import { Injectable } from '@nestjs/common';
import { UnitOfMeasure } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class UnitsOfMeasureService extends BaseMasterService<UnitOfMeasure> {
  protected readonly modelName = 'unitOfMeasure';
  protected readonly searchFields = ['name', 'code', 'category'];
  protected readonly uniqueKeyLabel = 'unit code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
