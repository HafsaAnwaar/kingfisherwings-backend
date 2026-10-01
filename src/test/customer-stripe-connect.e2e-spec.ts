/**
 * Customer → company invoice payments through the company's own Stripe
 * Connect account — end-to-end against a real database. Stripe's API is
 * never called (StripeGatewayService network methods are faked); webhooks
 * are genuinely signed, so onboarding, Checkout, ERP posting, refunds,
 * vendor payouts and tenant isolation run through the real code paths.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from "../app.module";
import { PrismaService } from "../prisma/prisma.service";
import {
  StripeGatewayService,
  StripeSdk,
} from "../modules/payments/stripe-gateway.service";

const WHSEC = "whsec_e2e_customer_connect";
const CONNECT_WHSEC = "whsec_e2e_customer_connect_accounts";
process.env.STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || "sk_test_e2e_placeholder";
process.env.STRIPE_PUBLISHABLE_KEY = "pk_test_e2e_platform";
process.env.STRIPE_WEBHOOK_SECRET = WHSEC;
process.env.STRIPE_CONNECT_WEBHOOK_SECRET = CONNECT_WHSEC;
process.env.STRIPE_CONNECT_ENABLED = "true";
process.env.STRIPE_CONNECT_APPLICATION_FEE_BPS = "100"; // 1 %
process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY =
  process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY || "e2e-payment-gateway-key";

describe("Customer pays company invoices via Stripe Connect (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const runId = Date.now();
  const pw = "SuperSecure@2026";
  let sa: string;
  const A = { id: "", token: "", slug: "" };
  const B = { id: "", token: "", slug: "" };
  let customerId: string;
  let portalToken: string;
  let evtSeq = 0;

  // ── fake Stripe ──
  const accounts = new Map<string, { ready: boolean; metadata: unknown }>();
  const sessions: Array<Record<string, any>> = [];
  const refunds: Array<Record<string, any>> = [];
  const debits: Array<Record<string, any>> = [];
  const transfers: Array<Record<string, any>> = [];
  let feeLookups = 0;
  const account = (id: string) => {
    const a = accounts.get(id);
    return {
      id,
      object: "account",
      details_submitted: Boolean(a?.ready),
      charges_enabled: Boolean(a?.ready),
      payouts_enabled: Boolean(a?.ready),
      capabilities: { transfers: a?.ready ? "active" : "inactive" },
      requirements: { currently_due: a?.ready ? [] : ["external_account"] },
      metadata: a?.metadata ?? {},
    };
  };

  const http = () => request(app.getHttpServer());
  const bypass = { "X-Throttle-Bypass": process.env.CRON_SECRET ?? "" };
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const data = <T = Record<string, any>>(res: request.Response): T =>
    (res.body?.data ?? res.body) as T;

  function signed(type: string, object: object, secret: string) {
    const payload = JSON.stringify({
      id: `evt_cc_${runId}_${++evtSeq}`,
      object: "event",
      type,
      livemode: false,
      created: Math.floor(Date.now() / 1000),
      data: { object },
    });
    return {
      payload,
      header: StripeSdk.webhooks.generateTestHeaderString({ payload, secret }),
    };
  }
  const post = (path: string, w: { payload: string; header: string }) =>
    http()
      .post(path)
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", w.header)
      .send(w.payload);
  const platformWebhook = (type: string, object: object) =>
    post("/payments/stripe/webhook", signed(type, object, WHSEC));
  const connectWebhook = (type: string, object: object) =>
    post(
      "/payments/stripe/webhook/connect",
      signed(type, object, CONNECT_WHSEC),
    );

  async function waitFor<T>(fn: () => Promise<T>, ok: (v: T) => boolean) {
    const until = Date.now() + 10_000;
    let v = await fn();
    while (!ok(v) && Date.now() < until) {
      await new Promise((r) => setTimeout(r, 200));
      v = await fn();
    }
    return v;
  }

  async function tenant(tag: string) {
    const slug = `cc-${tag}-${runId}`;
    await http()
      .post("/tenants")
      .set(auth(sa))
      .send({
        code: `C${tag}${runId}`.slice(0, 20),
        name: `Connect ${tag}`,
        slug,
        password: pw,
        email: `owner.${tag}.${runId}@cc.test`,
        base_currency: "USD",
      })
      .expect(201);
    const login = await http()
      .post("/auth/tenant-login")
      .set(bypass)
      .send({ tenant_slug: slug, password: pw })
      .expect(200);
    const token = login.body.data.access_token as string;
    await http()
      .post("/gl/accounts/seed-defaults")
      .set(auth(token))
      .send({})
      .expect(201);
    const row = await prisma.tenant.findUniqueOrThrow({ where: { slug } });
    return { id: row.id, token, slug };
  }

  async function postedInvoice(amount: number) {
    const inv = await http()
      .post("/invoices")
      .set(auth(A.token))
      .send({
        party_id: customerId,
        currency_code: "USD",
        vat_rate: 0,
        lines: [
          { description: "Air freight", unit_price: amount, is_taxable: false },
        ],
      })
      .expect(201);
    const id = data<{ id: string }>(inv).id;
    await http().post(`/invoices/${id}/post`).set(auth(A.token)).expect(201);
    return prisma.invoice.findUniqueOrThrow({ where: { id } });
  }

  const gateway = (tenantId: string) =>
    prisma.tenantPaymentGateway.findUnique({ where: { tenant_id: tenantId } });

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

    const stripe = app.get(StripeGatewayService);
    jest
      .spyOn(stripe, "createConnectedAccount")
      .mockImplementation(async (_c, params) => {
        const id = `acct_cc_${runId}_${accounts.size + 1}`;
        accounts.set(id, { ready: false, metadata: params.metadata || {} });
        return account(id) as never;
      });
    jest
      .spyOn(stripe, "retrieveConnectedAccount")
      .mockImplementation(async (_c, id) => account(id) as never);
    jest.spyOn(stripe, "createAccountLink").mockImplementation(
      async (_c, p) =>
        ({
          url: `https://connect.stripe.com/setup/e/${p.account}`,
          expires_at: Math.floor(Date.now() / 1000) + 300,
        }) as never,
    );
    jest.spyOn(stripe, "createLoginLink").mockImplementation(
      async (_c, id) =>
        ({
          url: `https://connect.stripe.com/express/${id}`,
        }) as never,
    );
    jest
      .spyOn(stripe, "createCustomer")
      .mockImplementation(async () => ({ id: `cus_cc_${runId}` }) as never);
    jest
      .spyOn(stripe, "createCheckoutSession")
      .mockImplementation(async (_c, params) => {
        const s = {
          id: `cs_cc_${runId}_${sessions.length + 1}`,
          object: "checkout.session",
          url: "https://checkout.stripe.com/c/test",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          params,
        };
        sessions.push(s);
        return s as never;
      });
    jest.spyOn(stripe, "expireCheckoutSession").mockResolvedValue(true);
    jest
      .spyOn(stripe, "createRefund")
      .mockImplementation(async (_c, params) => {
        const r = {
          id: `re_cc_${runId}_${refunds.length + 1}`,
          object: "refund",
          status: "succeeded",
          amount: params.amount,
          currency: "usd",
          payment_intent: params.payment_intent,
          metadata: params.metadata,
          params,
        };
        refunds.push(r);
        return r as never;
      });
    jest.spyOn(stripe, "paymentIntentFee").mockImplementation(async () => {
      feeLookups++;
      return { chargeId: "ch_x", fee: 999, currency: "usd" };
    });
    jest
      .spyOn(stripe, "debitConnectedAccount")
      .mockImplementation(async (_c, acct, params, key) => {
        const d = {
          id: `tr_debit_${runId}_${debits.length + 1}`,
          acct,
          params,
          key,
        };
        debits.push(d);
        return d as never;
      });
    jest
      .spyOn(stripe, "createTransfer")
      .mockImplementation(async (_c, params) => {
        const t = { id: `tr_cc_${runId}_${transfers.length + 1}`, ...params };
        transfers.push(t);
        return t as never;
      });

    const saRes = await http()
      .post("/auth/super-admin/signup")
      .set(bypass)
      .send({
        email: `cc.sa.${runId}@cc.test`,
        password: pw,
        first_name: "Connect",
        last_name: "Admin",
      })
      .expect(201);
    sa = saRes.body.data.access_token;
    Object.assign(A, await tenant("a"));
    Object.assign(B, await tenant("b"));

    const party = await http()
      .post("/parties")
      .set(auth(A.token))
      .send({
        party_type: "CUSTOMER",
        code: `K${runId}`.slice(0, 20),
        name: "Globex",
        email: `ap.${runId}@globex.test`,
      })
      .expect(201);
    customerId = data<{ id: string }>(party).id;
    const portalEmail = `buyer.${runId}@globex.test`;
    await http()
      .post(`/parties/${customerId}/portal-users`)
      .set(auth(A.token))
      .send({
        email: portalEmail,
        full_name: "Globex Buyer",
        password: pw,
        send_email: false,
      })
      .expect(201);
    const pLogin = await http()
      .post("/portal/auth/login")
      .set(bypass)
      .send({ tenant_slug: A.slug, email: portalEmail, password: pw });
    expect([200, 201]).toContain(pLogin.status);
    portalToken = data<{ access_token: string }>(pLogin).access_token;
  }, 180_000);

  afterAll(async () => {
    await app?.close();
  });

  it("customer cannot pay before the company connects Stripe", async () => {
    const inv = await postedInvoice(100);
    const cfg = await http()
      .get("/portal/payments/stripe/config")
      .set(auth(portalToken))
      .expect(200);
    expect(data(cfg).enabled).toBe(false);
    await http()
      .post(`/portal/invoices/${inv.id}/pay`)
      .set(auth(portalToken))
      .send({})
      .expect(400);
    // Connect collection cannot be switched on before onboarding.
    await http()
      .put("/payments/stripe/settings")
      .set(auth(A.token))
      .send({ use_connect: true, is_enabled: true })
      .expect(400);
    expect(sessions).toHaveLength(0);
  });

  it("company onboarding turns online payments on automatically", async () => {
    const before = await http()
      .get("/payments/stripe/connect")
      .set(auth(A.token))
      .expect(200);
    expect(data(before)).toMatchObject({
      connect_enabled: true,
      account_connected: false,
    });
    const link = await http()
      .post("/payments/stripe/connect/onboarding-link")
      .set(auth(A.token))
      .expect(201);
    expect(data(link).url).toContain("connect.stripe.com");
    // A second click reuses the same account.
    await http()
      .post("/payments/stripe/connect/onboarding-link")
      .set(auth(A.token))
      .expect(201);
    expect(accounts.size).toBe(1);
    const gw = await gateway(A.id);
    expect(gw?.connect_account_id).toBeTruthy();
    expect(gw?.is_enabled).toBe(false);

    await post(
      "/payments/stripe/webhook/connect",
      signed("account.updated", account(gw!.connect_account_id!), "whsec_bad"),
    ).expect(400);

    accounts.get(gw!.connect_account_id!)!.ready = true;
    await connectWebhook(
      "account.updated",
      account(gw!.connect_account_id!),
    ).expect(200);

    const after = await gateway(A.id);
    expect(after).toMatchObject({
      use_connect: true,
      is_enabled: true,
      connect_charges_enabled: true,
    });
    const status = await http()
      .get("/payments/stripe/connect")
      .set(auth(A.token))
      .expect(200);
    expect(data(status).online_payments_enabled).toBe(true);
    const cfg = await http()
      .get("/portal/payments/stripe/config")
      .set(auth(portalToken))
      .expect(200);
    expect(data(cfg)).toMatchObject({
      enabled: true,
      publishable_key: "pk_test_e2e_platform",
    });
    // The other company is untouched.
    const other = await http()
      .get("/payments/stripe/connect")
      .set(auth(B.token))
      .expect(200);
    expect(data(other).account_connected).toBe(false);
  });

  it("customer pays an invoice; money settles into the company's account and the ERP receipt is posted", async () => {
    const acct = (await gateway(A.id))!.connect_account_id!;
    const inv = await postedInvoice(1000);
    const res = await http()
      .post(`/portal/invoices/${inv.id}/pay`)
      .set(auth(portalToken))
      .send({}) // amount comes from the ERP balance
      .expect(201);
    expect(data(res).checkout_url).toContain("checkout.stripe.com");

    const s = sessions.at(-1)!;
    const pid = s.params.payment_intent_data;
    expect(s.params.line_items[0].price_data.unit_amount).toBe(100000);
    expect(pid.transfer_data).toEqual({ destination: acct });
    expect(pid.on_behalf_of).toBe(acct);
    expect(pid.application_fee_amount).toBe(1000); // 1 % platform fee
    expect(pid.metadata.tenant_id).toBe(A.id);

    const txn = await prisma.paymentTransaction.findFirstOrThrow({
      where: { stripe_checkout_session_id: s.id },
    });
    expect(txn).toMatchObject({
      account_ref: "platform",
      connect_destination_id: acct,
      application_fee_minor: 1000n,
    });

    const pi = `pi_cc_${runId}_1`;
    await platformWebhook("checkout.session.completed", {
      id: s.id,
      object: "checkout.session",
      mode: "payment",
      status: "complete",
      payment_status: "paid",
      amount_total: 100000,
      currency: "usd",
      payment_intent: pi,
      metadata: s.params.metadata,
    }).expect(200);

    const paid = await prisma.invoice.findUniqueOrThrow({
      where: { id: inv.id },
    });
    expect(paid.status).toBe("PAID");
    const receipt = await prisma.payment.findFirstOrThrow({
      where: { tenant_id: A.id, reference_number: `STRIPE:${pi}` },
    });
    expect(receipt.status).toBe("POSTED");

    // Company's cost is the platform fee (Stripe's fee is the platform's).
    const withFee = await waitFor(
      () =>
        prisma.paymentTransaction.findUniqueOrThrow({ where: { id: txn.id } }),
      (t) => Boolean(t.stripe_fee_amount),
    );
    expect(Number(withFee.stripe_fee_amount)).toBe(10);
    expect(feeLookups).toBe(0);

    // Refund comes back out of the company's account.
    await http()
      .post(`/payments/${txn.id}/refund`)
      .set(auth(A.token))
      .send({ amount: 250 })
      .expect(201);
    expect(refunds.at(-1)!.params).toMatchObject({
      payment_intent: pi,
      amount: 25000,
      reverse_transfer: true,
      refund_application_fee: true,
    });
    const reopened = await prisma.invoice.findUniqueOrThrow({
      where: { id: inv.id },
    });
    expect(Number(reopened.balance_due)).toBe(250);

    // Tenant isolation: another company cannot see or refund it.
    await http().get(`/payments/${txn.id}`).set(auth(B.token)).expect(404);
    await http()
      .post(`/payments/${txn.id}/refund`)
      .set(auth(B.token))
      .send({ amount: 1 })
      .expect(404);
  });

  it("vendor payouts are funded from the company's connected account", async () => {
    const acct = (await gateway(A.id))!.connect_account_id!;
    const vendor = await http()
      .post("/parties")
      .set(auth(A.token))
      .send({
        party_type: "TRUCKER",
        code: `V${runId}`.slice(0, 20),
        name: "Haulers",
      })
      .expect(201);
    const vendorId = data<{ id: string }>(vendor).id;
    await http()
      .post(`/vendor-payouts/accounts/${vendorId}/onboarding-link`)
      .set(auth(A.token))
      .expect(201);
    const va = await prisma.vendorPayoutAccount.findFirstOrThrow({
      where: { tenant_id: A.id, party_id: vendorId },
    });
    accounts.get(va.stripe_account_id)!.ready = true;
    await connectWebhook(
      "account.updated",
      account(va.stripe_account_id),
    ).expect(200);

    const pr = await http()
      .post("/payment-requests")
      .set(auth(A.token))
      .send({ party_id: vendorId, amount: 120, currency_code: "USD" })
      .expect(201);
    const prId = data<{ id: string }>(pr).id;
    await http()
      .post(`/payment-requests/${prId}/approve`)
      .set(auth(A.token))
      .send({})
      .expect(201);

    const payout = await waitFor(
      () =>
        prisma.vendorPayout.findFirst({
          where: { tenant_id: A.id, payment_request_id: prId },
        }),
      (p) => Boolean(p?.erp_payment_id),
    );
    expect(payout?.status).toBe("PAID");
    expect(debits.at(-1)).toMatchObject({ acct });
    expect(debits.at(-1)!.params.amount).toBe(12000);
    expect(payout?.stripe_debit_transfer_id).toBe(debits.at(-1)!.id);
    expect(transfers.at(-1)).toMatchObject({
      destination: va.stripe_account_id,
      amount: 12000,
    });
  });

  it("existing own-key / platform modes are unaffected and Connect can be switched off", async () => {
    // Switching Connect off falls back to the previous configuration (none
    // here) — payments stop instead of going anywhere unexpected.
    await http()
      .put("/payments/stripe/settings")
      .set(auth(A.token))
      .send({ use_connect: false })
      .expect(400); // no own secret key → cannot stay enabled
    process.env.STRIPE_CONNECT_ENABLED = "false";
    try {
      const cfg = await http()
        .get("/portal/payments/stripe/config")
        .set(auth(portalToken))
        .expect(200);
      expect(data(cfg).enabled).toBe(false);
    } finally {
      process.env.STRIPE_CONNECT_ENABLED = "true";
    }
    // Platform-account collection (Super Admin) still behaves as before.
    await http()
      .put(`/platform/tenants/${B.id}/payment-gateway`)
      .set(auth(sa))
      .send({ is_enabled: true, use_platform_account: true })
      .expect(200);
    const gwB = await gateway(B.id);
    expect(gwB).toMatchObject({
      use_platform_account: true,
      use_connect: false,
    });
  });
});
