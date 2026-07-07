import { ShippingLine } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class ShippingLinesService extends BaseMasterService<ShippingLine> {
    protected readonly modelName = "shippingLine";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "SCAC code";
    constructor(prisma: PrismaService);
}
