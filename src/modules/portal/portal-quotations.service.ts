import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, QuotationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationEmitterService } from '../notifications/notification-emitter.service';
import { QuotationsService } from '../quotations/quotations.service';
import { PortalQuotationQueryDto, PortalQuotationRequestDto } from './dto/portal-quotation.dto';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';

const PORTAL_CUSTOMER_REMARKS = ['customer portal', 'online quote'];

@Injectable()
export class PortalQuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotations: QuotationsService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async requestQuote(user: CurrentPortalUser, dto: PortalQuotationRequestDto) {
    const result = await this.quotations.createPortalQuoteRequest(
      user.tenantId,
      user.partyId,
      dto,
      user.id,
    );

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: 'QUOTATION_REQUEST',
      title: 'New portal quote request',
      message: `${user.fullName} submitted a quote request (${result.data.quotation_number}).`,
      entity_type: 'quotation',
      entity_id: result.data.quotation_id,
      link_path: `/quotations/${result.data.quotation_id}`,
    });

    return result;
  }

  async list(user: CurrentPortalUser, query: PortalQuotationQueryDto) {
    const where = this.buildWhere(user, query);

    const [rows, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
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
    });

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
        by: ['status'],
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
    const active = byStatus.SENT;
    const closed =
      byStatus.WON + byStatus.LOST + byStatus.EXPIRED + byStatus.CONVERTED + byStatus.REJECTED;

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
    const quotation = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      return tx.quotation.findFirst({
        where: {
          id: quotationId,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...this.baseOwnershipWhere(user.partyId),
        },
        include: {
          lines: { where: { is_cost: false }, orderBy: { sort_order: 'asc' } },
          status_history: {
            orderBy: { created_at: 'asc' },
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
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    const [originPort, destPort] = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const ids = [quotation.origin_port_id, quotation.dest_port_id].filter(Boolean) as string[];
      if (!ids.length) return [null, null];

      const ports = await tx.port.findMany({
        where: { tenant_id: user.tenantId, id: { in: ids }, deleted_at: null },
        select: { id: true, name: true, un_locode: true, country_code: true },
      });
      const map = new Map(ports.map((p) => [p.id, p]));
      return [
        quotation.origin_port_id ? map.get(quotation.origin_port_id) ?? null : null,
        quotation.dest_port_id ? map.get(quotation.dest_port_id) ?? null : null,
      ];
    });

    const revenueTotal = quotation.lines.reduce((sum, line) => sum + Number(line.amount), 0);

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
          ? { name: originPort.name, code: originPort.un_locode, country_code: originPort.country_code }
          : null,
        destination: destPort
          ? { name: destPort.name, code: destPort.un_locode, country_code: destPort.country_code }
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
        status_history: quotation.status_history,
        sent_at: quotation.sent_at,
        won_at: quotation.won_at,
        lost_at: quotation.lost_at,
        lost_reason: quotation.lost_reason,
        converted_job_id: quotation.converted_job_id,
        customer_pdf_url: quotation.customer_pdf_url,
        created_at: quotation.created_at,
        updated_at: quotation.updated_at,
      },
    };
  }

  private baseOwnershipWhere(partyId: string): Prisma.QuotationWhereInput {
    return {
      customer_id: partyId,
      deleted_at: null,
      OR: [
        { status: { not: 'DRAFT' } },
        ...PORTAL_CUSTOMER_REMARKS.map((phrase) => ({
          remarks: { contains: phrase, mode: 'insensitive' as const },
        })),
      ],
    };
  }

  private buildWhere(user: CurrentPortalUser, query: PortalQuotationQueryDto): Prisma.QuotationWhereInput {
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
            { quotation_number: { contains: q, mode: 'insensitive' } },
            { commodity: { contains: q, mode: 'insensitive' } },
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
