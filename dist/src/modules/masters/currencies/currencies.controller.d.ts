import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto, UpdateCurrencyDto } from '../dto/currency.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class CurrenciesController {
    private readonly service;
    constructor(service: CurrenciesService);
    findAll(tenantId: string, query: MasterQueryDto): Promise<import("../base-master.service").PaginatedMasterResult<{
        symbol: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        code: string;
        created_by: string | null;
        decimal_places: number;
        is_base: boolean;
    }>>;
    findOne(tenantId: string, id: string): Promise<{
        symbol: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        code: string;
        created_by: string | null;
        decimal_places: number;
        is_base: boolean;
    }>;
    create(tenantId: string, actorId: string, dto: CreateCurrencyDto): Promise<{
        symbol: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        code: string;
        created_by: string | null;
        decimal_places: number;
        is_base: boolean;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateCurrencyDto): Promise<{
        symbol: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        code: string;
        created_by: string | null;
        decimal_places: number;
        is_base: boolean;
    }>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
}
