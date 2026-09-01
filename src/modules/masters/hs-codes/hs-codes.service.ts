import { Injectable } from "@nestjs/common";
import { HsCode } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class HsCodesService extends BaseMasterService<HsCode> {
  protected readonly modelName = "hsCode";
  protected readonly searchFields = ["hs_code", "description"];
  protected readonly uniqueKeyLabel = "HS code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
