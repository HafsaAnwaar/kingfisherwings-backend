import { ChargeCode } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class ChargeCodesService extends BaseMasterService<ChargeCode> {
    protected readonly modelName = "chargeCode";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "charge code";
    constructor(prisma: PrismaService);
}
