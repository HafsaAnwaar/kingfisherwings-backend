import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class DepartmentsController {
    private readonly service;
    constructor(service: DepartmentsService);
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
        parent_id: string | null;
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
        parent_id: string | null;
    }>;
    create(tenantId: string, actorId: string, dto: CreateDepartmentDto): Promise<{
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
        parent_id: string | null;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateDepartmentDto): Promise<{
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
        parent_id: string | null;
    }>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
}
