import {
  BadRequestException,
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
}

/**
 * Per-tenant Stripe account configuration. Customer invoice payments are
 * collected into the tenant's own Stripe account; a tenant can instead be
 * switched to the platform account (use_platform_account) when the
 * operator collects on the tenant's behalf.
 */
@Injectable()
export class PaymentGatewaySettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly audit: PaymentAuditService,
  ) {}

  private encryptionKey(): string {
    const key =
      process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY?.trim() ||
      process.env.TWO_FACTOR_ENCRYPTION_KEY?.trim();
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
    return TwoFactorCrypto.decrypt(value, this.encryptionKey());
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
  ) {
    if (dto.secret_key && !/^(sk|rk)_(test|live)_/.test(dto.secret_key)) {
      throw new BadRequestException("secret_key must be a Stripe secret key.");
    }
    if (dto.publishable_key && !/^pk_(test|live)_/.test(dto.publishable_key)) {
      throw new BadRequestException(
        "publishable_key must be a Stripe publishable key.",
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
    if (
      willEnable &&
      !willUsePlatform &&
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
      ...(dto.secret_key
        ? { secret_key_encrypted: this.encrypt(dto.secret_key) }
        : {}),
      ...(dto.webhook_secret
        ? { webhook_secret_encrypted: this.encrypt(dto.webhook_secret) }
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
      client: this.resolveClient(gw).client,
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
      };
    }
    if (!gw.secret_key_encrypted) {
      throw new BadRequestException(
        "Stripe secret key is not configured for this company.",
      );
    }
    return {
      client: this.stripe.clientForKey(this.decrypt(gw.secret_key_encrypted)),
      accountRef: tenantAccountRef(gw.id),
    };
  }

  publishableKeyFor(gw: TenantPaymentGateway | null): string | null {
    if (!gw) return null;
    return gw.use_platform_account
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
      publishable_key: this.publishableKeyFor(gw),
      allow_partial_payments: gw.allow_partial_payments,
      bank_account_id: gw.bank_account_id,
      statement_descriptor: gw.statement_descriptor,
      platform_account_available: Boolean(this.stripe.platformClient()),
      webhook_url: gw.use_platform_account
        ? `${apiBase}/payments/stripe/webhook`
        : `${apiBase}/payments/stripe/webhook/${gw.webhook_token}`,
      updated_at: gw.updated_at,
    };
  }
}
