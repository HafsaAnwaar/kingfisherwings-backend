import { Department } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class DepartmentsService extends BaseMasterService<Department> {
    protected readonly modelName = "department";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "department code";
    constructor(prisma: PrismaService);
    create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Department>;
    update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<Department>;
    private assertParentValid;
}
