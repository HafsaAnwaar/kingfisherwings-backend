import { Country } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class CountriesService extends BaseMasterService<Country> {
    protected readonly modelName = "country";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "ISO code";
    constructor(prisma: PrismaService);
}
