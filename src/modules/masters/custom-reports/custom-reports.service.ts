import { Injectable } from "@nestjs/common";
import { CustomReportMaster } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class CustomReportMastersService extends BaseMasterService<CustomReportMaster> {
  protected readonly modelName = "customReportMaster";
  protected readonly searchFields = ["code", "name", "report_template_code"];
  protected readonly uniqueKeyLabel = "code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
