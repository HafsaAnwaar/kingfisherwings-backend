import { Airline } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class AirlinesService extends BaseMasterService<Airline> {
    protected readonly modelName = "airline";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "IATA code";
    constructor(prisma: PrismaService);
}
