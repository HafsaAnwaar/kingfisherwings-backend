import { Injectable } from "@nestjs/common";
import { MasterCategory } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class MasterCategoriesService extends BaseMasterService<MasterCategory> {
  protected readonly modelName = "masterCategory";
  protected readonly searchFields = ["code","name"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
