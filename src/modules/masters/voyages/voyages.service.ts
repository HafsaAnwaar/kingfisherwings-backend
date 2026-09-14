import { Injectable } from "@nestjs/common";
import { VoyageMaster } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class VoyageMastersService extends BaseMasterService<VoyageMaster> {
  protected readonly modelName = "voyageMaster";
  protected readonly searchFields = ["voyage_code"];
  protected readonly uniqueKeyLabel = "voyage_code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
