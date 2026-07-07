import { BanksService } from './banks.service';
import { CreateBankDto, UpdateBankDto } from '../dto/bank.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class BanksController {
    private readonly service;
    constructor(service: BanksService);
    findAll(tenantId: string, query: MasterQueryDto): Promise<import("../base-master.service").PaginatedMasterResult<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        country_code: string | null;
        created_by: string | null;
        short_name: string | null;
        swift_code: string | null;
        iban_prefix: string | null;
    }>>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        country_code: string | null;
        created_by: string | null;
        short_name: string | null;
        swift_code: string | null;
        iban_prefix: string | null;
    }>;
    create(tenantId: string, actorId: string, dto: CreateBankDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        country_code: string | null;
        created_by: string | null;
        short_name: string | null;
        swift_code: string | null;
        iban_prefix: string | null;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateBankDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        country_code: string | null;
        created_by: string | null;
        short_name: string | null;
        swift_code: string | null;
        iban_prefix: string | null;
    }>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
}
