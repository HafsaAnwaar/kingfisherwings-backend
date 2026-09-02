import { Injectable, NotFoundException } from "@nestjs/common";
import { InvoiceStatus, InvoiceType, Prisma } from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { PdfService } from "../../shared/pdf/pdf.service";
import { StorageService } from "../../shared/storage/storage.service";
import { ArApService } from "../gl/ar-ap.service";
import { PaymentsService } from "../gl/payments.service";
import { InvoicesService } from "../invoices/invoices.service";
import { PaymentProofsService } from "../invoices/payment-proofs/payment-proofs.service";
import { PaymentRequestsService } from "../invoices/payment-requests.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import {
  PORTAL_CSV_EXPORT_MAX_ROWS,
  toCsv,
} from "../portal/helpers/portal-csv.helper";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

const VISIBLE: InvoiceStatus[] = [
  "DRAFT",
  "POSTED",
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
];

@Injectable()
export class VendorFinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
    private readonly payments: PaymentsService,
    private readonly arAp: ArApService,
    private readonly paymentRequests: PaymentRequestsService,
    private readonly storage: StorageService,
    private readonly pdf: PdfService,
    private readonly notifications: NotificationEmitterService,
    private readonly paymentProofs: PaymentProofsService,
  ) {}

  async listInvoices(
    user: CurrentVendorUser,
    query: { page?: number; limit?: number; status?: InvoiceStatus },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.InvoiceWhereInput = {
      tenant_id: user.tenantId,
      party_id: user.partyId,
      deleted_at: null,
      invoice_type: InvoiceType.PURCHASE_INVOICE,
      status: query.status ?? { in: VISIBLE },
    };
    const [rows, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.invoice.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { invoice_date: "desc" },
            include: { job: { select: { id: true, job_number: true } } },
          }),
          tx.invoice.count({ where }),
        ]),
    );
    return {
      success: true,
      data: rows.map((inv) => this.toInvoiceItem(inv)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async invoiceSummary(user: CurrentVendorUser) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          invoice_type: InvoiceType.PURCHASE_INVOICE,
          status: { in: VISIBLE },
        },
        select: { status: true, balance_due: true, due_date: true },
      }),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let outstanding = 0;
    let overdue = 0;
    for (const r of rows) {
      const bal = Number(r.balance_due);
      outstanding += bal;
      if (bal > 0 && r.due_date && r.due_date < today) overdue += bal;
    }
    return {
      success: true,
      data: { count: rows.length, outstanding, overdue },
    };
  }

  async getInvoice(user: CurrentVendorUser, id: string) {
    const invoice = await this.invoices.findOne(user.tenantId, id);
    if (
      invoice.party_id !== user.partyId ||
      invoice.invoice_type !== InvoiceType.PURCHASE_INVOICE
    ) {
      throw new NotFoundException("Invoice not found.");
    }
    return {
      success: true,
      data: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        currency_code: invoice.currency_code,
        total_amount: invoice.total_amount,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        remarks: invoice.remarks,
        has_pdf: Boolean(invoice.pdf_url),
        lines: invoice.lines.map((l) => ({
          id: l.id,
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
          amount: l.amount,
        })),
      },
    };
  }

  async downloadInvoicePdf(user: CurrentVendorUser, id: string, res: Response) {
    const invoice = await this.invoices.findOne(user.tenantId, id);
    if (
      invoice.party_id !== user.partyId ||
      invoice.invoice_type !== InvoiceType.PURCHASE_INVOICE ||
      !invoice.pdf_url
    ) {
      throw new NotFoundException("Invoice PDF not available.");
    }
    const file = await this.storage.readByStoredFile(user.tenantId, {
      file_name: `${invoice.invoice_number}.pdf`,
      file_url: invoice.pdf_url,
      s3_key: invoice.pdf_s3_key,
      mime_type: "application/pdf",
    });
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName}"`,
    );
    res.send(file.buffer);
  }

  async exportInvoicesCsv(user: CurrentVendorUser, res: Response) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          invoice_type: InvoiceType.PURCHASE_INVOICE,
        },
        take: PORTAL_CSV_EXPORT_MAX_ROWS,
        orderBy: { invoice_date: "desc" },
      }),
    );
    const csv = toCsv(
      [
        "invoice_number",
        "status",
        "invoice_date",
        "due_date",
        "currency_code",
        "total_amount",
        "amount_paid",
        "balance_due",
      ],
      rows.map((r) => [
        r.invoice_number,
        r.status,
        r.invoice_date,
        r.due_date,
        r.currency_code,
        r.total_amount,
        r.amount_paid,
        r.balance_due,
      ]),
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="vendor-invoices.csv"',
    );
    res.send(csv);
  }

  async listPayments(user: CurrentVendorUser) {
    const rows = await this.payments.findAll(user.tenantId, {
      direction: "PAYMENT",
      party_id: user.partyId,
      status: "POSTED",
    });
    return { success: true, data: rows.map((p) => this.toPaymentItem(p)) };
  }

  async listAdvances(user: CurrentVendorUser) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.payment.findMany({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          direction: "PAYMENT",
          status: "POSTED",
          deleted_at: null,
          unallocated_amount: { gt: 0 },
        },
        orderBy: { payment_date: "desc" },
      }),
    );
    return { success: true, data: rows.map((p) => this.toPaymentItem(p)) };
  }

  async remittancePdf(
    user: CurrentVendorUser,
    paymentId: string,
    res: Response,
  ) {
    const payment = await this.payments.findOne(user.tenantId, paymentId);
    if (payment.party_id !== user.partyId || payment.direction !== "PAYMENT") {
      throw new NotFoundException("Payment not found.");
    }
    const html = `<!DOCTYPE html><html><body>
      <h1>Remittance Advice</h1>
      <p>Payment ${payment.payment_number}</p>
      <p>Date: ${payment.payment_date?.toISOString().slice(0, 10) ?? ""}</p>
      <p>Amount: ${payment.currency_code} ${payment.amount}</p>
      <p>Unallocated: ${payment.unallocated_amount}</p>
      <table border="1" cellpadding="6"><tr><th>Invoice</th><th>Allocated</th></tr>
      ${(payment.allocations ?? [])
        .map(
          (a: { invoice?: { invoice_number?: string }; amount: unknown }) =>
            `<tr><td>${a.invoice?.invoice_number ?? a}</td><td>${a.amount}</td></tr>`,
        )
        .join("")}
      </table></body></html>`;
    const buffer = await this.pdf.renderHtmlToPdf(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="remittance-${payment.payment_number}.pdf"`,
    );
    res.send(buffer);
  }

  async listCreditNotes(user: CurrentVendorUser) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          invoice_type: InvoiceType.CREDIT_NOTE,
          status: { in: ["POSTED", "SENT", "PAID", "PARTIALLY_PAID"] },
        },
        orderBy: { invoice_date: "desc" },
      }),
    );
    return { success: true, data: rows.map((r) => this.toInvoiceItem(r)) };
  }

  async aging(user: CurrentVendorUser) {
    return {
      success: true,
      data: await this.arAp.apAging(user.tenantId, { party_id: user.partyId }),
    };
  }

  async statement(user: CurrentVendorUser) {
    return {
      success: true,
      data: await this.arAp.partyStatement(
        user.tenantId,
        user.partyId,
        {},
        "AP",
      ),
    };
  }

  async statementPdf(user: CurrentVendorUser, res: Response) {
    const statement = await this.arAp.partyStatement(
      user.tenantId,
      user.partyId,
      {},
      "AP",
    );
    const html = `<!DOCTYPE html><html><body><h1>Vendor AP Statement</h1>
      <pre>${JSON.stringify(statement?.summary ?? {}, null, 2)}</pre></body></html>`;
    const buffer = await this.pdf.renderHtmlToPdf(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="vendor-statement.pdf"',
    );
    res.send(buffer);
  }

  async schedule(user: CurrentVendorUser) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          invoice_type: InvoiceType.PURCHASE_INVOICE,
          status: { in: ["POSTED", "SENT", "PARTIALLY_PAID"] },
          balance_due: { gt: 0 },
        },
        orderBy: { due_date: "asc" },
      }),
    );
    return {
      success: true,
      data: rows.map((r) => ({
        ...this.toInvoiceItem(r),
        schedule_status:
          r.due_date && r.due_date < today
            ? "OVERDUE"
            : Number(r.amount_paid) > 0
              ? "PARTIALLY_PAID"
              : "DUE",
      })),
    };
  }

  async listPaymentRequests(user: CurrentVendorUser) {
    const result = await this.paymentRequests.findAll(user.tenantId, {
      party_id: user.partyId,
    });
    return { success: true, ...result };
  }

  tdsPlaceholder() {
    return {
      success: true,
      data: { available: false, phase: "india_phase_3" },
    };
  }

  async submitInvoice(
    user: CurrentVendorUser,
    dto: {
      currency_code: string;
      total_amount: number;
      invoice_date?: string;
      due_date?: string;
      reference?: string;
      remarks?: string;
    },
    attachmentPath?: string,
  ) {
    const created = await this.invoices.createPurchaseInvoice(
      user.tenantId,
      {
        party_id: user.partyId,
        currency_code: dto.currency_code,
        invoice_date: dto.invoice_date,
        due_date: dto.due_date,
        lpo_number: dto.reference,
        remarks: `Submitted via vendor portal. ${dto.remarks ?? ""}`.trim(),
        lines: [
          {
            description: dto.reference
              ? `Vendor invoice ${dto.reference}`
              : "Vendor submitted invoice",
            quantity: 1,
            unit_price: dto.total_amount,
          },
        ],
      },
      user.id,
    );

    if (attachmentPath) {
      await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.invoice.update({
          where: { id: created.id },
          data: { pdf_url: attachmentPath },
        }),
      );
    }

    await this.notifications.notifyFinanceStaff(user.tenantId, {
      type: "VENDOR_INVOICE_SUBMITTED",
      title: "Vendor invoice submitted",
      message: `${user.fullName} submitted purchase invoice ${created.invoice_number}.`,
      entity_type: "invoice",
      entity_id: created.id,
      link_path: `/purchase-invoices/${created.id}`,
    });

    return {
      success: true,
      message: "Invoice submitted as draft for finance review.",
      data: this.toInvoiceItem(created),
    };
  }

  async listOpenItems(user: CurrentVendorUser) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          invoice_type: "PURCHASE_INVOICE",
          status: { in: ["POSTED", "SENT", "PARTIALLY_PAID"] },
          balance_due: { gt: 0.0001 },
        },
        orderBy: [{ due_date: "asc" }, { invoice_date: "desc" }],
      }),
    );
    return {
      success: true,
      data: rows.map((inv) => this.toInvoiceItem(inv)),
      meta: {
        total_pending: rows.reduce(
          (sum, inv) => sum + Number(inv.balance_due),
          0,
        ),
        count: rows.length,
      },
    };
  }

  async paymentsSummary(user: CurrentVendorUser) {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const [openRows, payments] = await Promise.all([
      this.listOpenItems(user),
      this.listPayments(user),
    ]);
    const totalReceivedYtd = (payments.data as any[]).filter(
      (p) => new Date(p.payment_date) >= yearStart,
    ).reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      success: true,
      data: {
        total_pending_receipt: openRows.meta.total_pending,
        total_received_ytd: totalReceivedYtd,
        currency_code: openRows.data[0]?.currency_code ?? "USD",
      },
    };
  }

  async listPaymentProofs(user: CurrentVendorUser, invoiceId: string) {
    await this.getInvoice(user, invoiceId);
    return this.paymentProofs.listForInvoice(user.tenantId, invoiceId);
  }

  async uploadPaymentProof(
    user: CurrentVendorUser,
    invoiceId: string,
    body: {
      amount_claimed: number;
      payment_date: string;
      reference_number?: string;
      notes?: string;
    },
    file: Express.Multer.File,
  ) {
    await this.getInvoice(user, invoiceId);
    return this.paymentProofs.create({
      tenantId: user.tenantId,
      direction: "TENANT_TO_VENDOR",
      invoiceId,
      amountClaimed: body.amount_claimed,
      paymentDate: body.payment_date,
      referenceNumber: body.reference_number,
      notes: body.notes,
      submittedByPartyId: user.partyId,
      submittedByUserId: user.id,
      file,
      actorId: user.id,
    });
  }

  async getPaymentRequest(user: CurrentVendorUser, id: string) {
    return this.paymentRequests.findOneForVendor(
      user.tenantId,
      user.partyId,
      id,
    );
  }

  private toPaymentItem(p: {
    id: string;
    payment_number: string;
    payment_date: Date;
    amount: unknown;
    currency_code: string;
    unallocated_amount: unknown;
    reference_number: string | null;
    allocations?: Array<{
      amount: unknown;
      invoice?: { invoice_number?: string } | null;
    }>;
  }) {
    return {
      id: p.id,
      payment_number: p.payment_number,
      payment_date: p.payment_date,
      amount: p.amount,
      currency_code: p.currency_code,
      unallocated_amount: p.unallocated_amount,
      reference_number: p.reference_number,
      allocations: (p.allocations ?? []).map((a) => ({
        invoice_number: a.invoice?.invoice_number ?? null,
        amount: a.amount,
      })),
    };
  }

  private toInvoiceItem(inv: {
    id: string;
    invoice_number: string;
    status: InvoiceStatus;
    invoice_date: Date;
    due_date: Date | null;
    currency_code: string;
    total_amount: unknown;
    amount_paid: unknown;
    balance_due: unknown;
    pdf_url?: string | null;
  }) {
    return {
      id: inv.id,
      invoice_number: inv.invoice_number,
      status: inv.status,
      invoice_date: inv.invoice_date,
      due_date: inv.due_date,
      currency_code: inv.currency_code,
      total_amount: inv.total_amount,
      amount_paid: inv.amount_paid,
      balance_due: inv.balance_due,
      has_pdf: Boolean(inv.pdf_url),
    };
  }
}
