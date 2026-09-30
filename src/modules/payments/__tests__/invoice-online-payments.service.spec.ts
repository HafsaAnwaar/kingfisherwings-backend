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
  const vouchers = {
    create: jest.fn().mockResolvedValue({ id: "v-fee", status: "DRAFT" }),
    post: jest.fn().mockResolvedValue({ id: "v-fee" }),
  };
  const service = new InvoiceOnlinePaymentsService(
    prisma as never,
    stripe as never,
    settings as never,
    customers as never,
    gl as never,
    notifications as never,
    mailer as never,
    audit as never,
    vouchers as never,
  );
  return {
    service,
    tx,
    prisma,
    stripe,
    settings,
    gl,
    audit,
    vouchers,
    notifications,
  };
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

  describe("hardening", () => {
    it("rejects balances below Stripe's minimum charge before calling Stripe", async () => {
      const { service, tx, stripe } = setup();
      tx.invoice.findFirst.mockResolvedValue({
        ...openInvoice,
        currency_code: "AED",
        balance_due: new Prisma.Decimal("1.50"),
      });
      await expect(
        service.startCheckout(TENANT, INVOICE, {
          initiator: { type: "STAFF" },
          returnUrl: "x",
        }),
      ).rejects.toThrow(/at least 2.00/);
      expect(stripe.createCheckoutSession).not.toHaveBeenCalled();
    });

    it("alerts finance when part of a Stripe receipt cannot be allocated", async () => {
      const { service, tx, gl, notifications } = setup();
      const txn = makeTxn({ stripe_payment_intent_id: "pi_1" });
      tx.paymentTransaction.findUnique.mockResolvedValue(txn);
      tx.paymentTransaction.update.mockImplementation(({ data }) => ({
        ...txn,
        ...data,
        invoice: { id: INVOICE, invoice_number: "INV/1" },
        party: { id: PARTY, name: "Acme", email: null },
        payment: null,
      }));
      tx.invoice.findFirst.mockResolvedValue({
        ...openInvoice,
        balance_due: new Prisma.Decimal("400"),
      });
      gl.post.mockResolvedValue({ id: "pay-1", payment_number: "PAY/1" });
      await service.markSucceeded(TENANT, txn.id, {
        paymentIntentId: "pi_1",
        amountMinor: 100000,
        currency: "usd",
      });
      expect(gl.create.mock.calls[0][1].allocations).toEqual([
        { invoice_id: INVOICE, amount: 400 },
      ]);
      const alert = notifications.notifyFinanceStaff.mock.calls.find(
        (c: unknown[]) =>
          (c[1] as { type: string }).type === "PAYMENT_ACTION_REQUIRED",
      );
      expect(alert?.[1].message).toContain("600.00 USD");
    });

    describe("recordStripeFee", () => {
      function feeSetup(
        feeCurrency = "usd",
        gwFeeAccount: string | null = "acct-fees",
      ) {
        const ctx = setup();
        const txn = makeTxn({
          status: "PAID",
          payment_id: "pay-1",
          stripe_payment_intent_id: "pi_1",
        });
        (
          ctx.tx.paymentTransaction as unknown as { updateMany: jest.Mock }
        ).updateMany = jest.fn().mockResolvedValue({ count: 1 });
        ctx.tx.paymentTransaction.findFirst.mockResolvedValue(txn);
        (ctx.tx as unknown as { voucher: unknown }).voucher = {
          findFirst: jest.fn().mockResolvedValue(null),
        };
        Object.assign(ctx.settings, {
          clientForAccountRef: jest.fn().mockResolvedValue({}),
          find: jest
            .fn()
            .mockResolvedValue({ fee_gl_account_id: gwFeeAccount }),
        });
        Object.assign(ctx.stripe, {
          paymentIntentFee: jest.fn().mockResolvedValue({
            chargeId: "ch_1",
            fee: 3230,
            currency: feeCurrency,
          }),
        });
        ctx.gl.findOne.mockResolvedValue({
          id: "pay-1",
          payment_number: "PAY/1",
          gl_account_id: "acct-bank",
          exchange_rate: new Prisma.Decimal(1),
          company_id: null,
          party_id: PARTY,
        });
        return ctx;
      }

      it("books Dr fees / Cr bank for the Stripe fee", async () => {
        const { service, vouchers, tx } = feeSetup();
        await service.recordStripeFee(TENANT, "t");
        const dto = vouchers.create.mock.calls[0][1];
        expect(dto.voucher_type).toBe("JOURNAL");
        expect(dto.reference_number).toBe("STRIPE-FEE:pi_1");
        expect(dto.lines).toEqual([
          expect.objectContaining({
            account_id: "acct-fees",
            debit_amount: 32.3,
          }),
          expect.objectContaining({
            account_id: "acct-bank",
            credit_amount: 32.3,
          }),
        ]);
        expect(vouchers.post).toHaveBeenCalledWith(TENANT, "v-fee");
        expect(
          tx.paymentTransaction.update.mock.calls.at(-1)[0].data,
        ).toMatchObject({
          fee_voucher_id: "v-fee",
          stripe_fee_currency: "USD",
        });
      });

      it("only records (no journal) when Stripe settles in another currency", async () => {
        const { service, vouchers } = feeSetup("eur");
        await service.recordStripeFee(TENANT, "t");
        expect(vouchers.create).not.toHaveBeenCalled();
      });

      it("releases the claim when the fee is not settled yet, for the reconciler to retry", async () => {
        const { service, stripe, tx } = feeSetup();
        (
          stripe as unknown as { paymentIntentFee: jest.Mock }
        ).paymentIntentFee.mockResolvedValue(null);
        await service.recordStripeFee(TENANT, "t");
        expect(tx.paymentTransaction.update.mock.calls.at(-1)[0].data).toEqual({
          fee_recorded_at: null,
        });
      });
    });

    describe("applyDispute", () => {
      function disputeSetup(txnOver: Record<string, unknown> = {}) {
        const ctx = setup();
        const txn = makeTxn({
          status: "PAID",
          payment_id: "pay-1",
          stripe_payment_intent_id: "pi_1",
          ...txnOver,
        });
        ctx.tx.paymentTransaction.findFirst.mockResolvedValue(txn);
        ctx.tx.paymentTransaction.update.mockResolvedValue(txn);
        (ctx.tx as unknown as { paymentRefund: unknown }).paymentRefund = {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn(({ data }) => ({ id: "ref-1", ...data })),
        };
        const applySpy = jest
          .spyOn(ctx.service, "applyRefundAccounting")
          .mockResolvedValue(undefined);
        return { ...ctx, txn, applySpy };
      }
      const dispute = (status: string) =>
        ({
          id: "du_1",
          payment_intent: "pi_1",
          amount: 100000,
          currency: "usd",
          status,
          reason: "fraudulent",
          evidence_details: { due_by: 1790000000 },
          metadata: {},
        }) as never;

      it("marks an opened dispute DISPUTED and alerts finance", async () => {
        const { service, tx, notifications, applySpy } = disputeSetup();
        await service.applyDispute(
          TENANT,
          "platform",
          dispute("needs_response"),
        );
        expect(
          tx.paymentTransaction.update.mock.calls[0][0].data,
        ).toMatchObject({
          status: "DISPUTED",
          stripe_dispute_id: "du_1",
        });
        expect(notifications.notifyFinanceStaff.mock.calls[0][1].type).toBe(
          "PAYMENT_DISPUTED",
        );
        expect(applySpy).not.toHaveBeenCalled();
      });

      it("reverses the payment in the ERP when the dispute is lost", async () => {
        const { service, tx, applySpy } = disputeSetup({
          status: "DISPUTED",
          stripe_dispute_id: "du_1",
        });
        await service.applyDispute(TENANT, "platform", dispute("lost"));
        const created = (
          tx as unknown as { paymentRefund: { create: jest.Mock } }
        ).paymentRefund.create.mock.calls[0][0].data;
        expect(created).toMatchObject({
          stripe_refund_id: "dispute:du_1",
          status: "SUCCEEDED",
        });
        expect(created.amount.toFixed(2)).toBe("1000.00");
        expect(applySpy).toHaveBeenCalledWith(TENANT, "ref-1");
      });

      it("restores PAID when the dispute is won", async () => {
        const { service, tx } = disputeSetup({
          status: "DISPUTED",
          stripe_dispute_id: "du_1",
        });
        await service.applyDispute(TENANT, "platform", dispute("won"));
        expect(tx.paymentTransaction.update.mock.calls[0][0].data.status).toBe(
          "PAID",
        );
      });

      it("ignores disputes for another Stripe account's payment", async () => {
        const { service, tx } = disputeSetup();
        const res = await service.applyDispute(
          TENANT,
          "tenant:other",
          dispute("needs_response"),
        );
        expect(res).toBeNull();
        expect(tx.paymentTransaction.update).not.toHaveBeenCalled();
      });
    });

    it("does not re-post a Stripe receipt that staff cancelled by hand when refunding", async () => {
      const { service, tx, gl, notifications } = setup();
      const txn = makeTxn({
        status: "PAID",
        payment_id: "pay-1",
        stripe_payment_intent_id: "pi_1",
      });
      (tx as unknown as { paymentRefund: unknown }).paymentRefund = {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: "r1",
          payment_transaction_id: txn.id,
          amount: new Prisma.Decimal("300"),
          currency_code: "USD",
        }),
        update: jest.fn(),
      };
      tx.paymentTransaction.findFirst.mockResolvedValue(txn);
      tx.paymentTransaction.update.mockResolvedValue(txn);
      gl.findOne.mockResolvedValue({
        id: "pay-1",
        status: "CANCELLED",
        payment_number: "PAY/1",
      });
      await service.applyRefundAccounting(TENANT, "r1");
      expect(gl.cancel).not.toHaveBeenCalled();
      expect(gl.create).not.toHaveBeenCalled();
      const alert = notifications.notifyFinanceStaff.mock.calls.find(
        (c: unknown[]) =>
          (c[1] as { type: string }).type === "PAYMENT_ACTION_REQUIRED",
      );
      expect(alert?.[1].message).toContain("cancelled manually");
    });
  });
});
