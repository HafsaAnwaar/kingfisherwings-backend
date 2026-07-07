"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ExchangeRatesService = class ExchangeRatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto, actorId) {
        return this.prisma.runWithTenant(tenantId, (tx) => tx.exchangeRate.upsert({
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
        }));
    }
    async findAll(tenantId, query) {
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
    async latest(tenantId, currencyId) {
        const rate = await this.prisma.runWithTenant(tenantId, (tx) => tx.exchangeRate.findFirst({
            where: { tenant_id: tenantId, currency_id: currencyId, rate_date: { lte: new Date() }, deleted_at: null },
            orderBy: { rate_date: 'desc' },
        }));
        if (!rate) {
            throw new common_1.NotFoundException('No exchange rate on file for this currency.');
        }
        return rate;
    }
};
exports.ExchangeRatesService = ExchangeRatesService;
exports.ExchangeRatesService = ExchangeRatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExchangeRatesService);
//# sourceMappingURL=exchange-rates.service.js.map