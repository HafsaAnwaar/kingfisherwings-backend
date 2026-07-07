import { Designation } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class DesignationsService extends BaseMasterService<Designation> {
    protected readonly modelName = "designation";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "designation";
    constructor(prisma: PrismaService);
    create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Designation>;
    update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<Designation>;
    private assertDepartmentExists;
}
