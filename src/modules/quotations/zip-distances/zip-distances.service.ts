import { Injectable } from '@nestjs/common';
import { ZipDistance } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../../masters/base-master.service';

@Injectable()
export class ZipDistancesService extends BaseMasterService<ZipDistance> {
  protected readonly modelName = 'zipDistance';
  protected readonly searchFields = ['from_zip', 'from_city', 'to_zip', 'to_city'];
  protected readonly uniqueKeyLabel = 'zip pair';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
