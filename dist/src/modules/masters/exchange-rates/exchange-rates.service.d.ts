import { ExchangeRate } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MasterQueryDto } from '../dto/master-query.dto';
import { CreateExchangeRateDto } from '../dto/exchange-rate.dto';
export declare class ExchangeRatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateExchangeRateDto, actorId?: string): Promise<ExchangeRate>;
    findAll(tenantId: string, query: MasterQueryDto & {
        currency_id?: string;
    }): Promise<{
        data: ({
            currency: {
                symbol: string;
                name: string;
                code: string;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            tenant_id: string;
            updated_by: string | null;
            base_currency: string;
            created_by: string | null;
            currency_id: string;
            rate: import("@prisma/client/runtime/library").Decimal;
            rate_date: Date;
            source: string;
            manual_override: boolean;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    latest(tenantId: string, currencyId: string): Promise<ExchangeRate>;
}
