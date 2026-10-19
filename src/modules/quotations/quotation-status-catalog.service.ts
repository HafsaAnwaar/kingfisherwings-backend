import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, QuotationStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  DEFAULT_QUOTATION_STATUS_CATALOG,
  SYSTEM_QUOTATION_STATUSES,
} from "../jobs/constants/job-status-catalog.defaults";
import {
  CreateStatusCatalogDto,
  UpdateStatusCatalogDto,
} from "../jobs/dto/status-catalog.dto";

@Injectable()
export class QuotationStatusCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureCatalog(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const count = await tx.quotationStatusCatalog.count({
        where: { tenant_id: tenantId },
      });
      if (count > 0) return;
      await tx.quotationStatusCatalog.createMany({
        data: DEFAULT_QUOTATION_STATUS_CATALOG.map((row) => ({
          tenant_id: tenantId,
          ...row,
        })),
      });
    });
  }

  async listOptions(tenantId: string, quotationId?: string) {
    await this.ensureCatalog(tenantId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotationStatusCatalog.findMany({
        where: { tenant_id: tenantId, is_active: true },
        orderBy: { sort_order: "asc" },
      }),
    );

    let current: QuotationStatus | null = null;
    let currentCode: string | null = null;
    if (quotationId) {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.quotation.findFirst({
          where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
          select: { status: true, status_code: true },
        }),
      );
      current = row?.status ?? null;
      currentCode = row?.status_code ?? row?.status ?? null;
    }

    const currentMeta = currentCode
      ? rows.find((r) => r.code === currentCode) ?? null
      : null;

    return {
      success: true,
      data: {
        options: rows.map((r) => ({
          code: r.code,
          label: r.label,
          is_terminal: r.is_terminal,
          maps_to_system_status: r.maps_to_system_status,
          is_system: r.is_system,
          is_custom: r.is_custom,
        })),
        current: current
          ? {
              code: currentCode ?? current,
              system_status: current,
              label: currentMeta?.label ?? currentCode ?? current,
            }
          : null,
        actions: {
          change_status: "POST /quotations/:id/change-status",
          create_custom: "POST /quotations/status-catalog",
        },
      },
    };
  }

  async createCustom(tenantId: string, dto: CreateStatusCatalogDto) {
    await this.ensureCatalog(tenantId);
    if (!SYSTEM_QUOTATION_STATUSES.includes(dto.maps_to_system_status as never)) {
      throw new BadRequestException(
        `maps_to_system_status must be one of: ${SYSTEM_QUOTATION_STATUSES.join(", ")}`,
      );
    }
    const code = dto.code.trim().toUpperCase();
    if (SYSTEM_QUOTATION_STATUSES.includes(code as never)) {
      throw new BadRequestException(
        "Cannot create a custom status that shadows a system status code.",
      );
    }
    try {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.quotationStatusCatalog.create({
          data: {
            tenant_id: tenantId,
            code,
            label: dto.label.trim(),
            is_terminal: dto.is_terminal ?? false,
            sort_order: dto.sort_order ?? 200,
            maps_to_system_status: dto.maps_to_system_status,
            is_system: false,
            is_custom: true,
          },
        }),
      );
      return { success: true, data: row };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException(`Status code ${code} already exists.`);
      }
      throw err;
    }
  }

  async updateCustom(
    tenantId: string,
    id: string,
    dto: UpdateStatusCatalogDto,
  ) {
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotationStatusCatalog.findFirst({
        where: { id, tenant_id: tenantId },
      }),
    );
    if (!existing) throw new NotFoundException("Status catalog row not found.");
    if (
      dto.maps_to_system_status &&
      existing.is_system &&
      dto.maps_to_system_status !== existing.maps_to_system_status
    ) {
      throw new BadRequestException("Cannot change maps_to on a system status.");
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotationStatusCatalog.update({
        where: { id },
        data: {
          ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
          ...(dto.maps_to_system_status !== undefined && !existing.is_system
            ? { maps_to_system_status: dto.maps_to_system_status }
            : {}),
          ...(dto.is_terminal !== undefined
            ? { is_terminal: dto.is_terminal }
            : {}),
          ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
          ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
        },
      }),
    );
    return { success: true, data: updated };
  }

  async deactivate(tenantId: string, id: string) {
    return this.updateCustom(tenantId, id, { is_active: false });
  }

  async resolveCode(tenantId: string, code: string) {
    await this.ensureCatalog(tenantId);
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotationStatusCatalog.findFirst({
        where: { tenant_id: tenantId, code, is_active: true },
      }),
    );
    if (!row) {
      throw new BadRequestException(
        `Status ${code} is not in the tenant quotation status catalog.`,
      );
    }
    return {
      code: row.code,
      systemStatus: row.maps_to_system_status as QuotationStatus,
    };
  }
}
