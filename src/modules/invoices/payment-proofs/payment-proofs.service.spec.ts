import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaymentProofsService } from "./payment-proofs.service";

const TENANT = "11111111-1111-1111-1111-111111111111";

function setup(proofOver: Record<string, unknown> = {}) {
  const proof = {
    id: "proof-1",
    direction: "CUSTOMER_TO_TENANT",
    amount_claimed: new Prisma.Decimal("120"),
    payment_date: new Date("2026-09-30"),
    reference_number: "TT1",
    submitted_by_user_id: null,
    invoice: {
      id: "inv-1",
      invoice_number: "INV/1",
      party_id: "party-1",
      status: "SENT",
      balance_due: new Prisma.Decimal("100"),
      currency_code: "USD",
      exchange_rate: new Prisma.Decimal(1),
      company_id: null,
      branch_id: null,
    },
    ...proofOver,
  };
  const tx = {
    paymentProof: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findFirst: jest.fn().mockResolvedValue(proof),
      findUniqueOrThrow: jest.fn().mockResolvedValue(proof),
      update: jest
        .fn()
        .mockResolvedValue({ ...proof, linked_payment_id: "pay-1" }),
    },
    auditLog: { create: jest.fn() },
  };
  const prisma = {
    runWithTenant: jest.fn((_t: string, cb: (x: typeof tx) => unknown) =>
      cb(tx),
    ),
  };
  const gl = {
    create: jest.fn().mockResolvedValue({ id: "pay-1" }),
    post: jest.fn().mockResolvedValue({ id: "pay-1" }),
  };
  const notifications = {
    notifyPortalUser: jest.fn(),
    notifyVendorUser: jest.fn(),
  };
  const svc = new PaymentProofsService(
    prisma as never,
    {} as never,
    notifications as never,
    gl as never,
  );
  return { svc, tx, gl };
}

describe("PaymentProofsService.approve", () => {
  it("records a receipt via the GL flow, capped to the invoice balance", async () => {
    const { svc, gl } = setup();
    const res = await svc.approve(TENANT, "proof-1", {}, "staff-1");
    expect(res.data.linked_payment_id).toBe("pay-1");
    const [, dto] = gl.create.mock.calls[0];
    expect(dto).toMatchObject({
      direction: "RECEIPT",
      amount: 120,
      reference_number: "PROOF:proof-1",
      allocations: [{ invoice_id: "inv-1", amount: 100 }],
    });
    expect(gl.post).toHaveBeenCalledWith(TENANT, "pay-1", "staff-1");
  });

  it("records a vendor proof as an AP payment", async () => {
    const { svc, gl } = setup({ direction: "TENANT_TO_VENDOR" });
    await svc.approve(TENANT, "proof-1", {}, "staff-1");
    expect(gl.create.mock.calls[0][1].direction).toBe("PAYMENT");
  });

  it("refuses a proof that was already reviewed (no duplicate payment)", async () => {
    const { svc, tx, gl } = setup();
    tx.paymentProof.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      svc.approve(TENANT, "proof-1", {}, "s"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(gl.create).not.toHaveBeenCalled();
  });

  it("releases the claim if posting fails", async () => {
    const { svc, tx, gl } = setup();
    gl.post.mockRejectedValue(new Error("no COA"));
    await expect(svc.approve(TENANT, "proof-1", {}, "s")).rejects.toThrow(
      "no COA",
    );
    expect(tx.paymentProof.update.mock.calls.at(-1)[0].data.status).toBe(
      "SUBMITTED",
    );
  });
});
