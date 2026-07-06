import { Injectable } from '@nestjs/common';
import { Port } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class PortsService extends BaseMasterService<Port> {
  protected readonly modelName = 'port';
  protected readonly searchFields = ['name', 'un_locode', 'city'];
  protected readonly uniqueKeyLabel = 'UN/LOCODE';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
