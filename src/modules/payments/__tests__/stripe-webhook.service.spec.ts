import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { StripeGatewayService, StripeSdk } from "../stripe-gateway.service";
import { StripeWebhookService } from "../stripe-webhook.service";

const SECRET = "whsec_unit_test_secret";
const TENANT_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const TENANT_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

function signedBody(event: object, secret = SECRET) {
  const payload = JSON.stringify(event);
  return {
    raw: Buffer.from(payload),
    sig: StripeSdk.webhooks.generateTestHeaderString({ payload, secret }),
  };
}

const sessionEvent = (metadata: Record<string, string>, id = "evt_1") => ({
  id,
  object: "event",
  type: "checkout.session.completed",
  livemode: false,
  data: {
    object: {
      id: "cs_1",
      object: "checkout.session",
      mode: "payment",
      status: "complete",
      payment_status: "paid",
      amount_total: 1000,
      currency: "usd",
      payment_intent: "pi_1",
      metadata,
    },
  },
});

function setup() {
  process.env.STRIPE_SECRET_KEY = "sk_test_unit";
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  const stored = { id: "row-1", status: "RECEIVED", tenant_id: null };
  const prisma = {
    stripeWebhookEvent: {
      create: jest.fn().mockResolvedValue(stored),
      findUniqueOrThrow: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue(stored),
    },
    tenantPaymentGateway: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const stripe = new StripeGatewayService();
  const settings = { resolveWebhookByToken: jest.fn() };
  const invoicePayments = {
    applyCheckoutSession: jest.fn().mockResolvedValue({ handled: true }),
    applyPaymentIntent: jest.fn().mockResolvedValue({ handled: true }),
    applyStripeRefund: jest.fn(),
  };
  const platform = {
    applyCheckoutSession: jest.fn().mockResolvedValue({ handled: true }),
    applyPaymentIntent: jest.fn(),
    applyStripeRefund: jest.fn(),
  };
  const subs = { syncSubscription: jest.fn() };
  const audit = { log: jest.fn() };
  const service = new StripeWebhookService(
    prisma as never,
    stripe,
    settings as never,
    invoicePayments as never,
    platform as never,
    subs as never,
    audit as never,
  );
  return { service, prisma, settings, invoicePayments, platform };
}

describe("StripeWebhookService", () => {
  afterAll(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("rejects an invalid signature before storing anything", async () => {
    const { service, prisma } = setup();
    const { raw, sig } = signedBody(sessionEvent({}), "whsec_attacker");
    await expect(service.handle(raw, sig)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.stripeWebhookEvent.create).not.toHaveBeenCalled();
  });

  it("rejects a missing signature / body", async () => {
    const { service } = setup();
    await expect(
      service.handle(Buffer.from("{}"), undefined),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.handle(undefined, "t=1,v1=x")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("stores, dispatches and marks a tenant invoice event processed", async () => {
    const { service, prisma, invoicePayments } = setup();
    const { raw, sig } = signedBody(
      sessionEvent({
        erp_scope: "tenant_invoice",
        tenant_id: TENANT_A,
        payment_id: "p",
      }),
    );
    const res = await service.handle(raw, sig);
    expect(res).toEqual({ received: true, handled: true });
    expect(
      prisma.stripeWebhookEvent.create.mock.calls[0][0].data,
    ).toMatchObject({
      stripe_event_id: "evt_1",
      account_ref: "platform",
    });
    expect(invoicePayments.applyCheckoutSession).toHaveBeenCalledWith(
      TENANT_A,
      "platform",
      expect.objectContaining({ id: "cs_1" }),
      "checkout.session.completed",
    );
    expect(
      prisma.stripeWebhookEvent.update.mock.calls.at(-1)[0].data.status,
    ).toBe("PROCESSED");
  });

  it("skips a duplicate delivery (already claimed / processed)", async () => {
    const { service, prisma, invoicePayments } = setup();
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 0 });
    const { raw, sig } = signedBody(
      sessionEvent({ erp_scope: "tenant_invoice", tenant_id: TENANT_A }),
    );
    const res = await service.handle(raw, sig);
    expect(res.duplicate).toBe(true);
    expect(invoicePayments.applyCheckoutSession).not.toHaveBeenCalled();
  });

  it("marks FAILED and surfaces 5xx so Stripe retries", async () => {
    const { service, prisma, invoicePayments } = setup();
    invoicePayments.applyCheckoutSession.mockRejectedValue(
      new Error("db down"),
    );
    const { raw, sig } = signedBody(
      sessionEvent({ erp_scope: "tenant_invoice", tenant_id: TENANT_A }),
    );
    await expect(service.handle(raw, sig)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    const last = prisma.stripeWebhookEvent.update.mock.calls.at(-1)[0].data;
    expect(last.status).toBe("FAILED");
    expect(last.error).toContain("db down");
  });

  it("on a tenant's own endpoint, ignores metadata naming another tenant", async () => {
    const { service, settings, invoicePayments } = setup();
    const tenantSecret = "whsec_tenant_a";
    settings.resolveWebhookByToken.mockResolvedValue({
      gateway: { tenant_id: TENANT_A },
      accountRef: "tenant:gw-a",
      webhookSecret: tenantSecret,
      client: {},
    });
    const { raw, sig } = signedBody(
      sessionEvent({ erp_scope: "tenant_invoice", tenant_id: TENANT_B }),
      tenantSecret,
    );
    const res = await service.handle(raw, sig, "a".repeat(48));
    expect(res.handled).toBe(false);
    expect(invoicePayments.applyCheckoutSession).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown tenant webhook token", async () => {
    const { service, settings } = setup();
    settings.resolveWebhookByToken.mockResolvedValue(null);
    const { raw, sig } = signedBody(sessionEvent({}));
    await expect(
      service.handle(raw, sig, "b".repeat(48)),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.handle(raw, sig, "../etc")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("never applies platform-invoice events arriving on a tenant account", async () => {
    const { service, settings, platform } = setup();
    settings.resolveWebhookByToken.mockResolvedValue({
      gateway: { tenant_id: TENANT_A },
      accountRef: "tenant:gw-a",
      webhookSecret: "whsec_t",
      client: {},
    });
    const { raw, sig } = signedBody(
      sessionEvent({ erp_scope: "platform_invoice", tenant_id: TENANT_A }),
      "whsec_t",
    );
    const res = await service.handle(raw, sig, "c".repeat(48));
    expect(res.handled).toBe(false);
    expect(platform.applyCheckoutSession).not.toHaveBeenCalled();
  });

  it("ignores unrelated event types", async () => {
    const { service, prisma } = setup();
    const { raw, sig } = signedBody({
      ...sessionEvent({}),
      type: "customer.created",
    });
    const res = await service.handle(raw, sig);
    expect(res.handled).toBe(false);
    expect(
      prisma.stripeWebhookEvent.update.mock.calls.at(-1)[0].data.status,
    ).toBe("IGNORED");
  });
});
