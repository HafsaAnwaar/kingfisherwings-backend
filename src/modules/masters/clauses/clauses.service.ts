import { Injectable } from "@nestjs/common";
import { Clause } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class ClausesService extends BaseMasterService<Clause> {
  protected readonly modelName = "clause";
  protected readonly searchFields = ["code","title"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
