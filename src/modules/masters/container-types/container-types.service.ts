import { Injectable } from "@nestjs/common";
import { ContainerType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class ContainerTypesService extends BaseMasterService<ContainerType> {
  protected readonly modelName = "containerType";
  protected readonly searchFields = ["name", "code"];
  protected readonly uniqueKeyLabel = "container type code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
