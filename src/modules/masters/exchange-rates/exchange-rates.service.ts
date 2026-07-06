import { Injectable, NotFoundException } from '@nestjs/common';
import { ExchangeRate } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MasterQueryDto } from '../dto/master-query.dto';
import { CreateExchangeRateDto } from '../dto/exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Upsert rather than plain create — re-submitting today's rate (e.g. a corrected manual entry) should replace it, not conflict. */
  async create(tenantId: string, dto: CreateExchangeRateDto, actorId?: string): Promise<ExchangeRate> {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.exchangeRate.upsert({
        where: {
          tenant_id_currency_id_rate_date: {
            tenant_id: tenantId,
            currency_id: dto.currency_id,
            rate_date: new Date(dto.rate_date),
          },
        },
        create: {
          tenant_id: tenantId,
          currency_id: dto.currency_id,
          base_currency: dto.base_currency,
          rate: dto.rate,
          rate_date: new Date(dto.rate_date),
          source: dto.source ?? 'manual',
          manual_override: (dto.source ?? 'manual') === 'manual',
          created_by: actorId,
          updated_by: actorId,
        },
        update: {
          rate: dto.rate,
          source: dto.source ?? 'manual',
          manual_override: (dto.source ?? 'manual') === 'manual',
          updated_by: actorId,
        },
      }),
    );
  }

  async findAll(tenantId: string, query: MasterQueryDto & { currency_id?: string }) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.currency_id ? { currency_id: query.currency_id } : {}),
      };

      const [data, total] = await Promise.all([
        tx.exchangeRate.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { rate_date: 'desc' },
          include: { currency: { select: { code: true, name: true, symbol: true } } },
        }),
        tx.exchangeRate.count({ where }),
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

  /** Most recent rate on or before today for a given currency — what Quotations/Invoicing will call. */
  async latest(tenantId: string, currencyId: string): Promise<ExchangeRate> {
    const rate = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.exchangeRate.findFirst({
        where: { tenant_id: tenantId, currency_id: currencyId, rate_date: { lte: new Date() }, deleted_at: null },
        orderBy: { rate_date: 'desc' },
      }),
    );

    if (!rate) {
      throw new NotFoundException('No exchange rate on file for this currency.');
    }

    return rate;
  }
}
