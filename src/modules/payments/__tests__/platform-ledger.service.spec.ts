import { Prisma } from "@prisma/client";
import { PlatformLedgerService } from "../platform-ledger.service";

const LEDGER = "99999999-9999-9999-9999-999999999999";

function setup() {
  process.env.PLATFORM_LEDGER_TENANT_ID = LEDGER;
  const tx = {
    party: {
      findFirst: jest.fn().mockResolvedValue({ id: "party-1" }),
      create: jest.fn(),
    },
  };
  const prisma = {
    runWithTenant: jest.fn((_t: string, cb: (x: typeof tx) => unknown) =>
      cb(tx),
    ),
    platformInvoice: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    platformPayment: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const invoices = {
    create: jest.fn().mockResolvedValue({
      id: "erp-1",
      invoice_number: "INV/1",
      total_amount: new Prisma.Decimal("524.9950"),
    }),
    addLine: jest.fn(),
    post: jest.fn(),
    findOne: jest.fn(),
    cancel: jest.fn(),
    softDelete: jest.fn(),
  };
  const gl = {
    create: jest.fn().mockResolvedValue({ id: "rcpt-new" }),
    post: jest.fn().mockResolvedValue({ id: "rcpt-new" }),
    findOne: jest.fn(),
    cancel: jest.fn(),
    softDelete: jest.fn(),
  };
  const svc = new PlatformLedgerService(
    prisma as never,
    invoices as never,
    gl as never,
  );
  return { svc, prisma, invoices, gl, tx };
}

const tenant = {
  id: "t1",
  code: "ABC",
  name: "ABC Logistics",
  display_name: null,
  email: "a@abc.test",
  phone: null,
  address: null,
  vat_number: null,
  base_currency: "USD",
};

describe("PlatformLedgerService", () => {
  afterAll(() => delete process.env.PLATFORM_LEDGER_TENANT_ID);

  it("books a sent platform invoice through the existing InvoicesService, matching totals to the cent", async () => {
    const { svc, prisma, invoices } = setup();
    prisma.platformInvoice.findUnique.mockResolvedValue({
      id: "pi1",
      invoice_number: "PF-000001",
      status: "SENT",
      deleted_at: null,
      erp_invoice_id: null,
      currency_code: "USD",
      tax_rate: new Prisma.Decimal(5),
      discount_amount: new Prisma.Decimal(60),
      total_amount: new Prisma.Decimal("525.00"),
      issue_date: new Date("2026-10-01"),
      due_date: null,
      notes: null,
      lines: [
        {
          description: "Fee",
          quantity: new Prisma.Decimal(1),
          unit_price: new Prisma.Decimal(560),
        },
      ],
      tenant,
    });
    await svc.syncInvoice("pi1");
    const dto = invoices.create.mock.calls[0][1];
    expect(invoices.create.mock.calls[0][0]).toBe(LEDGER);
    expect(dto).toMatchObject({
      party_id: "party-1",
      vat_rate: 5,
      lpo_number: "PF-000001",
    });
    expect(dto.lines).toEqual([
      expect.objectContaining({ unit_price: 560, is_taxable: true }),
      expect.objectContaining({ description: "Discount", unit_price: -60 }),
    ]);
    expect(invoices.addLine.mock.calls[0][2]).toMatchObject({
      description: "Rounding adjustment",
      unit_price: 0.005,
    });
    expect(invoices.post).toHaveBeenCalledWith(LEDGER, "erp-1");
  });

  it("does nothing for drafts or when no ledger is configured", async () => {
    const { svc, prisma, invoices } = setup();
    prisma.platformInvoice.findUnique.mockResolvedValue({
      id: "pi1",
      status: "DRAFT",
      deleted_at: null,
    });
    await svc.syncInvoice("pi1");
    delete process.env.PLATFORM_LEDGER_TENANT_ID;
    await svc.syncInvoice("pi1");
    expect(invoices.create).not.toHaveBeenCalled();
  });

  it("after a refund, reverses the ERP receipt and re-posts the net amount", async () => {
    const { svc, prisma, gl, invoices } = setup();
    const p = {
      id: "pp1",
      platform_invoice_id: "pi1",
      applied_at: new Date(),
      amount: new Prisma.Decimal(200),
      amount_refunded: new Prisma.Decimal(50),
      erp_synced_amount: new Prisma.Decimal(200),
      erp_payment_id: "rcpt-old",
      currency_code: "USD",
      payment_method: "BANK_TRANSFER",
      provider: "MANUAL",
      payment_date: new Date("2026-10-01"),
      paid_at: new Date(),
      reference_number: "TT-1",
      stripe_payment_intent_id: null,
      invoice: {
        id: "pi1",
        invoice_number: "PF-000001",
        erp_invoice_id: "erp-1",
      },
      tenant,
    };
    prisma.platformPayment.findUnique.mockResolvedValue(p);
    prisma.platformPayment.findUniqueOrThrow.mockResolvedValue(p);
    prisma.platformInvoice.findUnique.mockResolvedValue({
      id: "pi1",
      status: "PARTIALLY_PAID",
      deleted_at: null,
      erp_invoice_id: "erp-1",
    });
    invoices.findOne.mockResolvedValue({
      id: "erp-1",
      status: "PARTIALLY_PAID",
      balance_due: new Prisma.Decimal(375),
    });
    gl.findOne.mockResolvedValue({ id: "rcpt-old", status: "POSTED" });
    await svc.syncPayment("pp1");
    expect(gl.cancel).toHaveBeenCalledWith(LEDGER, "rcpt-old");
    expect(gl.create.mock.calls[0][1]).toMatchObject({
      direction: "RECEIPT",
      amount: 150,
      allocations: [{ invoice_id: "erp-1", amount: 150 }],
    });
    const last = prisma.platformPayment.update.mock.calls.find(
      (c: unknown[]) =>
        (c[0] as { data: { erp_payment_id?: string } }).data.erp_payment_id ===
        "rcpt-new",
    );
    expect(last?.[0].data.erp_synced_amount.toFixed(2)).toBe("150.00");
  });

  it("is a no-op when the ERP receipt already matches", async () => {
    const { svc, prisma, gl } = setup();
    prisma.platformPayment.findUnique.mockResolvedValue({
      id: "pp1",
      applied_at: new Date(),
      amount: new Prisma.Decimal(200),
      amount_refunded: new Prisma.Decimal(0),
      erp_synced_amount: new Prisma.Decimal(200),
      erp_payment_id: "rcpt",
    });
    await svc.syncPayment("pp1");
    expect(gl.create).not.toHaveBeenCalled();
  });
});
