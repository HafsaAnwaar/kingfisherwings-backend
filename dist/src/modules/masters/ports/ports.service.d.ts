import { Port } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class PortsService extends BaseMasterService<Port> {
    protected readonly modelName = "port";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "UN/LOCODE";
    constructor(prisma: PrismaService);
}
