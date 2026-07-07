import { CountriesService } from './countries.service';
import { CreateCountryDto, UpdateCountryDto } from '../dto/country.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class CountriesController {
    private readonly service;
    constructor(service: CountriesService);
    findAll(tenantId: string, query: MasterQueryDto): Promise<import("../base-master.service").PaginatedMasterResult<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        created_by: string | null;
        iso_code: string;
        iso3_code: string;
        dial_code: string | null;
        region: string | null;
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
        created_by: string | null;
        iso_code: string;
        iso3_code: string;
        dial_code: string | null;
        region: string | null;
    }>;
    create(tenantId: string, actorId: string, dto: CreateCountryDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        created_by: string | null;
        iso_code: string;
        iso3_code: string;
        dial_code: string | null;
        region: string | null;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateCountryDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        created_by: string | null;
        iso_code: string;
        iso3_code: string;
        dial_code: string | null;
        region: string | null;
    }>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
}
