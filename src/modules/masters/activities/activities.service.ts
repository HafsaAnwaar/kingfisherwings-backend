import { Injectable } from "@nestjs/common";
import { ActivityType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class ActivityTypesService extends BaseMasterService<ActivityType> {
  protected readonly modelName = "activityType";
  protected readonly searchFields = ["code","name"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
