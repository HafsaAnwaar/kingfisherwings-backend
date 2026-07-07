import { UnitOfMeasure } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class UnitsOfMeasureService extends BaseMasterService<UnitOfMeasure> {
    protected readonly modelName = "unitOfMeasure";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "unit code";
    constructor(prisma: PrismaService);
}
