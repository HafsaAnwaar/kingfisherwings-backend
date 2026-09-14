import { Injectable } from "@nestjs/common";
import { Commodity } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class CommoditiesService extends BaseMasterService<Commodity> {
  protected readonly modelName = "commodity";
  protected readonly searchFields = ["code","name","hs_code"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
