import { HolidaysService } from './holidays.service';
import { CreateHolidayDto, UpdateHolidayDto } from '../dto/holiday.dto';
import { MasterQueryDto } from '../dto/master-query.dto';
export declare class HolidaysController {
    private readonly service;
    constructor(service: HolidaysService);
    findAll(tenantId: string, query: MasterQueryDto): Promise<import("../base-master.service").PaginatedMasterResult<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        country_code: string;
        created_by: string | null;
        date: Date;
        is_recurring: boolean;
    }>>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        country_code: string;
        created_by: string | null;
        date: Date;
        is_recurring: boolean;
    }>;
    create(tenantId: string, actorId: string, dto: CreateHolidayDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        country_code: string;
        created_by: string | null;
        date: Date;
        is_recurring: boolean;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateHolidayDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        tenant_id: string;
        updated_by: string | null;
        country_code: string;
        created_by: string | null;
        date: Date;
        is_recurring: boolean;
    }>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
}
