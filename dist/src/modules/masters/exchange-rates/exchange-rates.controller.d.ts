import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from '../dto/exchange-rate.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class ExchangeRatesController {
    private readonly service;
    constructor(service: ExchangeRatesService);
    findAll(tenantId: string, query: MasterQueryDto, currencyId?: string): Promise<{
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
    latest(tenantId: string, currencyId: string): Promise<{
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
    }>;
    create(tenantId: string, actorId: string, dto: CreateExchangeRateDto): Promise<{
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
    }>;
}
