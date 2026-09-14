import { Injectable } from "@nestjs/common";
import { PortClauseMap } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class PortClauseMapsService extends BaseMasterService<PortClauseMap> {
  protected readonly modelName = "portClauseMap";
  protected readonly searchFields = [];
  protected readonly uniqueKeyLabel = "port and clause";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
