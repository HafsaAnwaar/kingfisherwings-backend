import { Injectable } from "@nestjs/common";
import { PackType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class PackTypesService extends BaseMasterService<PackType> {
  protected readonly modelName = "packType";
  protected readonly searchFields = ["code","name"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
