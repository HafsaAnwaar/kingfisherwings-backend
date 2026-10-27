import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, QuotationStatus } from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { QuotationsService } from "../quotations/quotations.service";
import { quotationActionFlags } from "../quotations/quotation-action-flags";
import {
  PortalCostingOptionsDto,
  PortalQuotationAcceptDto,
  PortalQuotationCounterOfferDto,
  PortalQuotationEstimateDto,
  PortalQuotationQueryDto,
  PortalQuotationRejectDto,
  PortalQuotationRequestDto,
  PortalQuotationUpdateDto,
} from "./dto/portal-quotation.dto";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalQuotePricingService } from "./portal-quote-pricing.service";
import { buildNegotiationPricingView } from "../quotations/quotation-negotiation-pricing.util";
import { QuotationNegotiationService } from "../quotations/quotation-negotiation.service";
import { ServiceCatalogService } from "../quotations/service-catalog/service-catalog.service";
import {
  lineTotal,
  MasterLabelService,
  sumLineTotals,
} from "../masters/master-label.service";

const PORTAL_CUSTOMER_SOURCES = ["CUSTOMER_PORTAL", "ONLINE_WIDGET"] as const;

function pricingSourceFromSnapshot(
  snapshot: unknown,
  chargeCodeId: string | null | undefined,
  chargeCode?: string | null,
): string | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const lines = (snapshot as { lines?: Array<Record<string, unknown>> }).lines;
  if (!Array.isArray(lines)) return null;
  const match = lines.find((l) => {
    if (chargeCodeId && l.charge_code_id === chargeCodeId) return true;
    if (chargeCode && String(l.code ?? "").toUpperCase() === chargeCode.toUpperCase())
      return true;
    return false;
  });
  return match?.source ? String(match.source) : null;
}

@Injectable()
export class PortalQuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotations: QuotationsService,
    private readonly notifications: NotificationEmitterService,
    private readonly storage: StorageService,
    private readonly pricing: PortalQuotePricingService,
    private readonly negotiation: QuotationNegotiationService,
    private readonly catalog: ServiceCatalogService,
    private readonly masterLabels: MasterLabelService,
  ) {}

  async getServiceCatalog(user: CurrentPortalUser, jobType?: string) {
    return this.catalog.findPortalVisible(user.tenantId, jobType as any);
  }

  async costingOptions(user: CurrentPortalUser, dto: PortalCostingOptionsDto) {
    const data = await this.pricing.buildCostingOptions(
      user.tenantId,
      user.partyId,
      dto,
    );
    return { success: true, data };
  }

  async estimate(user: CurrentPortalUser, dto: PortalQuotationEstimateDto) {
    const estimate = await this.pricing.buildEstimate(
      user.tenantId,
      user.partyId,
      dto,
    );
    return { success: true, data: estimate };
  }

  async requestQuote(user: CurrentPortalUser, dto: PortalQuotationRequestDto) {
    const hasCustomerLines = Boolean(dto.customer_lines?.length);
    const hasServiceCodes = Boolean(dto.service_codes?.length);

    let result;
    if (hasCustomerLines) {
      result = await this.pricing.persistCustomerLinesQuote(
        user.tenantId,
        user.partyId,
        dto,
        user.id,
      );
    } else if (hasServiceCodes) {
      result = await this.pricing.persistQuote(
        user.tenantId,
        user.partyId,
        {
          ...dto,
          packages: dto.packages ?? [],
          service_codes: dto.service_codes!,
        } as PortalQuotationEstimateDto,
        user.id,
        dto.estimate_snapshot,
      );
    } else {
      result = await this.quotations.createPortalQuoteRequest(
        user.tenantId,
        user.partyId,
        dto,
        user.id,
      );
    }

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: "QUOTATION_REQUEST",
      title: "New portal quote request",
      message: `${user.fullName} submitted a quote request (${result.data.quotation_number}).`,
      entity_type: "quotation",
      entity_id: result.data.quotation_id,
      link_path: `/quotations/${result.data.quotation_id}`,
    });

    return result;
  }

  async list(user: CurrentPortalUser, query: PortalQuotationQueryDto) {
    const where = this.buildWhere(user, query);

    const [rows, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) => {
        return Promise.all([
          tx.quotation.findMany({
            where,
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            orderBy: { created_at: query.order },
            select: {
              id: true,
              quotation_number: true,
              status: true,
              job_type: true,
              commodity: true,
              gross_weight: true,
              chargeable_weight: true,
              volume_cbm: true,
              pieces: true,
              currency_code: true,
              revenue_total: true,
              valid_until: true,
              sent_at: true,
              won_at: true,
              lost_at: true,
              converted_job_id: true,
              created_at: true,
              updated_at: true,
            },
          }),
          tx.quotation.count({ where }),
        ]);
      },
    );

    return {
      success: true,
      data: rows.map((row) => this.toListItem(row)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async summary(
    user: CurrentPortalUser,
    period?: { from: Date; to: Date; period?: string },
  ) {
    const base = {
      ...this.baseOwnershipWhere(user.partyId),
      ...(period
        ? { created_at: { gte: period.from, lte: period.to } }
        : {}),
    };

    const groups = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.quotation.groupBy({
        by: ["status"],
        where: base,
        _count: { _all: true },
      }),
    );

    const byStatus = Object.values(QuotationStatus).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<QuotationStatus, number>,
    );

    let total = 0;
    for (const row of groups) {
      byStatus[row.status] = row._count._all;
      total += row._count._all;
    }

    const pending =
      byStatus.DRAFT + byStatus.SUBMITTED + byStatus.INTERNALLY_APPROVED;
    const active =
      byStatus.SENT + byStatus.NEGOTIATING + byStatus.CUSTOMER_REVIEW;
    const closed =
      byStatus.APPROVED +
      byStatus.DISAPPROVED +
      byStatus.EXPIRED +
      byStatus.CONVERTED +
      byStatus.REJECTED;

    return {
      success: true,
      data: {
        total,
        pending,
        active,
        closed,
        by_status: byStatus,
      },
    };
  }

  async findOne(user: CurrentPortalUser, quotationId: string) {
    const quotation = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) => {
        return tx.quotation.findFirst({
          where: {
            id: quotationId,
            tenant_id: user.tenantId,
            deleted_at: null,
            ...this.baseOwnershipWhere(user.partyId),
          },
          include: {
            lines: {
              where: { is_cost: false },
              orderBy: { sort_order: "asc" },
            },
            packages: { orderBy: { sort_order: "asc" } },
            status_history: {
              orderBy: { created_at: "asc" },
              select: {
                id: true,
                from_status: true,
                to_status: true,
                reason: true,
                created_at: true,
              },
            },
          },
        });
      },
    );

    if (!quotation) {
      throw new NotFoundException("Quotation not found.");
    }

    const [parties, ports, containerTypes, chargeCodes, taxRates] =
      await this.prisma.runWithTenant(user.tenantId, async (tx) =>
        Promise.all([
          this.masterLabels.resolvePartiesWithPrimaryContact(
            user.tenantId,
            [quotation.customer_id],
            tx,
          ),
          this.masterLabels.resolvePorts(
            user.tenantId,
            [quotation.origin_port_id, quotation.dest_port_id],
            tx,
          ),
          this.masterLabels.resolveContainerTypes(
            user.tenantId,
            [quotation.container_type_id],
            tx,
          ),
          this.masterLabels.resolveChargeCodes(
            user.tenantId,
            quotation.lines.map((l) => l.charge_code_id),
            tx,
          ),
          this.masterLabels.resolveTaxRates(
            user.tenantId,
            quotation.lines.map((l) => l.tax_rate_id),
            tx,
          ),
        ]),
      );

    const customer = parties.get(quotation.customer_id);
    const originPort = quotation.origin_port_id
      ? ports.get(quotation.origin_port_id)
      : undefined;
    const destPort = quotation.dest_port_id
      ? ports.get(quotation.dest_port_id)
      : undefined;
    const containerType = quotation.container_type_id
      ? containerTypes.get(quotation.container_type_id)
      : undefined;

    let convertedJobNumber: string | null = null;
    const showConvertedJob =
      quotation.status === "CONVERTED" && !!quotation.converted_job_id;
    if (showConvertedJob) {
      const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.job.findFirst({
          where: {
            id: quotation.converted_job_id!,
            tenant_id: user.tenantId,
            deleted_at: null,
          },
          select: { job_number: true },
        }),
      );
      convertedJobNumber = job?.job_number ?? null;
    }

    const lines = quotation.lines.map((line) => {
      const charge = chargeCodes.get(line.charge_code_id);
      const tax = line.tax_rate_id
        ? taxRates.get(line.tax_rate_id)
        : undefined;
      return {
        id: line.id,
        description: line.description,
        unit: line.unit ?? charge?.unit ?? null,
        quantity: line.quantity,
        unit_price: line.unit_price,
        currency_code: line.currency_code,
        amount: line.amount,
        charge_code: charge?.code ?? null,
        charge_code_name: charge?.name ?? null,
        tax_percent: tax?.rate ?? null,
        tax_amount: line.tax_amount,
        line_total: lineTotal(line.amount, line.tax_amount),
        is_cost: false,
        pricing_source: pricingSourceFromSnapshot(
          quotation.portal_estimate_snapshot,
          line.charge_code_id,
          charge?.code,
        ),
      };
    });

    const totals = sumLineTotals(lines, true);

    return {
      success: true,
      data: {
        id: quotation.id,
        quotation_number: quotation.quotation_number,
        status: quotation.status,
        job_type: quotation.job_type,
        commodity: quotation.commodity,
        gross_weight: quotation.gross_weight,
        chargeable_weight: quotation.chargeable_weight,
        volume_cbm: quotation.volume_cbm,
        pieces: quotation.pieces,
        special_requirements: quotation.special_requirements,
        incoterm: quotation.incoterm,
        valid_until: quotation.valid_until,
        currency_code: quotation.currency_code,
        revenue_total: totals.subtotal,
        subtotal: totals.subtotal,
        tax_total: totals.tax_total,
        total_amount: totals.total_amount,
        remarks: quotation.remarks,
        portal_estimate_snapshot: quotation.portal_estimate_snapshot ?? null,
        customer_name: customer?.name ?? null,
        contact_name: customer?.primary_contact?.name ?? null,
        contact_email: customer?.primary_contact?.email ?? null,
        contact_phone: customer?.primary_contact?.phone ?? null,
        origin_port_code: originPort?.code ?? null,
        origin_port_name: originPort?.name ?? null,
        dest_port_code: destPort?.code ?? null,
        dest_port_name: destPort?.name ?? null,
        container_type_code: containerType?.code ?? null,
        container_type_name: containerType?.name ?? null,
        origin: originPort
          ? {
              id: originPort.id,
              name: originPort.name,
              code: originPort.code,
              country_code: originPort.country_code,
            }
          : null,
        destination: destPort
          ? {
              id: destPort.id,
              name: destPort.name,
              code: destPort.code,
              country_code: destPort.country_code,
            }
          : null,
        lines,
        packages: quotation.packages.map((pkg) => ({
          id: pkg.id,
          length_m: Number(pkg.length_cm) / 100,
          width_m: Number(pkg.width_cm) / 100,
          height_m: Number(pkg.height_cm) / 100,
          length_cm: pkg.length_cm,
          width_cm: pkg.width_cm,
          height_cm: pkg.height_cm,
          gross_weight_kg: pkg.gross_weight_kg,
          pieces: pkg.pieces,
          cbm: pkg.cbm,
        })),
        status_history: quotation.status_history,
        sent_at: quotation.sent_at,
        won_at: quotation.won_at,
        lost_at: quotation.lost_at,
        lost_reason: quotation.lost_reason,
        converted_job_id: showConvertedJob ? quotation.converted_job_id : null,
        converted_job_number: convertedJobNumber,
        negotiation_round: quotation.negotiation_round,
        source: quotation.source,
        negotiation_pricing: buildNegotiationPricingView(quotation),
        customer_pdf_url: quotation.customer_pdf_url,
        has_pdf: Boolean(quotation.customer_pdf_url),
        actions: {
          ...quotationActionFlags(quotation.status, {
            has_pdf: Boolean(
              quotation.customer_pdf_url || quotation.customer_pdf_s3_key,
            ),
          }),
          // Customer portal: accept stops at APPROVED; ops continuum is staff-only.
          can_generate_shipment: false,
          can_generate_job: false,
          can_convert_to_job: false,
          can_verify: false,
          can_admin_accept: false,
          can_admin_reject: false,
          can_change_status: false,
          can_edit: quotation.status === "DRAFT",
          can_replace: quotation.status === "DRAFT",
          can_delete: quotation.status === "DRAFT",
          can_amend: quotationActionFlags(quotation.status).can_negotiate,
        },
        created_at: quotation.created_at,
        updated_at: quotation.updated_at,
      },
    };
  }

  async downloadPdf(
    user: CurrentPortalUser,
    quotationId: string,
    res: Response,
  ) {
    const quotation = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) => {
        return tx.quotation.findFirst({
          where: {
            id: quotationId,
            tenant_id: user.tenantId,
            deleted_at: null,
            ...this.baseOwnershipWhere(user.partyId),
          },
          select: {
            id: true,
            quotation_number: true,
            customer_pdf_url: true,
            customer_pdf_s3_key: true,
          },
        });
      },
    );

    if (!quotation?.customer_pdf_url) {
      throw new NotFoundException("Quotation PDF not available.");
    }

    const file = await this.storage.readByStoredFile(user.tenantId, {
      file_name: `${quotation.quotation_number}.pdf`,
      file_url: quotation.customer_pdf_url,
      s3_key: quotation.customer_pdf_s3_key,
      mime_type: "application/pdf",
    });

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
    res.send(file.buffer);
  }

  async accept(
    user: CurrentPortalUser,
    quotationId: string,
    dto?: PortalQuotationAcceptDto,
  ) {
    const quotation = await this.getOwnedOrThrow(user, quotationId);
    this.negotiation.assertCustomerActionable(quotation.status);

    const updated = await this.quotations.markWon(
      user.tenantId,
      quotationId,
      user.id,
      dto?.message,
      { fromPortal: true },
    );

    // Status only — staff generate shipment / job from the admin ops flow.
    return {
      success: true,
      message:
        "Quotation approved. Our team will continue with shipment and booking.",
      data: {
        id: updated.id,
        quotation_number: updated.quotation_number,
        status: "APPROVED",
        won_at: updated.won_at,
      },
    };
  }

  async convertToJob(user: CurrentPortalUser, quotationId: string) {
    await this.getOwnedOrThrow(user, quotationId);
    // Jobs are created only by staff via Generate Job — never from the portal.
    throw new BadRequestException(
      "Job conversion is staff-only. After approval, your forwarder will use Generate Job on the admin side.",
    );
  }

  async reject(
    user: CurrentPortalUser,
    quotationId: string,
    dto: PortalQuotationRejectDto,
  ) {
    const quotation = await this.getOwnedOrThrow(user, quotationId);
    this.negotiation.assertCustomerActionable(quotation.status);

    const updated = await this.quotations.markLost(
      user.tenantId,
      quotationId,
      { reason: dto.reason, notes: dto.notes },
      user.id,
      { allowRenegotiate: false, fromPortal: true },
    );
    return {
      success: true,
      message: "Quotation rejected.",
      data: {
        id: updated.id,
        quotation_number: updated.quotation_number,
        status: updated.status,
        lost_at: updated.lost_at,
        lost_reason: updated.lost_reason,
      },
    };
  }

  async counterOffer(
    user: CurrentPortalUser,
    quotationId: string,
    dto: PortalQuotationCounterOfferDto,
  ) {
    const result = await this.quotations.customerCounterOffer(
      user.tenantId,
      quotationId,
      dto,
      user.id,
    );

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: "QUOTATION_COUNTER_OFFER",
      title: "Customer counter-offer",
      message: `${user.fullName} submitted a counter-offer on ${result.data.quotation_number}.`,
      entity_type: "quotation",
      entity_id: quotationId,
      link_path: `/quotations/${quotationId}`,
    });

    return result;
  }

  /** Amend = counter-offer (2C). */
  async amend(
    user: CurrentPortalUser,
    quotationId: string,
    dto: PortalQuotationCounterOfferDto,
  ) {
    return this.counterOffer(user, quotationId, dto);
  }

  async editDraft(
    user: CurrentPortalUser,
    quotationId: string,
    dto: PortalQuotationUpdateDto,
  ) {
    const quotation = await this.getOwnedOrThrow(user, quotationId);
    if (quotation.status !== "DRAFT") {
      throw new BadRequestException(
        "Only DRAFT portal quote requests can be edited.",
      );
    }

    const updated = await this.quotations.update(
      user.tenantId,
      quotationId,
      {
        job_type: dto.job_type,
        origin_port_id: dto.origin_port_id,
        dest_port_id: dto.dest_port_id,
        commodity: dto.commodity,
        gross_weight: dto.gross_weight,
        chargeable_weight: dto.chargeable_weight,
        volume_cbm: dto.volume_cbm,
        pieces: dto.pieces,
        container_type_id: dto.container_type_id,
        container_count: dto.container_count,
        special_requirements: dto.special_requirements,
        valid_until: dto.valid_until,
        currency_code: dto.currency_code,
        packages: dto.packages,
      } as never,
      user.id,
    );

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: "QUOTATION_REQUEST",
      title: "Portal quote edited",
      message: `${user.fullName} edited DRAFT quote ${updated.quotation_number}.`,
      entity_type: "quotation",
      entity_id: quotationId,
      link_path: `/quotations/${quotationId}`,
    });

    return this.findOne(user, quotationId);
  }

  async replaceDraft(user: CurrentPortalUser, quotationId: string) {
    const quotation = await this.getOwnedOrThrow(user, quotationId);
    if (quotation.status !== "DRAFT") {
      throw new BadRequestException(
        "Only DRAFT portal quote requests can be replaced.",
      );
    }

    const clone = await this.quotations.duplicate(
      user.tenantId,
      quotationId,
      user.id,
    );
    await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.quotation.update({
        where: { id: clone.id },
        data: {
          source: "CUSTOMER_PORTAL",
          customer_id: user.partyId,
          updated_by: user.id,
        },
      }),
    );
    await this.quotations.softDelete(user.tenantId, quotationId, user.id);

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: "QUOTATION_REQUEST",
      title: "Portal quote replaced",
      message: `${user.fullName} replaced ${quotation.quotation_number} with ${clone.quotation_number}.`,
      entity_type: "quotation",
      entity_id: clone.id,
      link_path: `/quotations/${clone.id}`,
    });

    return this.findOne(user, clone.id);
  }

  async deleteDraft(user: CurrentPortalUser, quotationId: string) {
    const quotation = await this.getOwnedOrThrow(user, quotationId);
    if (quotation.status !== "DRAFT") {
      throw new BadRequestException(
        "Only DRAFT portal quote requests can be deleted.",
      );
    }
    await this.quotations.softDelete(user.tenantId, quotationId, user.id);

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: "QUOTATION_REQUEST",
      title: "Portal quote withdrawn",
      message: `${user.fullName} deleted DRAFT quote ${quotation.quotation_number}.`,
      entity_type: "quotation",
      entity_id: quotationId,
      link_path: `/quotations/${quotationId}`,
    });

    return {
      success: true,
      message: "Draft quotation deleted.",
      data: { id: quotationId },
    };
  }

  async negotiationTimeline(user: CurrentPortalUser, quotationId: string) {
    await this.getOwnedOrThrow(user, quotationId);
    const result = await this.negotiation.getTimeline(
      user.tenantId,
      quotationId,
    );
    const detail = await this.findOne(user, quotationId);
    return {
      ...result,
      negotiation_pricing: detail.data.negotiation_pricing,
    };
  }

  private async getOwnedOrThrow(user: CurrentPortalUser, quotationId: string) {
    const quotation = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.quotation.findFirst({
        where: {
          id: quotationId,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...this.baseOwnershipWhere(user.partyId),
        },
        select: {
          id: true,
          status: true,
          quotation_number: true,
          converted_shipment_id: true,
          converted_job_id: true,
          job_type: true,
        },
      }),
    );
    if (!quotation) throw new NotFoundException("Quotation not found.");
    return quotation;
  }

  private baseOwnershipWhere(partyId: string): Prisma.QuotationWhereInput {
    return {
      customer_id: partyId,
      deleted_at: null,
      OR: [
        { status: { not: "DRAFT" } },
        { source: { in: [...PORTAL_CUSTOMER_SOURCES] } },
      ],
    };
  }

  private buildWhere(
    user: CurrentPortalUser,
    query: PortalQuotationQueryDto,
  ): Prisma.QuotationWhereInput {
    const where: Prisma.QuotationWhereInput = {
      tenant_id: user.tenantId,
      ...this.baseOwnershipWhere(user.partyId),
    };

    if (query.status) where.status = query.status;
    if (query.job_type) where.job_type = query.job_type;

    if (query.from_date || query.to_date) {
      where.created_at = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.AND = [
        {
          OR: [
            { quotation_number: { contains: q, mode: "insensitive" } },
            { commodity: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }

    return where;
  }

  private toListItem(row: {
    id: string;
    quotation_number: string;
    status: QuotationStatus;
    job_type: string;
    commodity: string | null;
    gross_weight: Prisma.Decimal | null;
    chargeable_weight: Prisma.Decimal | null;
    volume_cbm: Prisma.Decimal | null;
    pieces: number | null;
    currency_code: string;
    revenue_total: Prisma.Decimal;
    valid_until: Date | null;
    sent_at: Date | null;
    won_at: Date | null;
    lost_at: Date | null;
    converted_job_id: string | null;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: row.id,
      quotation_number: row.quotation_number,
      status: row.status,
      job_type: row.job_type,
      commodity: row.commodity,
      gross_weight: row.gross_weight,
      chargeable_weight: row.chargeable_weight,
      volume_cbm: row.volume_cbm,
      pieces: row.pieces,
      currency_code: row.currency_code,
      revenue_total: row.revenue_total,
      valid_until: row.valid_until,
      sent_at: row.sent_at,
      won_at: row.won_at,
      lost_at: row.lost_at,
      converted_job_id:
        row.status === "CONVERTED" ? row.converted_job_id : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
