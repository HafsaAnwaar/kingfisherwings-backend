import { Injectable } from "@nestjs/common";
import { JobStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { OperationsDashboardQueryDto } from "./dto/operations-dashboard.dto";

@Injectable()
export class OperationsDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(tenantId: string, query: OperationsDashboardQueryDto) {
    const from = new Date(query.from_date);
    const to = new Date(query.to_date);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const base: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        job_date: { gte: from, lte: to },
      };

      const [total, completed, inProgress] = await Promise.all([
        tx.job.count({ where: base }),
        tx.job.count({
          where: { ...base, status: JobStatus.COMPLETED },
        }),
        tx.job.count({
          where: { ...base, status: JobStatus.IN_PROGRESS },
        }),
      ]);

      return {
        success: true,
        data: {
          from_date: query.from_date,
          to_date: query.to_date,
          total_jobs: total,
          completed_jobs: completed,
          in_progress_jobs: inProgress,
          closed_job_report_path: "/operations/closed-job-report",
        },
      };
    });
  }

  async closedJobReport(tenantId: string, query: OperationsDashboardQueryDto) {
    const from = new Date(query.from_date);
    const to = new Date(query.to_date);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        status: JobStatus.COMPLETED,
        job_date: { gte: from, lte: to },
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
      };

      const [rows, total] = await Promise.all([
        tx.job.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { job_date: "desc" },
          select: {
            id: true,
            job_number: true,
            job_type: true,
            job_date: true,
            status: true,
            branch_id: true,
            department_id: true,
            salesperson_id: true,
            gp_amount: true,
          },
        }),
        tx.job.count({ where }),
      ]);

      return {
        success: true,
        data: {
          from_date: query.from_date,
          to_date: query.to_date,
          jobs: rows,
          pagination: { page, limit, total },
          download: {
            method: "POST",
            path: "/operations/closed-job-report/download",
            report_code: "CLOSED_JOB_LIST_REPORT_FORMAT",
          },
        },
      };
    });
  }
}
