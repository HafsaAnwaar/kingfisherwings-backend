import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Quotation, QuotationStatus, JobType, QuotationPdfMode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import { TariffsService } from './tariffs/tariffs.service';

import { CreateQuotationDto, UpdateQuotationDto } from './dto/quotation.dto';
import { CreateQuotationLineDto, UpdateQuotationLineDto } from './dto/quotation-line.dto';
import { QuotationQueryDto } from './dto/quotation-query.dto';
import { QuotationAnalyticsQueryDto } from './dto/quotation-analytics-query.dto';
import { CreateOnlineQuoteDto } from './dto/online-quote.dto';
import { MarkLostDto, ApprovalDecisionDto } from './dto/quotation-actions.dto';
import { GenerateQuotationPdfDto, SendQuotationEmailDto } from './dto/quotation-pdf.dto';
import { DocumentGenerationService } from '../../shared/queue/document-generation.service';
import { EmailService } from '../../shared/email/email.service';
import { StorageService } from '../../shared/storage/storage.service';

/** Maps a job type to the short code used inside the quotation number, e.g. KFW/AE/06/26/00136. */
const JOB_TYPE_CODE: Record<JobType, string> = {
  AIR_EXPORT: 'AE',
  AIR_IMPORT: 'AI',
  SEA_FCL_EXPORT: 'FE',
  SEA_FCL_IMPORT: 'FI',
  SEA_LCL_EXPORT: 'LE',
  SEA_LCL_IMPORT: 'LI',
  LAND: 'LD',
  COURIER: 'CR',
  CUSTOMS_CLEARANCE: 'CC',
  NVOCC_EXPORT: 'NE',
  NVOCC_IMPORT: 'NI',
  SERVICE_JOB: 'SJ',
  WAREHOUSE: 'WH',
};

const EDITABLE_STATUSES: QuotationStatus[] = ['DRAFT', 'REJECTED'];

const ARCHIVABLE_STATUSES: QuotationStatus[] = ['SENT', 'WON', 'LOST', 'EXPIRED', 'CONVERTED', 'APPROVED'];

const EXPIRABLE_STATUSES: QuotationStatus[] = ['SENT', 'APPROVED', 'DRAFT', 'SUBMITTED'];

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly tariffsService: TariffsService,
    private readonly documentGeneration: DocumentGenerationService,
    private readonly emailService: EmailService,
    private readonly storage: StorageService,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(tenantId: string, dto: CreateQuotationDto, actorId?: string): Promise<Quotation> {
    await this.assertPartyExists(tenantId, dto.customer_id, 'Customer');
    await this.assertPartyExists(tenantId, dto.carrier_id, 'Carrier');
    await this.assertCompanyExists(tenantId, dto.company_id);
    await this.assertBranchExists(tenantId, dto.branch_id);
    await this.assertDepartmentExists(tenantId, dto.department_id);
    await this.assertPortExists(tenantId, dto.origin_port_id, 'Origin port');
    await this.assertPortExists(tenantId, dto.dest_port_id, 'Destination port');

    const branchCode = await this.resolveBranchCode(tenantId, dto.branch_id);
    const quotationNumber = await this.numberGenerator.generate(tenantId, 'QUOTATION', {
      extraSegment: JOB_TYPE_CODE[dto.job_type],
      branchCode,
    });

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.create({
        data: {
          tenant_id: tenantId,
          company_id: dto.company_id,
          quotation_number: quotationNumber,
          status: 'DRAFT',
          job_type: dto.job_type,
          customer_id: dto.customer_id,
          salesperson_id: dto.salesperson_id,
          branch_id: dto.branch_id,
          department_id: dto.department_id,
          carrier_id: dto.carrier_id,
          origin_port_id: dto.origin_port_id,
          dest_port_id: dto.dest_port_id,
          incoterm: dto.incoterm,
          commodity: dto.commodity,
          hs_code: dto.hs_code,
          gross_weight: dto.gross_weight,
          chargeable_weight: dto.chargeable_weight,
          volume_cbm: dto.volume_cbm,
          pieces: dto.pieces,
          container_type_id: dto.container_type_id,
          container_count: dto.container_count,
          is_dg: dto.is_dg ?? false,
          dg_class: dto.dg_class,
          special_requirements: dto.special_requirements,
          carrier_preference: dto.carrier_preference,
          transit_time_days: dto.transit_time_days,
          routing_notes: dto.routing_notes,
          remarks: dto.remarks,
          internal_notes: dto.internal_notes,
          valid_until: dto.valid_until ? new Date(dto.valid_until) : undefined,
          currency_code: dto.currency_code,
          exchange_rate: dto.exchange_rate ?? 1,
          discount_percent: dto.discount_percent,
          discount_amount: dto.discount_amount,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  // ============================================================
  // READ
  // ============================================================

  private buildListWhere(tenantId: string, query: QuotationQueryDto): Prisma.QuotationWhereInput {
    const where: Prisma.QuotationWhereInput = { tenant_id: tenantId, deleted_at: null };

    if (query.status) where.status = query.status;
    if (query.job_type) where.job_type = query.job_type;
    if (query.customer_id) where.customer_id = query.customer_id;
    if (query.salesperson_id) where.salesperson_id = query.salesperson_id;
    if (query.branch_id) where.branch_id = query.branch_id;
    if (query.company_id) where.company_id = query.company_id;
    if (query.department_id) where.department_id = query.department_id;
    if (query.carrier_id) where.carrier_id = query.carrier_id;
    if (query.origin_port_id) where.origin_port_id = query.origin_port_id;
    if (query.dest_port_id) where.dest_port_id = query.dest_port_id;
    if (query.container_type_id) where.container_type_id = query.container_type_id;
    if (query.incoterm) where.incoterm = query.incoterm;
    if (query.created_by) where.created_by = query.created_by;

    if (query.from_date || query.to_date) {
      where.created_at = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }

    if (query.search) {
      where.OR = [
        { quotation_number: { contains: query.search, mode: 'insensitive' } },
        { commodity: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findAll(tenantId: string, query: QuotationQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where = this.buildListWhere(tenantId, query);

      const [data, total] = await Promise.all([
        tx.quotation.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: query.order },
        }),
        tx.quotation.count({ where }),
      ]);

      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 1,
        },
      };
    });
  }

  /**
   * "All Quotations Chargewise" report — same filters as findAll(), but
   * returns each quotation with its full charge-line breakdown instead
   * of just the header.
   */
  async findAllChargewise(tenantId: string, query: QuotationQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where = this.buildListWhere(tenantId, query);

      const [data, total] = await Promise.all([
        tx.quotation.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: query.order },
          include: { lines: { orderBy: { sort_order: 'asc' } } },
        }),
        tx.quotation.count({ where }),
      ]);

      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 1,
        },
      };
    });
  }

  async getRevisions(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await tx.quotation.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });

      if (!quotation) {
        throw new NotFoundException('Quotation not found.');
      }

      const rootId = quotation.parent_quotation_id ?? quotation.id;

      return tx.quotation.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [{ id: rootId }, { parent_quotation_id: rootId }],
        },
        orderBy: { version: 'asc' },
        select: {
          id: true,
          quotation_number: true,
          version: true,
          status: true,
          parent_quotation_id: true,
          revenue_total: true,
          gp_amount: true,
          gp_percent: true,
          created_at: true,
          created_by: true,
          submitted_at: true,
          sent_at: true,
          won_at: true,
          lost_at: true,
          lost_reason: true,
        },
      });
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await tx.quotation.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: { orderBy: { sort_order: 'asc' } },
          status_history: { orderBy: { created_at: 'asc' } },
          approvals: { orderBy: { level: 'asc' } },
        },
      });

      if (!quotation) {
        throw new NotFoundException('Quotation not found.');
      }

      return quotation;
    });
  }

  // ============================================================
  // UPDATE (header) — only while DRAFT or REJECTED (resubmittable)
  // ============================================================

  async update(tenantId: string, id: string, dto: UpdateQuotationDto, actorId?: string): Promise<Quotation> {
    await this.assertCompanyExists(tenantId, dto.company_id);
    await this.assertBranchExists(tenantId, dto.branch_id);
    await this.assertDepartmentExists(tenantId, dto.department_id);
    await this.assertPortExists(tenantId, dto.origin_port_id, 'Origin port');
    await this.assertPortExists(tenantId, dto.dest_port_id, 'Destination port');

    if (dto.customer_id) {
      await this.assertPartyExists(tenantId, dto.customer_id, 'Customer');
    }

    if (dto.carrier_id) {
      await this.assertPartyExists(tenantId, dto.carrier_id, 'Carrier');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await this.getOrThrow(tx, tenantId, id);
      this.assertEditable(existing);

      const { valid_until, ...rest } = dto;

      return tx.quotation.update({
        where: { id },
        data: {
          ...rest,
          ...(valid_until ? { valid_until: new Date(valid_until) } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await this.getOrThrow(tx, tenantId, id);

      if (existing.status !== 'DRAFT') {
        throw new BadRequestException('Only DRAFT quotations can be deleted.');
      }

      await tx.quotation.update({ where: { id }, data: { deleted_at: new Date(), updated_by: actorId } });
    });
  }

  // ============================================================
  // CHARGE LINES — every mutation recalculates GP
  // ============================================================

  async addLine(tenantId: string, quotationId: string, dto: CreateQuotationLineDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, quotationId);
      this.assertEditable(quotation);

      await this.assertChargeCodeExists(tx, tenantId, dto.charge_code_id);
      const taxAmount = await this.computeTax(tx, tenantId, dto);

      const quantity = dto.quantity ?? 1;
      const exchangeRate = dto.exchange_rate ?? 1;
      const amount = quantity * dto.unit_price;
      const amountBase = amount * exchangeRate;

      const line = await tx.quotationLine.create({
        data: {
          tenant_id: tenantId,
          quotation_id: quotationId,
          charge_code_id: dto.charge_code_id,
          description: dto.description,
          unit: dto.unit,
          quantity,
          unit_price: dto.unit_price,
          currency_code: dto.currency_code,
          exchange_rate: exchangeRate,
          amount,
          amount_base_currency: amountBase,
          tax_rate_id: dto.tax_rate_id,
          tax_amount: taxAmount,
          is_cost: dto.is_cost ?? false,
          supplier_id: dto.supplier_id,
          sort_order: dto.sort_order ?? 0,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await this.recalculateTotals(tx, tenantId, quotationId);

      return line;
    });
  }

  /**
   * Auto-populates a charge line from the best-matching active Tariff
   * for this quotation's lane/service type/container type/customer —
   * the "Online Tariff Master" auto-populate feature. Orchestrates
   * existing top-level methods (each manages its own transaction)
   * rather than nesting calls inside one, for the same reason
   * duplicate()/convertToJob() do — TariffsService.findMatch() and
   * addLine() each open their own transaction internally.
   */
  async applyTariff(tenantId: string, quotationId: string, actorId?: string) {
    const quotation = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({ where: { id: quotationId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    const tariff = await this.tariffsService.findMatch(tenantId, {
      serviceType: quotation.job_type,
      originPortId: quotation.origin_port_id ?? undefined,
      destPortId: quotation.dest_port_id ?? undefined,
      containerTypeId: quotation.container_type_id ?? undefined,
      customerId: quotation.customer_id,
    });

    if (!tariff) {
      throw new NotFoundException("No matching tariff found for this quotation's lane and service type.");
    }

    const chargeCode = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chargeCode.findFirst({ where: { id: tariff.charge_code_id, tenant_id: tenantId } }),
    );

    return this.addLine(
      tenantId,
      quotationId,
      {
        charge_code_id: tariff.charge_code_id,
        description: chargeCode?.description ?? 'Tariff charge',
        unit: tariff.unit ?? undefined,
        quantity: 1,
        unit_price: Number(tariff.sale_rate),
        currency_code: tariff.currency_code,
      },
      actorId,
    );
  }

  async updateLine(
    tenantId: string,
    quotationId: string,
    lineId: string,
    dto: UpdateQuotationLineDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, quotationId);
      this.assertEditable(quotation);

      const existingLine = await tx.quotationLine.findFirst({
        where: { id: lineId, quotation_id: quotationId, tenant_id: tenantId },
      });

      if (!existingLine) {
        throw new NotFoundException('Charge line not found.');
      }

      if (dto.charge_code_id) {
        await this.assertChargeCodeExists(tx, tenantId, dto.charge_code_id);
      }

      const quantity = dto.quantity ?? Number(existingLine.quantity);
      const unitPrice = dto.unit_price ?? Number(existingLine.unit_price);
      const exchangeRate = dto.exchange_rate ?? Number(existingLine.exchange_rate);
      const amount = quantity * unitPrice;
      const amountBase = amount * exchangeRate;
      const taxAmount =
        dto.tax_rate_id !== undefined
          ? await this.computeTax(tx, tenantId, { ...dto, unit_price: unitPrice, quantity })
          : Number(existingLine.tax_amount);

      const line = await tx.quotationLine.update({
        where: { id: lineId },
        data: {
          ...dto,
          quantity,
          unit_price: unitPrice,
          exchange_rate: exchangeRate,
          amount,
          amount_base_currency: amountBase,
          tax_amount: taxAmount,
          updated_by: actorId,
        },
      });

      await this.recalculateTotals(tx, tenantId, quotationId);

      return line;
    });
  }

  async removeLine(tenantId: string, quotationId: string, lineId: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, quotationId);
      this.assertEditable(quotation);

      const existingLine = await tx.quotationLine.findFirst({
        where: { id: lineId, quotation_id: quotationId, tenant_id: tenantId },
      });

      if (!existingLine) {
        throw new NotFoundException('Charge line not found.');
      }

      await tx.quotationLine.delete({ where: { id: lineId } });
      await this.recalculateTotals(tx, tenantId, quotationId);
    });
  }

  // ============================================================
  // ARCHIVE & EXPIRY
  // ============================================================

  async archive(tenantId: string, id: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, id);

      if (!ARCHIVABLE_STATUSES.includes(quotation.status)) {
        throw new BadRequestException(
          `Only closed quotations (${ARCHIVABLE_STATUSES.join(', ')}) can be archived.`,
        );
      }

      await tx.quotation.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  async expire(tenantId: string, id: string, actorId?: string): Promise<Quotation> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, id);

      if (!EXPIRABLE_STATUSES.includes(quotation.status)) {
        throw new BadRequestException(`Cannot expire a quotation in ${quotation.status} status.`);
      }

      if (quotation.valid_until && quotation.valid_until > new Date()) {
        throw new BadRequestException('Quotation is still within its validity period.');
      }

      const updated = await tx.quotation.update({
        where: { id },
        data: { status: 'EXPIRED', updated_by: actorId },
      });

      await this.recordStatusChange(tx, tenantId, id, quotation.status, 'EXPIRED', actorId, 'Manually expired.');

      return updated;
    });
  }

  /** Batch-expire all quotations past valid_until — intended for a daily cron. */
  async expireDue(tenantId: string, actorId?: string): Promise<{ expired: number }> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const due = await tx.quotation.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: { in: EXPIRABLE_STATUSES },
          valid_until: { lt: new Date() },
        },
      });

      for (const quotation of due) {
        await tx.quotation.update({
          where: { id: quotation.id },
          data: { status: 'EXPIRED', updated_by: actorId },
        });

        await this.recordStatusChange(
          tx,
          tenantId,
          quotation.id,
          quotation.status,
          'EXPIRED',
          actorId,
          'Auto-expired past valid_until.',
        );
      }

      return { expired: due.length };
    });
  }

  /** HTTP cron helper — expire across all active tenants. */
  async expireDueAllTenants(): Promise<{ tenants: number; expired: number }> {
    const tenants = await this.prisma.tenant.findMany({
      where: { status: { in: ['ACTIVE', 'TRIAL'] }, is_active: true, deleted_at: null },
      select: { id: true },
    });

    let expired = 0;
    for (const tenant of tenants) {
      const result = await this.expireDue(tenant.id);
      expired += result.expired;
    }
    return { tenants: tenants.length, expired };
  }

  // ============================================================
  // PDF & EMAIL (Ch.7)
  // ============================================================

  async generatePdf(tenantId: string, quotationId: string, dto: GenerateQuotationPdfDto, actorId?: string) {
    await this.findOne(tenantId, quotationId);

    const task = await this.documentGeneration.enqueueQuotationPdf(
      tenantId,
      quotationId,
      dto.mode,
      actorId,
      dto.layout_variant,
    );

    return {
      task_id: task.id,
      status: task.status,
      mode: dto.mode,
      message: 'PDF generation queued.',
    };
  }

  async getPdfInfo(tenantId: string, quotationId: string) {
    const quotation = await this.findOne(tenantId, quotationId);

    const tasks = await this.documentGeneration.listTasks(tenantId, { quotationId });

    return {
      quotation_id: quotationId,
      quotation_number: quotation.quotation_number,
      customer_pdf: quotation.customer_pdf_url
        ? {
            url: quotation.customer_pdf_url,
            generated_at: quotation.customer_pdf_generated_at,
          }
        : null,
      internal_pdf: quotation.internal_pdf_url
        ? {
            url: quotation.internal_pdf_url,
            generated_at: quotation.internal_pdf_generated_at,
          }
        : null,
      last_emailed_at: quotation.last_emailed_at,
      last_emailed_to: quotation.last_emailed_to,
      recent_tasks: tasks,
    };
  }

  async getPdfStatus(tenantId: string, quotationId: string) {
    await this.findOne(tenantId, quotationId);
    return this.documentGeneration.listTasks(tenantId, { quotationId });
  }

  async sendEmail(tenantId: string, quotationId: string, dto: SendQuotationEmailDto, actorId?: string) {
    const quotation = await this.findOne(tenantId, quotationId);
    const mode = dto.pdf_mode ?? QuotationPdfMode.CUSTOMER;

    let pdfUrl =
      mode === QuotationPdfMode.CUSTOMER ? quotation.customer_pdf_url : quotation.internal_pdf_url;

    let attachmentBuffer: Buffer | undefined;
    let attachmentName: string | undefined;

    if (!pdfUrl) {
      const task = await this.documentGeneration.enqueueQuotationPdf(
        tenantId,
        quotationId,
        mode,
        actorId,
      );
      await this.documentGeneration.processTask(task.id, tenantId);

      const refreshed = await this.findOne(tenantId, quotationId);
      pdfUrl =
        mode === QuotationPdfMode.CUSTOMER ? refreshed.customer_pdf_url : refreshed.internal_pdf_url;

      if (pdfUrl && !pdfUrl.startsWith('http')) {
        const filename = pdfUrl.split('/').pop();
        if (filename) {
          attachmentBuffer = await this.storage.readBuffer(tenantId, decodeURIComponent(filename));
          attachmentName = filename;
        }
      }
    }

    const body =
      dto.message ??
      `<p>Please find attached quotation <strong>${quotation.quotation_number}</strong>.</p>`;

    const emailLog = await this.emailService.send({
      tenantId,
      eventType: 'QUOTATION_PDF',
      to: dto.to_email,
      cc: dto.cc_email,
      subject: `Quotation ${quotation.quotation_number}`,
      body,
      attachmentBuffer,
      attachmentName,
      attachmentPath: pdfUrl ?? undefined,
      quotationId,
      createdBy: actorId,
    });

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.update({
        where: { id: quotationId },
        data: {
          last_emailed_at: new Date(),
          last_emailed_to: dto.to_email,
          updated_by: actorId,
        },
      }),
    );

    return {
      success: emailLog.status === 'SENT',
      email_log_id: emailLog.id,
      status: emailLog.status,
      to_email: dto.to_email,
    };
  }

  // ============================================================
  // ANALYTICS (Ch.7.7)
  // ============================================================

  private buildAnalyticsWhere(tenantId: string, query: QuotationAnalyticsQueryDto): Prisma.QuotationWhereInput {
    const where: Prisma.QuotationWhereInput = { tenant_id: tenantId, deleted_at: null };

    if (query.branch_id) where.branch_id = query.branch_id;
    if (query.salesperson_id) where.salesperson_id = query.salesperson_id;
    if (query.customer_id) where.customer_id = query.customer_id;
    if (query.job_type) where.job_type = query.job_type;

    if (query.from_date || query.to_date) {
      where.created_at = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }

    return where;
  }

  async getAnalytics(tenantId: string, query: QuotationAnalyticsQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where = this.buildAnalyticsWhere(tenantId, query);

      const [total, won, lost, sent, byStatus, byJobType] = await Promise.all([
        tx.quotation.count({ where }),
        tx.quotation.count({ where: { ...where, status: 'WON' } }),
        tx.quotation.count({ where: { ...where, status: 'LOST' } }),
        tx.quotation.count({ where: { ...where, status: 'SENT' } }),
        tx.quotation.groupBy({ by: ['status'], where, _count: { id: true } }),
        tx.quotation.groupBy({ by: ['job_type'], where, _count: { id: true } }),
      ]);

      const closed = won + lost;
      const conversionRate = closed > 0 ? (won / closed) * 100 : 0;

      const valueAgg = await tx.quotation.aggregate({
        where,
        _sum: { revenue_total: true, gp_amount: true },
        _avg: { gp_percent: true },
      });

      return {
        summary: {
          total,
          won,
          lost,
          sent,
          conversion_rate: Math.round(conversionRate * 100) / 100,
          total_quote_value: Number(valueAgg._sum.revenue_total ?? 0),
          total_gp: Number(valueAgg._sum.gp_amount ?? 0),
          average_gp_percent: Number(valueAgg._avg.gp_percent ?? 0),
        },
        by_status: byStatus.map((row) => ({ status: row.status, count: row._count.id })),
        by_job_type: byJobType.map((row) => ({ job_type: row.job_type, count: row._count.id })),
      };
    });
  }

  async getConversionAnalytics(tenantId: string, query: QuotationAnalyticsQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where = this.buildAnalyticsWhere(tenantId, query);

      const [won, lost, converted] = await Promise.all([
        tx.quotation.count({ where: { ...where, status: 'WON' } }),
        tx.quotation.count({ where: { ...where, status: 'LOST' } }),
        tx.quotation.count({ where: { ...where, status: 'CONVERTED' } }),
      ]);

      const closed = won + lost;
      const winRate = closed > 0 ? (won / closed) * 100 : 0;

      return {
        won,
        lost,
        converted,
        win_rate: Math.round(winRate * 100) / 100,
        conversion_to_job_rate: won > 0 ? Math.round((converted / won) * 10000) / 100 : 0,
      };
    });
  }

  async getLostReasonAnalytics(tenantId: string, query: QuotationAnalyticsQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.QuotationWhereInput = {
        ...this.buildAnalyticsWhere(tenantId, query),
        status: 'LOST',
        lost_reason: { not: null },
      };

      const rows = await tx.quotation.groupBy({
        by: ['lost_reason'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      });

      return rows.map((row) => ({
        reason: row.lost_reason,
        count: row._count.id,
      }));
    });
  }

  async getResponseTimeAnalytics(tenantId: string, query: QuotationAnalyticsQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotations = await tx.quotation.findMany({
        where: {
          ...this.buildAnalyticsWhere(tenantId, query),
          submitted_at: { not: null },
          sent_at: { not: null },
        },
        select: { created_at: true, submitted_at: true, sent_at: true },
      });

      if (quotations.length === 0) {
        return { sample_size: 0, avg_hours_to_submit: 0, avg_hours_to_send: 0 };
      }

      let submitHours = 0;
      let sendHours = 0;

      for (const q of quotations) {
        submitHours += (q.submitted_at!.getTime() - q.created_at.getTime()) / 3_600_000;
        sendHours += (q.sent_at!.getTime() - q.created_at.getTime()) / 3_600_000;
      }

      return {
        sample_size: quotations.length,
        avg_hours_to_submit: Math.round((submitHours / quotations.length) * 100) / 100,
        avg_hours_to_send: Math.round((sendHours / quotations.length) * 100) / 100,
      };
    });
  }

  // ============================================================
  // ONLINE QUOTE (Ch.7.5) — public, no auth
  // ============================================================

  async createOnlineQuote(dto: CreateOnlineQuoteDto) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: dto.tenant_slug, deleted_at: null },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    const tenantId = tenant.id;

    let customerId = dto.customer_id;

    if (!customerId) {
      if (!dto.contact_email || !dto.contact_name) {
        throw new BadRequestException('contact_email and contact_name are required when customer_id is not provided.');
      }

      const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.party.findFirst({
          where: { tenant_id: tenantId, email: dto.contact_email!.toLowerCase(), deleted_at: null },
        }),
      );

      if (existing) {
        customerId = existing.id;
      } else {
        const created = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.party.create({
            data: {
              tenant_id: tenantId,
              party_type: 'CUSTOMER',
              code: `WEB-${Date.now()}`,
              name: dto.contact_name!,
              email: dto.contact_email!.toLowerCase(),
              is_active: true,
            },
          }),
        );
        customerId = created.id;
      }
    }

    const quotation = await this.create(
      tenantId,
      {
        job_type: dto.job_type,
        customer_id: customerId,
        origin_port_id: dto.origin_port_id,
        dest_port_id: dto.dest_port_id,
        commodity: dto.commodity,
        gross_weight: dto.gross_weight,
        chargeable_weight: dto.chargeable_weight,
        volume_cbm: dto.volume_cbm,
        pieces: dto.pieces,
        container_type_id: dto.container_type_id,
        special_requirements: dto.special_requirements,
        valid_until: dto.valid_until,
        currency_code: dto.currency_code,
        remarks: 'Submitted via online quote widget.',
      },
      undefined,
    );

    try {
      await this.applyTariff(tenantId, quotation.id, undefined);
    } catch {
      // Best-effort — a quote without a matching tariff is still valid.
    }

    const refreshed = await this.findOne(tenantId, quotation.id);

    return {
      success: true,
      message: 'Online quote request received. Our sales team will follow up shortly.',
      data: {
        quotation_id: refreshed.id,
        quotation_number: refreshed.quotation_number,
        status: refreshed.status,
        revenue_total: refreshed.revenue_total,
        gp_amount: refreshed.gp_amount,
        gp_percent: refreshed.gp_percent,
        line_count: refreshed.lines.length,
      },
    };
  }

  // ============================================================
  // STATUS WORKFLOW
  // ============================================================

  /**
   * DRAFT/REJECTED -> SUBMITTED. Opens a fresh approval cycle (level 1).
   * Multi-level approval (Ch.2.6 — up to 3, threshold-based) is
   * intentionally a single fixed level for now; the tenant-configurable
   * approval-workflow settings this really belongs to live in the
   * General Settings module, not built yet. Wiring 3 levels here would
   * mean guessing at config that doesn't exist anywhere yet.
   */
  async submit(tenantId: string, id: string, actorId?: string): Promise<Quotation> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, id);

      if (!EDITABLE_STATUSES.includes(quotation.status)) {
        throw new BadRequestException(`Cannot submit a quotation in ${quotation.status} status.`);
      }

      const lineCount = await tx.quotationLine.count({ where: { quotation_id: id, tenant_id: tenantId } });

      if (lineCount === 0) {
        throw new BadRequestException('Add at least one charge line before submitting.');
      }

      await tx.quotationApproval.upsert({
        where: { tenant_id_quotation_id_level: { tenant_id: tenantId, quotation_id: id, level: 1 } },
        create: { tenant_id: tenantId, quotation_id: id, level: 1, status: 'PENDING' },
        update: { status: 'PENDING', approver_id: null, decided_at: null, comments: null },
      });

      const updated = await tx.quotation.update({
        where: { id },
        data: { status: 'SUBMITTED', submitted_at: new Date(), updated_by: actorId },
      });

      await this.recordStatusChange(tx, tenantId, id, quotation.status, 'SUBMITTED', actorId);

      return updated;
    });
  }

  async approve(tenantId: string, id: string, actorId: string | undefined, dto: ApprovalDecisionDto): Promise<Quotation> {
    return this.decide(tenantId, id, actorId, 'APPROVED', dto);
  }

  async reject(tenantId: string, id: string, actorId: string | undefined, dto: ApprovalDecisionDto): Promise<Quotation> {
    return this.decide(tenantId, id, actorId, 'REJECTED', dto);
  }

  private async decide(
    tenantId: string,
    id: string,
    actorId: string | undefined,
    decision: 'APPROVED' | 'REJECTED',
    dto: ApprovalDecisionDto,
  ): Promise<Quotation> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, id);

      if (quotation.status !== 'SUBMITTED') {
        throw new BadRequestException('Only a SUBMITTED quotation can be approved or rejected.');
      }

      const approval = await tx.quotationApproval.findFirst({
        where: { tenant_id: tenantId, quotation_id: id, level: 1, status: 'PENDING' },
      });

      if (!approval) {
        throw new ConflictException('No pending approval found for this quotation.');
      }

      await tx.quotationApproval.update({
        where: { id: approval.id },
        data: { status: decision, approver_id: actorId, decided_at: new Date(), comments: dto.comments },
      });

      const newStatus: QuotationStatus = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';

      const updated = await tx.quotation.update({
        where: { id },
        data: {
          status: newStatus,
          ...(decision === 'APPROVED' ? { approved_at: new Date(), approved_by: actorId } : {}),
          updated_by: actorId,
        },
      });

      await this.recordStatusChange(tx, tenantId, id, quotation.status, newStatus, actorId, dto.comments);

      return updated;
    });
  }

  async send(tenantId: string, id: string, actorId?: string): Promise<Quotation> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, id);

      if (quotation.status !== 'APPROVED') {
        throw new BadRequestException('Only an APPROVED quotation can be sent.');
      }

      const updated = await tx.quotation.update({
        where: { id },
        data: { status: 'SENT', sent_at: new Date(), updated_by: actorId },
      });

      await this.recordStatusChange(tx, tenantId, id, quotation.status, 'SENT', actorId);

      return updated;
    });
  }

  async markWon(tenantId: string, id: string, actorId?: string): Promise<Quotation> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, id);

      if (quotation.status !== 'SENT') {
        throw new BadRequestException('Only a SENT quotation can be marked won.');
      }

      const updated = await tx.quotation.update({
        where: { id },
        data: { status: 'WON', won_at: new Date(), updated_by: actorId },
      });

      await this.recordStatusChange(tx, tenantId, id, quotation.status, 'WON', actorId);

      return updated;
    });
  }

  async markLost(tenantId: string, id: string, dto: MarkLostDto, actorId?: string): Promise<Quotation> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await this.getOrThrow(tx, tenantId, id);

      if (quotation.status !== 'SENT') {
        throw new BadRequestException('Only a SENT quotation can be marked lost.');
      }

      const updated = await tx.quotation.update({
        where: { id },
        data: {
          status: 'LOST',
          lost_at: new Date(),
          lost_reason: dto.reason,
          updated_by: actorId,
        },
      });

      await this.recordStatusChange(tx, tenantId, id, quotation.status, 'LOST', actorId, dto.notes ?? dto.reason);

      return updated;
    });
  }

  // ============================================================
  // REVISIONS — clone into a new DRAFT, incrementing version
  // ============================================================

  async duplicate(tenantId: string, id: string, actorId?: string): Promise<Quotation> {
    // Phase 1: read (own transaction).
    const original = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null }, include: { lines: true } }),
    );

    if (!original) {
      throw new NotFoundException('Quotation not found.');
    }

    const rootId = original.parent_quotation_id ?? original.id;

    const latestVersion = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.aggregate({
        where: { tenant_id: tenantId, OR: [{ id: rootId }, { parent_quotation_id: rootId }] },
        _max: { version: true },
      }),
    );

    // Phase 2: resolve branch code + mint the new number — each of
    // these is its own atomic operation (numberGenerator manages its
    // own transaction internally), deliberately NOT nested inside the
    // write transaction below.
    const branchCode = await this.resolveBranchCode(tenantId, original.branch_id ?? undefined);
    const quotationNumber = await this.numberGenerator.generate(tenantId, 'QUOTATION', {
      extraSegment: JOB_TYPE_CODE[original.job_type],
      branchCode,
    });

    // Phase 3: write everything atomically.
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const clone = await tx.quotation.create({
        data: {
          tenant_id: tenantId,
          quotation_number: quotationNumber,
          status: 'DRAFT',
          job_type: original.job_type,
          company_id: original.company_id,
          customer_id: original.customer_id,
          salesperson_id: original.salesperson_id,
          branch_id: original.branch_id,
          origin_port_id: original.origin_port_id,
          dest_port_id: original.dest_port_id,
          incoterm: original.incoterm,
          commodity: original.commodity,
          hs_code: original.hs_code,
          gross_weight: original.gross_weight,
          chargeable_weight: original.chargeable_weight,
          volume_cbm: original.volume_cbm,
          pieces: original.pieces,
          container_type_id: original.container_type_id,
          container_count: original.container_count,
          is_dg: original.is_dg,
          dg_class: original.dg_class,
          special_requirements: original.special_requirements,
          carrier_preference: original.carrier_preference,
          transit_time_days: original.transit_time_days,
          routing_notes: original.routing_notes,
          remarks: original.remarks,
          currency_code: original.currency_code,
          exchange_rate: original.exchange_rate,
          discount_percent: original.discount_percent,
          discount_amount: original.discount_amount,
          version: (latestVersion._max.version ?? original.version) + 1,
          parent_quotation_id: rootId,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (original.lines.length > 0) {
        await tx.quotationLine.createMany({
          data: original.lines.map((line) => ({
            tenant_id: tenantId,
            quotation_id: clone.id,
            charge_code_id: line.charge_code_id,
            description: line.description,
            unit: line.unit,
            quantity: line.quantity,
            unit_price: line.unit_price,
            currency_code: line.currency_code,
            exchange_rate: line.exchange_rate,
            amount: line.amount,
            amount_base_currency: line.amount_base_currency,
            tax_rate_id: line.tax_rate_id,
            tax_amount: line.tax_amount,
            is_cost: line.is_cost,
            supplier_id: line.supplier_id,
            sort_order: line.sort_order,
            created_by: actorId,
            updated_by: actorId,
          })),
        });

        await this.recalculateTotals(tx, tenantId, clone.id);
      }

      return tx.quotation.findFirstOrThrow({ where: { id: clone.id } });
    });
  }

  // ============================================================
  // CONVERT TO JOB
  //
  // Deliberately minimal: creates the Job row + carries revenue/cost
  // lines over as JobCharge rows, and links back via
  // Quotation.converted_job_id. Full job management — milestones,
  // documents, HAWB/MAWB, pre-alerts — is its own module, not built
  // yet. This is enough to prove the quote-to-job handoff works, not
  // a substitute for that module.
  // ============================================================

  async convertToJob(tenantId: string, id: string, actorId?: string): Promise<{ jobId: string; jobNumber: string }> {
    // Phase 1: read + validate (own transaction).
    const quotation = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null }, include: { lines: true } }),
    );

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    if (quotation.status !== 'WON') {
      throw new BadRequestException('Only a WON quotation can be converted to a job.');
    }

    if (quotation.converted_job_id) {
      throw new ConflictException('This quotation has already been converted to a job.');
    }

    // Phase 2: mint the job number — not nested inside the write transaction.
    const branchCode = await this.resolveBranchCode(tenantId, quotation.branch_id ?? undefined);
    const jobNumber = await this.numberGenerator.generate(tenantId, 'JOB_NUMBER', {
      extraSegment: JOB_TYPE_CODE[quotation.job_type],
      branchCode,
    });

    // Phase 3: write everything atomically.
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.create({
        data: {
          tenant_id: tenantId,
          job_number: jobNumber,
          job_type: quotation.job_type,
          status: 'BOOKING_CONFIRMED',
          created_from_quote_id: id,
          company_id: quotation.company_id,
          branch_id: quotation.branch_id,
          department_id: quotation.department_id,
          shipper_id: quotation.customer_id,
          salesperson_id: quotation.salesperson_id,
          origin_port_id: quotation.origin_port_id,
          dest_port_id: quotation.dest_port_id,
          commodity: quotation.commodity,
          hs_code: quotation.hs_code,
          gross_weight: quotation.gross_weight,
          chargeable_weight: quotation.chargeable_weight,
          volume_cbm: quotation.volume_cbm,
          pieces: quotation.pieces,
          incoterms: quotation.incoterm,
          is_dg: quotation.is_dg,
          dg_class: quotation.dg_class,
          notes: quotation.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (quotation.lines.length > 0) {
        await tx.jobCharge.createMany({
          data: quotation.lines.map((line) => ({
            tenant_id: tenantId,
            job_id: job.id,
            charge_code_id: line.charge_code_id,
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unit_price,
            currency_code: line.currency_code,
            exchange_rate: line.exchange_rate,
            amount: line.amount,
            amount_base_currency: line.amount_base_currency,
            tax_rate_id: line.tax_rate_id,
            tax_amount: line.tax_amount,
            is_cost: line.is_cost,
            party_id: line.supplier_id,
            created_by: actorId,
            updated_by: actorId,
          })),
        });
      }

      // Re-fetch inside this transaction — the quotation object from
      // Phase 1 came from a different (already-closed) transaction, and
      // Prisma requires status_history's FK write to target a row
      // visible in *this* one (it is — same committed row — but we
      // re-derive from-status from it explicitly for clarity).
      await tx.quotation.update({
        where: { id },
        data: { status: 'CONVERTED', converted_job_id: job.id, updated_by: actorId },
      });

      await this.recordStatusChange(tx, tenantId, id, 'WON', 'CONVERTED', actorId);

      this.logger.log(`[CONVERT_TO_JOB] Quotation ${quotation.quotation_number} -> Job ${jobNumber}`);

      return { jobId: job.id, jobNumber };
    });
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async getOrThrow(tx: Prisma.TransactionClient, tenantId: string, id: string): Promise<Quotation> {
    const quotation = await tx.quotation.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    return quotation;
  }

  private assertEditable(quotation: Quotation): void {
    if (!EDITABLE_STATUSES.includes(quotation.status)) {
      throw new ForbiddenException(
        `Quotation is ${quotation.status} and can no longer be edited. Only DRAFT or REJECTED quotations can be changed.`,
      );
    }
  }

  private async recalculateTotals(tx: Prisma.TransactionClient, tenantId: string, quotationId: string): Promise<void> {
    const lines = await tx.quotationLine.findMany({ where: { tenant_id: tenantId, quotation_id: quotationId } });

    let revenue = 0;
    let cost = 0;

    for (const line of lines) {
      const amount = Number(line.amount_base_currency);
      if (line.is_cost) {
        cost += amount;
      } else {
        revenue += amount;
      }
    }

    const gp = revenue - cost;
    const gpPercent = revenue > 0 ? (gp / revenue) * 100 : 0;

    await tx.quotation.update({
      where: { id: quotationId },
      data: { revenue_total: revenue, cost_total: cost, gp_amount: gp, gp_percent: gpPercent },
    });
  }

  private async computeTax(
    tx: Prisma.TransactionClient,
    tenantId: string,
    dto: { tax_rate_id?: string; unit_price: number; quantity?: number },
  ): Promise<number> {
    if (!dto.tax_rate_id) {
      return 0;
    }

    const taxRate = await tx.taxRate.findFirst({ where: { id: dto.tax_rate_id, tenant_id: tenantId } });

    if (!taxRate) {
      throw new NotFoundException('Tax rate not found.');
    }

    const amount = (dto.quantity ?? 1) * dto.unit_price;
    return amount * (Number(taxRate.rate) / 100);
  }

  private async recordStatusChange(
    tx: Prisma.TransactionClient,
    tenantId: string,
    quotationId: string,
    from: QuotationStatus,
    to: QuotationStatus,
    actorId?: string,
    reason?: string,
  ): Promise<void> {
    await tx.quotationStatusHistory.create({
      data: {
        tenant_id: tenantId,
        quotation_id: quotationId,
        from_status: from,
        to_status: to,
        changed_by: actorId,
        reason,
      },
    });
  }

  private async assertChargeCodeExists(
    tx: Prisma.TransactionClient,
    tenantId: string,
    chargeCodeId: string,
  ): Promise<void> {
    const exists = await tx.chargeCode.findFirst({ where: { id: chargeCodeId, tenant_id: tenantId, deleted_at: null } });

    if (!exists) {
      throw new NotFoundException('Charge code not found.');
    }
  }

  private async assertPartyExists(tenantId: string, partyId: string | undefined, label: string): Promise<void> {
    if (!partyId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({ where: { id: partyId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException(`${label} not found.`);
    }
  }

  private async assertCompanyExists(tenantId: string, companyId?: string): Promise<void> {
    if (!companyId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.company.findFirst({ where: { id: companyId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Company not found.');
    }
  }

  private async assertDepartmentExists(tenantId: string, departmentId?: string): Promise<void> {
    if (!departmentId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.department.findFirst({ where: { id: departmentId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Department not found.');
    }
  }

  private async assertBranchExists(tenantId: string, branchId?: string): Promise<void> {
    if (!branchId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.branch.findFirst({ where: { id: branchId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Branch not found.');
    }
  }

  private async resolveBranchCode(
    tenantId: string,
    branchId?: string,
    existingTx?: Prisma.TransactionClient,
  ): Promise<string | undefined> {
    if (!branchId) {
      return undefined;
    }

    const run = existingTx
      ? (fn: (tx: Prisma.TransactionClient) => Promise<any>) => fn(existingTx)
      : (fn: (tx: Prisma.TransactionClient) => Promise<any>) => this.prisma.runWithTenant(tenantId, fn);

    const branch = await run((tx) => tx.branch.findFirst({ where: { id: branchId, tenant_id: tenantId } }));

    return branch?.code;
  }

  private async assertPortExists(tenantId: string, portId: string | undefined, label: string): Promise<void> {
    if (!portId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.port.findFirst({ where: { id: portId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException(`${label} not found.`);
    }
  }
}
