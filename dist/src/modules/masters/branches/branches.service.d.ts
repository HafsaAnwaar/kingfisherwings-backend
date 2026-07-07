import { Branch } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class BranchesService extends BaseMasterService<Branch> {
    protected readonly modelName = "branch";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "branch code";
    constructor(prisma: PrismaService);
}
