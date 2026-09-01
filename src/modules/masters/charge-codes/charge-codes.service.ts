import { Injectable } from "@nestjs/common";
import { ChargeCode } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class ChargeCodesService extends BaseMasterService<ChargeCode> {
  protected readonly modelName = "chargeCode";
  protected readonly searchFields = ["code", "description"];
  protected readonly uniqueKeyLabel = "charge code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
