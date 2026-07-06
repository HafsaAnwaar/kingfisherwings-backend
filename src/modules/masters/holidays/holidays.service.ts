import { Injectable } from '@nestjs/common';
import { Holiday } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class HolidaysService extends BaseMasterService<Holiday> {
  protected readonly modelName = 'holiday';
  protected readonly searchFields = ['name', 'country_code'];
  protected readonly uniqueKeyLabel = 'holiday date for this country';
  protected readonly supportsIsActive = false;

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
