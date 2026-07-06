import { Injectable } from '@nestjs/common';
import { Warehouse } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class WarehousesService extends BaseMasterService<Warehouse> {
  protected readonly modelName = 'warehouse';
  protected readonly searchFields = ['name', 'code', 'city'];
  protected readonly uniqueKeyLabel = 'warehouse code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
