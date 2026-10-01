import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma, StripeWebhookEvent } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import {
  METADATA_SCOPE,
  PLATFORM_ACCOUNT_REF,
  STRIPE_METADATA,
  WEBHOOK_PROCESSING_STALE_MS,
} from "./constants/online-payment.constants";
import { InvoiceOnlinePaymentsService } from "./invoice-online-payments.service";
import { PaymentAuditService } from "./payment-audit.service";
import { PaymentGatewaySettingsService } from "./payment-gateway-settings.service";
import { PlatformBillingService } from "./platform-billing.service";
import { PlatformSubscriptionsService } from "./platform-subscriptions.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import {
  VENDOR_PAYOUT_SCOPE,
  VendorPayoutsService,
} from "./vendor-payouts.service";

interface WebhookAccount {
  accountRef: string;
  client: Stripe;
  /** Set when the endpoint belongs to one tenant's own Stripe account. */
  tenantId: string | null;
}

type DispatchResult = {
  handled: boolean;
  reason?: string;
  tenantId?: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Stripe webhook processing:
 *   verify signature → persist event (unique per account) → claim →
 *   dispatch to the ERP ledgers → mark PROCESSED / IGNORED / FAILED.
 * A failure is recorded and rethrown (HTTP 500) so Stripe retries; a
 * processed event is never applied twice.
 */
@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private readonly warnedApiVersions = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly settings: PaymentGatewaySettingsService,
    private readonly invoicePayments: InvoiceOnlinePaymentsService,
    private readonly platformBilling: PlatformBillingService,
    private readonly subscriptions: PlatformSubscriptionsService,
    private readonly audit: PaymentAuditService,
    private readonly vendorPayouts: VendorPayoutsService,
  ) {}

  async handle(
    rawBody: Buffer | undefined,
    signature: string | undefined,
    token?: string,
    /** Stripe Connect endpoint (events from connected vendor accounts). */
    connect = false,
  ) {
    const { account, secret } = await this.resolveAccount(token, connect);
    const event = this.stripe.constructEvent(rawBody, signature, secret);
    this.warnOnApiVersionMismatch(event);

    const stored = await this.persist(event, account);
    const claimed = await this.claim(stored);
    if (!claimed) {
      return { received: true, duplicate: true, status: stored.status };
    }

    try {
      const result = await this.dispatch(event, account);
      await this.prisma.stripeWebhookEvent.update({
        where: { id: stored.id },
        data: {
          status: result.handled ? "PROCESSED" : "IGNORED",
          processed_at: new Date(),
          error: result.handled ? null : (result.reason ?? null),
          tenant_id: result.tenantId ?? stored.tenant_id,
        },
      });
      const tenantForAudit = result.tenantId ?? account.tenantId;
      if (result.handled && tenantForAudit) {
        await this.audit.log(tenantForAudit, {
          action: "STRIPE_WEBHOOK_PROCESSED",
          entity: "StripeWebhookEvent",
          entityId: stored.id,
          metadata: { stripe_event_id: event.id, type: event.type },
        });
      }
      return { received: true, handled: result.handled };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Stripe event ${event.id} (${event.type}) failed: ${message}`,
      );
      await this.prisma.stripeWebhookEvent.update({
        where: { id: stored.id },
        data: { status: "FAILED", error: message.slice(0, 4000) },
      });
      throw new ServiceUnavailableException(
        "Webhook processing failed; Stripe will retry.",
      );
    }
  }

  private async resolveAccount(
    token?: string,
    connect = false,
  ): Promise<{ account: WebhookAccount; secret: string }> {
    if (connect && !this.stripe.connectEnabled()) {
      throw new NotFoundException();
    }
    if (token) {
      if (!/^[a-f0-9]{48}$/.test(token)) throw new NotFoundException();
      const resolved = connect
        ? await this.settings.resolveConnectWebhookByToken(token)
        : await this.settings.resolveWebhookByToken(token);
      if (!resolved) throw new NotFoundException();
      return {
        account: {
          accountRef: resolved.accountRef,
          client: resolved.client,
          tenantId: resolved.gateway.tenant_id,
        },
        secret: resolved.webhookSecret,
      };
    }
    const secret = connect
      ? this.stripe.platformConnectWebhookSecret()
      : this.stripe.platformWebhookSecret();
    const client = this.stripe.platformClient();
    if (!secret || !client) {
      throw new BadRequestException("Stripe webhooks are not configured.");
    }
    return {
      account: { accountRef: PLATFORM_ACCOUNT_REF, client, tenantId: null },
      secret,
    };
  }

  private async persist(
    event: Stripe.Event,
    account: WebhookAccount,
  ): Promise<StripeWebhookEvent> {
    try {
      return await this.prisma.stripeWebhookEvent.create({
        data: {
          stripe_event_id: event.id,
          event_type: event.type,
          account_ref: account.accountRef,
          tenant_id: account.tenantId,
          livemode: event.livemode,
          payload: event as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return this.prisma.stripeWebhookEvent.findUniqueOrThrow({
          where: {
            account_ref_stripe_event_id: {
              account_ref: account.accountRef,
              stripe_event_id: event.id,
            },
          },
        });
      }
      throw err;
    }
  }

  /** Atomic claim: only one worker processes a given event at a time. */
  private async claim(stored: StripeWebhookEvent): Promise<boolean> {
    const staleBefore = new Date(Date.now() - WEBHOOK_PROCESSING_STALE_MS);
    const res = await this.prisma.stripeWebhookEvent.updateMany({
      where: {
        id: stored.id,
        OR: [
          { status: { in: ["RECEIVED", "FAILED"] } },
          { status: "PROCESSING", processing_started_at: { lt: staleBefore } },
        ],
      },
      data: {
        status: "PROCESSING",
        processing_started_at: new Date(),
        attempts: { increment: 1 },
      },
    });
    return res.count === 1;
  }

  async dispatch(
    event: Stripe.Event,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        return this.onCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
          event.type,
          account,
        );

      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.processing":
      case "payment_intent.canceled":
      case "payment_intent.requires_action":
        return this.onPaymentIntent(
          event.data.object as Stripe.PaymentIntent,
          account,
        );

      case "charge.refunded":
        return this.onChargeRefunded(
          event.data.object as Stripe.Charge,
          account,
        );

      case "refund.created":
      case "refund.updated":
      case "refund.failed":
      case "charge.refund.updated":
        return this.onRefund(event.data.object as Stripe.Refund, account);

      case "transfer.reversed":
        return this.onTransferReversed(
          event.data.object as Stripe.Transfer,
          account,
        );

      case "account.updated":
        return this.onAccountUpdated(
          event.data.object as Stripe.Account,
          account,
        );

      case "charge.dispute.created":

      case "charge.dispute.updated":

      case "charge.dispute.closed":

      case "charge.dispute.funds_withdrawn":

      case "charge.dispute.funds_reinstated":
        return this.onDispute(event.data.object as Stripe.Dispute, account);

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        if (account.accountRef !== PLATFORM_ACCOUNT_REF) {
          return {
            handled: false,
            reason: "subscriptions_only_on_platform_account",
          };
        }
        return this.subscriptions.syncSubscription(
          event.data.object as Stripe.Subscription,
        );

      case "invoice.paid":
      case "invoice.payment_failed":
        return this.onBillingInvoice(
          event.data.object as Stripe.Invoice,
          account,
        );

      default:
        return { handled: false, reason: "event_type_not_handled" };
    }
  }

  private async onCheckoutSession(
    session: Stripe.Checkout.Session,
    eventType: string,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    const scope = session.metadata?.[STRIPE_METADATA.SCOPE];

    if (
      session.mode === "subscription" ||
      scope === METADATA_SCOPE.PLATFORM_SUBSCRIPTION
    ) {
      if (
        account.accountRef !== PLATFORM_ACCOUNT_REF ||
        !session.subscription
      ) {
        return { handled: false, reason: "subscription_session_ignored" };
      }
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      const sub = await this.stripe.retrieveSubscription(account.client, subId);
      if (
        !sub.metadata?.[STRIPE_METADATA.TENANT_ID] &&
        session.metadata?.[STRIPE_METADATA.TENANT_ID]
      ) {
        sub.metadata = { ...sub.metadata, ...session.metadata };
      }
      return this.subscriptions.syncSubscription(sub);
    }

    if (scope === METADATA_SCOPE.PLATFORM_INVOICE) {
      if (account.accountRef !== PLATFORM_ACCOUNT_REF) {
        return { handled: false, reason: "platform_invoice_on_tenant_account" };
      }
      const res = await this.platformBilling.applyCheckoutSession(
        session,
        eventType,
      );
      return {
        ...res,
        tenantId: session.metadata?.[STRIPE_METADATA.TENANT_ID] ?? null,
      };
    }

    if (scope === METADATA_SCOPE.TENANT_INVOICE) {
      const tenantId = this.tenantFor(session.metadata, account);
      if (!tenantId) return { handled: false, reason: "tenant_mismatch" };
      const res = await this.invoicePayments.applyCheckoutSession(
        tenantId,
        account.accountRef,
        session,
        eventType,
      );
      return { ...res, tenantId };
    }
    return { handled: false, reason: "not_an_erp_session" };
  }

  private async onPaymentIntent(
    pi: Stripe.PaymentIntent,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    const scope = pi.metadata?.[STRIPE_METADATA.SCOPE];
    if (scope === METADATA_SCOPE.PLATFORM_INVOICE) {
      if (account.accountRef !== PLATFORM_ACCOUNT_REF) {
        return { handled: false, reason: "platform_invoice_on_tenant_account" };
      }
      const res = await this.platformBilling.applyPaymentIntent(pi);
      return {
        ...res,
        tenantId: pi.metadata?.[STRIPE_METADATA.TENANT_ID] ?? null,
      };
    }
    if (scope === METADATA_SCOPE.TENANT_INVOICE) {
      const tenantId = this.tenantFor(pi.metadata, account);
      if (!tenantId) return { handled: false, reason: "tenant_mismatch" };
      const res = await this.invoicePayments.applyPaymentIntent(
        tenantId,
        account.accountRef,
        pi,
      );
      return { ...res, tenantId };
    }
    return { handled: false, reason: "not_an_erp_payment_intent" };
  }

  private async onChargeRefunded(
    charge: Stripe.Charge,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    const piId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (!piId)
      return { handled: false, reason: "charge_without_payment_intent" };
    const refunds = await this.stripe.listRefundsForPaymentIntent(
      account.client,
      piId,
    );
    let handled = false;
    let tenantId: string | null = null;
    for (const refund of refunds) {
      const r = await this.onRefund(refund, account);
      handled = handled || r.handled;
      tenantId = tenantId ?? r.tenantId ?? null;
    }
    return {
      handled,
      tenantId,
      reason: handled ? undefined : "payment_not_found",
    };
  }

  /**
   * Refunds may be created by the ERP (metadata set) or in the Stripe
   * dashboard (no metadata) — the payment intent id locates the ERP row.
   */
  private async onRefund(
    refund: Stripe.Refund,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    const scope = refund.metadata?.[STRIPE_METADATA.SCOPE];

    if (
      account.accountRef === PLATFORM_ACCOUNT_REF &&
      scope !== METADATA_SCOPE.TENANT_INVOICE
    ) {
      const row = await this.platformBilling.applyStripeRefund(refund);
      if (row) return { handled: true, tenantId: row.tenant_id };
      if (scope === METADATA_SCOPE.PLATFORM_INVOICE) {
        return { handled: false, reason: "platform_payment_not_found" };
      }
    }

    const candidates = await this.candidateTenants(refund.metadata, account);
    for (const tenantId of candidates) {
      const row = await this.invoicePayments.applyStripeRefund(
        tenantId,
        account.accountRef,
        refund,
      );
      if (row) return { handled: true, tenantId };
    }
    return { handled: false, reason: "payment_not_found" };
  }

  /** Vendor payout transfer reversed on the sending (company/platform) account. */
  private async onTransferReversed(
    transfer: Stripe.Transfer,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    if (transfer.metadata?.erp_scope !== VENDOR_PAYOUT_SCOPE) {
      return { handled: false, reason: "not_an_erp_payout" };
    }
    const tenantId = this.tenantFor(transfer.metadata, account);
    if (!tenantId) return { handled: false, reason: "tenant_mismatch" };
    const row = await this.vendorPayouts.applyTransferReversed(
      tenantId,
      transfer,
      account.accountRef,
    );
    return row
      ? { handled: true, tenantId }
      : { handled: false, reason: "payout_not_found" };
  }

  /** Connected vendor account changed (onboarding progress / capabilities). */
  private async onAccountUpdated(
    acct: Stripe.Account,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    const row = await this.prisma.vendorPayoutAccount.findUnique({
      where: { stripe_account_id: acct.id },
    });
    if (
      !row ||
      row.account_ref !== account.accountRef ||
      (account.tenantId && row.tenant_id !== account.tenantId)
    ) {
      return { handled: false, reason: "unknown_connected_account" };
    }
    await this.vendorPayouts.updateAccountFromStripe(acct);
    return { handled: true, tenantId: row.tenant_id };
  }

  /** Chargebacks carry no ERP metadata; the payment intent locates the row. */
  private async onDispute(
    dispute: Stripe.Dispute,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    if (account.accountRef === PLATFORM_ACCOUNT_REF) {
      const row = await this.platformBilling.applyDispute(dispute);
      if (row) return { handled: true, tenantId: row.tenant_id };
    }
    const candidates = await this.candidateTenants(dispute.metadata, account);
    for (const tenantId of candidates) {
      const row = await this.invoicePayments.applyDispute(
        tenantId,
        account.accountRef,
        dispute,
      );
      if (row) return { handled: true, tenantId };
    }
    return { handled: false, reason: "payment_not_found" };
  }

  /**
   * Payload shape follows the webhook endpoint's API version (set in the
   * Stripe dashboard), not this SDK's. Warn once per version so a
   * mismatched endpoint is noticed before a field goes missing.
   */
  private warnOnApiVersionMismatch(event: Stripe.Event) {
    const sdk = this.stripe.sdkApiVersion();
    const got = event.api_version ?? null;
    if (!sdk || !got || got === sdk || this.warnedApiVersions.has(got)) return;
    this.warnedApiVersions.add(got);
    this.logger.warn(
      `Stripe webhook endpoint sends API version ${got}, SDK uses ${sdk}. ` +
        "Update the endpoint's API version in the Stripe dashboard to match.",
    );
  }

  private async onBillingInvoice(
    invoice: Stripe.Invoice,
    account: WebhookAccount,
  ): Promise<DispatchResult> {
    if (account.accountRef !== PLATFORM_ACCOUNT_REF) {
      return { handled: false, reason: "billing_only_on_platform_account" };
    }
    const legacy = invoice as unknown as {
      subscription?: string | { id: string } | null;
    };
    const parent = (
      invoice as unknown as {
        parent?: {
          subscription_details?: { subscription?: string | { id: string } };
        };
      }
    ).parent;
    const subRef =
      parent?.subscription_details?.subscription ?? legacy.subscription;
    const subId = typeof subRef === "string" ? subRef : subRef?.id;
    if (!subId) return { handled: false, reason: "not_a_subscription_invoice" };
    const sub = await this.stripe.retrieveSubscription(account.client, subId);
    return this.subscriptions.syncSubscription(sub);
  }

  /**
   * Tenant that owns a tenant-invoice object. On a tenant's own endpoint
   * the tenant is fixed by the verified endpoint — metadata must agree.
   */
  private tenantFor(
    metadata: Stripe.Metadata | null | undefined,
    account: WebhookAccount,
  ): string | null {
    const fromMeta = metadata?.[STRIPE_METADATA.TENANT_ID];
    if (account.tenantId) {
      return !fromMeta || fromMeta === account.tenantId
        ? account.tenantId
        : null;
    }
    return fromMeta && UUID_RE.test(fromMeta) ? fromMeta : null;
  }

  private async candidateTenants(
    metadata: Stripe.Metadata | null | undefined,
    account: WebhookAccount,
  ): Promise<string[]> {
    const tenantId = this.tenantFor(metadata, account);
    if (tenantId) return [tenantId];
    if (account.tenantId) return [];
    // Dashboard refund on the platform account for a tenant that collects
    // through the platform account: search those tenants only.
    const gateways = await this.prisma.tenantPaymentGateway.findMany({
      where: { use_platform_account: true },
      select: { tenant_id: true },
    });
    return gateways.map((g) => g.tenant_id);
  }

  // ─────────────── admin: inspection / replay ───────────────

  async listEvents(filter: {
    status?: string;
    tenantId?: string;
    limit?: number;
  }) {
    const rows = await this.prisma.stripeWebhookEvent.findMany({
      where: {
        ...(filter.status
          ? { status: filter.status as StripeWebhookEvent["status"] }
          : {}),
        ...(filter.tenantId ? { tenant_id: filter.tenantId } : {}),
      },
      select: {
        id: true,
        stripe_event_id: true,
        event_type: true,
        account_ref: true,
        tenant_id: true,
        livemode: true,
        status: true,
        attempts: true,
        error: true,
        processed_at: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: Math.min(filter.limit ?? 50, 200),
    });
    return { success: true, data: rows };
  }

  /** Re-runs a FAILED event from its stored (already verified) payload. */
  async replay(eventRowId: string) {
    const stored = await this.prisma.stripeWebhookEvent.findUnique({
      where: { id: eventRowId },
    });
    if (!stored) throw new NotFoundException("Webhook event not found.");
    if (stored.status !== "FAILED") {
      throw new BadRequestException("Only failed events can be replayed.");
    }
    let account: WebhookAccount;
    if (stored.account_ref === PLATFORM_ACCOUNT_REF) {
      account = {
        accountRef: PLATFORM_ACCOUNT_REF,
        client: this.stripe.requirePlatformClient(),
        tenantId: null,
      };
    } else {
      if (!stored.tenant_id)
        throw new BadRequestException("Event has no tenant.");
      account = {
        accountRef: stored.account_ref,
        client: await this.settings.clientForAccountRef(
          stored.account_ref,
          stored.tenant_id,
        ),
        tenantId: stored.tenant_id,
      };
    }
    if (!(await this.claim(stored))) {
      throw new BadRequestException("Event is already being processed.");
    }
    try {
      const result = await this.dispatch(
        stored.payload as unknown as Stripe.Event,
        account,
      );
      await this.prisma.stripeWebhookEvent.update({
        where: { id: stored.id },
        data: {
          status: result.handled ? "PROCESSED" : "IGNORED",
          processed_at: new Date(),
          error: null,
        },
      });
      return { success: true, data: { handled: result.handled } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.prisma.stripeWebhookEvent.update({
        where: { id: stored.id },
        data: { status: "FAILED", error: message.slice(0, 4000) },
      });
      throw err;
    }
  }
}
