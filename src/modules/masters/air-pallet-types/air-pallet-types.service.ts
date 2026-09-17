import { Injectable } from "@nestjs/common";
import { AirPalletType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class AirPalletTypesService extends BaseMasterService<AirPalletType> {
  protected readonly modelName = "airPalletType";
  protected readonly searchFields = ["code", "name"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
