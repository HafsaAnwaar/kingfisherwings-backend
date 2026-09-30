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
