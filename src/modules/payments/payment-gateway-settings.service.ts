import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { TenantPaymentGateway } from "@prisma/client";
import { randomBytes } from "crypto";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { TwoFactorCrypto } from "../../common/utils/two-factor-crypto.util";
import { StripeGatewayService } from "./stripe-gateway.service";
import {
  PLATFORM_ACCOUNT_REF,
  tenantAccountRef,
} from "./constants/online-payment.constants";
import { UpdatePaymentGatewaySettingsDto } from "./dto/payment-gateway.dto";
import { PaymentAuditService } from "./payment-audit.service";

export interface ResolvedTenantAccount {
  client: Stripe;
  accountRef: string;
  gateway: TenantPaymentGateway;
  /**
   * Stripe Connect collection: the company's connected account. Charges are
   * created on the platform (accountRef "platform") as destination charges
   * that settle into this account.
   */
  connectAccountId: string | null;
}

/**
 * Per-tenant Stripe account configuration. Customer invoice payments are
 * collected into the tenant's own Stripe account; a tenant can instead be
 * switched to the platform account (use_platform_account) when the
 * operator collects on the tenant's behalf, or collect through its own
 * Stripe Connect account (use_connect, onboarded via Stripe-hosted pages).
 */
@Injectable()
export class PaymentGatewaySettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly audit: PaymentAuditService,
  ) {}

  private encryptionKey(): string {
    const dedicated = process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY?.trim();
    // In production the key must be dedicated: sharing the 2FA key means
    // rotating it would silently make every stored Stripe key unreadable.
    const key =
      dedicated ||
      (process.env.NODE_ENV === "production"
        ? undefined
        : process.env.TWO_FACTOR_ENCRYPTION_KEY?.trim());
    if (!key) {
      throw new InternalServerErrorException(
        "PAYMENT_GATEWAY_ENCRYPTION_KEY is not configured.",
      );
    }
    return key;
  }

  private encrypt(value: string) {
    return TwoFactorCrypto.encrypt(value, this.encryptionKey());
  }

  private decrypt(value: string) {
    try {
      return TwoFactorCrypto.decrypt(value, this.encryptionKey());
    } catch {
      throw new ServiceUnavailableException(
        "Stored Stripe keys cannot be decrypted (was PAYMENT_GATEWAY_ENCRYPTION_KEY changed?). " +
          "Re-enter the Stripe secret key and webhook secret in payment settings.",
      );
    }
  }

  async find(tenantId: string) {
    return this.prisma.tenantPaymentGateway.findUnique({
      where: { tenant_id: tenantId },
    });
  }

  /** Public-safe view: never returns secrets, only whether they are set. */
  async getSettings(tenantId: string) {
    const gw = await this.find(tenantId);
    return {
      success: true,
      data: this.toView(gw),
    };
  }

  async updateSettings(
    tenantId: string,
    dto: UpdatePaymentGatewaySettingsDto,
    actorId?: string,
    opts: { allowPlatformAccount?: boolean } = {},
  ) {
    // Collecting a company's customer payments into the platform's Stripe
    // account makes the platform hold funds owed to that company — a
    // platform-level (compliance) decision, so only the Super Admin can set it.
    if (dto.use_platform_account !== undefined && !opts.allowPlatformAccount) {
      throw new ForbiddenException(
        "Only the platform administrator can change platform-account collection.",
      );
    }
    if (dto.fee_gl_account_id) {
      const acct = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.chartOfAccount.findFirst({
          where: {
            id: dto.fee_gl_account_id,
            tenant_id: tenantId,
            deleted_at: null,
            is_postable: true,
          },
        }),
      );
      if (!acct)
        throw new NotFoundException(
          "Fee GL account not found or not postable.",
        );
    }
    if (dto.secret_key && !/^(sk|rk)_(test|live)_/.test(dto.secret_key)) {
      throw new BadRequestException("secret_key must be a Stripe secret key.");
    }
    if (dto.publishable_key && !/^pk_(test|live)_/.test(dto.publishable_key)) {
      throw new BadRequestException(
        "publishable_key must be a Stripe publishable key.",
      );
    }
    if (
      dto.connect_webhook_secret &&
      !dto.connect_webhook_secret.startsWith("whsec_")
    ) {
      throw new BadRequestException(
        "connect_webhook_secret must be a Stripe webhook signing secret.",
      );
    }
    if (dto.webhook_secret && !dto.webhook_secret.startsWith("whsec_")) {
      throw new BadRequestException(
        "webhook_secret must be a Stripe webhook signing secret.",
      );
    }
    if (dto.bank_account_id) {
      const bank = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.tenantBankAccount.findFirst({
          where: {
            id: dto.bank_account_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
        }),
      );
      if (!bank) throw new NotFoundException("Bank account not found.");
    }

    const existing = await this.find(tenantId);

    // Validate the resulting configuration before persisting it.
    const willEnable = dto.is_enabled ?? existing?.is_enabled ?? false;
    const willUsePlatform =
      dto.use_platform_account ?? existing?.use_platform_account ?? false;
    if (willEnable && willUsePlatform && !this.stripe.platformClient()) {
      throw new BadRequestException(
        "The platform Stripe account is not configured; provide the company's own keys.",
      );
    }
    const willUseConnect = dto.use_connect ?? existing?.use_connect ?? false;
    if (willUseConnect && !existing?.connect_account_id) {
      throw new BadRequestException(
        "Start Stripe onboarding first (POST /payments/stripe/connect/onboarding-link).",
      );
    }
    if (
      willEnable &&
      !willUsePlatform &&
      !willUseConnect &&
      !dto.secret_key &&
      !existing?.secret_key_encrypted
    ) {
      throw new BadRequestException(
        "A Stripe secret key is required to enable online payments.",
      );
    }

    const data = {
      ...(dto.is_enabled !== undefined ? { is_enabled: dto.is_enabled } : {}),
      ...(dto.use_platform_account !== undefined
        ? { use_platform_account: dto.use_platform_account }
        : {}),
      ...(dto.use_connect !== undefined
        ? { use_connect: dto.use_connect }
        : {}),
      ...(dto.secret_key
        ? { secret_key_encrypted: this.encrypt(dto.secret_key) }
        : {}),
      ...(dto.webhook_secret
        ? { webhook_secret_encrypted: this.encrypt(dto.webhook_secret) }
        : {}),
      ...(dto.connect_webhook_secret
        ? {
            connect_webhook_secret_encrypted: this.encrypt(
              dto.connect_webhook_secret,
            ),
          }
        : {}),
      ...(dto.auto_vendor_payouts !== undefined
        ? { auto_vendor_payouts: dto.auto_vendor_payouts }
        : {}),
      ...(dto.publishable_key !== undefined
        ? { publishable_key: dto.publishable_key || null }
        : {}),
      ...(dto.allow_partial_payments !== undefined
        ? { allow_partial_payments: dto.allow_partial_payments }
        : {}),
      ...(dto.bank_account_id !== undefined
        ? { bank_account_id: dto.bank_account_id || null }
        : {}),
      ...(dto.statement_descriptor !== undefined
        ? { statement_descriptor: dto.statement_descriptor || null }
        : {}),
      ...(dto.fee_gl_account_id !== undefined
        ? { fee_gl_account_id: dto.fee_gl_account_id || null }
        : {}),
      updated_by: actorId,
    };

    const saved = existing
      ? await this.prisma.tenantPaymentGateway.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.tenantPaymentGateway.create({
          data: {
            tenant_id: tenantId,
            webhook_token: randomBytes(24).toString("hex"),
            created_by: actorId,
            ...data,
          },
        });

    await this.audit.log(tenantId, {
      userId: actorId,
      action: "PAYMENT_GATEWAY_UPDATED",
      entity: "TenantPaymentGateway",
      entityId: saved.id,
      metadata: {
        is_enabled: saved.is_enabled,
        use_platform_account: saved.use_platform_account,
        use_connect: saved.use_connect,
        secret_key_changed: Boolean(dto.secret_key),
        webhook_secret_changed: Boolean(dto.webhook_secret),
      },
    });

    return { success: true, data: this.toView(saved) };
  }

  /** Rotates the webhook URL token (e.g. if the URL leaked). */
  async rotateWebhookToken(tenantId: string, actorId?: string) {
    const gw = await this.find(tenantId);
    if (!gw) throw new NotFoundException("Payment gateway not configured.");
    const saved = await this.prisma.tenantPaymentGateway.update({
      where: { id: gw.id },
      data: {
        webhook_token: randomBytes(24).toString("hex"),
        updated_by: actorId,
      },
    });
    await this.audit.log(tenantId, {
      userId: actorId,
      action: "PAYMENT_GATEWAY_WEBHOOK_ROTATED",
      entity: "TenantPaymentGateway",
      entityId: gw.id,
    });
    return { success: true, data: this.toView(saved) };
  }

  /**
   * Resolves the Stripe account that collects this tenant's customer
   * invoices. Throws when online payments are not enabled.
   */
  async resolveTenantAccount(tenantId: string): Promise<ResolvedTenantAccount> {
    const gw = await this.find(tenantId);
    if (!gw || !gw.is_enabled) {
      throw new BadRequestException(
        "Online payments are not enabled for this company.",
      );
    }
    return { ...this.resolveClient(gw), gateway: gw };
  }

  async isOnlinePaymentEnabled(tenantId: string): Promise<boolean> {
    try {
      await this.resolveTenantAccount(tenantId);
      return true;
    } catch {
      return false;
    }
  }

  /** Webhook signing secret for a tenant gateway resolved by URL token. */
  async resolveWebhookByToken(token: string) {
    const gw = await this.prisma.tenantPaymentGateway.findUnique({
      where: { webhook_token: token },
    });
    if (!gw || gw.use_platform_account || !gw.webhook_secret_encrypted) {
      return null;
    }
    return {
      gateway: gw,
      accountRef: tenantAccountRef(gw.id),
      webhookSecret: this.decrypt(gw.webhook_secret_encrypted),
      client: this.ownKeysClient(gw),
    };
  }

  /** Connect webhook secret for a tenant gateway resolved by URL token. */
  async resolveConnectWebhookByToken(token: string) {
    const gw = await this.prisma.tenantPaymentGateway.findUnique({
      where: { webhook_token: token },
    });
    if (
      !gw ||
      gw.use_platform_account ||
      !gw.connect_webhook_secret_encrypted
    ) {
      return null;
    }
    return {
      gateway: gw,
      accountRef: tenantAccountRef(gw.id),
      webhookSecret: this.decrypt(gw.connect_webhook_secret_encrypted),
      client: this.ownKeysClient(gw),
    };
  }

  /** Client for a stored account_ref (used when reconciling / refunding). */
  async clientForAccountRef(
    accountRef: string,
    tenantId: string,
  ): Promise<Stripe> {
    if (accountRef === PLATFORM_ACCOUNT_REF) {
      return this.stripe.requirePlatformClient();
    }
    const gw = await this.find(tenantId);
    if (
      !gw ||
      tenantAccountRef(gw.id) !== accountRef ||
      !gw.secret_key_encrypted
    ) {
      throw new ServiceUnavailableException(
        "The Stripe account used for this payment is no longer configured.",
      );
    }
    return this.stripe.clientForKey(this.decrypt(gw.secret_key_encrypted));
  }

  private resolveClient(gw: TenantPaymentGateway) {
    if (gw.use_platform_account) {
      return {
        client: this.stripe.requirePlatformClient(),
        accountRef: PLATFORM_ACCOUNT_REF,
        connectAccountId: null,
      };
    }
    if (gw.use_connect) {
      if (!this.connectCollectionReady(gw)) {
        throw new BadRequestException(
          "Online payments become available once the company finishes Stripe onboarding.",
        );
      }
      return {
        client: this.stripe.requirePlatformClient(),
        accountRef: PLATFORM_ACCOUNT_REF,
        connectAccountId: gw.connect_account_id,
      };
    }
    return {
      client: this.ownKeysClient(gw),
      accountRef: tenantAccountRef(gw.id),
      connectAccountId: null,
    };
  }

  /** Company collects through its connected account and Stripe allows charges. */
  connectCollectionReady(gw: TenantPaymentGateway | null) {
    return Boolean(
      gw?.use_connect &&
      gw.connect_account_id &&
      gw.connect_charges_enabled &&
      this.stripe.connectEnabled(),
    );
  }

  private ownKeysClient(gw: TenantPaymentGateway) {
    if (!gw.secret_key_encrypted) {
      throw new BadRequestException(
        "Stripe secret key is not configured for this company.",
      );
    }
    return this.stripe.clientForKey(this.decrypt(gw.secret_key_encrypted));
  }

  publishableKeyFor(gw: TenantPaymentGateway | null): string | null {
    if (!gw) return null;
    return gw.use_platform_account || gw.use_connect
      ? this.stripe.platformPublishableKey()
      : gw.publishable_key;
  }

  private toView(gw: TenantPaymentGateway | null) {
    if (!gw) {
      return {
        configured: false,
        is_enabled: false,
        provider: "STRIPE",
        platform_account_available: Boolean(this.stripe.platformClient()),
      };
    }
    const apiBase = (process.env.PUBLIC_API_URL ?? process.env.APP_URL ?? "")
      .trim()
      .replace(/\/$/, "");
    return {
      configured: true,
      provider: gw.provider,
      is_enabled: gw.is_enabled,
      use_platform_account: gw.use_platform_account,
      secret_key_set: Boolean(gw.secret_key_encrypted),
      webhook_secret_set: Boolean(gw.webhook_secret_encrypted),
      connect_webhook_secret_set: Boolean(gw.connect_webhook_secret_encrypted),
      auto_vendor_payouts: gw.auto_vendor_payouts,
      use_connect: gw.use_connect,
      connect: {
        account_connected: Boolean(gw.connect_account_id),
        details_submitted: gw.connect_details_submitted,
        charges_enabled: gw.connect_charges_enabled,
        payouts_enabled: gw.connect_payouts_enabled,
        requirements_due: gw.connect_requirements_due ?? [],
        ready: this.connectCollectionReady(gw),
      },
      publishable_key: this.publishableKeyFor(gw),
      allow_partial_payments: gw.allow_partial_payments,
      bank_account_id: gw.bank_account_id,
      fee_gl_account_id: gw.fee_gl_account_id,
      statement_descriptor: gw.statement_descriptor,
      platform_account_available: Boolean(this.stripe.platformClient()),
      webhook_url:
        gw.use_platform_account || gw.use_connect
          ? `${apiBase}/payments/stripe/webhook`
          : `${apiBase}/payments/stripe/webhook/${gw.webhook_token}`,
      updated_at: gw.updated_at,
    };
  }
}
