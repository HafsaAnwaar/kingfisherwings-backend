import { Holiday } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class HolidaysService extends BaseMasterService<Holiday> {
    protected readonly modelName = "holiday";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "holiday date for this country";
    protected readonly supportsIsActive = false;
    constructor(prisma: PrismaService);
}
