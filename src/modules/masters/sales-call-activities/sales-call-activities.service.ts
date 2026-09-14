import { Injectable } from "@nestjs/common";
import { SalesCallActivityType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class SalesCallActivityTypesService extends BaseMasterService<SalesCallActivityType> {
  protected readonly modelName = "salesCallActivityType";
  protected readonly searchFields = ["code","name"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
