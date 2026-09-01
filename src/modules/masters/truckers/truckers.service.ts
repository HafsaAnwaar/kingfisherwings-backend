import { Injectable } from "@nestjs/common";
import { Trucker } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class TruckersService extends BaseMasterService<Trucker> {
  protected readonly modelName = "trucker";
  protected readonly searchFields = ["name", "code", "contact_person"];
  protected readonly uniqueKeyLabel = "trucker code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
