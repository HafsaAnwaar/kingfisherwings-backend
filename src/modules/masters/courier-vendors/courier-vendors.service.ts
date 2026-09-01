import { Injectable } from "@nestjs/common";
import { CourierVendor } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class CourierVendorsService extends BaseMasterService<CourierVendor> {
  protected readonly modelName = "courierVendor";
  protected readonly searchFields = ["name", "code"];
  protected readonly uniqueKeyLabel = "courier vendor code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
