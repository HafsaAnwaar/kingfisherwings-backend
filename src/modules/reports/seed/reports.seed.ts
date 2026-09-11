import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  Prisma,
  ReportContext,
  ReportFamily,
  ReportFormat,
} from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { OPS_LIST_PHASE1_SEED } from "./ops-list-phase1.seed";
import { SEA_DOCS_PHASE2_SEED } from "./sea-docs-phase2.seed";
import {
  collectProtectedCodes,
  importFresaRegistry,
} from "./reports-registry.import";
import { RegistryEntry } from "./fresa-registry.util";

@Injectable()
export class ReportsSeedService implements OnModuleInit {
  private readonly logger = new Logger(ReportsSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.upsertPackSeeds([
        ...OPS_LIST_PHASE1_SEED,
        ...SEA_DOCS_PHASE2_SEED,
      ]);
      const protectedCodes = collectProtectedCodes([
        ...OPS_LIST_PHASE1_SEED.map((r) => r.code),
        ...SEA_DOCS_PHASE2_SEED.map((r) => r.code),
      ]);
      await importFresaRegistry(this.prisma, { protectedCodes });
    } catch (err) {
      this.logger.error(
        `Report template seed failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async upsertPackSeeds(
    rows: Array<{
      code: string;
      name: string;
      family: string;
      contexts: string[];
      formats: string[];
      description?: string;
      is_active: boolean;
      renderer_key: string;
      sort_order: number;
      parameters_schema: unknown;
    }>,
  ) {
    for (const row of rows) {
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
          parameters_schema:
            row.parameters_schema as unknown as Prisma.InputJsonValue,
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
          parameters_schema:
            row.parameters_schema as unknown as Prisma.InputJsonValue,
          renderer_key: row.renderer_key,
          sort_order: row.sort_order,
        },
      });
    }
    this.logger.log(`Upserted ${rows.length} pack report templates`);
  }

  async importRegistryEntries(entries: RegistryEntry[]) {
    const protectedCodes = collectProtectedCodes([
      ...OPS_LIST_PHASE1_SEED.map((r) => r.code),
      ...SEA_DOCS_PHASE2_SEED.map((r) => r.code),
    ]);
    return importFresaRegistry(this.prisma, { protectedCodes, entries });
  }
}
