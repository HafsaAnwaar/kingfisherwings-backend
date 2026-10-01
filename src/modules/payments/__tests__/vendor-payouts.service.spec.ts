import {
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { VendorPayoutsService } from "../vendor-payouts.service";

const T = "11111111-1111-1111-1111-111111111111";
const REQ = "22222222-2222-2222-2222-222222222222";
const VENDOR = "33333333-3333-3333-3333-333333333333";

function setup(opts: { ready?: boolean; enabled?: boolean } = {}) {
  process.env.STRIPE_CONNECT_ENABLED =
    opts.enabled === false ? "false" : "true";
  const request = {
    id: REQ,
    tenant_id: T,
    party_id: VENDOR,
    status: "APPROVED",
    payment_id: null,
    invoice_id: null,
    amount: new Prisma.Decimal("300"),
    currency_code: "USD",
    request_number: "PR/1",
    approved_by: "u1",
  };
  const tx = {
    paymentRequest: {
      findFirst: jest.fn().mockResolvedValue(request),
      updateMany: jest.fn(),
    },
    invoice: { findFirst: jest.fn() },
    vendorPayout: {
      create: jest.fn(({ data }) => ({ id: "po1", ...data })),
      update: jest.fn(({ data }) => ({ id: "po1", ...data })),
      findFirst: jest.fn(),
    },
  };
  const prisma = {
    runWithTenant: jest.fn((_t: string, cb: (x: typeof tx) => unknown) =>
      cb(tx),
    ),
    vendorPayoutAccount: {
      findUnique: jest.fn().mockResolvedValue(
        opts.ready === false
          ? {
              stripe_account_id: "acct_v",
              transfers_active: false,
              payouts_enabled: false,
            }
          : {
              stripe_account_id: "acct_v",
              transfers_active: true,
              payouts_enabled: true,
            },
      ),
    },
  };
  const stripe = {
    connectEnabled: () => process.env.STRIPE_CONNECT_ENABLED === "true",
    createTransfer: jest.fn().mockResolvedValue({ id: "tr_1" }),
  };
  const settings = {
    resolveTenantAccount: jest
      .fn()
      .mockResolvedValue({ client: {}, accountRef: "platform" }),
    find: jest
      .fn()
      .mockResolvedValue({ is_enabled: true, auto_vendor_payouts: true }),
  };
  const gl = {
    findOne: jest.fn(),
    cancel: jest.fn(),
    create: jest.fn(),
    post: jest.fn(),
  };
  const paymentRequests = {
    markPaid: jest.fn().mockResolvedValue({ payment_id: "ap-1" }),
  };
  const notifications = { notifyFinanceStaff: jest.fn() };
  const audit = { log: jest.fn() };
  const svc = new VendorPayoutsService(
    prisma as never,
    stripe as never,
    settings as never,
    gl as never,
    paymentRequests as never,
    notifications as never,
    audit as never,
  );
  tx.vendorPayout.findFirst.mockResolvedValue({
    id: "po1",
    status: "PAID",
    amount: new Prisma.Decimal(300),
    currency_code: "USD",
  });
  return {
    svc,
    tx,
    prisma,
    stripe,
    settings,
    gl,
    paymentRequests,
    notifications,
  };
}

describe("VendorPayoutsService", () => {
  afterAll(() => delete process.env.STRIPE_CONNECT_ENABLED);

  it("pays an approved request: ERP amount → Stripe transfer → existing markPaid posts the AP payment", async () => {
    const { svc, stripe, paymentRequests, tx } = setup();
    await svc.payPaymentRequest(T, REQ, { type: "STAFF", id: "u1" });
    const [, params, key] = stripe.createTransfer.mock.calls[0];
    expect(params).toMatchObject({
      amount: 30000,
      currency: "usd",
      destination: "acct_v",
      metadata: expect.objectContaining({
        erp_scope: "vendor_payout",
        tenant_id: T,
        payment_request_id: REQ,
      }),
    });
    expect(key).toBe("erp-payout:po1");
    expect(paymentRequests.markPaid).toHaveBeenCalledWith(
      T,
      REQ,
      "u1",
      expect.objectContaining({ referenceNumber: "STRIPE:tr_1" }),
    );
    expect(tx.vendorPayout.update.mock.calls.at(-1)![0].data).toEqual({
      erp_payment_id: "ap-1",
    });
  });

  it("approval hook pays automatically, and is a silent no-op when Connect is off", async () => {
    const on = setup();
    await on.svc.autoPayApprovedRequest(T, REQ, { type: "STAFF", id: "u1" });
    expect(on.stripe.createTransfer).toHaveBeenCalledTimes(1);
    const off = setup({ enabled: false });
    await off.svc.autoPayApprovedRequest(T, REQ, { type: "STAFF", id: "u1" });
    expect(off.stripe.createTransfer).not.toHaveBeenCalled();
    await expect(
      off.svc.payPaymentRequest(T, REQ, { type: "STAFF" }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("waits (no transfer) until the vendor finishes onboarding", async () => {
    const { svc, stripe } = setup({ ready: false });
    await expect(
      svc.payPaymentRequest(T, REQ, { type: "STAFF" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(stripe.createTransfer).not.toHaveBeenCalled();
  });

  it("never pays the same request twice (DB guard)", async () => {
    const { svc, tx, stripe } = setup();
    tx.vendorPayout.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("dup", {
        code: "P2002",
        clientVersion: "x",
      }),
    );
    await expect(
      svc.payPaymentRequest(T, REQ, { type: "STAFF" }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(stripe.createTransfer).not.toHaveBeenCalled();
  });

  it("marks a failed transfer FAILED and alerts finance", async () => {
    const { svc, stripe, tx, notifications, paymentRequests } = setup();
    stripe.createTransfer.mockRejectedValue(new Error("insufficient balance"));
    await expect(
      svc.payPaymentRequest(T, REQ, { type: "STAFF" }),
    ).rejects.toThrow("insufficient balance");
    expect(tx.vendorPayout.update.mock.calls[0][0].data.status).toBe("FAILED");
    expect(notifications.notifyFinanceStaff).toHaveBeenCalled();
    expect(paymentRequests.markPaid).not.toHaveBeenCalled();
  });

  it("reverses the AP payment and reopens the request when Stripe reverses the transfer", async () => {
    const { svc, tx, gl } = setup();
    tx.vendorPayout.findFirst.mockResolvedValue({
      id: "po1",
      status: "PAID",
      erp_payment_id: "ap-1",
      payment_request_id: REQ,
      account_ref: "platform",
      amount: new Prisma.Decimal(300),
      currency_code: "USD",
    });
    gl.findOne.mockResolvedValue({ id: "ap-1", status: "POSTED" });
    await svc.applyTransferReversed(
      T,
      { id: "tr_1", amount: 30000, amount_reversed: 30000 } as never,
      "platform",
    );
    expect(gl.cancel).toHaveBeenCalledWith(T, "ap-1");
    expect(tx.paymentRequest.updateMany.mock.calls[0][0].data).toMatchObject({
      status: "APPROVED",
      payment_id: null,
    });
    expect(tx.vendorPayout.update.mock.calls.at(-1)![0].data.status).toBe(
      "REFUNDED",
    );
  });

  it("ignores a reversal reported by a different Stripe account", async () => {
    const { svc, tx, gl } = setup();
    tx.vendorPayout.findFirst.mockResolvedValue({
      id: "po1",
      status: "PAID",
      account_ref: "tenant:x",
    });
    expect(
      await svc.applyTransferReversed(T, { id: "tr_1" } as never, "platform"),
    ).toBeNull();
    expect(gl.cancel).not.toHaveBeenCalled();
  });
});
