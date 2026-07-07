import { HsCode } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class HsCodesService extends BaseMasterService<HsCode> {
    protected readonly modelName = "hsCode";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "HS code";
    constructor(prisma: PrismaService);
}
