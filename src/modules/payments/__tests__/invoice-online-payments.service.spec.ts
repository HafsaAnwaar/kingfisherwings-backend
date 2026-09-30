import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { InvoiceOnlinePaymentsService } from "../invoice-online-payments.service";

const TENANT = "11111111-1111-1111-1111-111111111111";
const INVOICE = "22222222-2222-2222-2222-222222222222";
const PARTY = "33333333-3333-3333-3333-333333333333";

function makeTxn(over: Record<string, unknown> = {}) {
  return {
    id: "44444444-4444-4444-4444-444444444444",
    tenant_id: TENANT,
    invoice_id: INVOICE,
    party_id: PARTY,
    provider: "STRIPE",
    status: "PENDING",
    attempt_number: 1,
    amount: new Prisma.Decimal("1000"),
    currency_code: "USD",
    amount_minor: 100000n,
    amount_refunded: new Prisma.Decimal(0),
    account_ref: "platform",
    stripe_payment_intent_id: null,
    stripe_charge_id: null,
    payer_email: null,
    payment_id: null,
    erp_posting_claimed_at: null,
    ...over,
  };
}

function setup() {
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: "x" }]),
    paymentTransaction: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    invoice: { findFirst: jest.fn() },
    payment: { findFirst: jest.fn().mockResolvedValue(null) },
    tenantPaymentGateway: { findUnique: jest.fn().mockResolvedValue(null) },
    paymentProof: { count: jest.fn().mockResolvedValue(0) },
    paymentAllocation: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const prisma = {
    runWithTenant: jest.fn(
      (tenantId: string, cb: (t: typeof tx) => unknown) => {
        if (tenantId !== TENANT) throw new Error("wrong tenant context");
        return cb(tx);
      },
    ),
  };
  const stripe = {
    createCheckoutSession: jest.fn().mockResolvedValue({
      id: "cs_1",
      url: "https://checkout.stripe.com/c/cs_1",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }),
    expireCheckoutSession: jest.fn(),
  };
  const settings = {
    resolveTenantAccount: jest.fn().mockResolvedValue({
      client: {},
      accountRef: "platform",
      gateway: { allow_partial_payments: false, statement_descriptor: null },
    }),
    isOnlinePaymentEnabled: jest.fn().mockResolvedValue(true),
  };
  const customers = { ensureCustomer: jest.fn().mockResolvedValue("cus_1") };
  const gl = {
    create: jest.fn().mockResolvedValue({ id: "pay-1" }),
    post: jest.fn().mockResolvedValue({ id: "pay-1" }),
    findOne: jest.fn(),
    cancel: jest.fn(),
    softDelete: jest.fn(),
  };
  const notifications = {
    notifyFinanceStaff: jest.fn(),
    notifyPortalUser: jest.fn(),
    notifyPartyPortalUsers: jest.fn(),
  };
  const mailer = { sendReceipt: jest.fn() };
  const audit = { log: jest.fn() };
  const service = new InvoiceOnlinePaymentsService(
    prisma as never,
    stripe as never,
    settings as never,
    customers as never,
    gl as never,
    notifications as never,
    mailer as never,
    audit as never,
  );
  return { service, tx, prisma, stripe, settings, gl, audit };
}

const openInvoice = {
  id: INVOICE,
  tenant_id: TENANT,
  invoice_number: "INV/1",
  invoice_type: "CUSTOMER_INVOICE",
  status: "SENT",
  balance_due: new Prisma.Decimal("1000"),
  currency_code: "USD",
  exchange_rate: new Prisma.Decimal(1),
  party_id: PARTY,
  company_id: null,
  branch_id: null,
  party: { id: PARTY, name: "Acme", email: "a@acme.test" },
};

describe("InvoiceOnlinePaymentsService", () => {
  describe("resolvePayableAmount (server-side amount)", () => {
    const { service } = setup();
    it("defaults to the ERP balance", () => {
      expect(
        service.resolvePayableAmount("1000.0000", undefined, false).toFixed(2),
      ).toBe("1000.00");
    });
    it("rejects a different amount when partial payments are disabled", () => {
      expect(() => service.resolvePayableAmount("1000", 1, false)).toThrow(
        BadRequestException,
      );
    });
    it("rejects amounts above the balance even when partials are allowed", () => {
      expect(() => service.resolvePayableAmount("1000", 1000.01, true)).toThrow(
        BadRequestException,
      );
    });
    it("accepts a valid partial amount when allowed", () => {
      expect(service.resolvePayableAmount("1000", 250, true).toFixed(2)).toBe(
        "250.00",
      );
    });
  });

  describe("startCheckout", () => {
    it("charges the invoice balance from the ERP, with ERP metadata", async () => {
      const { service, tx, stripe } = setup();
      tx.invoice.findFirst.mockResolvedValue(openInvoice);
      tx.paymentTransaction.create.mockImplementation(({ data }) => ({
        ...makeTxn(),
        ...data,
      }));
      tx.paymentTransaction.update.mockImplementation(({ data }) => ({
        ...makeTxn(),
        ...data,
      }));

      const res = await service.startCheckout(TENANT, INVOICE, {
        initiator: { type: "STAFF", id: "u1" },
        returnUrl: "https://erp.test/invoices/x",
      });

      const params = stripe.createCheckoutSession.mock.calls[0][1];
      expect(params.line_items[0].price_data.unit_amount).toBe(100000);
      expect(params.metadata).toMatchObject({
        tenant_id: TENANT,
        invoice_id: INVOICE,
        party_id: PARTY,
        erp_scope: "tenant_invoice",
      });
      expect(params.success_url).toContain("session_id={CHECKOUT_SESSION_ID}");
      expect(stripe.createCheckoutSession.mock.calls[0][2]).toMatch(
        /^erp-checkout:/,
      );
      expect(res.data.checkout_url).toBe("https://checkout.stripe.com/c/cs_1");
    });

    it("refuses paid / non-customer documents", async () => {
      const { service, tx } = setup();
      tx.invoice.findFirst.mockResolvedValue({
        ...openInvoice,
        status: "PAID",
      });
      await expect(
        service.startCheckout(TENANT, INVOICE, {
          initiator: { type: "STAFF" },
          returnUrl: "x",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      tx.invoice.findFirst.mockResolvedValue({
        ...openInvoice,
        invoice_type: "PURCHASE_INVOICE",
      });
      await expect(
        service.startCheckout(TENANT, INVOICE, {
          initiator: { type: "STAFF" },
          returnUrl: "x",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("rejects while another payment for the invoice is processing", async () => {
      const { service, tx, stripe } = setup();
      tx.invoice.findFirst.mockResolvedValue(openInvoice);
      tx.paymentTransaction.findMany.mockResolvedValue([
        makeTxn({ status: "PROCESSING" }),
      ]);
      await expect(
        service.startCheckout(TENANT, INVOICE, {
          initiator: { type: "STAFF" },
          returnUrl: "x",
        }),
      ).rejects.toThrow(/already being processed/);
      expect(stripe.createCheckoutSession).not.toHaveBeenCalled();
    });

    it("reuses a live open session for the same amount instead of creating another", async () => {
      const { service, tx, stripe } = setup();
      tx.invoice.findFirst.mockResolvedValue(openInvoice);
      tx.paymentTransaction.findMany.mockResolvedValue([
        makeTxn({
          checkout_url: "https://checkout.stripe.com/c/existing",
          checkout_expires_at: new Date(Date.now() + 30 * 60_000),
        }),
      ]);
      const res = await service.startCheckout(TENANT, INVOICE, {
        initiator: { type: "STAFF" },
        returnUrl: "x",
      });
      expect(res.data.reused).toBe(true);
      expect(stripe.createCheckoutSession).not.toHaveBeenCalled();
    });
  });

  describe("markSucceeded (webhook success path)", () => {
    it("posts exactly one ERP receipt through the GL flow", async () => {
      const { service, tx, gl } = setup();
      const txn = makeTxn();
      tx.paymentTransaction.findUnique.mockResolvedValue(txn);
      tx.paymentTransaction.update.mockImplementation(({ data }) => ({
        ...txn,
        ...data,
        stripe_payment_intent_id: "pi_1",
        invoice: { id: INVOICE, invoice_number: "INV/1" },
        party: { id: PARTY, name: "Acme", email: null },
        payment: { payment_number: "PAY/1" },
      }));
      tx.invoice.findFirst.mockResolvedValue(openInvoice);

      await service.markSucceeded(TENANT, txn.id, {
        paymentIntentId: "pi_1",
        amountMinor: 100000,
        currency: "usd",
      });

      expect(gl.create).toHaveBeenCalledTimes(1);
      const [, dto] = gl.create.mock.calls[0];
      expect(dto).toMatchObject({
        direction: "RECEIPT",
        payment_method: "CREDIT_CARD",
        reference_number: "STRIPE:pi_1",
        allocations: [{ invoice_id: INVOICE, amount: 1000 }],
      });
      expect(gl.post).toHaveBeenCalledWith(TENANT, "pay-1");
    });

    it("does not post again when the attempt is already linked (duplicate webhook)", async () => {
      const { service, tx, gl } = setup();
      const txn = makeTxn({
        status: "PAID",
        payment_id: "pay-1",
        stripe_payment_intent_id: "pi_1",
      });
      tx.paymentTransaction.findUnique.mockResolvedValue(txn);
      tx.paymentTransaction.update.mockResolvedValue(txn);
      await service.markSucceeded(TENANT, txn.id, {
        paymentIntentId: "pi_1",
        amountMinor: 100000,
        currency: "usd",
      });
      expect(gl.create).not.toHaveBeenCalled();
    });

    it("never posts when Stripe's amount differs from the ERP attempt", async () => {
      const { service, tx, gl } = setup();
      tx.paymentTransaction.findUnique.mockResolvedValue(makeTxn());
      tx.paymentTransaction.update.mockResolvedValue(makeTxn());
      await service.markSucceeded(TENANT, "t", {
        paymentIntentId: "pi_1",
        amountMinor: 1,
        currency: "usd",
      });
      expect(gl.create).not.toHaveBeenCalled();
      expect(
        tx.paymentTransaction.update.mock.calls[0][0].data.failure_code,
      ).toBe("amount_mismatch");
    });

    it("reuses an ERP payment that already exists for the payment intent", async () => {
      const { service, tx, gl } = setup();
      const txn = makeTxn({ stripe_payment_intent_id: "pi_1" });
      tx.paymentTransaction.findUnique.mockResolvedValue(txn);
      tx.paymentTransaction.update.mockImplementation(({ data }) => ({
        ...txn,
        ...data,
        invoice: { id: INVOICE, invoice_number: "INV/1" },
        party: { id: PARTY, name: "Acme", email: null },
        payment: null,
      }));
      tx.payment.findFirst.mockResolvedValue({
        id: "existing",
        status: "POSTED",
      });
      await service.markSucceeded(TENANT, txn.id, {
        paymentIntentId: "pi_1",
        amountMinor: 100000,
        currency: "usd",
      });
      expect(gl.create).not.toHaveBeenCalled();
    });

    it("releases the posting claim if ERP posting fails (so Stripe's retry can post)", async () => {
      const { service, tx, gl } = setup();
      const txn = makeTxn({ stripe_payment_intent_id: "pi_1" });
      tx.paymentTransaction.findUnique.mockResolvedValue(txn);
      tx.paymentTransaction.update.mockResolvedValue(txn);
      tx.invoice.findFirst.mockResolvedValue(openInvoice);
      gl.post.mockRejectedValueOnce(new Error("GL down"));
      await expect(
        service.markSucceeded(TENANT, txn.id, {
          paymentIntentId: "pi_1",
          amountMinor: 100000,
          currency: "usd",
        }),
      ).rejects.toThrow("GL down");
      const last = tx.paymentTransaction.update.mock.calls.at(-1)[0];
      expect(last.data).toEqual({ erp_posting_claimed_at: null });
    });
  });

  describe("tenant isolation", () => {
    it("queries are always scoped to the caller's tenant", async () => {
      const { service, tx } = setup();
      tx.paymentTransaction.findFirst.mockResolvedValue(null);
      await expect(service.getOne(TENANT, "x")).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(
        tx.paymentTransaction.findFirst.mock.calls[0][0].where,
      ).toMatchObject({
        tenant_id: TENANT,
      });
    });

    it("scopes portal lookups to the customer's party", async () => {
      const { service, tx } = setup();
      tx.paymentTransaction.findFirst.mockResolvedValue(null);
      await expect(service.getOne(TENANT, "x", PARTY)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(
        tx.paymentTransaction.findFirst.mock.calls[0][0].where,
      ).toMatchObject({
        tenant_id: TENANT,
        party_id: PARTY,
      });
    });

    it("refuses refunds larger than the refundable amount", async () => {
      const { service, tx } = setup();
      tx.paymentTransaction.findFirst.mockResolvedValue(
        makeTxn({ status: "PAID", stripe_payment_intent_id: "pi_1" }),
      );
      (tx as unknown as { paymentRefund: unknown }).paymentRefund = {
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: null } }),
      };
      await expect(
        service.refund(
          TENANT,
          "t",
          { amount: 1000.01 },
          { type: "STAFF", id: "u" },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
