import { Vessel } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class VesselsService extends BaseMasterService<Vessel> {
    protected readonly modelName = "vessel";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "vessel";
    constructor(prisma: PrismaService);
    create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Vessel>;
    update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<Vessel>;
    private assertShippingLineExists;
}
