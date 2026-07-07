import { Airport } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class AirportsService extends BaseMasterService<Airport> {
    protected readonly modelName = "airport";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "IATA code";
    constructor(prisma: PrismaService);
}
