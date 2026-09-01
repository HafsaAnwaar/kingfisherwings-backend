import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export class JobExportQueryDto {
  job_ids!: string[];
}

@Injectable()
export class DocumentationJobTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async exportJobs(tenantId: string, jobIds: string[]) {
    const jobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: { tenant_id: tenantId, id: { in: jobIds }, deleted_at: null },
        include: {
          charges: { where: { deleted_at: null } },
          air_details: true,
          sea_fcl_details: {
            include: { containers: { where: { deleted_at: null } } },
          },
          sea_lcl_details: true,
        },
      }),
    );

    if (!jobs.length) throw new NotFoundException("No jobs found for export.");

    return {
      exported_at: new Date().toISOString(),
      job_count: jobs.length,
      jobs,
    };
  }

  async importJobs(
    tenantId: string,
    bundle: { jobs?: unknown[] },
    actorId?: string,
  ) {
    const rows = Array.isArray(bundle.jobs) ? bundle.jobs : [];
    const imported: string[] = [];

    for (const raw of rows) {
      const row = raw as Record<string, unknown>;
      if (!row.job_number || typeof row.job_number !== "string") continue;

      const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.findFirst({
          where: {
            tenant_id: tenantId,
            job_number: row.job_number as string,
            deleted_at: null,
          },
        }),
      );
      if (existing) continue;

      const created = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.create({
          data: {
            tenant_id: tenantId,
            job_number: `${row.job_number}-IMP`,
            job_type: (row.job_type as never) ?? "SEA_FCL_EXPORT",
            status: "ENQUIRY",
            commodity:
              typeof row.commodity === "string" ? row.commodity : undefined,
            notes: "Imported via documentation job transfer",
            created_by: actorId,
            updated_by: actorId,
          },
        }),
      );
      imported.push(created.id);
    }

    return { imported_count: imported.length, imported_job_ids: imported };
  }
}
