import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateSavedReportDto,
  SavedReportQueryDto,
  UpdateSavedReportDto,
} from "./dto/financial-reports.dto";

@Injectable()
export class SavedReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    userId: string | undefined,
    query: SavedReportQueryDto,
  ) {
    const where: Prisma.SavedReportWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      OR: [{ is_shared: true }, ...(userId ? [{ created_by: userId }] : [])],
    };
    if (query.report_type) where.report_type = query.report_type;
    if (query.shared_only) {
      where.OR = undefined;
      where.is_shared = true;
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.savedReport.findMany({
        where,
        orderBy: { updated_at: "desc" },
      }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.savedReport.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!row) throw new NotFoundException("Saved report not found.");
    return row;
  }

  async create(tenantId: string, dto: CreateSavedReportDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.savedReport.create({
        data: {
          tenant_id: tenantId,
          name: dto.name,
          report_type: dto.report_type,
          description: dto.description,
          filters: (dto.filters ?? {}) as Prisma.InputJsonValue,
          company_id: dto.company_id,
          is_shared: dto.is_shared ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateSavedReportDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.savedReport.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.report_type !== undefined
            ? { report_type: dto.report_type }
            : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.filters !== undefined
            ? { filters: dto.filters as Prisma.InputJsonValue }
            : {}),
          ...(dto.company_id !== undefined
            ? { company_id: dto.company_id }
            : {}),
          ...(dto.is_shared !== undefined ? { is_shared: dto.is_shared } : {}),
          updated_by: actorId,
        },
      }),
    );
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.savedReport.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
  }
}
