import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobStatus, JobStatusCategory, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  DEFAULT_JOB_STATUS_CATALOG,
  DEFAULT_REOPEN_STATUS,
  SYSTEM_JOB_STATUSES,
} from "./constants/job-status-catalog.defaults";
import {
  CreateStatusCatalogDto,
  UpdateStatusCatalogDto,
} from "./dto/status-catalog.dto";

@Injectable()
export class JobStatusCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureCatalog(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const count = await tx.jobStatusCatalog.count({
        where: { tenant_id: tenantId },
      });
      if (count > 0) {
        const rows = await tx.jobStatusCatalog.findMany({
          where: { tenant_id: tenantId },
        });
        for (const row of rows) {
          if (!row.maps_to_system_status) {
            await tx.jobStatusCatalog.update({
              where: { id: row.id },
              data: {
                maps_to_system_status: row.code,
                is_system: SYSTEM_JOB_STATUSES.includes(row.code),
                is_custom: !SYSTEM_JOB_STATUSES.includes(row.code),
              },
            });
          }
        }
        return;
      }
      await tx.jobStatusCatalog.createMany({
        data: DEFAULT_JOB_STATUS_CATALOG.map((row) => ({
          tenant_id: tenantId,
          ...row,
        })),
      });
    });
  }

  async listOptions(tenantId: string, jobId?: string) {
    await this.ensureCatalog(tenantId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobStatusCatalog.findMany({
        where: { tenant_id: tenantId, is_active: true },
        orderBy: { sort_order: "asc" },
      }),
    );

    let current: JobStatus | null = null;
    let currentCode: string | null = null;
    if (jobId) {
      const job = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.findFirst({
          where: { id: jobId, tenant_id: tenantId, deleted_at: null },
          select: { status: true, status_code: true },
        }),
      );
      current = job?.status ?? null;
      currentCode = job?.status_code ?? job?.status ?? null;
    }

    const currentMeta = currentCode
      ? rows.find((r) => r.code === currentCode) ??
        rows.find((r) => r.code === current) ??
        null
      : null;

    return {
      success: true,
      data: {
        options: rows.map((r) => ({
          code: r.code,
          label: r.label,
          category: r.category,
          is_terminal: r.is_terminal,
          is_open: !r.is_terminal,
          maps_to_system_status: r.maps_to_system_status,
          is_system: r.is_system,
          is_custom: r.is_custom,
        })),
        current: current
          ? {
              code: currentCode ?? current,
              system_status: current,
              label: currentMeta?.label ?? currentCode ?? current,
              is_terminal: currentMeta?.is_terminal ?? false,
            }
          : null,
        default_reopen_status: DEFAULT_REOPEN_STATUS,
        actions: {
          reopen: "POST /jobs/:id/reopen",
          change_status: "POST /jobs/:id/change-status",
          close: "POST /jobs/:id/close",
          create_custom: "POST /jobs/status-catalog",
        },
      },
    };
  }

  async createCustom(tenantId: string, dto: CreateStatusCatalogDto) {
    await this.ensureCatalog(tenantId);
    if (!SYSTEM_JOB_STATUSES.includes(dto.maps_to_system_status)) {
      throw new BadRequestException(
        `maps_to_system_status must be one of: ${SYSTEM_JOB_STATUSES.join(", ")}`,
      );
    }
    const code = dto.code.trim().toUpperCase();
    if (SYSTEM_JOB_STATUSES.includes(code)) {
      throw new BadRequestException(
        "Cannot create a custom status that shadows a system status code.",
      );
    }

    try {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobStatusCatalog.create({
          data: {
            tenant_id: tenantId,
            code,
            label: dto.label.trim(),
            category: JobStatusCategory.OPERATIONAL,
            is_terminal: dto.is_terminal ?? false,
            sort_order: dto.sort_order ?? 200,
            maps_to_system_status: dto.maps_to_system_status,
            is_system: false,
            is_custom: true,
            is_active: true,
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
    await this.ensureCatalog(tenantId);
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobStatusCatalog.findFirst({
        where: { id, tenant_id: tenantId },
      }),
    );
    if (!existing) throw new NotFoundException("Status catalog row not found.");
    if (existing.is_system) {
      // Allow label/sort/active tweaks on system rows; not maps_to/code.
      if (dto.maps_to_system_status && dto.maps_to_system_status !== existing.maps_to_system_status) {
        throw new BadRequestException("Cannot change maps_to on a system status.");
      }
    } else if (
      dto.maps_to_system_status &&
      !SYSTEM_JOB_STATUSES.includes(dto.maps_to_system_status)
    ) {
      throw new BadRequestException(
        `maps_to_system_status must be one of: ${SYSTEM_JOB_STATUSES.join(", ")}`,
      );
    }

    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobStatusCatalog.update({
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

  async resolveCode(
    tenantId: string,
    code: string,
  ): Promise<{ code: string; systemStatus: JobStatus; is_terminal: boolean }> {
    await this.ensureCatalog(tenantId);
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobStatusCatalog.findFirst({
        where: { tenant_id: tenantId, code, is_active: true },
      }),
    );
    if (!row) {
      throw new BadRequestException(
        `Status ${code} is not in the tenant job status catalog.`,
      );
    }
    const systemStatus = row.maps_to_system_status as JobStatus;
    if (!SYSTEM_JOB_STATUSES.includes(systemStatus)) {
      throw new BadRequestException(
        `Catalog row ${code} maps to invalid system status ${row.maps_to_system_status}.`,
      );
    }
    return {
      code: row.code,
      systemStatus,
      is_terminal: row.is_terminal,
    };
  }

  async assertActiveCode(tenantId: string, code: string) {
    return this.resolveCode(tenantId, code);
  }

  isTerminalFromCatalog(
    rows: { code: string; is_terminal: boolean }[],
    status: JobStatus,
  ): boolean {
    const hit = rows.find((r) => r.code === status);
    if (hit) return hit.is_terminal;
    return status === "COMPLETED" || status === "CANCELLED";
  }

  async terminalSet(tenantId: string): Promise<Set<string>> {
    await this.ensureCatalog(tenantId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobStatusCatalog.findMany({
        where: { tenant_id: tenantId, is_active: true, is_terminal: true },
        select: { code: true },
      }),
    );
    return new Set(rows.map((r) => r.code));
  }
}
