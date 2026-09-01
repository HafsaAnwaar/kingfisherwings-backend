import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { JobsService } from "../jobs/jobs.service";
import {
  ApplyChargeTemplateDto,
  ChargeTemplateQueryDto,
  CreateChargeTemplateDto,
  UpdateChargeTemplateDto,
} from "./dto/documentation-charge-template.dto";
import { paginated } from "./dto/documentation-pagination.dto";

@Injectable()
export class DocumentationChargeTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  async findAll(tenantId: string, query: ChargeTemplateQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.DocumentationChargeTemplateWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.is_active !== undefined
          ? { is_active: query.is_active }
          : {}),
        ...(query.search
          ? { name: { contains: query.search, mode: "insensitive" } }
          : {}),
      };

      const [items, total] = await Promise.all([
        tx.documentationChargeTemplate.findMany({
          where,
          include: { lines: { orderBy: { sort_order: "asc" } } },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: "asc" },
        }),
        tx.documentationChargeTemplate.count({ where }),
      ]);

      return paginated(items, page, limit, total);
    });
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationChargeTemplate.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: { lines: { orderBy: { sort_order: "asc" } } },
      }),
    );
    if (!template) throw new NotFoundException("Charge template not found.");
    return template;
  }

  async create(
    tenantId: string,
    dto: CreateChargeTemplateDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationChargeTemplate.create({
        data: {
          tenant_id: tenantId,
          name: dto.name,
          description: dto.description,
          job_types: dto.job_types ?? [],
          is_active: dto.is_active ?? true,
          created_by: actorId,
          updated_by: actorId,
          lines: {
            create: dto.lines.map((line, idx) => ({
              tenant_id: tenantId,
              charge_code_id: line.charge_code_id,
              description: line.description,
              sale_or_cost: line.sale_or_cost ?? "SALE",
              dr_cr: line.dr_cr ?? "Dr",
              currency_code: line.currency_code,
              default_amount: line.default_amount,
              tax_group_id: line.tax_group_id,
              sort_order: line.sort_order ?? idx,
            })),
          },
        },
        include: { lines: true },
      }),
    );
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateChargeTemplateDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (dto.lines) {
        await tx.documentationChargeTemplateLine.deleteMany({
          where: { template_id: id, tenant_id: tenantId },
        });
      }

      return tx.documentationChargeTemplate.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.job_types !== undefined ? { job_types: dto.job_types } : {}),
          ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
          updated_by: actorId,
          ...(dto.lines
            ? {
                lines: {
                  create: dto.lines.map((line, idx) => ({
                    tenant_id: tenantId,
                    charge_code_id: line.charge_code_id,
                    description: line.description,
                    sale_or_cost: line.sale_or_cost ?? "SALE",
                    dr_cr: line.dr_cr ?? "Dr",
                    currency_code: line.currency_code,
                    default_amount: line.default_amount,
                    tax_group_id: line.tax_group_id,
                    sort_order: line.sort_order ?? idx,
                  })),
                },
              }
            : {}),
        },
        include: { lines: true },
      });
    });
  }

  async remove(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationChargeTemplate.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
  }

  async apply(
    tenantId: string,
    id: string,
    dto: ApplyChargeTemplateDto,
    actorId?: string,
  ) {
    const template = await this.findOne(tenantId, id);
    const created: string[] = [];

    for (const line of template.lines) {
      if (!line.charge_code_id || line.default_amount == null) continue;
      const charge = await this.jobsService.addCharge(
        tenantId,
        dto.job_id,
        {
          charge_code_id: line.charge_code_id,
          description: line.description,
          unit_price: Number(line.default_amount),
          currency_code: line.currency_code,
          is_cost: line.sale_or_cost === "COST",
        },
        actorId,
      );
      created.push(charge.id);
    }

    return { template_id: id, job_id: dto.job_id, charge_ids: created };
  }
}
