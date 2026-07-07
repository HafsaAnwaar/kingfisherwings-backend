import { Trucker } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class TruckersService extends BaseMasterService<Trucker> {
    protected readonly modelName = "trucker";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "trucker code";
    constructor(prisma: PrismaService);
}
