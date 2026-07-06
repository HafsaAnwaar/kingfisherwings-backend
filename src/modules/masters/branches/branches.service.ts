import { Injectable } from '@nestjs/common';
import { Branch } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class BranchesService extends BaseMasterService<Branch> {
  protected readonly modelName = 'branch';
  protected readonly searchFields = ['name', 'code', 'city'];
  protected readonly uniqueKeyLabel = 'branch code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
