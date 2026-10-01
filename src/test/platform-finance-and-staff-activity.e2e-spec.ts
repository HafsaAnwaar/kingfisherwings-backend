/**
 * Super Admin billing/finance (platform ledger) + Tenant Admin staff-activity
 * emails — end-to-end against a real database (DATABASE_URL, migrations applied).
 * Stripe's API is not called: checkout attempts are inserted as startCheckout
 * persists them and webhooks are genuinely signed.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request = require("supertest");
import * as argon2 from "argon2";
import { AppModule } from "../app.module";
import { PrismaService } from "../prisma/prisma.service";
import { StripeSdk } from "../modules/payments/stripe-gateway.service";

const WHSEC = "whsec_e2e_platform_finance";
process.env.STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || "sk_test_e2e_placeholder";
process.env.STRIPE_WEBHOOK_SECRET = WHSEC;
process.env.FRONTEND_URL =
  process.env.FRONTEND_URL || "https://erp.example.test";

describe("Super Admin finance + staff activity emails (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const runId = Date.now();
  const pw = "SuperSecure@2026";
  let sa: string;
  const A = { id: "", token: "", code: "", email: "" };
  const B = { id: "", token: "", code: "", email: "" };
  const L = { id: "", token: "", code: "", email: "" };
  let evtSeq = 0;
  const http = () => request(app.getHttpServer());
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const bypass = { "X-Throttle-Bypass": process.env.CRON_SECRET ?? "" };
  const data = <T = Record<string, unknown>>(r: request.Response) =>
    (r.body?.data ?? r.body) as T;

  const webhook = (type: string, object: Record<string, unknown>) => {
    const payload = JSON.stringify({
      id: `evt_pf_${runId}_${++evtSeq}`,
      object: "event",
      type,
      livemode: false,
      created: 0,
      data: { object },
    });
    return http()
      .post("/payments/stripe/webhook")
      .set("Content-Type", "application/json")
      .set(
        "Stripe-Signature",
        StripeSdk.webhooks.generateTestHeaderString({ payload, secret: WHSEC }),
      )
      .send(payload);
  };

  async function tenant(tag: string, target: typeof A) {
    const slug = `pf-${tag}-${runId}`;
    const email = `owner.${tag}.${runId}@pf.test`;
    await http()
      .post("/tenants")
      .set(auth(sa))
      .send({
        code: `PF${tag}${runId}`.slice(0, 20),
        name: `PF ${tag}`,
        slug,
        password: pw,
        email,
        base_currency: "USD",
      })
      .expect(201);
    const login = await http()
      .post("/auth/tenant-login")
      .set(bypass)
      .send({ tenant_slug: slug, password: pw })
      .expect(200);
    const row = await prisma.tenant.findUniqueOrThrow({ where: { slug } });
    Object.assign(target, {
      id: row.id,
      token: login.body.data.access_token,
      code: row.code,
      email,
    });
  }

  const erpInvoice = (id: string) =>
    prisma.runWithTenant(L.id, (tx) =>
      tx.invoice.findUniqueOrThrow({ where: { id } }),
    );
  const emailLogs = (
    tenantId: string,
    eventType: "STAFF_ACTIVITY" | "PLATFORM_INVOICE_SENT",
  ) =>
    prisma.runWithTenant(tenantId, (tx) =>
      tx.emailLog.findMany({
        where: { tenant_id: tenantId, event_type: eventType },
      }),
    );
  async function waitFor<T>(
    fn: () => Promise<T>,
    ok: (v: T) => boolean,
    ms = 15_000,
  ) {
    const until = Date.now() + ms;
    let v = await fn();
    while (!ok(v) && Date.now() < until) {
      await new Promise((r) => setTimeout(r, 300));
      v = await fn();
    }
    return v;
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
    const s = await http()
      .post("/auth/super-admin/signup")
      .set(bypass)
      .send({
        email: `pf.sa.${runId}@pf.test`,
        password: pw,
        first_name: "Platform",
        last_name: "Admin",
      })
      .expect(201);
    sa = s.body.data.access_token;
    await tenant("a", A);
    await tenant("b", B);
    await tenant("l", L);
    await http()
      .post("/gl/accounts/seed-defaults")
      .set(auth(L.token))
      .send({})
      .expect(201);
    await http()
      .post("/gl/accounts/seed-defaults")
      .set(auth(A.token))
      .send({})
      .expect(201);
    process.env.PLATFORM_LEDGER_TENANT_ID = L.id;
  }, 240_000);

  afterAll(async () => {
    delete process.env.PLATFORM_LEDGER_TENANT_ID;
    await app?.close();
  });

  describe("Feature 1 — Super Admin billing & finance", () => {
    let invoiceId = "";
    let proofPaymentId = "";

    it("creates a draft, edits it, finalizes for the portal only, then emails it", async () => {
      const created = await http()
        .post("/platform/invoices")
        .set(auth(sa))
        .send({
          tenant_id: A.id,
          currency_code: "USD",
          lines: [{ description: "Monthly Platform Fee", unit_price: 400 }],
          tax_rate: 5,
          due_date: "2026-10-31",
          notes: "Net 30",
        })
        .expect(201);
      invoiceId = created.body.data.id;
      expect(created.body.data.status).toBe("DRAFT");

      const edited = await http()
        .patch(`/platform/invoices/${invoiceId}`)
        .set(auth(sa))
        .send({
          issue_date: "2026-10-01",
          lines: [
            { description: "Monthly Platform Fee", unit_price: 500 },
            { description: "Additional User Fee", quantity: 3, unit_price: 20 },
          ],
          discount_amount: 60,
        })
        .expect(200);
      expect(edited.body.data.total_amount).toBe("525.00");
      await http()
        .get(`/tenant/platform-invoices/${invoiceId}`)
        .set(auth(A.token))
        .expect(404); // draft hidden

      const before = (await emailLogs(A.id, "PLATFORM_INVOICE_SENT")).length;
      const fin = await http()
        .post(`/platform/invoices/${invoiceId}/send`)
        .set(auth(sa))
        .send({ deliver_email: false })
        .expect(201);
      expect(fin.body.data.status).toBe("SENT");
      expect((await emailLogs(A.id, "PLATFORM_INVOICE_SENT")).length).toBe(
        before,
      );

      const tenantView = await http()
        .get(`/tenant/platform-invoices/${invoiceId}`)
        .set(auth(A.token))
        .expect(200);
      expect(tenantView.body.data.balance_due).toBe("525.00");
      await http()
        .get(`/tenant/platform-invoices/${invoiceId}`)
        .set(auth(B.token))
        .expect(404);

      await http()
        .post(`/platform/invoices/${invoiceId}/send`)
        .set(auth(sa))
        .send({})
        .expect(201);
      const sent = await emailLogs(A.id, "PLATFORM_INVOICE_SENT");
      expect(sent.length).toBeGreaterThan(before);
      expect(sent.map((e) => e.to_email)).toContain(A.email);
    });

    it("books the invoice in the platform ledger's existing AR", async () => {
      const pinv = await prisma.platformInvoice.findUniqueOrThrow({
        where: { id: invoiceId },
      });
      expect(pinv.erp_invoice_id).toBeTruthy();
      const erp = await erpInvoice(pinv.erp_invoice_id!);
      expect(erp.status).toBe("POSTED");
      expect(erp.invoice_type).toBe("CUSTOMER_INVOICE");
      expect(Number(erp.total_amount)).toBeCloseTo(525, 4);
      expect(erp.lpo_number).toBe(pinv.invoice_number);
      const party = await prisma.runWithTenant(L.id, (tx) =>
        tx.party.findUniqueOrThrow({ where: { id: erp.party_id } }),
      );
      expect(party.code).toBe(`PLT-${A.code}`);
    });

    it("tenant proof → Super Admin review → receipt posted in the ledger", async () => {
      const up = await http()
        .post(`/tenant/platform-invoices/${invoiceId}/payment-proof`)
        .set(auth(A.token))
        .field("amount", "200")
        .field("payment_method", "BANK_TRANSFER")
        .field("reference_number", "TT-1")
        .attach("file", Buffer.from("%PDF-1.4"), {
          filename: "slip.pdf",
          contentType: "application/pdf",
        })
        .expect(201);
      proofPaymentId = up.body.data.id;
      expect(up.body.data.status).toBe("PENDING_VERIFICATION");

      const queue = await http()
        .get("/platform/payments?status=PENDING_VERIFICATION")
        .set(auth(sa))
        .expect(200);
      const row = queue.body.data.find(
        (p: { id: string }) => p.id === proofPaymentId,
      );
      expect(row.has_proof).toBe(true);
      expect(row.submitted_by?.email).toBeTruthy();
      await http()
        .get(`/platform/payments/${proofPaymentId}/proof`)
        .set(auth(sa))
        .expect(200);
      await http()
        .post(`/platform/payments/${proofPaymentId}/verify`)
        .set(auth(A.token))
        .expect(403);
      await http()
        .post(`/platform/payments/${proofPaymentId}/verify`)
        .set(auth(sa))
        .expect(201);

      const pp = await prisma.platformPayment.findUniqueOrThrow({
        where: { id: proofPaymentId },
      });
      expect(pp.erp_payment_id).toBeTruthy();
      const receipt = await prisma.runWithTenant(L.id, (tx) =>
        tx.payment.findUniqueOrThrow({
          where: { id: pp.erp_payment_id! },
          include: { allocations: true, voucher: true },
        }),
      );
      expect(receipt.status).toBe("POSTED");
      expect(receipt.direction).toBe("RECEIPT");
      expect(receipt.voucher?.voucher_type).toBe("BANK_RECEIPT");
      expect(Number(receipt.allocations[0].amount)).toBe(200);
      const pinv = await prisma.platformInvoice.findUniqueOrThrow({
        where: { id: invoiceId },
      });
      expect(pinv.status).toBe("PARTIALLY_PAID");
      expect((await erpInvoice(pinv.erp_invoice_id!)).status).toBe(
        "PARTIALLY_PAID",
      );
    });

    it("Stripe failure leaves it unpaid; Stripe success pays the rest — in both ledgers", async () => {
      const mk = (n: number) =>
        prisma.platformPayment.create({
          data: {
            platform_invoice_id: invoiceId,
            tenant_id: A.id,
            provider: "STRIPE",
            status: "PENDING",
            attempt_number: n,
            amount: 325,
            currency_code: "USD",
            amount_minor: 32500n,
            stripe_checkout_session_id: `cs_pf_${runId}_${n}`,
            initiated_by_type: "TENANT_ADMIN",
          },
        });
      const meta = (p: { id: string }) => ({
        erp_scope: "platform_invoice",
        tenant_id: A.id,
        invoice_id: invoiceId,
        payment_id: p.id,
      });

      const failed = await mk(2);
      await webhook("payment_intent.payment_failed", {
        id: `pi_pf_${runId}_f`,
        object: "payment_intent",
        status: "requires_payment_method",
        amount: 32500,
        currency: "usd",
        last_payment_error: { message: "Card declined" },
        metadata: meta(failed),
      }).expect(200);
      expect(
        (
          await prisma.platformPayment.findUniqueOrThrow({
            where: { id: failed.id },
          })
        ).status,
      ).toBe("FAILED");
      expect(
        (
          await prisma.platformInvoice.findUniqueOrThrow({
            where: { id: invoiceId },
          })
        ).status,
      ).toBe("PARTIALLY_PAID");

      const ok = await mk(3);
      const session = {
        id: ok.stripe_checkout_session_id,
        object: "checkout.session",
        mode: "payment",
        status: "complete",
        payment_status: "paid",
        amount_total: 32500,
        currency: "usd",
        payment_intent: `pi_pf_${runId}_ok`,
        metadata: meta(ok),
      };
      await webhook("checkout.session.completed", session).expect(200);
      await webhook("checkout.session.completed", session).expect(200); // different event id, same payment
      const status = await http()
        .get(`/tenant/platform-invoices/${invoiceId}/payment-status`)
        .set(auth(A.token))
        .expect(200);
      expect(status.body.data.invoice_status).toBe("PAID");
      const pinv = await prisma.platformInvoice.findUniqueOrThrow({
        where: { id: invoiceId },
      });
      const erp = await erpInvoice(pinv.erp_invoice_id!);
      expect(erp.status).toBe("PAID");
      expect(Number(erp.balance_due)).toBe(0);
      const receipts = await prisma.runWithTenant(L.id, (tx) =>
        tx.payment.count({
          where: {
            tenant_id: L.id,
            direction: "RECEIPT",
            status: "POSTED",
            party_id: erp.party_id,
          },
        }),
      );
      expect(receipts).toBe(2);
    });

    it("a refund reverses and re-posts the ledger receipt", async () => {
      await http()
        .post(`/platform/payments/${proofPaymentId}/refund`)
        .set(auth(sa))
        .send({ amount: 50 })
        .expect(201);
      const pp = await prisma.platformPayment.findUniqueOrThrow({
        where: { id: proofPaymentId },
      });
      expect(Number(pp.erp_synced_amount)).toBe(150);
      const pinv = await prisma.platformInvoice.findUniqueOrThrow({
        where: { id: invoiceId },
      });
      expect(Number((await erpInvoice(pinv.erp_invoice_id!)).balance_due)).toBe(
        50,
      );
      expect(pinv.balance_due.toFixed(2)).toBe("50.00");
    });

    it("exposes AR, AP, GL and reports from the existing finance services", async () => {
      const rec = await http()
        .get(`/platform/finance/receivables?tenant_id=${A.id}`)
        .set(auth(sa))
        .expect(200);
      const row = rec.body.data.find(
        (r: { invoice_id: string }) => r.invoice_id === invoiceId,
      );
      expect(row).toMatchObject({
        invoice_amount: "525.00",
        paid_amount: "475.00",
        outstanding_amount: "50.00",
      });
      expect(row.ledger_invoice_number).toBeTruthy();
      expect(row.tenant.id).toBe(A.id);

      await http().get("/platform/finance/ar/aging").set(auth(sa)).expect(200);
      await http()
        .get(`/platform/finance/ar/tenant/${A.id}/statement`)
        .set(auth(sa))
        .expect(200);
      await http().get("/platform/finance/ap/aging").set(auth(sa)).expect(200);
      await http()
        .get("/platform/finance/payments?direction=RECEIPT")
        .set(auth(sa))
        .expect(200);
      await http().get("/platform/finance/vouchers").set(auth(sa)).expect(200);
      await http()
        .get("/platform/finance/reports/trial-balance")
        .set(auth(sa))
        .expect(200);
      await http()
        .get("/platform/finance/reports/profit-and-loss")
        .set(auth(sa))
        .expect(200);

      const vendor = await prisma.runWithTenant(L.id, (tx) =>
        tx.party.create({
          data: {
            tenant_id: L.id,
            party_type: "SUPPLIER",
            code: `V${runId}`.slice(0, 20),
            name: "Hosting Co",
          },
        }),
      );
      const bill = await http()
        .post("/platform/finance/vendor-bills")
        .set(auth(sa))
        .send({
          party_id: vendor.id,
          currency_code: "USD",
          vat_rate: 0,
          lines: [
            { description: "Servers", unit_price: 90, is_taxable: false },
          ],
        })
        .expect(201);
      await http()
        .post(
          `/platform/finance/invoices/${data<{ id: string }>(bill).id}/post`,
        )
        .set(auth(sa))
        .expect(201);
      const ap = await http()
        .get("/platform/finance/ap/open-items")
        .set(auth(sa))
        .expect(200);
      expect(JSON.stringify(ap.body)).toContain("Hosting Co");

      await http()
        .get("/platform/finance/receivables")
        .set(auth(A.token))
        .expect(403);
      await http()
        .get("/platform/finance/ar/aging")
        .set(auth(L.token))
        .expect(403);
    });
  });

  describe("Feature 2 — staff activity emails", () => {
    let staffToken = "";

    beforeAll(async () => {
      const staffEmail = `staff.${runId}@pf.test`;
      await http()
        .post("/users")
        .set(auth(A.token))
        .send({
          email: staffEmail,
          first_name: "John",
          last_name: "Doe",
          role: "FINANCE_MANAGER",
        })
        .expect(201);
      await prisma.runWithTenant(A.id, (tx) =>
        tx.user.updateMany({
          where: { tenant_id: A.id, email: staffEmail },
          data: { status: "ACTIVE", password_hash: undefined },
        }),
      );
      const hash = await argon2.hash(pw);
      await prisma.runWithTenant(A.id, (tx) =>
        tx.user.updateMany({
          where: { tenant_id: A.id, email: staffEmail },
          data: { password_hash: hash },
        }),
      );
      const login = await http()
        .post("/auth/login")
        .set(bypass)
        .send({ tenant_slug: `pf-a-${runId}`, email: staffEmail, password: pw })
        .expect(200);
      staffToken = login.body.data.access_token;
    });

    it("emails the tenant admin once when staff create an invoice, with the details", async () => {
      const beforeA = (await emailLogs(A.id, "STAFF_ACTIVITY")).length;
      const party = await prisma.runWithTenant(A.id, (tx) =>
        tx.party.create({
          data: {
            tenant_id: A.id,
            party_type: "CUSTOMER",
            code: `C${runId}`.slice(0, 20),
            name: "Acme",
          },
        }),
      );
      const inv = await http()
        .post("/invoices")
        .set(auth(staffToken))
        .send({
          party_id: party.id,
          currency_code: "USD",
          vat_rate: 0,
          lines: [
            { description: "Freight", unit_price: 1250, is_taxable: false },
          ],
        })
        .expect(201);
      const invoice = data<{ id: string; invoice_number: string }>(inv);

      const logs = await waitFor(
        () => emailLogs(A.id, "STAFF_ACTIVITY"),
        (l) => l.length > beforeA,
      );
      const mine = logs.filter(
        (l) =>
          l.subject.includes("Created Invoice") &&
          (l.body ?? "").includes(invoice.invoice_number),
      );
      expect(mine).toHaveLength(1); // one action → one email per recipient
      expect(mine[0].to_email).toBe(A.email); // registered tenant admin email
      expect(mine[0].subject).toContain("Staff Activity: Created Invoice");
      expect(mine[0].body ?? "").toContain("John Doe");
      expect(mine[0].body ?? "").toContain("Finance Manager");
      expect(mine[0].body ?? "").toContain(`/invoices/${invoice.id}`);

      const audit = await prisma.runWithTenant(A.id, (tx) =>
        tx.auditLog.findMany({
          where: {
            tenant_id: A.id,
            entity_id: invoice.id,
            action: "Created Invoice",
          },
        }),
      );
      expect(audit).toHaveLength(1);

      // Reads and render-only actions send nothing more.
      await http().get("/invoices").set(auth(staffToken)).expect(200);
      await http()
        .get(`/invoices/${invoice.id}`)
        .set(auth(staffToken))
        .expect(200);
      await new Promise((r) => setTimeout(r, 1500));
      const after = await emailLogs(A.id, "STAFF_ACTIVITY");
      expect(
        after.filter((l) => (l.body ?? "").includes(invoice.invoice_number)),
      ).toHaveLength(1);
    });

    it("never notifies another tenant, and emails the tenant admin about their own action too", async () => {
      const bLogs = await emailLogs(B.id, "STAFF_ACTIVITY");
      expect(bLogs).toHaveLength(0);
      const allA = await emailLogs(A.id, "STAFF_ACTIVITY");
      // A non-admin staff member is never a recipient.
      expect(allA.every((l) => l.to_email !== `staff.${runId}@pf.test`)).toBe(
        true,
      );

      // The owner (tenant admin) acting themselves is still informed.
      const ownerCode = `O${runId}`.slice(0, 20);
      await http()
        .post("/parties")
        .set(auth(A.token))
        .send({
          party_type: "CUSTOMER",
          code: ownerCode,
          name: "Owner-made",
        })
        .expect(201);
      const ownerMails = (
        await waitFor(
          () => emailLogs(A.id, "STAFF_ACTIVITY"),
          (l) => l.some((x) => (x.body ?? "").includes(ownerCode)),
        )
      ).filter((l) => (l.body ?? "").includes(ownerCode));
      expect(ownerMails).toHaveLength(1); // one email, no duplicates
      expect(ownerMails[0].to_email).toBe(A.email.toLowerCase());
      expect(ownerMails[0].subject).toContain("Created Customer");
      expect((await emailLogs(B.id, "STAFF_ACTIVITY")).length).toBe(0);
    });
  });
});
