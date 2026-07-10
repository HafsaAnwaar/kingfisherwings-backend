import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Invoice, InvoiceLine, InvoiceStatus, InvoiceType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import { PdfService } from '../../shared/pdf/pdf.service';
import { StorageService } from '../../shared/storage/storage.service';
import { EmailService } from '../../shared/email/email.service';
import {
  CreateCreditNoteDto,
  CreateInvoiceDto,
  CreateInvoiceLineDto,
  CreatePurchaseInvoiceDto,
  InvoiceQueryDto,
  SendInvoiceEmailDto,
  UpdateInvoiceDto,
  UpdateInvoiceLineDto,
} from './dto/invoice.dto';

const EDITABLE_STATUSES: InvoiceStatus[] = ['DRAFT'];

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly pdfService: PdfService,
    private readonly storage: StorageService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(tenantId: string, query: InvoiceQueryDto, invoiceType?: InvoiceType) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where = this.buildWhere(tenantId, query, invoiceType);

      const [data, total] = await Promise.all([
        tx.invoice.findMany({
          where,
          include: {
            party: { select: { id: true, name: true, code: true } },
            job: { select: { id: true, job_number: true } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { invoice_date: 'desc' },
        }),
        tx.invoice.count({ where }),
      ]);

      return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          party: { select: { id: true, name: true, code: true, vat_number: true, email: true } },
          job: { select: { id: true, job_number: true, job_type: true } },
          company: { select: { id: true, name: true, vat_number: true } },
          credited_invoice: { select: { id: true, invoice_number: true } },
          lines: { where: { deleted_at: null }, orderBy: { sort_order: 'asc' } },
        },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found.');
      }

      return invoice;
    });
  }

  async create(
    tenantId: string,
    dto: CreateInvoiceDto,
    actorId: string | undefined,
    invoiceType: InvoiceType = 'CUSTOMER_INVOICE',
  ) {
    await this.assertPartyExists(tenantId, dto.party_id);
    if (dto.job_id) await this.assertJobExists(tenantId, dto.job_id);
    if (dto.company_id) await this.assertCompanyExists(tenantId, dto.company_id);

    const docType =
      invoiceType === 'PURCHASE_INVOICE'
        ? 'PURCHASE_INVOICE'
        : invoiceType === 'CREDIT_NOTE'
          ? 'CREDIT_NOTE'
          : invoiceType === 'DEBIT_NOTE'
            ? 'DEBIT_NOTE'
            : 'INVOICE';

    const invoiceNumber = await this.numberGenerator.generate(tenantId, docType);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const party = await tx.party.findFirst({ where: { id: dto.party_id, tenant_id: tenantId } });

      const invoice = await tx.invoice.create({
        data: {
          tenant_id: tenantId,
          company_id: dto.company_id,
          invoice_number: invoiceNumber,
          invoice_type: invoiceType,
          status: 'DRAFT',
          job_id: dto.job_id,
          party_id: dto.party_id,
          branch_id: dto.branch_id,
          department_id: dto.department_id,
          invoice_date: dto.invoice_date ? new Date(dto.invoice_date) : new Date(),
          due_date: dto.due_date ? new Date(dto.due_date) : undefined,
          currency_code: dto.currency_code,
          exchange_rate: dto.exchange_rate ?? 1,
          vat_rate: dto.vat_rate ?? 5,
          party_vat_number: party?.vat_number,
          lpo_number: dto.lpo_number,
          remarks: dto.remarks,
          internal_notes: dto.internal_notes,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (dto.lines?.length) {
        for (const [index, line] of dto.lines.entries()) {
          await this.createLineInternal(tx, tenantId, invoice.id, line, actorId, index, invoice.vat_rate);
        }
      }

      return this.recalculateAndReturn(tx, tenantId, invoice.id);
    });
  }

  async createFromJob(tenantId: string, jobId: string, actorId?: string) {
    const invoiceNumber = await this.numberGenerator.generate(tenantId, 'INVOICE');

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          charges: {
            where: {
              deleted_at: null,
              is_billable: true,
              is_cost: false,
              is_invoiced: false,
            },
          },
        },
      });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      if (!job.charges.length) {
        throw new BadRequestException('No uninvoiced billable revenue charges on this job.');
      }

      const customerId = job.shipper_id ?? job.consignee_id;
      if (!customerId) {
        throw new BadRequestException('Job must have a shipper or consignee to invoice.');
      }

      const invoice = await tx.invoice.create({
        data: {
          tenant_id: tenantId,
          company_id: job.company_id,
          invoice_number: invoiceNumber,
          invoice_type: 'CUSTOMER_INVOICE',
          status: 'DRAFT',
          job_id: jobId,
          party_id: customerId,
          branch_id: job.branch_id,
          department_id: job.department_id,
          currency_code: job.charges[0].currency_code,
          exchange_rate: job.charges[0].exchange_rate,
          vat_rate: 5,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      for (const [index, charge] of job.charges.entries()) {
        await tx.invoiceLine.create({
          data: {
            tenant_id: tenantId,
            invoice_id: invoice.id,
            job_id: jobId,
            job_charge_id: charge.id,
            charge_code_id: charge.charge_code_id,
            description: charge.description,
            quantity: charge.quantity,
            unit_price: charge.unit_price,
            amount: charge.amount,
            tax_rate_id: charge.tax_rate_id,
            tax_rate: Number(charge.tax_amount) > 0 ? 5 : 0,
            tax_amount: charge.tax_amount,
            is_taxable: Number(charge.tax_amount) > 0,
            sort_order: index,
            created_by: actorId,
            updated_by: actorId,
          },
        });

        await tx.jobCharge.update({
          where: { id: charge.id },
          data: { is_invoiced: true, updated_by: actorId },
        });
      }

      return this.recalculateAndReturn(tx, tenantId, invoice.id);
    });
  }

  async createCreditNote(tenantId: string, dto: CreateCreditNoteDto, actorId?: string) {
    const original = await this.findOne(tenantId, dto.credited_invoice_id);

    if (original.invoice_type !== 'CUSTOMER_INVOICE') {
      throw new BadRequestException('Credit notes can only be issued against customer invoices.');
    }

    if (!['POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID'].includes(original.status)) {
      throw new BadRequestException('Original invoice must be posted before issuing a credit note.');
    }

    const invoiceNumber = await this.numberGenerator.generate(tenantId, 'CREDIT_NOTE');

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const creditNote = await tx.invoice.create({
        data: {
          tenant_id: tenantId,
          company_id: original.company_id,
          invoice_number: invoiceNumber,
          invoice_type: 'CREDIT_NOTE',
          status: 'DRAFT',
          job_id: original.job_id,
          party_id: original.party_id,
          branch_id: original.branch_id,
          department_id: original.department_id,
          credited_invoice_id: original.id,
          currency_code: original.currency_code,
          exchange_rate: original.exchange_rate,
          vat_rate: original.vat_rate,
          party_vat_number: original.party_vat_number,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      const lines =
        dto.lines ??
        original.lines.map((l) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
          charge_code_id: l.charge_code_id ?? undefined,
          tax_rate_id: l.tax_rate_id ?? undefined,
          is_taxable: l.is_taxable,
        }));

      for (const [index, line] of lines.entries()) {
        await this.createLineInternal(tx, tenantId, creditNote.id, line, actorId, index, creditNote.vat_rate);
      }

      return this.recalculateAndReturn(tx, tenantId, creditNote.id);
    });
  }

  async createPurchaseInvoice(tenantId: string, dto: CreatePurchaseInvoiceDto, actorId?: string) {
    return this.create(tenantId, dto, actorId, 'PURCHASE_INVOICE');
  }

  async update(tenantId: string, id: string, dto: UpdateInvoiceDto, actorId?: string) {
    const invoice = await this.findOne(tenantId, id);
    this.assertEditable(invoice);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: {
          ...(dto.party_id ? { party_id: dto.party_id } : {}),
          ...(dto.company_id !== undefined ? { company_id: dto.company_id } : {}),
          ...(dto.job_id !== undefined ? { job_id: dto.job_id } : {}),
          ...(dto.branch_id !== undefined ? { branch_id: dto.branch_id } : {}),
          ...(dto.department_id !== undefined ? { department_id: dto.department_id } : {}),
          ...(dto.currency_code ? { currency_code: dto.currency_code } : {}),
          ...(dto.exchange_rate !== undefined ? { exchange_rate: dto.exchange_rate } : {}),
          ...(dto.vat_rate !== undefined ? { vat_rate: dto.vat_rate } : {}),
          ...(dto.invoice_date ? { invoice_date: new Date(dto.invoice_date) } : {}),
          ...(dto.due_date !== undefined ? { due_date: dto.due_date ? new Date(dto.due_date) : null } : {}),
          ...(dto.lpo_number !== undefined ? { lpo_number: dto.lpo_number } : {}),
          ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
          ...(dto.internal_notes !== undefined ? { internal_notes: dto.internal_notes } : {}),
          updated_by: actorId,
        },
      });

      return this.recalculateAndReturn(tx, tenantId, id);
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    const invoice = await this.findOne(tenantId, id);
    this.assertEditable(invoice);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const lines = await tx.invoiceLine.findMany({
        where: { invoice_id: id, tenant_id: tenantId, deleted_at: null },
      });

      for (const line of lines) {
        if (line.job_charge_id) {
          await tx.jobCharge.update({
            where: { id: line.job_charge_id },
            data: { is_invoiced: false, updated_by: actorId },
          });
        }
      }

      await tx.invoice.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  async addLine(tenantId: string, invoiceId: string, dto: CreateInvoiceLineDto, actorId?: string) {
    const invoice = await this.findOne(tenantId, invoiceId);
    this.assertEditable(invoice);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const count = await tx.invoiceLine.count({ where: { invoice_id: invoiceId, deleted_at: null } });
      await this.createLineInternal(tx, tenantId, invoiceId, dto, actorId, count, invoice.vat_rate);
      return this.recalculateAndReturn(tx, tenantId, invoiceId);
    });
  }

  async updateLine(
    tenantId: string,
    invoiceId: string,
    lineId: string,
    dto: UpdateInvoiceLineDto,
    actorId?: string,
  ) {
    const invoice = await this.findOne(tenantId, invoiceId);
    this.assertEditable(invoice);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const line = await tx.invoiceLine.findFirst({
        where: { id: lineId, invoice_id: invoiceId, tenant_id: tenantId, deleted_at: null },
      });

      if (!line) {
        throw new NotFoundException('Invoice line not found.');
      }

      const quantity = dto.quantity ?? Number(line.quantity);
      const unitPrice = dto.unit_price ?? Number(line.unit_price);
      const amount = quantity * unitPrice;
      const isTaxable = dto.is_taxable ?? line.is_taxable;
      const taxRate = isTaxable ? Number(invoice.vat_rate) : 0;
      const taxAmount = (amount * taxRate) / 100;

      await tx.invoiceLine.update({
        where: { id: lineId },
        data: {
          ...(dto.description ? { description: dto.description } : {}),
          ...(dto.quantity !== undefined ? { quantity } : {}),
          ...(dto.unit_price !== undefined ? { unit_price: unitPrice } : {}),
          amount,
          ...(dto.charge_code_id !== undefined ? { charge_code_id: dto.charge_code_id } : {}),
          ...(dto.tax_rate_id !== undefined ? { tax_rate_id: dto.tax_rate_id } : {}),
          ...(dto.is_taxable !== undefined ? { is_taxable: dto.is_taxable, tax_rate: taxRate, tax_amount: taxAmount } : {}),
          ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
          updated_by: actorId,
        },
      });

      return this.recalculateAndReturn(tx, tenantId, invoiceId);
    });
  }

  async removeLine(tenantId: string, invoiceId: string, lineId: string, actorId?: string) {
    const invoice = await this.findOne(tenantId, invoiceId);
    this.assertEditable(invoice);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const line = await tx.invoiceLine.findFirst({
        where: { id: lineId, invoice_id: invoiceId, tenant_id: tenantId, deleted_at: null },
      });

      if (!line) {
        throw new NotFoundException('Invoice line not found.');
      }

      if (line.job_charge_id) {
        await tx.jobCharge.update({
          where: { id: line.job_charge_id },
          data: { is_invoiced: false, updated_by: actorId },
        });
      }

      await tx.invoiceLine.update({
        where: { id: lineId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });

    return this.prisma.runWithTenant(tenantId, (tx) => this.recalculateAndReturn(tx, tenantId, invoiceId));
  }

  async post(tenantId: string, id: string, actorId?: string) {
    const invoice = await this.findOne(tenantId, id);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be posted.');
    }

    if (!invoice.lines.length) {
      throw new BadRequestException('Invoice must have at least one line before posting.');
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.update({
        where: { id },
        data: { status: 'POSTED', posted_at: new Date(), updated_by: actorId },
        include: { lines: { where: { deleted_at: null } }, party: true },
      }),
    );
  }

  async send(tenantId: string, id: string, dto: SendInvoiceEmailDto, actorId?: string) {
    const invoice = await this.findOne(tenantId, id);

    if (!['POSTED', 'SENT', 'PARTIALLY_PAID'].includes(invoice.status)) {
      throw new BadRequestException('Invoice must be posted before sending.');
    }

    let pdfBuffer: Buffer | undefined;
    if (!invoice.pdf_url) {
      const generated = await this.generatePdf(tenantId, id, actorId);
      pdfBuffer = generated.buffer;
    }

    const emailLog = await this.emailService.send({
      tenantId,
      eventType: 'INVOICE_SENT',
      to: dto.to_email,
      subject: `Invoice ${invoice.invoice_number}`,
      body: dto.message ?? `<p>Please find attached invoice <strong>${invoice.invoice_number}</strong>.</p>`,
      attachmentBuffer: pdfBuffer,
      attachmentName: pdfBuffer ? `${invoice.invoice_number}.pdf` : undefined,
      attachmentPath: invoice.pdf_url ?? undefined,
      createdBy: actorId,
    });

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.update({
        where: { id },
        data: {
          status: invoice.status === 'POSTED' ? 'SENT' : invoice.status,
          sent_at: invoice.sent_at ?? new Date(),
          last_emailed_at: new Date(),
          last_emailed_to: dto.to_email,
          updated_by: actorId,
        },
      }),
    ).then(() => ({
      success: emailLog.status === 'SENT',
      email_log_id: emailLog.id,
      status: emailLog.status,
    }));
  }

  async cancel(tenantId: string, id: string, actorId?: string) {
    const invoice = await this.findOne(tenantId, id);

    if (['PAID', 'CANCELLED', 'VOID'].includes(invoice.status)) {
      throw new BadRequestException('This invoice cannot be cancelled.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const line of invoice.lines) {
        if (line.job_charge_id) {
          await tx.jobCharge.update({
            where: { id: line.job_charge_id },
            data: { is_invoiced: false, updated_by: actorId },
          });
        }
      }

      return tx.invoice.update({
        where: { id },
        data: { status: 'CANCELLED', updated_by: actorId },
      });
    });
  }

  async generatePdf(tenantId: string, id: string, actorId?: string) {
    const invoice = await this.findOne(tenantId, id);
    const buffer = await this.pdfService.generateInvoicePdf({
      invoice_number: invoice.invoice_number,
      invoice_type: invoice.invoice_type,
      status: invoice.status,
      party_name: invoice.party.name,
      party_vat_number: invoice.party_vat_number ?? invoice.party.vat_number ?? undefined,
      job_number: invoice.job?.job_number,
      currency_code: invoice.currency_code,
      subtotal: invoice.subtotal.toString(),
      tax_amount: invoice.tax_amount.toString(),
      total_amount: invoice.total_amount.toString(),
      vat_rate: invoice.vat_rate.toString(),
      invoice_date: invoice.invoice_date.toISOString().slice(0, 10),
      due_date: invoice.due_date?.toISOString().slice(0, 10),
      remarks: invoice.remarks ?? undefined,
      lines: invoice.lines.map((l) => ({
        description: l.description,
        quantity: l.quantity.toString(),
        unit_price: l.unit_price.toString(),
        amount: l.amount.toString(),
        tax_amount: l.tax_amount.toString(),
      })),
    });

    const filename = `${invoice.invoice_number}.pdf`;
    const stored = await this.storage.saveBuffer(tenantId, buffer, filename);

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.update({
        where: { id },
        data: {
          pdf_url: stored.fileUrl,
          pdf_s3_key: stored.s3Key,
          pdf_generated_at: new Date(),
          updated_by: actorId,
        },
      }),
    );

    return { ...stored, buffer, filename };
  }

  async getOverdueReport(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          invoice_type: 'CUSTOMER_INVOICE',
          status: { in: ['POSTED', 'SENT', 'PARTIALLY_PAID'] },
          due_date: { lt: today },
          balance_due: { gt: 0 },
        },
        include: {
          party: { select: { id: true, name: true, email: true } },
        },
        orderBy: { due_date: 'asc' },
      }),
    );
  }

  private buildWhere(tenantId: string, query: InvoiceQueryDto, invoiceType?: InvoiceType): Prisma.InvoiceWhereInput {
    const where: Prisma.InvoiceWhereInput = { tenant_id: tenantId, deleted_at: null };

    if (invoiceType) where.invoice_type = invoiceType;
    if (query.invoice_type) where.invoice_type = query.invoice_type;
    if (query.status) where.status = query.status;
    if (query.party_id) where.party_id = query.party_id;
    if (query.job_id) where.job_id = query.job_id;

    if (query.from_date || query.to_date) {
      where.invoice_date = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }

    if (query.search) {
      where.OR = [
        { invoice_number: { contains: query.search, mode: 'insensitive' } },
        { lpo_number: { contains: query.search, mode: 'insensitive' } },
        { remarks: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async createLineInternal(
    tx: Prisma.TransactionClient,
    tenantId: string,
    invoiceId: string,
    dto: CreateInvoiceLineDto,
    actorId: string | undefined,
    sortOrder: number,
    headerVatRate: Prisma.Decimal | number,
  ) {
    const quantity = dto.quantity ?? 1;
    const amount = quantity * dto.unit_price;
    const isTaxable = dto.is_taxable ?? true;
    const taxRate = isTaxable ? Number(headerVatRate) : 0;
    const taxAmount = (amount * taxRate) / 100;

    return tx.invoiceLine.create({
      data: {
        tenant_id: tenantId,
        invoice_id: invoiceId,
        charge_code_id: dto.charge_code_id,
        description: dto.description,
        quantity,
        unit_price: dto.unit_price,
        amount,
        tax_rate_id: dto.tax_rate_id,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        is_taxable: isTaxable,
        sort_order: dto.sort_order ?? sortOrder,
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  private async recalculateAndReturn(tx: Prisma.TransactionClient, tenantId: string, invoiceId: string) {
    const lines = await tx.invoiceLine.findMany({
      where: { invoice_id: invoiceId, tenant_id: tenantId, deleted_at: null },
    });

    const subtotal = lines.reduce((sum: number, l: InvoiceLine) => sum + Number(l.amount), 0);
    const taxAmount = lines.reduce((sum: number, l: InvoiceLine) => sum + Number(l.tax_amount), 0);
    const totalAmount = subtotal + taxAmount;
    const invoice = await tx.invoice.findFirstOrThrow({ where: { id: invoiceId } });
    const balanceDue = totalAmount - Number(invoice.amount_paid);

    return tx.invoice.update({
      where: { id: invoiceId },
      data: { subtotal, tax_amount: taxAmount, total_amount: totalAmount, balance_due: balanceDue },
      include: {
        lines: { where: { deleted_at: null }, orderBy: { sort_order: 'asc' } },
        party: { select: { id: true, name: true, code: true } },
      },
    });
  }

  private assertEditable(invoice: Invoice & { lines?: unknown[] }) {
    if (!EDITABLE_STATUSES.includes(invoice.status)) {
      throw new BadRequestException('Only draft invoices can be modified.');
    }
  }

  private async assertPartyExists(tenantId: string, partyId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({ where: { id: partyId, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!exists) throw new NotFoundException('Party not found.');
  }

  private async assertJobExists(tenantId: string, jobId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!exists) throw new NotFoundException('Job not found.');
  }

  private async assertCompanyExists(tenantId: string, companyId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.company.findFirst({ where: { id: companyId, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!exists) throw new NotFoundException('Company not found.');
  }
}
