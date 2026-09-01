import { Injectable } from "@nestjs/common";
import { Bank } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class BanksService extends BaseMasterService<Bank> {
  protected readonly modelName = "bank";
  protected readonly searchFields = ["name", "short_name", "swift_code"];
  protected readonly uniqueKeyLabel = "bank";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
