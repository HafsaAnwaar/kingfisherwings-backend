import { Injectable } from "@nestjs/common";
import { Region } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class RegionsService extends BaseMasterService<Region> {
  protected readonly modelName = "region";
  protected readonly searchFields = ["code","name"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
