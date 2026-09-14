import { Injectable } from "@nestjs/common";
import { StorageSlab } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class StorageSlabsService extends BaseMasterService<StorageSlab> {
  protected readonly modelName = "storageSlab";
  protected readonly searchFields = ["code","name"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
