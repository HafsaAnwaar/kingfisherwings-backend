import { Warehouse } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class WarehousesService extends BaseMasterService<Warehouse> {
    protected readonly modelName = "warehouse";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "warehouse code";
    constructor(prisma: PrismaService);
}
