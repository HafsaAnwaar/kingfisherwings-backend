import { DesignationsService } from './designations.service';
import { CreateDesignationDto, UpdateDesignationDto } from '../dto/designation.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class DesignationsController {
    private readonly service;
    constructor(service: DesignationsService);
    findAll(tenantId: string, query: MasterQueryDto): Promise<import("../base-master.service").PaginatedMasterResult<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        department_id: string | null;
        updated_by: string | null;
        created_by: string | null;
    }>>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        department_id: string | null;
        updated_by: string | null;
        created_by: string | null;
    }>;
    create(tenantId: string, actorId: string, dto: CreateDesignationDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        department_id: string | null;
        updated_by: string | null;
        created_by: string | null;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateDesignationDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        department_id: string | null;
        updated_by: string | null;
        created_by: string | null;
    }>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
}
