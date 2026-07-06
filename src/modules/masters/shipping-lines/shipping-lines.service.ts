import { Injectable } from '@nestjs/common';
import { ShippingLine } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class ShippingLinesService extends BaseMasterService<ShippingLine> {
  protected readonly modelName = 'shippingLine';
  protected readonly searchFields = ['name', 'short_name', 'scac_code'];
  protected readonly uniqueKeyLabel = 'SCAC code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
