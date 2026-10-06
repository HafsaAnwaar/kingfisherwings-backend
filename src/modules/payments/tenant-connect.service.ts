import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma, TenantPaymentGateway } from "@prisma/client";
import { randomBytes } from "crypto";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { PaymentAuditService } from "./payment-audit.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import { staffFrontendUrl } from "./utils/frontend-url.util";

/** Metadata scope on the company's connected account. */
export const TENANT_COLLECTION_SCOPE = "tenant_collection";

/**
 * Stripe Connect for a company's own customer collections. The company
 * completes Stripe-hosted onboarding once; when Stripe enables charges the
 * gateway switches to Connect collection and online payments turn on
 * automatically. Customers then pay exactly as before (portal "Pay Now",
 * emailed pay links, staff checkout) — the charge is a destination charge
 * that settles into the company's account. Tenant comes only from the JWT.
 */
@Injectable()
export class TenantConnectService {
  private readonly logger = new Logger(TenantConnectService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly notifications: NotificationEmitterService,
    private readonly audit: PaymentAuditService,
  ) {}

  private requireEnabled() {
    if (!this.stripe.connectEnabled()) {
      throw new ServiceUnavailableException(
        "Stripe Connect is not enabled yet.",
      );
    }
    return this.stripe.requirePlatformClient();
  }

  /** Creates (once) the company's Express account and returns an onboarding link. */
  async onboardingLink(tenantId: string, actorId?: string) {
    const client = this.requireEnabled();
    const gw = await this.ensureAccount(client, tenantId, actorId);
    const returnUrl = `${staffFrontendUrl()}/settings/payments`;
    const link = await this.stripe.createAccountLink(client, {
      account: gw.connect_account_id!,
      type: "account_onboarding",
      refresh_url: returnUrl,
      return_url: returnUrl,
    });
    return {
      success: true,
      data: { url: link.url, expires_at: new Date(link.expires_at * 1000) },
    };
  }

  /** Stripe Express dashboard (payouts, balance) for an onboarded company. */
  async dashboardLink(tenantId: string) {
    const client = this.requireEnabled();
    const gw = await this.gateway(tenantId);
    if (!gw?.connect_account_id || !gw.connect_details_submitted) {
      throw new NotFoundException("Stripe onboarding is not complete.");
    }
    const link = await this.stripe.createLoginLink(
      client,
      gw.connect_account_id,
    );
    return { success: true, data: { url: link.url } };
  }

  /** Connect status (refreshed from Stripe while onboarding is incomplete). */
  async status(tenantId: string) {
    let gw = await this.gateway(tenantId);
    if (
      gw?.connect_account_id &&
      this.stripe.connectEnabled() &&
      !this.isReady(gw)
    ) {
      gw = await this.refresh(gw).catch((err) => {
        this.logger.warn(
          `Connect status refresh failed for ${tenantId}: ${String(err)}`,
        );
        return gw;
      });
    }
    return { success: true, data: this.view(gw) };
  }

  /** account.updated (Connect webhook) or refresh → persist capabilities. */
  async applyAccountUpdate(acct: Stripe.Account) {
    const before = await this.prisma.tenantPaymentGateway.findUnique({
      where: { connect_account_id: acct.id },
    });
    if (!before) return null;
    const flags = this.flags(acct);
    const becameReady = !this.isReady(before) && flags.connect_charges_enabled;
    const row = await this.prisma.tenantPaymentGateway.update({
      where: { id: before.id },
      data: {
        ...flags,
        // Onboarding finished → collect through Connect automatically
        // (unless the Super Admin set platform-account collection).
        ...(becameReady
          ? {
              use_connect: true,
              ...(before.use_platform_account ? {} : { is_enabled: true }),
            }
          : {}),
      },
    });
    if (becameReady) {
      await this.audit.log(row.tenant_id, {
        action: "STRIPE_CONNECT_ACTIVATED",
        entity: "TenantPaymentGateway",
        entityId: row.id,
        metadata: { connect_account_id: acct.id, is_enabled: row.is_enabled },
      });
      await this.notifications
        .notifyFinanceStaff(row.tenant_id, {
          type: "PAYMENT_ACTION_REQUIRED",
          title: "Stripe payments are live",
          message:
            "Stripe onboarding is complete. Customers can now pay their invoices online; payments settle into your Stripe account.",
          entity_type: "payment_gateway",
          entity_id: row.id,
          link_path: "/settings/payments",
        })
        .catch(() => undefined);
    }
    return row;
  }

  /** Reconciler: catch up on a missed account.updated while onboarding. */
  async reconcileTenant(tenantId: string) {
    if (!this.stripe.connectEnabled()) return 0;
    const gw = await this.gateway(tenantId);
    if (!gw?.connect_account_id || this.isReady(gw)) return 0;
    await this.refresh(gw);
    return 1;
  }

  private async refresh(gw: TenantPaymentGateway) {
    const acct = await this.stripe.retrieveConnectedAccount(
      this.stripe.requirePlatformClient(),
      gw.connect_account_id!,
    );
    return (await this.applyAccountUpdate(acct)) ?? gw;
  }

  private async ensureAccount(
    client: Stripe,
    tenantId: string,
    actorId?: string,
  ): Promise<TenantPaymentGateway> {
    let gw = await this.gateway(tenantId);
    if (gw?.connect_account_id) return gw;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        display_name: true,
        email: true,
        country_code: true,
      },
    });
    if (!tenant) throw new NotFoundException("Company not found.");
    if (!gw) {
      gw = await this.prisma.tenantPaymentGateway.upsert({
        where: { tenant_id: tenantId },
        create: {
          tenant_id: tenantId,
          webhook_token: randomBytes(24).toString("hex"),
          created_by: actorId,
        },
        update: {},
      });
    }

    const acct = await this.stripe.createConnectedAccount(
      client,
      {
        type: "express",
        ...(tenant.country_code ? { country: tenant.country_code } : {}),
        email: tenant.email ?? undefined,
        business_profile: {
          name: (tenant.display_name || tenant.name).slice(0, 200),
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { tenant_id: tenantId, erp_scope: TENANT_COLLECTION_SCOPE },
      },
      `erp-tenant-account:${tenantId}`,
    );
    // Concurrent first clicks share the idempotent Stripe account; only the
    // first write sets it.
    await this.prisma.tenantPaymentGateway.updateMany({
      where: { id: gw.id, connect_account_id: null },
      data: { connect_account_id: acct.id, ...this.flags(acct) },
    });
    const saved = await this.prisma.tenantPaymentGateway.findUniqueOrThrow({
      where: { id: gw.id },
    });
    await this.audit.log(tenantId, {
      userId: actorId ?? null,
      action: "STRIPE_CONNECT_ACCOUNT_CREATED",
      entity: "TenantPaymentGateway",
      entityId: saved.id,
      metadata: { connect_account_id: saved.connect_account_id },
    });
    return saved;
  }

  private gateway(tenantId: string) {
    return this.prisma.tenantPaymentGateway.findUnique({
      where: { tenant_id: tenantId },
    });
  }

  private flags(acct: Stripe.Account) {
    return {
      connect_details_submitted: Boolean(acct.details_submitted),
      connect_charges_enabled: Boolean(acct.charges_enabled),
      connect_payouts_enabled: Boolean(acct.payouts_enabled),
      connect_requirements_due: (acct.requirements?.currently_due ??
        []) as Prisma.InputJsonValue,
    };
  }

  /** Stripe allows charges (transition false → true switches collection on). */
  private isReady(gw: TenantPaymentGateway) {
    return gw.connect_charges_enabled;
  }

  private view(gw: TenantPaymentGateway | null) {
    return {
      connect_enabled: this.stripe.connectEnabled(),
      account_connected: Boolean(gw?.connect_account_id),
      details_submitted: gw?.connect_details_submitted ?? false,
      charges_enabled: gw?.connect_charges_enabled ?? false,
      payouts_enabled: gw?.connect_payouts_enabled ?? false,
      requirements_due: gw?.connect_requirements_due ?? [],
      use_connect: gw?.use_connect ?? false,
      online_payments_enabled: Boolean(
        gw?.is_enabled &&
        (gw.use_platform_account ||
          (gw.use_connect && gw.connect_charges_enabled) ||
          gw.secret_key_encrypted),
      ),
    };
  }
}
