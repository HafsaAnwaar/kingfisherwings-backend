import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import {
  RECONCILE_ATTEMPT_STATUSES,
  RECONCILE_STALE_AFTER_MS,
  WEBHOOK_MAX_REPLAYS,
} from "./constants/online-payment.constants";
import { InvoiceOnlinePaymentsService } from "./invoice-online-payments.service";
import { PlatformBillingService } from "./platform-billing.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import { StripeWebhookService } from "./stripe-webhook.service";
import { TenantConnectService } from "./tenant-connect.service";
import { VendorPayoutsService } from "./vendor-payouts.service";

/**
 * Safety net for the webhook-driven flow. Every 15 minutes:
 *  - re-reads checkout attempts stuck in PENDING / REQUIRES_ACTION /
 *    PROCESSING from Stripe (missed or misconfigured webhooks),
 *  - retries ERP posting, Stripe-fee journals and refund accounting that
 *    failed earlier,
 *  - replays FAILED webhook events (bounded).
 * Every step is idempotent, so running on several instances is safe.
 * Disable with PAYMENT_RECONCILE_ENABLED=false.
 */
@Injectable()
export class PaymentReconciliationService implements OnModuleInit {
  private readonly logger = new Logger(PaymentReconciliationService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly invoicePayments: InvoiceOnlinePaymentsService,
    private readonly platformBilling: PlatformBillingService,
    private readonly webhooks: StripeWebhookService,
    private readonly vendorPayouts: VendorPayoutsService,
    private readonly tenantConnect: TenantConnectService,
  ) {}

  onModuleInit() {
    for (const problem of this.configProblems()) {
      this.logger.warn(`Payments configuration: ${problem}`);
    }
  }

  @Cron("*/15 * * * *")
  async scheduledRun() {
    if (process.env.PAYMENT_RECONCILE_ENABLED === "false") return;
    await this.runAll();
  }

  async runAll() {
    if (this.running) {
      return {
        skipped: true,
        reason: "A reconciliation run is already in progress.",
      };
    }
    this.running = true;
    const summary = {
      tenants: 0,
      checked: 0,
      posted: 0,
      fees: 0,
      refunds: 0,
      webhook_replays: 0,
      vendor_payouts: 0,
      errors: 0,
    };
    try {
      // Companies mid Stripe onboarding: catch up on a missed account.updated.
      const onboarding = await this.prisma.tenantPaymentGateway.findMany({
        where: {
          connect_account_id: { not: null },
          connect_charges_enabled: false,
        },
        select: { tenant_id: true },
        take: 50,
      });
      for (const { tenant_id } of onboarding) {
        await this.tenantConnect.reconcileTenant(tenant_id).catch((err) => {
          summary.errors++;
          this.logger.warn(
            `Connect refresh failed for tenant ${tenant_id}: ${String(err)}`,
          );
        });
      }
      const gateways = await this.prisma.tenantPaymentGateway.findMany({
        where: { is_enabled: true },
        select: { tenant_id: true },
      });
      for (const { tenant_id } of gateways) {
        try {
          const r = await this.invoicePayments.reconcileTenant(tenant_id);
          const v = await this.vendorPayouts.reconcileTenant(tenant_id);
          summary.vendor_payouts += v.paid + v.posted;
          summary.tenants++;
          summary.checked += r.checked;
          summary.posted += r.posted;
          summary.fees += r.fees;
          summary.refunds += r.refunds;
          summary.errors += r.errors;
        } catch (err) {
          summary.errors++;
          this.logger.error(
            `Reconcile tenant ${tenant_id} failed: ${String(err)}`,
          );
        }
      }

      const platform = await this.platformBilling.reconcilePlatform();
      summary.checked += platform.checked;
      summary.fees += platform.fees;
      summary.refunds += platform.refunds;
      summary.errors += platform.errors;

      const failed = await this.prisma.stripeWebhookEvent.findMany({
        where: {
          status: "FAILED",
          attempts: { lt: WEBHOOK_MAX_REPLAYS },
          updated_at: { lt: new Date(Date.now() - 10 * 60 * 1000) },
        },
        select: { id: true },
        take: 25,
      });
      for (const e of failed) {
        try {
          await this.webhooks.replay(e.id);
          summary.webhook_replays++;
        } catch (err) {
          summary.errors++;
          this.logger.warn(`Webhook replay ${e.id} failed: ${String(err)}`);
        }
      }

      if (
        summary.checked ||
        summary.posted ||
        summary.refunds ||
        summary.webhook_replays ||
        summary.errors
      ) {
        this.logger.log(`Payment reconciliation: ${JSON.stringify(summary)}`);
      }
      return summary;
    } finally {
      this.running = false;
    }
  }

  runForTenant(tenantId: string) {
    return this.invoicePayments.reconcileTenant(tenantId);
  }

  /** Configuration + health snapshot for the Super Admin. */
  async readiness() {
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const staleBefore = new Date(Date.now() - RECONCILE_STALE_AFTER_MS);
    const [
      failed24h,
      lastProcessed,
      stuckPlatform,
      enabledGateways,
      gatewaysWithoutWebhook,
    ] = await Promise.all([
      this.prisma.stripeWebhookEvent.count({
        where: { status: "FAILED", created_at: { gt: since } },
      }),
      this.prisma.stripeWebhookEvent.findFirst({
        where: { status: "PROCESSED" },
        orderBy: { processed_at: "desc" },
        select: { processed_at: true },
      }),
      this.prisma.platformPayment.count({
        where: {
          status: { in: RECONCILE_ATTEMPT_STATUSES },
          created_at: { lt: staleBefore },
        },
      }),
      this.prisma.tenantPaymentGateway.count({ where: { is_enabled: true } }),
      this.prisma.tenantPaymentGateway.count({
        where: {
          is_enabled: true,
          use_platform_account: false,
          use_connect: false,
          webhook_secret_encrypted: null,
        },
      }),
    ]);
    const problems = this.configProblems();
    if (gatewaysWithoutWebhook) {
      problems.push(
        `${gatewaysWithoutWebhook} company gateway(s) are enabled without a webhook secret — their payments rely on the reconciler only.`,
      );
    }
    if (failed24h)
      problems.push(`${failed24h} webhook event(s) failed in the last 24h.`);
    if (stuckPlatform)
      problems.push(
        `${stuckPlatform} platform payment(s) are stuck awaiting confirmation.`,
      );
    return {
      ready: problems.length === 0,
      problems,
      sdk_api_version: this.stripe.sdkApiVersion(),
      enabled_company_gateways: enabledGateways,
      last_webhook_processed_at: lastProcessed?.processed_at ?? null,
      reconciler_enabled: process.env.PAYMENT_RECONCILE_ENABLED !== "false",
    };
  }

  private configProblems(): string[] {
    const problems: string[] = [];
    const prod = process.env.NODE_ENV === "production";
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      problems.push(
        "STRIPE_SECRET_KEY is not set (platform billing and platform-account collection disabled).",
      );
    } else if (!this.stripe.platformWebhookSecret()) {
      problems.push(
        "STRIPE_WEBHOOK_SECRET is not set — platform webhooks are rejected.",
      );
    }
    if (!process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY?.trim()) {
      problems.push(
        prod
          ? "PAYMENT_GATEWAY_ENCRYPTION_KEY is not set — companies cannot save their own Stripe keys."
          : "PAYMENT_GATEWAY_ENCRYPTION_KEY is not set (dev falls back to TWO_FACTOR_ENCRYPTION_KEY).",
      );
    }
    if (
      this.stripe.connectEnabled() &&
      !this.stripe.platformConnectWebhookSecret()
    ) {
      problems.push(
        "STRIPE_CONNECT_WEBHOOK_SECRET is not set — vendor onboarding status updates rely on the reconciler.",
      );
    }
    if (!process.env.FRONTEND_URL?.trim()) {
      problems.push(
        "FRONTEND_URL is not set — Checkout return pages and emailed Pay Now links will be wrong.",
      );
    }
    return problems;
  }
}
