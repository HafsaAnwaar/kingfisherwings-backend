import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ReportTemplate } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ReportDataPackRegistry } from "./data-packs/report-data-pack.registry";
import { ActivateTemplateDto, BindRendererDto } from "./dto/bind-renderer.dto";
import { ReportTemplatesQueryDto } from "./dto/report-templates-query.dto";
import { ReportParamDef } from "./types/report.types";
import { OPS_LIST_PHASE1_SEED } from "./seed/ops-list-phase1.seed";
import { SEA_DOCS_PHASE2_SEED } from "./seed/sea-docs-phase2.seed";
import { PRIORITY_PACKS_SEED } from "./seed/priority-packs.seed";
import { resolveRendererKeyForCode } from "./constants/renderer-bind-map";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Donor pack seed used to copy parameters_schema when binding an empty stub. */
const RENDERER_DONOR_SCHEMA: Record<string, ReportParamDef[]> = (() => {
  const map: Record<string, ReportParamDef[]> = {};
  for (const row of [
    ...OPS_LIST_PHASE1_SEED,
    ...SEA_DOCS_PHASE2_SEED,
    ...PRIORITY_PACKS_SEED,
  ]) {
    map[row.renderer_key] = row.parameters_schema;
  }
  return map;
})();

@Injectable()
export class ReportsTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataPacks: ReportDataPackRegistry,
  ) {}

  async list(query: ReportTemplatesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Prisma.ReportTemplateWhereInput = {
      ...(query.include_inactive ? {} : { is_active: true }),
      ...(query.family ? { family: query.family } : {}),
      ...(query.context ? { contexts: { has: query.context } } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.reportTemplate.findMany({
        where,
        orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.reportTemplate.count({ where }),
    ]);

    return {
      data: rows.map((t) => this.toListItem(t)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  listRenderers() {
    return {
      data: this.dataPacks.listImplemented(),
      meta: {
        note: "Bind one of these keys to a FRESA code via POST /reports/templates/:code/bind-renderer (or activate with body.renderer_key).",
      },
    };
  }

  async getByIdOrCode(tenantId: string, idOrCode: string) {
    // Return inactive templates too so FRESA browse can show "not activated yet".
    // Default list still filters is_active=true; generate still rejects inactive.
    const template = await this.findTemplate(idOrCode, false);
    if (!template) {
      throw new NotFoundException(`Report template "${idOrCode}" not found`);
    }
    const parameters = await this.hydrateParameters(
      tenantId,
      template.parameters_schema,
    );
    return {
      ...this.toListItem(template),
      parameters,
      renderer_key: template.renderer_key,
      sort_order: template.sort_order,
    };
  }

  /**
   * Clear pending.* by assigning an implemented pack renderer_key.
   * Optionally activate in the same call (FE Activate flow).
   */
  async bindRenderer(code: string, dto: BindRendererDto) {
    this.dataPacks.assertImplemented(dto.renderer_key);
    const template = await this.findTemplate(code, false);
    if (!template) {
      throw new NotFoundException(`Report template "${code}" not found`);
    }

    const schemaEmpty =
      !Array.isArray(template.parameters_schema) ||
      (template.parameters_schema as unknown[]).length === 0;
    const donorSchema = RENDERER_DONOR_SCHEMA[dto.renderer_key];

    return this.prisma.reportTemplate.update({
      where: { id: template.id },
      data: {
        renderer_key: dto.renderer_key,
        ...(dto.formats?.length ? { formats: dto.formats } : {}),
        ...(schemaEmpty && donorSchema
          ? {
              parameters_schema:
                donorSchema as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.activate ? { is_active: true } : {}),
      },
    });
  }

  async activate(code: string, dto?: ActivateTemplateDto) {
    const template = await this.findTemplate(code, false);
    if (!template) {
      throw new NotFoundException(`Report template "${code}" not found`);
    }

    if (dto?.renderer_key) {
      return this.bindRenderer(code, {
        renderer_key: dto.renderer_key,
        activate: true,
      });
    }

    if (template.renderer_key.startsWith("pending.")) {
      const mapped = resolveRendererKeyForCode(code);
      if (mapped && this.dataPacks.isImplemented(mapped)) {
        return this.bindRenderer(code, {
          renderer_key: mapped,
          activate: true,
        });
      }
      throw new BadRequestException(
        `Renderer not implemented for "${code}" (renderer_key=${template.renderer_key}). Bind an implemented pack first: POST /reports/templates/${code}/bind-renderer with { "renderer_key": "…" } (see GET /reports/templates/renderers), or pass renderer_key on this activate body.`,
      );
    }

    this.dataPacks.assertImplemented(template.renderer_key);

    return this.prisma.reportTemplate.update({
      where: { id: template.id },
      data: { is_active: true },
    });
  }

  async deactivate(code: string) {
    const template = await this.findTemplate(code, false);
    if (!template) {
      throw new NotFoundException(`Report template "${code}" not found`);
    }
    return this.prisma.reportTemplate.update({
      where: { id: template.id },
      data: { is_active: false },
    });
  }

  async findTemplate(idOrCode: string, activeOnly = false) {
    const whereBase = activeOnly ? { is_active: true } : {};
    if (UUID_RE.test(idOrCode)) {
      return this.prisma.reportTemplate.findFirst({
        where: { id: idOrCode, ...whereBase },
      });
    }
    return this.prisma.reportTemplate.findFirst({
      where: { code: idOrCode, ...whereBase },
    });
  }

  private toListItem(t: ReportTemplate) {
    return {
      id: t.id,
      code: t.code,
      name: t.name,
      family: t.family,
      contexts: t.contexts,
      formats: t.formats,
      description: t.description,
      is_active: t.is_active,
    };
  }

  private async hydrateParameters(
    tenantId: string,
    schema: Prisma.JsonValue,
  ): Promise<ReportParamDef[]> {
    const defs = (Array.isArray(schema) ? schema : []) as ReportParamDef[];
    const needsBranches = defs.some((d) => d.options_source === "branches");
    const needsSales = defs.some((d) => d.options_source === "salespeople");

    let branchOptions: Array<{ value: string; label: string }> = [];
    let salesOptions: Array<{ value: string; label: string }> = [];

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      if (needsBranches) {
        const branches = await tx.branch.findMany({
          where: { tenant_id: tenantId, is_active: true, deleted_at: null },
          select: { id: true, name: true, code: true },
          orderBy: { name: "asc" },
        });
        branchOptions = branches.map((b) => ({
          value: b.id,
          label: `${b.code} — ${b.name}`,
        }));
      }
      if (needsSales) {
        const users = await tx.user.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: "ACTIVE",
            OR: [
              { is_salesperson: true },
              { role: { in: ["SALES_MANAGER", "SALES_EXECUTIVE"] } },
            ],
          },
          select: { id: true, first_name: true, last_name: true, email: true },
          take: 500,
          orderBy: { first_name: "asc" },
        });
        salesOptions = users.map((u) => ({
          value: u.id,
          label:
            [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email,
        }));
      }
    });

    return defs.map((d) => {
      const { options_source, ...rest } = d;
      if (options_source === "branches") {
        return { ...rest, options: branchOptions };
      }
      if (options_source === "salespeople") {
        return { ...rest, options: salesOptions };
      }
      return rest;
    });
  }
}
