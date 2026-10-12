import { BadRequestException, Injectable } from "@nestjs/common";
import { JobStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  DEFAULT_JOB_STATUS_CATALOG,
  DEFAULT_REOPEN_STATUS,
} from "./constants/job-status-catalog.defaults";

@Injectable()
export class JobStatusCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureCatalog(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const count = await tx.jobStatusCatalog.count({
        where: { tenant_id: tenantId },
      });
      if (count > 0) return;
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
    if (jobId) {
      const job = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.findFirst({
          where: { id: jobId, tenant_id: tenantId, deleted_at: null },
          select: { status: true },
        }),
      );
      current = job?.status ?? null;
    }

    const currentMeta = current
      ? rows.find((r) => r.code === current) ?? null
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
        })),
        current: current
          ? {
              code: current,
              label: currentMeta?.label ?? current,
              is_terminal: currentMeta?.is_terminal ?? false,
            }
          : null,
        default_reopen_status: DEFAULT_REOPEN_STATUS,
        actions: {
          reopen: "POST /jobs/:id/reopen",
          change_status: "POST /jobs/:id/change-status",
          close: "POST /jobs/:id/close",
        },
      },
    };
  }

  async assertActiveCode(tenantId: string, code: string) {
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
    return row;
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
