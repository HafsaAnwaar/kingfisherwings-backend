import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ReportTemplate } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ReportTemplatesQueryDto } from "./dto/report-templates-query.dto";
import { ReportParamDef } from "./types/report.types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ReportsTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getByIdOrCode(tenantId: string, idOrCode: string) {
    const template = await this.findTemplate(idOrCode, true);
    if (!template || !template.is_active) {
      throw new NotFoundException(`Report template "${idOrCode}" not found`);
    }
    const parameters = await this.hydrateParameters(
      tenantId,
      template.parameters_schema,
    );
    return {
      ...this.toListItem(template),
      parameters,
    };
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
