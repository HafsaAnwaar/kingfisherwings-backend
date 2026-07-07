import { UnitsOfMeasureService } from './units-of-measure.service';
import { CreateUnitOfMeasureDto, UpdateUnitOfMeasureDto } from '../dto/unit-of-measure.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class UnitsOfMeasureController {
    private readonly service;
    constructor(service: UnitsOfMeasureService);
    findAll(tenantId: string, query: MasterQueryDto): Promise<import("../base-master.service").PaginatedMasterResult<{
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
        category: string;
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
        code: string;
        created_by: string | null;
        category: string;
    }>;
    create(tenantId: string, actorId: string, dto: CreateUnitOfMeasureDto): Promise<{
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
        category: string;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateUnitOfMeasureDto): Promise<{
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
        category: string;
    }>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
}
