import { Injectable } from "@nestjs/common";
import { JobStatus, JobType, Prisma } from "@prisma/client";
import {
  JobsDashboardQueryDto,
} from "../../common/dto/dashboard-period-query.dto";
import {
  DEFAULT_OPS_CAPACITY,
  isOpenJobDelayed,
  OPEN_JOB_STATUSES,
} from "../../common/utils/on-time.util";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JobsDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboardCounts(tenantId: string, query: JobsDashboardQueryDto) {
    const { from, to, period } = query.resolve("30d");

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const base: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(query.job_type ? { job_type: query.job_type as JobType } : {}),
      };

      const [byStatus, byType, createdInPeriod, openWithEta] = await Promise.all([
        tx.job.groupBy({
          by: ["status"],
          where: base,
          _count: { _all: true },
        }),
        tx.job.groupBy({
          by: ["job_type"],
          where: base,
          _count: { _all: true },
        }),
        tx.job.count({
          where: {
            ...base,
            created_at: { gte: from, lte: to },
          },
        }),
        tx.job.findMany({
          where: {
            ...base,
            status: { in: [...OPEN_JOB_STATUSES] as JobStatus[] },
            eta: { not: null },
          },
          select: {
            id: true,
            status: true,
            eta: true,
          },
        }),
      ]);

      const statusMap: Record<string, number> = {};
      for (const row of byStatus) {
        statusMap[row.status] = row._count._all;
      }

      const open = OPEN_JOB_STATUSES.reduce(
        (sum, s) => sum + (statusMap[s] ?? 0),
        0,
      );
      const in_progress =
        (statusMap["IN_PROGRESS"] ?? 0) +
        (statusMap["DOCS_PENDING"] ?? 0) +
        (statusMap["CUSTOMS_CLEARANCE"] ?? 0) +
        (statusMap["OPEN"] ?? 0) +
        (statusMap["APPROVED"] ?? 0) +
        (statusMap["BOOKING_CONFIRMED"] ?? 0);
      const delivered = statusMap["DELIVERED"] ?? 0;
      const completed = statusMap["COMPLETED"] ?? 0;
      const cancelled = statusMap["CANCELLED"] ?? 0;
      const on_hold = statusMap["ON_HOLD"] ?? 0;
      const delayed = openWithEta.filter((j) => isOpenJobDelayed(j)).length;

      return {
        success: true,
        data: {
          period,
          from: from.toISOString(),
          to: to.toISOString(),
          open,
          in_progress,
          on_hold,
          delayed,
          delivered,
          completed,
          cancelled,
          by_status: statusMap,
          by_job_type: Object.fromEntries(
            byType.map((r) => [r.job_type, r._count._all]),
          ),
          created_in_period: createdInPeriod,
        },
      };
    });
  }

  async teamWorkload(tenantId: string, query: JobsDashboardQueryDto) {
    const { from, to, period } = query.resolve("30d");
    const capacity = DEFAULT_OPS_CAPACITY;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const jobWhere: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        status: { in: [...OPEN_JOB_STATUSES] as JobStatus[] },
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(query.job_type ? { job_type: query.job_type as JobType } : {}),
      };

      const openJobs = await tx.job.findMany({
        where: jobWhere,
        select: {
          id: true,
          ops_user_id: true,
          salesperson_id: true,
        },
      });

      const openByUser = new Map<string, number>();
      for (const job of openJobs) {
        const key = job.ops_user_id ?? "unassigned";
        openByUser.set(key, (openByUser.get(key) ?? 0) + 1);
      }

      const milestones = await tx.jobMilestone.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          planned_date: { gte: from, lte: to },
          job: {
            deleted_at: null,
            ...(query.branch_id ? { branch_id: query.branch_id } : {}),
            ...(query.job_type ? { job_type: query.job_type as JobType } : {}),
          },
        },
        select: {
          planned_date: true,
          actual_date: true,
          job: {
            select: { ops_user_id: true, salesperson_id: true },
          },
        },
      });

      type SlaAgg = {
        due: number;
        onTime: number;
        overdue: number;
      };
      const slaByUser = new Map<string, SlaAgg>();
      const now = new Date();

      for (const m of milestones) {
        const key =
          m.job.ops_user_id ?? m.job.salesperson_id ?? "unassigned";
        const agg = slaByUser.get(key) ?? { due: 0, onTime: 0, overdue: 0 };
        const planned = m.planned_date ? new Date(m.planned_date) : null;
        if (!planned) continue;

        if (m.actual_date) {
          agg.due += 1;
          if (new Date(m.actual_date).getTime() <= planned.getTime()) {
            agg.onTime += 1;
          } else {
            agg.overdue += 1;
          }
        } else if (planned.getTime() < now.getTime()) {
          agg.due += 1;
          agg.overdue += 1;
        } else {
          // future planned — not yet in SLA denominator
        }
        slaByUser.set(key, agg);
      }

      const userIds = [
        ...new Set(
          [...openByUser.keys(), ...slaByUser.keys()].filter(
            (id) => id !== "unassigned",
          ),
        ),
      ];

      const users = userIds.length
        ? await tx.user.findMany({
            where: { tenant_id: tenantId, id: { in: userIds } },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          })
        : [];
      const nameById = new Map(
        users.map((u) => [
          u.id,
          [u.first_name, u.last_name].filter(Boolean).join(" ") ||
            u.email ||
            u.id,
        ]),
      );

      const allKeys = new Set([
        ...openByUser.keys(),
        ...slaByUser.keys(),
      ]);

      const rows = [...allKeys].map((userId) => {
        const open = openByUser.get(userId) ?? 0;
        const sla = slaByUser.get(userId) ?? {
          due: 0,
          onTime: 0,
          overdue: 0,
        };
        const slaDenom = sla.onTime + sla.overdue;
        return {
          user_id: userId === "unassigned" ? null : userId,
          name:
            userId === "unassigned"
              ? "Unassigned"
              : (nameById.get(userId) ?? userId),
          open_jobs: open,
          capacity,
          utilization_pct:
            capacity > 0
              ? Math.round((open / capacity) * 10000) / 100
              : null,
          sla_percent:
            slaDenom > 0
              ? Math.round((sla.onTime / slaDenom) * 10000) / 100
              : null,
          milestones_due: sla.due,
          milestones_on_time: sla.onTime,
          overdue_milestones: sla.overdue,
        };
      });

      rows.sort((a, b) => b.open_jobs - a.open_jobs);

      const totals = {
        open_jobs: rows.reduce((s, r) => s + r.open_jobs, 0),
        milestones_due: rows.reduce((s, r) => s + r.milestones_due, 0),
        milestones_on_time: rows.reduce(
          (s, r) => s + r.milestones_on_time,
          0,
        ),
        overdue_milestones: rows.reduce(
          (s, r) => s + r.overdue_milestones,
          0,
        ),
      };
      const slaDenom = totals.milestones_on_time + totals.overdue_milestones;

      return {
        success: true,
        data: {
          period,
          from: from.toISOString(),
          to: to.toISOString(),
          capacity_default: capacity,
          users: rows,
          totals: {
            ...totals,
            sla_percent:
              slaDenom > 0
                ? Math.round(
                    (totals.milestones_on_time / slaDenom) * 10000,
                  ) / 100
                : null,
          },
        },
      };
    });
  }

  async listOnHoldWithDocs(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const jobs = await tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: JobStatus.ON_HOLD,
        },
        orderBy: { held_at: "desc" },
        select: {
          id: true,
          job_number: true,
          job_type: true,
          status: true,
          status_code: true,
          hold_reason: true,
          held_at: true,
          expected_release_at: true,
          resume_reason: true,
          resumed_at: true,
          commodity: true,
          eta: true,
          etd: true,
          shipper_id: true,
          consignee_id: true,
          billing_party_id: true,
          created_at: true,
          updated_at: true,
          documents: {
            where: {
              deleted_at: null,
              visible_to_customer: true,
            },
            orderBy: { created_at: "desc" },
            select: {
              id: true,
              document_type: true,
              file_name: true,
              reference_number: true,
              visible_to_customer: true,
              downloadable_by_customer: true,
              created_at: true,
            },
          },
        },
      });

      return {
        success: true,
        data: jobs.map((job) => ({
          id: job.id,
          job_number: job.job_number,
          job_type: job.job_type,
          status: job.status,
          status_code: job.status_code,
          hold_reason: job.hold_reason,
          held_at: job.held_at,
          expected_release_at: job.expected_release_at,
          resume_reason: job.resume_reason,
          resumed_at: job.resumed_at,
          commodity: job.commodity,
          eta: job.eta,
          etd: job.etd,
          shipper_id: job.shipper_id,
          consignee_id: job.consignee_id,
          billing_party_id: job.billing_party_id,
          created_at: job.created_at,
          updated_at: job.updated_at,
          customer_visible_documents: job.documents.map((d) => ({
            id: d.id,
            document_type: d.document_type,
            file_name: d.file_name,
            reference_number: d.reference_number,
            downloadable_by_customer: d.downloadable_by_customer,
            created_at: d.created_at,
          })),
          customer_visible_document_count: job.documents.length,
        })),
      };
    });
  }

  async pendingQuotations(tenantId: string) {
    const PENDING: string[] = [
      "DRAFT",
      "SUBMITTED",
      "INTERNALLY_APPROVED",
      "SENT",
      "NEGOTIATING",
      "CUSTOMER_REVIEW",
      "VERIFIED",
    ];

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const rows = await tx.quotation.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: { in: PENDING as never },
        },
        orderBy: { updated_at: "desc" },
        select: {
          id: true,
          quotation_number: true,
          status: true,
          status_code: true,
          job_type: true,
          customer_id: true,
          valid_until: true,
          revenue_total: true,
          currency_code: true,
          converted_job_id: true,
          created_at: true,
          updated_at: true,
        },
      });

      return {
        success: true,
        data: rows,
        meta: { total: rows.length },
      };
    });
  }
}
