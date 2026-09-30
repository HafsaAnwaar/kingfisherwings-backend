/**
 * Stripe payment gateway — end-to-end against a real database.
 * Requires DATABASE_URL with migrations applied (like the other e2e specs).
 *
 * Stripe's API is never called: the checkout attempt row is written the way
 * startCheckout persists it after Stripe returns a session, and webhooks are
 * genuinely signed with STRIPE_WEBHOOK_SECRET, so signature verification,
 * idempotency and the ERP accounting integration are exercised for real.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from "../app.module";
import { PrismaService } from "../prisma/prisma.service";
import { StripeSdk } from "../modules/payments/stripe-gateway.service";

// Read at request time by the payments module, so setting them here is enough.
const WHSEC = "whsec_e2e_stripe_payments";
process.env.STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || "sk_test_e2e_placeholder";
process.env.STRIPE_WEBHOOK_SECRET = WHSEC;
process.env.STRIPE_PUBLISHABLE_KEY = "pk_test_e2e";
process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY =
  process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY || "e2e-payment-gateway-key";

describe("Stripe payments (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const runId = Date.now();
  const pw = "SuperSecure@2026";
  let sa: string;
  const A = { id: "", token: "" };
  const B = { id: "", token: "" };
  let partyId: string;
  let evtSeq = 0;

  const http = () => request(app.getHttpServer());
  /** AppThrottlerGuard skips rate limits when this matches CRON_SECRET. */
  const bypass = { "X-Throttle-Bypass": process.env.CRON_SECRET ?? "" };
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const data = <T = Record<string, unknown>>(res: request.Response): T =>
    (res.body?.data ?? res.body) as T;

  function signedWebhook(
    type: string,
    object: Record<string, unknown>,
    secret = WHSEC,
  ) {
    const payload = JSON.stringify({
      id: `evt_e2e_${runId}_${++evtSeq}`,
      object: "event",
      type,
      livemode: false,
      created: Math.floor(Date.now() / 1000),
      data: { object },
    });
    const header = StripeSdk.webhooks.generateTestHeaderString({
      payload,
      secret,
    });
    return { payload, header };
  }
  const postWebhook = (w: { payload: string; header: string }) =>
    http()
      .post("/payments/stripe/webhook")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", w.header)
      .send(w.payload);

  async function tenant(tag: string) {
    const slug = `stp-${tag}-${runId}`;
    await http()
      .post("/tenants")
      .set(auth(sa))
      .send({
        code: `S${tag}${runId}`.slice(0, 20),
        name: `Stripe ${tag}`,
        slug,
        password: pw,
        email: `owner.${tag}.${runId}@stripe.test`,
        base_currency: "USD",
      })
      .expect(201);
    const login = await http()
      .post("/auth/tenant-login")
      .set(bypass)
      .send({ tenant_slug: slug, password: pw })
      .expect(200);
    const row = await prisma.tenant.findUniqueOrThrow({ where: { slug } });
    return { id: row.id, token: login.body.data.access_token as string };
  }

  async function postedInvoice(amount: number) {
    const inv = await http()
      .post("/invoices")
      .set(auth(A.token))
      .send({
        party_id: partyId,
        currency_code: "USD",
        vat_rate: 0,
        lines: [
          {
            description: "Ocean freight",
            unit_price: amount,
            is_taxable: false,
          },
        ],
      })
      .expect(201);
    const id = data<{ id: string }>(inv).id;
    await http().post(`/invoices/${id}/post`).set(auth(A.token)).expect(201);
    return prisma.invoice.findUniqueOrThrow({ where: { id } });
  }

  /** What startCheckout persists after Stripe returns a Checkout Session. */
  async function attempt(invoiceId: string, amount: number, n: number) {
    return prisma.runWithTenant(A.id, (tx) =>
      tx.paymentTransaction.create({
        data: {
          tenant_id: A.id,
          invoice_id: invoiceId,
          party_id: partyId,
          status: "PENDING",
          attempt_number: n,
          amount,
          currency_code: "USD",
          amount_minor: BigInt(Math.round(amount * 100)),
          account_ref: "platform",
          stripe_checkout_session_id: `cs_e2e_${runId}_${invoiceId.slice(0, 8)}_${n}`,
          checkout_url: "https://checkout.stripe.com/c/test",
          checkout_expires_at: new Date(Date.now() + 3600_000),
          initiated_by_type: "STAFF",
        },
      }),
    );
  }

  const session = (
    inv: { id: string; invoice_number: string },
    txn: {
      id: string;
      stripe_checkout_session_id: string | null;
      amount_minor: bigint;
    },
    pi: string,
    over: Record<string, unknown> = {},
  ) => ({
    id: txn.stripe_checkout_session_id,
    object: "checkout.session",
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    amount_total: Number(txn.amount_minor),
    currency: "usd",
    payment_intent: pi,
    metadata: {
      erp_scope: "tenant_invoice",
      tenant_id: A.id,
      invoice_id: inv.id,
      payment_id: txn.id,
      party_id: partyId,
      invoice_number: inv.invoice_number,
    },
    ...over,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const saRes = await http()
      .post("/auth/super-admin/signup")
      .set(bypass)
      .send({
        email: `stp.sa.${runId}@stripe.test`,
        password: pw,
        first_name: "Stripe",
        last_name: "Admin",
      })
      .expect(201);
    sa = saRes.body.data.access_token;
    Object.assign(A, await tenant("a"));
    Object.assign(B, await tenant("b"));

    await http()
      .post("/gl/accounts/seed-defaults")
      .set(auth(A.token))
      .send({})
      .expect(201);
    const party = await http()
      .post("/parties")
      .set(auth(A.token))
      .send({
        party_type: "CUSTOMER",
        code: `C${runId}`.slice(0, 20),
        name: "Acme",
        email: "ap@acme.test",
      })
      .expect(201);
    partyId = data<{ id: string }>(party).id;
    // Tenants may not self-enable platform-account collection (compliance).
    await http()
      .put("/payments/stripe/settings")
      .set(auth(A.token))
      .send({ is_enabled: true, use_platform_account: true })
      .expect(403);
    await http()
      .put(`/platform/tenants/${A.id}/payment-gateway`)
      .set(auth(sa))
      .send({ is_enabled: true, use_platform_account: true })
      .expect(200);
  }, 180_000);

  afterAll(async () => {
    await app?.close();
  });

  it("rejects webhooks with an invalid signature", async () => {
    const w = signedWebhook(
      "checkout.session.completed",
      { id: "cs_x" },
      "whsec_wrong",
    );
    await postWebhook(w).expect(400);
    await http().post("/payments/stripe/webhook").send(w.payload).expect(400);
  });

  it("successful payment posts one ERP receipt, allocation and voucher; duplicates are ignored", async () => {
    const inv = await postedInvoice(1000);
    const txn = await attempt(inv.id, 1000, 1);
    const pi = `pi_e2e_${runId}_ok`;
    const w = signedWebhook(
      "checkout.session.completed",
      session(inv, txn, pi),
    );

    const first = await postWebhook(w).expect(200);
    expect(first.body).toEqual({ received: true, handled: true });
    const dup = await postWebhook(w).expect(200);
    expect(dup.body.duplicate).toBe(true);
    await postWebhook(
      signedWebhook("payment_intent.succeeded", {
        id: pi,
        object: "payment_intent",
        status: "succeeded",
        amount: 100000,
        amount_received: 100000,
        currency: "usd",
        metadata: session(inv, txn, pi).metadata,
      }),
    ).expect(200);

    const payments = await prisma.payment.findMany({
      where: {
        tenant_id: A.id,
        reference_number: `STRIPE:${pi}`,
        status: { not: "CANCELLED" },
      },
      include: { voucher: true, allocations: true },
    });
    expect(payments).toHaveLength(1);
    expect(payments[0].status).toBe("POSTED");
    expect(payments[0].voucher?.voucher_type).toBe("BANK_RECEIPT");
    expect(Number(payments[0].allocations[0].amount)).toBe(1000);
    const after = await prisma.invoice.findUniqueOrThrow({
      where: { id: inv.id },
    });
    expect(after.status).toBe("PAID");
    expect(Number(after.balance_due)).toBe(0);

    // Partial refund (e.g. from the Stripe dashboard) → ERP reversal + net re-post.
    await postWebhook(
      signedWebhook("refund.updated", {
        id: `re_e2e_${runId}`,
        object: "refund",
        status: "succeeded",
        amount: 25000,
        currency: "usd",
        payment_intent: pi,
        metadata: {},
      }),
    ).expect(200);
    const reopened = await prisma.invoice.findUniqueOrThrow({
      where: { id: inv.id },
    });
    expect(reopened.status).toBe("PARTIALLY_PAID");
    expect(Number(reopened.balance_due)).toBe(250);
    const txnAfter = await prisma.runWithTenant(A.id, (tx) =>
      tx.paymentTransaction.findUniqueOrThrow({ where: { id: txn.id } }),
    );
    expect(txnAfter.status).toBe("PARTIALLY_REFUNDED");
  });

  it("failed payment leaves the invoice unpaid and allows a retry on the same invoice", async () => {
    const inv = await postedInvoice(300);
    const txn = await attempt(inv.id, 300, 1);
    await postWebhook(
      signedWebhook("payment_intent.payment_failed", {
        id: `pi_e2e_${runId}_fail`,
        object: "payment_intent",
        status: "requires_payment_method",
        amount: 30000,
        currency: "usd",
        last_payment_error: { code: "card_declined", message: "Declined" },
        metadata: session(inv, txn, "x").metadata,
      }),
    ).expect(200);
    const status = await http()
      .get(`/invoices/${inv.id}/payment-status`)
      .set(auth(A.token))
      .expect(200);
    expect(status.body.data.payment_status).toBe("FAILED");
    expect(status.body.data.can_pay_online).toBe(true);
    expect(
      (await prisma.invoice.findUniqueOrThrow({ where: { id: inv.id } }))
        .status,
    ).toBe("POSTED");

    const expired = await attempt(inv.id, 300, 2);
    await postWebhook(
      signedWebhook(
        "checkout.session.expired",
        session(inv, expired, "x", {
          status: "expired",
          payment_status: "unpaid",
        }),
      ),
    ).expect(200);
    const retry = await attempt(inv.id, 300, 3);
    await postWebhook(
      signedWebhook(
        "checkout.session.completed",
        session(inv, retry, `pi_e2e_${runId}_retry`),
      ),
    ).expect(200);
    expect(
      (await prisma.invoice.findUniqueOrThrow({ where: { id: inv.id } }))
        .status,
    ).toBe("PAID");
  });

  it("does not post when Stripe's amount differs from the ERP attempt", async () => {
    const inv = await postedInvoice(80);
    const txn = await attempt(inv.id, 80, 1);
    await postWebhook(
      signedWebhook(
        "checkout.session.completed",
        session(inv, txn, `pi_e2e_${runId}_mm`, { amount_total: 1 }),
      ),
    ).expect(200);
    expect(
      (await prisma.invoice.findUniqueOrThrow({ where: { id: inv.id } }))
        .status,
    ).toBe("POSTED");
  });

  it("isolates tenants", async () => {
    const inv = await postedInvoice(50);
    await http()
      .get(`/invoices/${inv.id}/payment-status`)
      .set(auth(B.token))
      .expect(404);
    await http()
      .post(`/invoices/${inv.id}/pay`)
      .set(auth(B.token))
      .send({})
      .expect(404);
    await http()
      .post(`/invoices/${inv.id}/pay`)
      .set(auth(A.token))
      .send({ amount: 1 })
      .expect(400);
    const txn = await attempt(inv.id, 50, 1);
    await http().get(`/payments/${txn.id}`).set(auth(B.token)).expect(404);
    const forged = await postWebhook(
      signedWebhook("checkout.session.completed", {
        ...session(inv, txn, "pi_forged"),
        metadata: {
          ...session(inv, txn, "pi_forged").metadata,
          tenant_id: B.id,
        },
      }),
    ).expect(200);
    expect(forged.body.handled).toBe(false);
  });

  it("chargebacks: an open dispute blocks refunds; a lost dispute reverses the receipt", async () => {
    const inv = await postedInvoice(200);
    const txn = await attempt(inv.id, 200, 1);
    const pi = `pi_e2e_${runId}_dispute`;
    await postWebhook(
      signedWebhook("checkout.session.completed", session(inv, txn, pi)),
    ).expect(200);
    expect(
      (await prisma.invoice.findUniqueOrThrow({ where: { id: inv.id } }))
        .status,
    ).toBe("PAID");

    const dispute = (status: string) => ({
      id: `du_e2e_${runId}`,
      object: "dispute",
      payment_intent: pi,
      amount: 20000,
      currency: "usd",
      status,
      reason: "fraudulent",
      metadata: {},
    });
    const opened = await postWebhook(
      signedWebhook("charge.dispute.created", dispute("needs_response")),
    ).expect(200);
    expect(opened.body.handled).toBe(true);
    const disputed = await prisma.runWithTenant(A.id, (tx) =>
      tx.paymentTransaction.findUniqueOrThrow({ where: { id: txn.id } }),
    );
    expect(disputed.status).toBe("DISPUTED");
    await http()
      .post(`/payments/${txn.id}/refund`)
      .set(auth(A.token))
      .send({})
      .expect(400);

    const closed = signedWebhook("charge.dispute.closed", dispute("lost"));
    await postWebhook(closed).expect(200);
    await postWebhook(closed).expect(200); // redelivery is a no-op
    const reopened = await prisma.invoice.findUniqueOrThrow({
      where: { id: inv.id },
    });
    expect(reopened.status).not.toBe("PAID");
    expect(Number(reopened.balance_due)).toBe(200);
    const live = await prisma.payment.count({
      where: {
        tenant_id: A.id,
        reference_number: `STRIPE:${pi}`,
        status: "POSTED",
      },
    });
    expect(live).toBe(0);
    const after = await prisma.runWithTenant(A.id, (tx) =>
      tx.paymentTransaction.findUniqueOrThrow({ where: { id: txn.id } }),
    );
    expect(after.status).toBe("REFUNDED");
    expect(after.dispute_status).toBe("lost");
  });

  it("reconciler and readiness endpoints", async () => {
    const r = await http()
      .post("/payments/stripe/reconcile")
      .set(auth(A.token))
      .expect(201);
    expect(r.body.data).toEqual(
      expect.objectContaining({ checked: expect.any(Number) }),
    );
    const status = await http()
      .get("/platform/billing/stripe/status")
      .set(auth(sa))
      .expect(200);
    expect(status.body.data).toEqual(
      expect.objectContaining({
        ready: expect.any(Boolean),
        problems: expect.any(Array),
      }),
    );
    await http()
      .post("/platform/billing/reconcile")
      .set(auth(A.token))
      .expect(403);
  });

  it("platform billing: Super Admin invoice → tenant proof → verification", async () => {
    const created = await http()
      .post("/platform/invoices")
      .set(auth(sa))
      .send({
        tenant_id: A.id,
        currency_code: "USD",
        lines: [
          { description: "Monthly Platform Fee", unit_price: 500 },
          { description: "Additional User Fee", quantity: 3, unit_price: 20 },
        ],
        discount_amount: 60,
        tax_rate: 5,
      })
      .expect(201);
    const inv = created.body.data;
    expect(inv.total_amount).toBe("525.00");
    await http()
      .post("/platform/invoices")
      .set(auth(A.token))
      .send({ tenant_id: A.id, lines: [] })
      .expect(403);
    await http()
      .post(`/platform/invoices/${inv.id}/send`)
      .set(auth(sa))
      .send({ to_email: "billing@a.test" })
      .expect(201);
    await http()
      .get(`/tenant/platform-invoices/${inv.id}`)
      .set(auth(B.token))
      .expect(404);

    const proof = await http()
      .post(`/tenant/platform-invoices/${inv.id}/payment-proof`)
      .set(auth(A.token))
      .field("amount", "525")
      .field("payment_method", "BANK_TRANSFER")
      .attach("file", Buffer.from("%PDF-1.4"), {
        filename: "slip.pdf",
        contentType: "application/pdf",
      })
      .expect(201);
    expect(proof.body.data.status).toBe("PENDING_VERIFICATION");
    await http()
      .post(`/platform/payments/${proof.body.data.id}/verify`)
      .set(auth(A.token))
      .expect(403);
    await http()
      .post(`/platform/payments/${proof.body.data.id}/verify`)
      .set(auth(sa))
      .expect(201);
    await http()
      .post(`/platform/payments/${proof.body.data.id}/verify`)
      .set(auth(sa))
      .expect(400);
    const status = await http()
      .get(`/tenant/platform-invoices/${inv.id}/payment-status`)
      .set(auth(A.token))
      .expect(200);
    expect(status.body.data.invoice_status).toBe("PAID");
  });
});
