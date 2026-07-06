import { Injectable } from '@nestjs/common';
import { Airline } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class AirlinesService extends BaseMasterService<Airline> {
  protected readonly modelName = 'airline';
  protected readonly searchFields = ['name', 'iata_code', 'icao_code'];
  protected readonly uniqueKeyLabel = 'IATA code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
