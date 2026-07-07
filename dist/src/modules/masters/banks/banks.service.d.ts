import { Bank } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class BanksService extends BaseMasterService<Bank> {
    protected readonly modelName = "bank";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "bank";
    constructor(prisma: PrismaService);
}
