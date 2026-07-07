import { AirlinesService } from './airlines.service';
import { CreateAirlineDto, UpdateAirlineDto } from '../dto/airline.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class AirlinesController {
    private readonly service;
    constructor(service: AirlinesService);
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
        iata_code: string;
        icao_code: string | null;
        prefix_code: string | null;
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
        iata_code: string;
        icao_code: string | null;
        prefix_code: string | null;
    }>;
    create(tenantId: string, actorId: string, dto: CreateAirlineDto): Promise<{
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
        iata_code: string;
        icao_code: string | null;
        prefix_code: string | null;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateAirlineDto): Promise<{
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
        iata_code: string;
        icao_code: string | null;
        prefix_code: string | null;
    }>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
}
