import {
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
import {
  PortalQuotationAcceptDto,
  PortalQuotationCounterOfferDto,
  PortalQuotationEstimateDto,
  PortalQuotationQueryDto,
  PortalQuotationRejectDto,
  PortalQuotationRequestDto,
} from "./dto/portal-quotation.dto";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalQuotePricingService } from "./portal-quote-pricing.service";
import { QuotationNegotiationService } from "../quotations/quotation-negotiation.service";
import { ServiceCatalogService } from "../quotations/service-catalog/service-catalog.service";

const PORTAL_CUSTOMER_SOURCES = ["CUSTOMER_PORTAL", "ONLINE_WIDGET"] as const;

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
  ) {}

  async getServiceCatalog(user: CurrentPortalUser, jobType?: string) {
    return this.catalog.findPortalVisible(user.tenantId, jobType as any);
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
    const hasRichPayload =
      "packages" in dto &&
      Array.isArray((dto as PortalQuotationEstimateDto).packages) &&
      (dto as PortalQuotationEstimateDto).packages.length > 0 &&
      "service_codes" in dto &&
      Array.isArray((dto as PortalQuotationEstimateDto).service_codes);

    const result = hasRichPayload
      ? await this.pricing.persistQuote(
          user.tenantId,
          user.partyId,
          dto as PortalQuotationEstimateDto,
          user.id,
        )
      : await this.quotations.createPortalQuoteRequest(
          user.tenantId,
          user.partyId,
          dto,
          user.id,
        );

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

  async summary(user: CurrentPortalUser) {
    const base = this.baseOwnershipWhere(user.partyId);

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

    const pending = byStatus.DRAFT + byStatus.SUBMITTED + byStatus.APPROVED;
    const active =
      byStatus.SENT + byStatus.NEGOTIATING + byStatus.CUSTOMER_REVIEW;
    const closed =
      byStatus.WON +
      byStatus.LOST +
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

    const [originPort, destPort] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) => {
        const ids = [quotation.origin_port_id, quotation.dest_port_id].filter(
          Boolean,
        ) as string[];
        if (!ids.length) return [null, null];

        const ports = await tx.port.findMany({
          where: {
            tenant_id: user.tenantId,
            id: { in: ids },
            deleted_at: null,
          },
          select: { id: true, name: true, un_locode: true, country_code: true },
        });
        const map = new Map(ports.map((p) => [p.id, p]));
        return [
          quotation.origin_port_id
            ? (map.get(quotation.origin_port_id) ?? null)
            : null,
          quotation.dest_port_id
            ? (map.get(quotation.dest_port_id) ?? null)
            : null,
        ];
      },
    );

    let convertedJobNumber: string | null = null;
    if (quotation.converted_job_id) {
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

    const revenueTotal = quotation.lines.reduce(
      (sum, line) => sum + Number(line.amount),
      0,
    );

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
        revenue_total: revenueTotal,
        remarks: quotation.remarks,
        origin: originPort
          ? {
              name: originPort.name,
              code: originPort.un_locode,
              country_code: originPort.country_code,
            }
          : null,
        destination: destPort
          ? {
              name: destPort.name,
              code: destPort.un_locode,
              country_code: destPort.country_code,
            }
          : null,
        lines: quotation.lines.map((line) => ({
          id: line.id,
          description: line.description,
          unit: line.unit,
          quantity: line.quantity,
          unit_price: line.unit_price,
          currency_code: line.currency_code,
          amount: line.amount,
        })),
        packages: quotation.packages.map((pkg) => ({
          id: pkg.id,
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
        converted_job_id: quotation.converted_job_id,
        converted_job_number: convertedJobNumber,
        negotiation_round: quotation.negotiation_round,
        source: quotation.source,
        customer_pdf_url: quotation.customer_pdf_url,
        has_pdf: Boolean(quotation.customer_pdf_url),
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
    return {
      success: true,
      message: "Quotation accepted.",
      data: {
        id: updated.id,
        quotation_number: updated.quotation_number,
        status: updated.status,
        won_at: updated.won_at,
      },
    };
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
      { allowRenegotiate: true, fromPortal: true },
    );
    return {
      success: true,
      message:
        updated.status === "NEGOTIATING"
          ? "Counter-offer submitted for review."
          : "Quotation rejected.",
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

  async negotiationTimeline(user: CurrentPortalUser, quotationId: string) {
    await this.getOwnedOrThrow(user, quotationId);
    return this.negotiation.getTimeline(user.tenantId, quotationId);
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
      converted_job_id: row.converted_job_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
