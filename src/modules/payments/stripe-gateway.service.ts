import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import Stripe from "stripe";
import { createHash } from "crypto";

/**
 * Runtime Stripe constructor. The project compiles without
 * esModuleInterop, so `import Stripe from "stripe"` becomes
 * `require("stripe").default`, which is undefined for stripe@22's CJS
 * build (the module itself is the constructor). The default import above
 * is used for types only.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stripeModule = require("stripe") as typeof Stripe & {
  default?: typeof Stripe;
};
export const StripeSdk: typeof Stripe = stripeModule.default ?? stripeModule;

/**
 * The only place that talks to the Stripe SDK. Everything else in the ERP
 * works with ERP ids and calls through here, so Stripe stays an external
 * processor behind one seam (and is trivial to mock in tests).
 */
@Injectable()
export class StripeGatewayService {
  private readonly logger = new Logger(StripeGatewayService.name);
  private readonly clients = new Map<string, Stripe>();

  /** Platform (Super Admin) Stripe account — env configured. */
  platformClient(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    return key ? this.clientForKey(key) : null;
  }

  requirePlatformClient(): Stripe {
    const client = this.platformClient();
    if (!client) {
      throw new ServiceUnavailableException(
        "Stripe is not configured on the platform (STRIPE_SECRET_KEY).",
      );
    }
    return client;
  }

  platformWebhookSecret(): string | null {
    return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
  }

  platformPublishableKey(): string | null {
    return process.env.STRIPE_PUBLISHABLE_KEY?.trim() || null;
  }

  clientForKey(secretKey: string): Stripe {
    const cacheKey = createHash("sha256").update(secretKey).digest("hex");
    let client = this.clients.get(cacheKey);
    if (!client) {
      client = new StripeSdk(secretKey, {
        maxNetworkRetries: 2,
        appInfo: { name: "KingFisher Wings ERP" },
      });
      this.clients.set(cacheKey, client);
    }
    return client;
  }

  /**
   * Verifies the `Stripe-Signature` header against the raw body. Throws
   * BadRequest on any mismatch so the webhook responds 400 (Stripe then
   * retries — a bad signature is never silently accepted).
   */
  constructEvent(
    rawBody: Buffer | undefined,
    signature: string | undefined,
    webhookSecret: string,
  ): Stripe.Event {
    if (!rawBody?.length) {
      throw new BadRequestException("Missing raw webhook body.");
    }
    if (!signature) {
      throw new BadRequestException("Missing Stripe-Signature header.");
    }
    try {
      // Any client instance can verify; signature check is offline.
      return StripeSdk.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.warn(
        `Stripe webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new BadRequestException("Invalid Stripe webhook signature.");
    }
  }

  async createCustomer(
    client: Stripe,
    params: Stripe.CustomerCreateParams,
    idempotencyKey: string,
  ): Promise<Stripe.Customer> {
    return this.call("customers.create", () =>
      client.customers.create(params, { idempotencyKey }),
    );
  }

  async createCheckoutSession(
    client: Stripe,
    params: Stripe.Checkout.SessionCreateParams,
    idempotencyKey: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.call("checkout.sessions.create", () =>
      client.checkout.sessions.create(params, { idempotencyKey }),
    );
  }

  async retrieveCheckoutSession(
    client: Stripe,
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.call("checkout.sessions.retrieve", () =>
      client.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
      }),
    );
  }

  /** Best effort: an already completed/expired session cannot be expired. */
  async expireCheckoutSession(client: Stripe, sessionId: string) {
    try {
      await client.checkout.sessions.expire(sessionId);
      return true;
    } catch (err) {
      this.logger.debug(
        `Could not expire checkout session ${sessionId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  async createRefund(
    client: Stripe,
    params: Stripe.RefundCreateParams,
    idempotencyKey: string,
  ): Promise<Stripe.Refund> {
    return this.call("refunds.create", () =>
      client.refunds.create(params, { idempotencyKey }),
    );
  }

  /** API version this SDK speaks; webhook endpoints should match it. */
  sdkApiVersion(): string | null {
    const v = (StripeSdk as unknown as { API_VERSION?: string }).API_VERSION;
    return v ?? null;
  }

  /**
   * Processing fee for a succeeded PaymentIntent, from its charge's
   * balance transaction. `null` while Stripe has not settled it yet.
   */
  async paymentIntentFee(
    client: Stripe,
    paymentIntentId: string,
  ): Promise<{
    chargeId: string | null;
    fee: number;
    currency: string;
  } | null> {
    const pi = await this.call("paymentIntents.retrieve", () =>
      client.paymentIntents.retrieve(paymentIntentId, {
        expand: ["latest_charge.balance_transaction"],
      }),
    );
    const charge =
      pi.latest_charge && typeof pi.latest_charge !== "string"
        ? pi.latest_charge
        : null;
    const bt =
      charge?.balance_transaction &&
      typeof charge.balance_transaction !== "string"
        ? charge.balance_transaction
        : null;
    if (!bt) return null;
    return { chargeId: charge?.id ?? null, fee: bt.fee, currency: bt.currency };
  }

  // ─── Stripe Connect (vendor payouts, company collection) ───

  /** Connect is "provided later": everything below is off until enabled. */
  connectEnabled(): boolean {
    return process.env.STRIPE_CONNECT_ENABLED === "true";
  }

  platformConnectWebhookSecret(): string | null {
    return process.env.STRIPE_CONNECT_WEBHOOK_SECRET?.trim() || null;
  }

  async createConnectedAccount(
    client: Stripe,
    params: Stripe.AccountCreateParams,
    idempotencyKey: string,
  ) {
    return this.call("accounts.create", () =>
      client.accounts.create(params, { idempotencyKey }),
    );
  }

  async retrieveConnectedAccount(client: Stripe, accountId: string) {
    return this.call("accounts.retrieve", () =>
      client.accounts.retrieve(accountId),
    );
  }

  async createAccountLink(
    client: Stripe,
    params: Stripe.AccountLinkCreateParams,
  ) {
    return this.call("accountLinks.create", () =>
      client.accountLinks.create(params),
    );
  }

  /** Moves funds from the sending account's balance to a connected account. */
  async createTransfer(
    client: Stripe,
    params: Stripe.TransferCreateParams,
    idempotencyKey: string,
  ) {
    return this.call("transfers.create", () =>
      client.transfers.create(params, { idempotencyKey }),
    );
  }

  /**
   * Account debit: pulls funds from a connected account's balance into the
   * platform balance (used to fund a vendor payout for a company that
   * collects through its own connected account).
   */
  async debitConnectedAccount(
    client: Stripe,
    connectedAccountId: string,
    params: Omit<Stripe.TransferCreateParams, "destination">,
    idempotencyKey: string,
  ) {
    const platformId = await this.platformAccountId(client);
    return this.call("transfers.create(debit)", () =>
      client.transfers.create(
        { ...params, destination: platformId },
        { idempotencyKey, stripeAccount: connectedAccountId },
      ),
    );
  }

  /** Reverses a transfer (optionally one created on a connected account). */
  async reverseTransfer(
    client: Stripe,
    transferId: string,
    params: Stripe.TransferCreateReversalParams,
    idempotencyKey: string,
    onAccount?: string,
  ) {
    return this.call("transfers.createReversal", () =>
      client.transfers.createReversal(transferId, params, {
        idempotencyKey,
        ...(onAccount ? { stripeAccount: onAccount } : {}),
      }),
    );
  }

  /** Transfer that settled a destination charge into the connected account. */
  async destinationTransferId(
    client: Stripe,
    paymentIntentId: string,
  ): Promise<string | null> {
    const pi = await this.call("paymentIntents.retrieve", () =>
      client.paymentIntents.retrieve(paymentIntentId, {
        expand: ["latest_charge"],
      }),
    );
    const charge =
      pi.latest_charge && typeof pi.latest_charge !== "string"
        ? pi.latest_charge
        : null;
    const transfer = charge?.transfer;
    return typeof transfer === "string" ? transfer : (transfer?.id ?? null);
  }

  async createLoginLink(client: Stripe, connectedAccountId: string) {
    return this.call("accounts.createLoginLink", () =>
      client.accounts.createLoginLink(connectedAccountId),
    );
  }

  private platformIdCache = new WeakMap<Stripe, string>();

  private async platformAccountId(client: Stripe): Promise<string> {
    const cached = this.platformIdCache.get(client);
    if (cached) return cached;
    const acct = await this.call("accounts.retrieve(self)", () =>
      client.accounts.retrieveCurrent(),
    );
    this.platformIdCache.set(client, acct.id);
    return acct.id;
  }

  /**
   * Platform application fee on Connect customer payments, in basis points
   * (STRIPE_CONNECT_APPLICATION_FEE_BPS, default 0 = no fee).
   */
  connectApplicationFeeBps(): number {
    const raw = Number(process.env.STRIPE_CONNECT_APPLICATION_FEE_BPS ?? 0);
    return Number.isFinite(raw) && raw > 0
      ? Math.min(Math.floor(raw), 5000)
      : 0;
  }

  async listRefundsForPaymentIntent(client: Stripe, paymentIntentId: string) {
    const page = await this.call("refunds.list", () =>
      client.refunds.list({ payment_intent: paymentIntentId, limit: 100 }),
    );
    return page.data;
  }

  async createProduct(
    client: Stripe,
    params: Stripe.ProductCreateParams,
    idempotencyKey: string,
  ) {
    return this.call("products.create", () =>
      client.products.create(params, { idempotencyKey }),
    );
  }

  async createPrice(
    client: Stripe,
    params: Stripe.PriceCreateParams,
    idempotencyKey: string,
  ) {
    return this.call("prices.create", () =>
      client.prices.create(params, { idempotencyKey }),
    );
  }

  async retrieveSubscription(client: Stripe, id: string) {
    return this.call("subscriptions.retrieve", () =>
      client.subscriptions.retrieve(id),
    );
  }

  async updateSubscription(
    client: Stripe,
    id: string,
    params: Stripe.SubscriptionUpdateParams,
    idempotencyKey?: string,
  ) {
    return this.call("subscriptions.update", () =>
      client.subscriptions.update(
        id,
        params,
        idempotencyKey ? { idempotencyKey } : undefined,
      ),
    );
  }

  /**
   * Wraps SDK calls so Stripe error details are logged server-side but
   * the API only returns a generic, non-leaky message.
   */
  private async call<T>(op: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      const e = err as { type?: string; code?: string; message?: string };
      this.logger.error(
        `Stripe ${op} failed: ${e.type ?? "error"} ${e.code ?? ""} ${e.message ?? String(err)}`,
      );
      if (
        e.type === "StripeCardError" ||
        e.type === "StripeInvalidRequestError"
      ) {
        throw new BadRequestException(
          `Payment provider rejected the request${e.code ? ` (${e.code})` : ""}.`,
        );
      }
      throw new ServiceUnavailableException(
        "Payment provider is unavailable. Please try again.",
      );
    }
  }
}
