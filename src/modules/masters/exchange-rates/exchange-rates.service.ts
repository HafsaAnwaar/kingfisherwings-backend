import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ExchangeRate } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MasterQueryDto } from '../dto/master-query.dto';
import { CreateExchangeRateDto } from '../dto/exchange-rate.dto';
import { CountryLocaleService } from '../../../common/locale/country-locale.service';

@Injectable()
export class ExchangeRatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locale: CountryLocaleService,
  ) {}

  /** Upsert rather than plain create — re-submitting today's rate (e.g. a corrected manual entry) should replace it, not conflict. */
  async create(tenantId: string, dto: CreateExchangeRateDto, actorId?: string): Promise<ExchangeRate> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { base_currency: true, country_code: true },
    });
    const expectedBase =
      tenant?.base_currency ??
      this.locale.getDefaultCurrency(tenant?.country_code) ??
      'USD';
    const baseCurrency = (dto.base_currency || expectedBase).toUpperCase();

    if (expectedBase && baseCurrency !== expectedBase.toUpperCase()) {
      throw new BadRequestException(
        `base_currency must match the tenant base currency (${expectedBase}). Change organization country/currency first if needed.`,
      );
    }

    if (!this.locale.isKnownCurrency(baseCurrency)) {
      throw new BadRequestException('base_currency must be a valid ISO 4217 currency code.');
    }

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
          base_currency: baseCurrency,
          rate: dto.rate,
          rate_date: new Date(dto.rate_date),
          source: dto.source ?? 'manual',
          manual_override: (dto.source ?? 'manual') === 'manual',
          created_by: actorId,
          updated_by: actorId,
        },
        update: {
          rate: dto.rate,
          base_currency: baseCurrency,
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
