import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, InvoiceType, PortalDocumentType, Prisma } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { PdfService } from '../../shared/pdf/pdf.service';
import { ArApService } from '../gl/ar-ap.service';
import { PaymentsService } from '../gl/payments.service';
import { InvoicesService } from '../invoices/invoices.service';
import {
  PortalCreditAgingQueryDto,
  PortalInvoiceQueryDto,
  PortalPaymentQueryDto,
  PORTAL_VISIBLE_INVOICE_STATUSES,
} from './dto/portal-finance.dto';
import { PORTAL_CSV_EXPORT_MAX_ROWS, toCsv } from './helpers/portal-csv.helper';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalPermissionsService } from './portal-permissions.service';

@Injectable()
export class PortalFinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
    private readonly arAp: ArApService,
    private readonly payments: PaymentsService,
    private readonly permissions: PortalPermissionsService,
    private readonly storage: StorageService,
    private readonly pdf: PdfService,
  ) {}

  async listInvoices(user: CurrentPortalUser, query: PortalInvoiceQueryDto) {
    const where = this.buildPortalInvoiceWhere(user, query, [
      InvoiceType.CUSTOMER_INVOICE,
      InvoiceType.DEBIT_NOTE,
    ]);

    const [rows, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.invoice.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { invoice_date: 'desc' },
          include: {
            job: { select: { id: true, job_number: true } },
          },
        }),
        tx.invoice.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows.map((inv) => this.toInvoiceListItem(inv)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async exportInvoicesCsv(user: CurrentPortalUser, query: PortalInvoiceQueryDto, res: Response) {
    const where = this.buildPortalInvoiceWhere(user, query, [
      InvoiceType.CUSTOMER_INVOICE,
      InvoiceType.DEBIT_NOTE,
    ]);

    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findMany({
        where,
        take: PORTAL_CSV_EXPORT_MAX_ROWS,
        orderBy: { invoice_date: 'desc' },
        include: {
          job: { select: { id: true, job_number: true } },
        },
      }),
    );

    const items = rows.map((inv) => this.toInvoiceListItem(inv));

    const headers = [
      'invoice_number',
      'invoice_type',
      'status',
      'invoice_date',
      'due_date',
      'currency_code',
      'total_amount',
      'amount_paid',
      'balance_due',
      'has_pdf',
      'job_number',
    ];

    const csvRows = items.map((item) => [
      item.invoice_number,
      item.invoice_type,
      item.status,
      item.invoice_date,
      item.due_date,
      item.currency_code,
      item.total_amount,
      item.amount_paid,
      item.balance_due,
      item.has_pdf,
      item.job?.job_number ?? '',
    ]);

    const csv = toCsv(headers, csvRows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
    res.send(csv);
  }

  async listDebitNotes(user: CurrentPortalUser, query: PortalInvoiceQueryDto) {
    const where = this.buildPortalInvoiceWhere(user, query, [InvoiceType.DEBIT_NOTE]);
    const [rows, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.invoice.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { invoice_date: 'desc' },
          include: { job: { select: { id: true, job_number: true } } },
        }),
        tx.invoice.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows.map((inv) => this.toInvoiceListItem(inv)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async listCreditNotes(user: CurrentPortalUser, query: PortalInvoiceQueryDto) {
    const where = this.buildPortalInvoiceWhere(user, query, [InvoiceType.CREDIT_NOTE]);
    const [rows, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.invoice.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { invoice_date: 'desc' },
          include: { job: { select: { id: true, job_number: true } } },
        }),
        tx.invoice.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows.map((inv) => this.toInvoiceListItem(inv)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  private buildPortalInvoiceWhere(
    user: CurrentPortalUser,
    query: PortalInvoiceQueryDto,
    types: InvoiceType[],
  ): Prisma.InvoiceWhereInput {
    const where: Prisma.InvoiceWhereInput = {
      tenant_id: user.tenantId,
      party_id: user.partyId,
      deleted_at: null,
      invoice_type: { in: types },
      status: query.status
        ? query.status
        : { in: [...PORTAL_VISIBLE_INVOICE_STATUSES] },
      ...(query.job_id ? { job_id: query.job_id } : {}),
    };

    if (query.from_date || query.to_date) {
      where.invoice_date = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { invoice_number: { contains: q, mode: 'insensitive' } },
        { lpo_number: { contains: q, mode: 'insensitive' } },
        { remarks: { contains: q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async invoiceSummary(user: CurrentPortalUser) {
    const invoices = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          invoice_type: { in: [InvoiceType.CUSTOMER_INVOICE, InvoiceType.DEBIT_NOTE] },
          status: { in: PORTAL_VISIBLE_INVOICE_STATUSES },
        },
        select: {
          status: true,
          balance_due: true,
          total_amount: true,
          due_date: true,
        },
      }),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let outstanding = 0;
    let overdue = 0;
    let paid = 0;

    for (const inv of invoices) {
      const bal = Number(inv.balance_due);
      if (inv.status === InvoiceStatus.PAID || bal <= 0) {
        paid += 1;
      } else {
        outstanding += bal;
        if (inv.due_date && inv.due_date < today) overdue += bal;
      }
    }

    return {
      success: true,
      data: {
        invoice_count: invoices.length,
        outstanding,
        overdue,
        paid_count: paid,
      },
    };
  }

  async getInvoice(user: CurrentPortalUser, id: string) {
    const invoice = await this.invoices.findOne(user.tenantId, id);
    this.assertOwnedInvoice(invoice, user.partyId);

    if (!PORTAL_VISIBLE_INVOICE_STATUSES.includes(invoice.status)) {
      throw new NotFoundException('Invoice not found.');
    }

    return {
      success: true,
      data: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_type: invoice.invoice_type,
        status: invoice.status,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        currency_code: invoice.currency_code,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        remarks: invoice.remarks,
        lpo_number: invoice.lpo_number,
        job: invoice.job,
        credited_invoice: invoice.credited_invoice,
        has_pdf: Boolean(invoice.pdf_url),
        lines: invoice.lines.map((line) => ({
          id: line.id,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          amount: line.amount,
          tax_amount: line.tax_amount,
        })),
        created_at: invoice.created_at,
        // Never: internal_notes
      },
    };
  }

  async downloadInvoicePdf(user: CurrentPortalUser, id: string, res: Response) {
    const invoice = await this.invoices.findOne(user.tenantId, id);
    this.assertOwnedInvoice(invoice, user.partyId);

    if (!invoice.pdf_url) {
      throw new NotFoundException('Invoice PDF not available.');
    }

    const portalType =
      invoice.invoice_type === InvoiceType.CREDIT_NOTE
        ? PortalDocumentType.CREDIT_NOTE
        : PortalDocumentType.INVOICE;

    const matrix = await this.permissions.resolveMatrix(user.tenantId, user.partyId);
    if (!this.permissions.assertCanView(matrix, portalType)) {
      throw new NotFoundException('Invoice not found.');
    }
    if (!this.permissions.assertCanDownload(matrix, portalType)) {
      throw new ForbiddenException('Download is not permitted for this document type.');
    }

    const file = await this.storage.readByStoredFile(user.tenantId, {
      file_name: `${invoice.invoice_number}.pdf`,
      file_url: invoice.pdf_url,
      s3_key: invoice.pdf_s3_key,
      mime_type: 'application/pdf',
    });

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    res.send(file.buffer);
  }

  async listPayments(user: CurrentPortalUser, query: PortalPaymentQueryDto) {
    const rows = await this.payments.findAll(user.tenantId, {
      party_id: user.partyId,
      direction: 'RECEIPT',
      status: 'POSTED',
      from_date: query.from_date,
      to_date: query.to_date,
      search: query.search,
    });

    const start = (query.page - 1) * query.limit;
    const pageRows = rows.slice(start, start + query.limit);

    return {
      success: true,
      data: pageRows.map((p) => ({
        id: p.id,
        payment_number: p.payment_number,
        payment_date: p.payment_date,
        amount: p.amount,
        currency_code: p.currency_code,
        reference_number: p.reference_number,
        unallocated_amount: p.unallocated_amount,
        allocations: p.allocations.map((a) => ({
          invoice_id: a.invoice?.id,
          invoice_number: a.invoice?.invoice_number,
          amount: a.amount,
        })),
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total: rows.length,
        totalPages: Math.ceil(rows.length / query.limit) || 1,
      },
    };
  }

  async creditSummary(user: CurrentPortalUser) {
    const [party, statement] = await Promise.all([
      this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.party.findFirst({
          where: { id: user.partyId, tenant_id: user.tenantId, deleted_at: null },
          select: {
            id: true,
            name: true,
            credit_limit: true,
            credit_days: true,
            credit_status: true,
            currency_code: true,
          },
        }),
      ),
      this.arAp.partyStatement(user.tenantId, user.partyId, {}, 'AR'),
    ]);

    if (!party) {
      throw new NotFoundException('Party not found.');
    }

    const creditLimit = party.credit_limit != null ? Number(party.credit_limit) : null;
    const used = statement.summary?.open_balance ?? 0;
    const available = creditLimit != null ? Math.max(0, creditLimit - used) : null;

    return {
      success: true,
      data: {
        party_id: party.id,
        party_name: party.name,
        credit_limit: creditLimit,
        credit_days: party.credit_days,
        credit_status: party.credit_status,
        currency_code: party.currency_code,
        used,
        available,
        open_invoice_count: statement.summary?.invoice_count ?? 0,
        advances_unallocated: statement.summary?.advances_unallocated ?? 0,
      },
    };
  }

  async creditAging(user: CurrentPortalUser, query: PortalCreditAgingQueryDto) {
    const aging = await this.arAp.arAging(user.tenantId, {
      party_id: user.partyId,
      as_of: query.as_of,
    });

    return { success: true, data: aging };
  }

  async creditStatement(user: CurrentPortalUser, query: PortalCreditAgingQueryDto) {
    const statement = await this.arAp.partyStatement(
      user.tenantId,
      user.partyId,
      { as_of: query.as_of },
      'AR',
    );

    return { success: true, data: statement };
  }

  async downloadStatementPdf(
    user: CurrentPortalUser,
    query: PortalCreditAgingQueryDto,
    res: Response,
  ) {
    const matrix = await this.permissions.resolveMatrix(user.tenantId, user.partyId);
    if (!this.permissions.assertCanView(matrix, PortalDocumentType.STATEMENT)) {
      throw new NotFoundException('Statement not found.');
    }
    if (!this.permissions.assertCanDownload(matrix, PortalDocumentType.STATEMENT)) {
      throw new ForbiddenException('Download is not permitted for statements.');
    }

    const statement = await this.arAp.partyStatement(
      user.tenantId,
      user.partyId,
      { as_of: query.as_of },
      'AR',
    );

    const partyName = statement.party?.name ?? 'Customer';
    const asOf = statement.as_of;
    const rows = (statement.invoices ?? [])
      .map(
        (inv) =>
          `<tr>
            <td>${inv.invoice_number}</td>
            <td>${inv.invoice_type}</td>
            <td>${String(inv.invoice_date).slice(0, 10)}</td>
            <td>${inv.due_date ? String(inv.due_date).slice(0, 10) : ''}</td>
            <td style="text-align:right">${Number(inv.total_amount).toFixed(2)}</td>
            <td style="text-align:right">${Number(inv.balance_due).toFixed(2)}</td>
          </tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Account Statement</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;color:#222;padding:24px}
        h1{font-size:18px;margin:0 0 8px}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border:1px solid #ccc;padding:6px 8px}
        th{background:#f3f3f3;text-align:left}
      </style></head><body>
      <h1>Account Statement</h1>
      <p><strong>${partyName}</strong><br/>As of ${asOf}</p>
      <p>Open balance: <strong>${Number(statement.summary?.open_balance ?? 0).toFixed(2)}</strong></p>
      <table>
        <thead><tr><th>Invoice</th><th>Type</th><th>Date</th><th>Due</th><th>Total</th><th>Balance</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6">No invoices</td></tr>'}</tbody>
      </table>
      </body></html>`;

    const buffer = await this.pdf.renderHtmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="statement-${user.partyId.slice(0, 8)}-${asOf}.pdf"`,
    );
    res.send(buffer);
  }

  private assertOwnedInvoice(
    invoice: { party_id: string; invoice_type: InvoiceType },
    partyId: string,
  ) {
    if (invoice.party_id !== partyId) {
      throw new NotFoundException('Invoice not found.');
    }
    if (
      invoice.invoice_type !== InvoiceType.CUSTOMER_INVOICE &&
      invoice.invoice_type !== InvoiceType.CREDIT_NOTE &&
      invoice.invoice_type !== InvoiceType.DEBIT_NOTE
    ) {
      throw new NotFoundException('Invoice not found.');
    }
  }

  private toInvoiceListItem(inv: {
    id: string;
    invoice_number: string;
    invoice_type: InvoiceType;
    status: InvoiceStatus;
    invoice_date: Date;
    due_date: Date | null;
    currency_code: string;
    total_amount: unknown;
    amount_paid: unknown;
    balance_due: unknown;
    pdf_url: string | null;
    job: { id: string; job_number: string } | null;
  }) {
    return {
      id: inv.id,
      invoice_number: inv.invoice_number,
      invoice_type: inv.invoice_type,
      status: inv.status,
      invoice_date: inv.invoice_date,
      due_date: inv.due_date,
      currency_code: inv.currency_code,
      total_amount: inv.total_amount,
      amount_paid: inv.amount_paid,
      balance_due: inv.balance_due,
      has_pdf: Boolean(inv.pdf_url),
      job: inv.job,
    };
  }
}
