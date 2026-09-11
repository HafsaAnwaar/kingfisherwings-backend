import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  Prisma,
  ReportContext,
  ReportFamily,
  ReportFormat,
} from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { OPS_LIST_PHASE1_SEED } from "./ops-list-phase1.seed";

@Injectable()
export class ReportsSeedService implements OnModuleInit {
  private readonly logger = new Logger(ReportsSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.upsertPhase1();
    } catch (err) {
      this.logger.error(
        `Report template seed failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async upsertPhase1() {
    for (const row of OPS_LIST_PHASE1_SEED) {
      await this.prisma.reportTemplate.upsert({
        where: { code: row.code },
        create: {
          code: row.code,
          name: row.name,
          family: row.family as ReportFamily,
          contexts: row.contexts as ReportContext[],
          formats: row.formats as ReportFormat[],
          description: row.description ?? null,
          is_active: row.is_active,
          parameters_schema: row.parameters_schema as unknown as Prisma.InputJsonValue,
          renderer_key: row.renderer_key,
          sort_order: row.sort_order,
        },
        update: {
          name: row.name,
          family: row.family as ReportFamily,
          contexts: row.contexts as ReportContext[],
          formats: row.formats as ReportFormat[],
          description: row.description ?? null,
          is_active: row.is_active,
          parameters_schema: row.parameters_schema as unknown as Prisma.InputJsonValue,
          renderer_key: row.renderer_key,
          sort_order: row.sort_order,
        },
      });
    }
    this.logger.log(
      `Upserted ${OPS_LIST_PHASE1_SEED.length} Phase-1 ops_list report templates`,
    );
  }
}
