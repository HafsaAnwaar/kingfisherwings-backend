/**
 * Automatic vendor payouts (Stripe Connect) — end-to-end against a real
 * database. Stripe's API is never called: the four Connect calls on
 * StripeGatewayService are replaced with in-memory fakes, while Connect
 * webhooks are genuinely signed, so signature checks, the ERP AP posting,
 * reversal and tenant isolation are exercised for real.
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

const WHSEC = "whsec_e2e_vendor_payouts";
const CONNECT_WHSEC = "whsec_e2e_vendor_payouts_connect";
process.env.STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || "sk_test_e2e_placeholder";
process.env.STRIPE_WEBHOOK_SECRET = WHSEC;
process.env.STRIPE_CONNECT_WEBHOOK_SECRET = CONNECT_WHSEC;
process.env.STRIPE_CONNECT_ENABLED = "true";
process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY =
  process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY || "e2e-payment-gateway-key";

describe("Vendor payouts via Stripe Connect (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const runId = Date.now();
  const pw = "SuperSecure@2026";
  let sa: string;
  const A = { id: "", token: "", slug: "" };
  const B = { id: "", token: "", slug: "" };
  let vendorId: string;
  let vendorToken: string;
  let evtSeq = 0;

  // ── fake Stripe Connect ──
  const accounts = new Map<string, Record<string, unknown>>();
  const transfers: Array<Record<string, unknown>> = [];
  const readyAccount = (id: string) => ({
    id,
    object: "account",
    details_submitted: true,
    payouts_enabled: true,
    capabilities: { transfers: "active" },
    requirements: { currently_due: [] },
    metadata: accounts.get(id)?.metadata ?? {},
  });

  const http = () => request(app.getHttpServer());
  const bypass = { "X-Throttle-Bypass": process.env.CRON_SECRET ?? "" };
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const data = <T = Record<string, unknown>>(res: request.Response): T =>
    (res.body?.data ?? res.body) as T;

  function connectWebhook(type: string, object: Record<string, unknown>) {
    const payload = JSON.stringify({
      id: `evt_vp_${runId}_${++evtSeq}`,
      object: "event",
      type,
      livemode: false,
      created: Math.floor(Date.now() / 1000),
      data: { object },
    });
    const header = StripeSdk.webhooks.generateTestHeaderString({
      payload,
      secret: CONNECT_WHSEC,
    });
    return http()
      .post("/payments/stripe/webhook/connect")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", header)
      .send(payload);
  }

  async function waitFor<T>(
    fn: () => Promise<T>,
    ok: (v: T) => boolean,
    ms = 10_000,
  ) {
    const until = Date.now() + ms;
    let v = await fn();
    while (!ok(v) && Date.now() < until) {
      await new Promise((r) => setTimeout(r, 200));
      v = await fn();
    }
    return v;
  }

  async function tenant(tag: string) {
    const slug = `vp-${tag}-${runId}`;
    await http()
      .post("/tenants")
      .set(auth(sa))
      .send({
        code: `V${tag}${runId}`.slice(0, 20),
        name: `Payouts ${tag}`,
        slug,
        password: pw,
        email: `owner.${tag}.${runId}@vp.test`,
        base_currency: "USD",
      })
      .expect(201);
    const login = await http()
      .post("/auth/tenant-login")
      .set(bypass)
      .send({ tenant_slug: slug, password: pw })
      .expect(200);
    const row = await prisma.tenant.findUniqueOrThrow({ where: { slug } });
    await http()
      .post("/gl/accounts/seed-defaults")
      .set(auth(login.body.data.access_token))
      .send({})
      .expect(201);
    await http()
      .put(`/platform/tenants/${row.id}/payment-gateway`)
      .set(auth(sa))
      .send({ is_enabled: true, use_platform_account: true })
      .expect(200);
    return { id: row.id, token: login.body.data.access_token as string, slug };
  }

  const payoutsFor = (tenantId: string) =>
    prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPayout.findMany({
        where: { tenant_id: tenantId },
        orderBy: { created_at: "asc" },
      }),
    );

  async function approvedRequest(amount: number) {
    const pr = await http()
      .post("/payment-requests")
      .set(auth(A.token))
      .send({ party_id: vendorId, amount, currency_code: "USD" })
      .expect(201);
    const id = data<{ id: string }>(pr).id;
    await http()
      .post(`/payment-requests/${id}/approve`)
      .set(auth(A.token))
      .send({})
      .expect(201);
    return id;
  }

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
        const id = `acct_vp_${runId}_${accounts.size + 1}`;
        accounts.set(id, { metadata: params.metadata });
        return {
          id,
          object: "account",
          details_submitted: false,
          payouts_enabled: false,
          capabilities: { transfers: "inactive" },
          requirements: { currently_due: ["external_account"] },
          metadata: params.metadata,
        } as never;
      });
    jest
      .spyOn(stripe, "retrieveConnectedAccount")
      .mockImplementation(async (_c, id) => {
        const a = accounts.get(id);
        return (
          a?.ready
            ? readyAccount(id)
            : {
                id,
                object: "account",
                details_submitted: false,
                payouts_enabled: false,
                capabilities: { transfers: "inactive" },
                requirements: { currently_due: ["external_account"] },
                metadata: a?.metadata ?? {},
              }
        ) as never;
      });
    jest.spyOn(stripe, "createAccountLink").mockImplementation(
      async (_c, params) =>
        ({
          object: "account_link",
          url: `https://connect.stripe.com/setup/e/${params.account}`,
          expires_at: Math.floor(Date.now() / 1000) + 300,
          created: Math.floor(Date.now() / 1000),
        }) as never,
    );
    jest
      .spyOn(stripe, "createTransfer")
      .mockImplementation(async (_c, params, idempotencyKey) => {
        const existing = transfers.find((t) => t.key === idempotencyKey);
        if (existing) return existing.obj as never;
        const obj = {
          id: `tr_vp_${runId}_${transfers.length + 1}`,
          object: "transfer",
          amount: params.amount,
          currency: params.currency,
          destination: params.destination,
          metadata: params.metadata,
          reversed: false,
        };
        transfers.push({ key: idempotencyKey, obj });
        return obj as never;
      });

    const saRes = await http()
      .post("/auth/super-admin/signup")
      .set(bypass)
      .send({
        email: `vp.sa.${runId}@vp.test`,
        password: pw,
        first_name: "Payout",
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
        party_type: "TRUCKER",
        code: `T${runId}`.slice(0, 20),
        name: "Fast Trucks",
        email: `trucks.${runId}@vp.test`,
      })
      .expect(201);
    vendorId = data<{ id: string }>(party).id;
    const vendorEmail = `vendor.${runId}@vp.test`;
    await http()
      .post(`/parties/${vendorId}/vendor-users`)
      .set(auth(A.token))
      .send({
        party_id: vendorId,
        email: vendorEmail,
        full_name: "Vendor User",
        password: pw,
        send_email: false,
      })
      .expect(201);
    const vLogin = await http()
      .post("/vendor/auth/login")
      .set(bypass)
      .send({ tenant_slug: A.slug, email: vendorEmail, password: pw })
      .expect(201);
    vendorToken = data<{ access_token: string }>(vLogin).access_token;
  }, 180_000);

  afterAll(async () => {
    await app?.close();
  });

  it("returns 503 and changes nothing while Connect is not enabled", async () => {
    process.env.STRIPE_CONNECT_ENABLED = "false";
    try {
      await http()
        .post("/vendor/payouts/account/onboarding-link")
        .set(auth(vendorToken))
        .expect(503);
      await http()
        .post("/payments/stripe/webhook/connect")
        .set("Content-Type", "application/json")
        .send("{}")
        .expect(404);
      const status = await http()
        .get("/vendor/payouts/account")
        .set(auth(vendorToken))
        .expect(200);
      expect(data<{ connect_enabled: boolean }>(status).connect_enabled).toBe(
        false,
      );
      // Approval keeps working exactly as before; nothing is paid.
      const id = await approvedRequest(50);
      const pr = await prisma.runWithTenant(A.id, (tx) =>
        tx.paymentRequest.findUniqueOrThrow({ where: { id } }),
      );
      expect(pr.status).toBe("APPROVED");
      expect(await payoutsFor(A.id)).toHaveLength(0);
      expect(transfers).toHaveLength(0);
    } finally {
      process.env.STRIPE_CONNECT_ENABLED = "true";
    }
  });

  it("pays a request approved before onboarding as soon as the vendor is ready", async () => {
    const waitingId = await approvedRequest(400);
    expect(transfers).toHaveLength(0);

    const link = await http()
      .post("/vendor/payouts/account/onboarding-link")
      .set(auth(vendorToken))
      .expect(201);
    expect(data<{ url: string }>(link).url).toContain("connect.stripe.com");
    const acct = await prisma.vendorPayoutAccount.findFirstOrThrow({
      where: { tenant_id: A.id, party_id: vendorId },
    });
    expect(acct.payouts_enabled).toBe(false);

    // Unsigned / wrongly-signed Connect events are rejected.
    await http()
      .post("/payments/stripe/webhook/connect")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", "t=1,v1=bad")
      .send("{}")
      .expect(400);

    accounts.get(acct.stripe_account_id)!.ready = true;
    await connectWebhook(
      "account.updated",
      readyAccount(acct.stripe_account_id),
    ).expect(200);

    // Both requests approved earlier (the 503 test's and this one) get paid.
    const payouts = await waitFor(
      () => payoutsFor(A.id),
      (p) =>
        p.filter((x) => x.status === "PAID" && x.erp_payment_id).length >= 2,
    );
    const mine = payouts.find((p) => p.payment_request_id === waitingId)!;
    expect(mine.status).toBe("PAID");
    expect(Number(mine.amount)).toBe(400);
    expect(mine.amount_minor).toBe(40000n);
    expect(mine.stripe_account_id).toBe(acct.stripe_account_id);

    const pr = await prisma.runWithTenant(A.id, (tx) =>
      tx.paymentRequest.findUniqueOrThrow({ where: { id: waitingId } }),
    );
    expect(pr.status).toBe("PAID");
    const pay = await prisma.payment.findFirstOrThrow({
      where: {
        tenant_id: A.id,
        reference_number: `STRIPE:${mine.stripe_transfer_id}`,
      },
    });
    expect(pay.status).toBe("POSTED");
    expect(pay.id).toBe(mine.erp_payment_id);
  });

  it("approving a payment request pays the vendor automatically and posts AP", async () => {
    const id = await approvedRequest(250);
    const payout = (
      await waitFor(
        () => payoutsFor(A.id),
        (p) => p.some((x) => x.payment_request_id === id && x.erp_payment_id),
      )
    ).find((p) => p.payment_request_id === id)!;
    expect(payout.status).toBe("PAID");
    expect(Number(payout.amount)).toBe(250); // amount comes from the ERP record
    const tr = transfers.find(
      (t) => (t.obj as { id: string }).id === payout.stripe_transfer_id,
    )!.obj as { metadata: Record<string, string>; amount: number };
    expect(tr.amount).toBe(25000);
    expect(tr.metadata.tenant_id).toBe(A.id);
    expect(tr.metadata.payment_request_id).toBe(id);

    const pr = await prisma.runWithTenant(A.id, (tx) =>
      tx.paymentRequest.findUniqueOrThrow({ where: { id } }),
    );
    expect(pr.status).toBe("PAID");
    const pay = await prisma.payment.findUniqueOrThrow({
      where: { id: payout.erp_payment_id! },
    });
    expect(pay.reference_number).toBe(`STRIPE:${payout.stripe_transfer_id}`);
    expect(pay.status).toBe("POSTED");

    // Paying it again is refused — no double payout.
    await http()
      .post(`/vendor-payouts/payment-requests/${id}`)
      .set(auth(A.token))
      .expect(400);

    // The vendor sees it in their portal; another tenant does not.
    const mine = await http()
      .get("/vendor/payouts")
      .set(auth(vendorToken))
      .expect(200);
    expect(JSON.stringify(mine.body)).toContain(payout.id);
    await http()
      .get(`/vendor-payouts/${payout.id}`)
      .set(auth(B.token))
      .expect(404);
    expect(await payoutsFor(B.id)).toHaveLength(0);
  });

  it("a reversed transfer cancels the AP payment and reopens the request", async () => {
    const id = await approvedRequest(75);
    const payout = (
      await waitFor(
        () => payoutsFor(A.id),
        (p) => p.some((x) => x.payment_request_id === id && x.erp_payment_id),
      )
    ).find((p) => p.payment_request_id === id)!;
    await connectWebhook("transfer.reversed", {
      id: payout.stripe_transfer_id,
      object: "transfer",
      amount: 7500,
      amount_reversed: 7500,
      currency: "usd",
      reversed: true,
      destination: payout.stripe_account_id,
      metadata: {
        erp_scope: "vendor_payout",
        tenant_id: A.id,
        payout_id: payout.id,
        payment_request_id: id,
      },
    }).expect(200);

    const after = await prisma.runWithTenant(A.id, (tx) =>
      tx.vendorPayout.findUniqueOrThrow({ where: { id: payout.id } }),
    );
    expect(after.status).toBe("REFUNDED");
    const pay = await prisma.payment.findUniqueOrThrow({
      where: { id: payout.erp_payment_id! },
    });
    expect(pay.status).toBe("CANCELLED");
    const pr = await prisma.runWithTenant(A.id, (tx) =>
      tx.paymentRequest.findUniqueOrThrow({ where: { id } }),
    );
    expect(pr.status).toBe("APPROVED");
  });

  it("pays a posted vendor bill directly and settles it in the ERP", async () => {
    const inv = await http()
      .post("/purchase-invoices")
      .set(auth(A.token))
      .send({
        party_id: vendorId,
        currency_code: "USD",
        vat_rate: 0,
        lines: [{ description: "Haulage", unit_price: 600, is_taxable: false }],
      })
      .expect(201);
    const billId = data<{ id: string }>(inv).id;
    await http()
      .post(`/purchase-invoices/${billId}/post`)
      .set(auth(A.token))
      .expect(201);

    // Another tenant cannot pay this bill.
    await http()
      .post(`/vendor-payouts/purchase-invoices/${billId}`)
      .set(auth(B.token))
      .expect(404);

    const res = await http()
      .post(`/vendor-payouts/purchase-invoices/${billId}`)
      .set(auth(A.token))
      .expect(201);
    const payout = data<{ status: string; amount: string | number }>(res);
    expect(payout.status).toBe("PAID");
    expect(Number(payout.amount)).toBe(600);

    const bill = await prisma.invoice.findUniqueOrThrow({
      where: { id: billId },
    });
    expect(bill.status).toBe("PAID");
    expect(Number(bill.balance_due)).toBe(0);
  });
});
