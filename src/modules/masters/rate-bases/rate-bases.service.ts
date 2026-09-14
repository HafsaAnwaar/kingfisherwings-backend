import { Injectable } from "@nestjs/common";
import { RateBasis } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class RateBasesService extends BaseMasterService<RateBasis> {
  protected readonly modelName = "rateBasis";
  protected readonly searchFields = ["code","name"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
