import { Injectable } from "@nestjs/common";
import { JobStatus, JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  ExceptionsQueryDto,
  JobFinanceReportQueryDto,
  JobListSummaryQueryDto,
  JobNotInvoicedDoQueryDto,
  KpiStatusQueryDto,
  VoyageJobsShipmentsQueryDto,
} from "../operations/dto/operations-fresa-reports.dto";

const SALE_UNINVOICED: Prisma.JobChargeWhereInput = {
  deleted_at: null,
  is_cost: false,
  is_billable: true,
  is_provisional: false,
  is_invoiced: false,
};

@Injectable()
export class OperationsFresaReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async jobNotInvoicedDo(tenantId: string, query: JobNotInvoicedDoQueryDto) {
    const from = new Date(query.from_date);
    const to = new Date(query.to_date);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const dateBasis = query.date_basis ?? "do_issued";

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const candidates = await tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...(query.branch_id ? { branch_id: query.branch_id } : {}),
          ...(query.job_type ? { job_type: query.job_type } : {}),
          charges: { some: SALE_UNINVOICED },
          OR: [
            { air_details: { delivery_order_issued_at: { not: null } } },
            { nvocc_details: { do_issued_at: { not: null } } },
            {
              milestones: {
                some: {
                  deleted_at: null,
                  milestone: "DO_ISSUED",
                  actual_date: { not: null },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          job_number: true,
          job_type: true,
          job_date: true,
          status: true,
          branch_id: true,
          salesperson_id: true,
          air_details: { select: { delivery_order_issued_at: true } },
          nvocc_details: { select: { do_issued_at: true } },
          milestones: {
            where: {
              deleted_at: null,
              milestone: "DO_ISSUED",
              actual_date: { not: null },
            },
            select: { actual_date: true },
            take: 1,
            orderBy: { actual_date: "asc" },
          },
          charges: {
            where: SALE_UNINVOICED,
            select: {
              amount_base_currency: true,
              sale_amount: true,
              amount: true,
            },
          },
        },
        take: 2000,
      });

      const jobIds = candidates.map((j) => j.id);
      const docs =
        jobIds.length === 0
          ? []
          : await tx.documentationDeliveryOrder.findMany({
              where: {
                tenant_id: tenantId,
                deleted_at: null,
                job_id: { in: jobIds },
                do_status: "ISSUED",
              },
              select: { job_id: true, do_date: true, created_at: true },
            });
      const docDoByJob = new Map<string, Date>();
      for (const d of docs) {
        const at = d.do_date ?? d.created_at;
        const prev = docDoByJob.get(d.job_id);
        if (!prev || at < prev) docDoByJob.set(d.job_id, at);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const rows = candidates
        .map((j) => {
          const doIssuedAt =
            j.air_details?.delivery_order_issued_at ??
            j.nvocc_details?.do_issued_at ??
            j.milestones[0]?.actual_date ??
            docDoByJob.get(j.id) ??
            null;
          if (!doIssuedAt && !docDoByJob.has(j.id)) {
            // still include if milestone/air/nvocc set; else skip unless doc
            if (
              !j.air_details?.delivery_order_issued_at &&
              !j.nvocc_details?.do_issued_at &&
              !j.milestones.length &&
              !docDoByJob.has(j.id)
            ) {
              return null;
            }
          }
          const issued = doIssuedAt ?? docDoByJob.get(j.id)!;
          const filterDate = dateBasis === "job_date" ? j.job_date : issued;
          if (!filterDate || filterDate < from || filterDate > to) return null;

          const uninvoiced = j.charges.reduce((sum, c) => {
            const amt =
              c.sale_amount != null
                ? Number(c.sale_amount)
                : Number(c.amount_base_currency ?? c.amount ?? 0);
            return sum + amt;
          }, 0);
          const agingDays = Math.max(
            0,
            Math.floor(
              (today.getTime() - new Date(issued).getTime()) /
                (24 * 60 * 60 * 1000),
            ),
          );
          return {
            job_id: j.id,
            job_number: j.job_number,
            job_type: j.job_type,
            status: j.status,
            job_date: j.job_date,
            branch_id: j.branch_id,
            salesperson_id: j.salesperson_id,
            do_issued_at: issued,
            uninvoiced_amount: Math.round(uninvoiced * 100) / 100,
            uninvoiced_charge_count: j.charges.length,
            aging_days_since_do: agingDays,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r != null)
        .sort(
          (a, b) =>
            new Date(b.do_issued_at).getTime() -
            new Date(a.do_issued_at).getTime(),
        );

      const total = rows.length;
      const pageRows = rows.slice((page - 1) * limit, page * limit);
      const uninvoicedTotal = rows.reduce(
        (s, r) => s + r.uninvoiced_amount,
        0,
      );

      return {
        success: true,
        data: {
          from_date: query.from_date,
          to_date: query.to_date,
          date_basis: dateBasis,
          jobs: pageRows,
          totals: {
            jobs: total,
            uninvoiced_amount: Math.round(uninvoicedTotal * 100) / 100,
          },
          pagination: { page, limit, total },
          download: {
            method: "POST",
            path: "/operations/job-not-invoiced-do/download",
            report_code: "AR_JOB_NOT_INVOICE_REPORT_FORMAT",
          },
        },
      };
    });
  }

  /** Flat rows for report pack (no pagination). */
  async jobNotInvoicedDoRows(
    tenantId: string,
    params: Record<string, unknown>,
  ) {
    const res = await this.jobNotInvoicedDo(tenantId, {
      from_date: String(params.from_date ?? new Date().toISOString()),
      to_date: String(params.to_date ?? new Date().toISOString()),
      branch_id: params.branch_id ? String(params.branch_id) : undefined,
      job_type: params.job_type as JobType | undefined,
      date_basis:
        params.date_basis === "job_date" ? "job_date" : "do_issued",
      page: 1,
      limit: 2000,
    });
    return res.data.jobs.map((j) => ({
      job_number: j.job_number,
      job_type: j.job_type,
      status: j.status,
      job_date: j.job_date?.toISOString?.() ?? j.job_date,
      do_issued_at:
        j.do_issued_at instanceof Date
          ? j.do_issued_at.toISOString()
          : j.do_issued_at,
      uninvoiced_amount: j.uninvoiced_amount,
      aging_days_since_do: j.aging_days_since_do,
    }));
  }

  async jobFinanceReport(tenantId: string, query: JobFinanceReportQueryDto) {
    const from = new Date(query.from_date);
    const to = new Date(query.to_date);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const dateBasis = query.date_basis ?? "shipment_date";
    const groupBy = query.group_by ?? "none";

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const jobs = await tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...(query.branch_id ? { branch_id: query.branch_id } : {}),
          ...(query.job_type ? { job_type: query.job_type } : {}),
        },
        select: {
          id: true,
          job_number: true,
          job_type: true,
          job_date: true,
          status: true,
          branch_id: true,
          salesperson_id: true,
          revenue_total: true,
          cost_total: true,
          gp_amount: true,
          gp_percent: true,
          shipments: {
            where: { deleted_at: null },
            select: {
              shipment_number: true,
              shipment_date: true,
            },
          },
          charges: {
            where: { deleted_at: null, is_provisional: false },
            select: {
              is_cost: true,
              is_billable: true,
              is_invoiced: true,
              amount_base_currency: true,
              sale_amount: true,
              amount: true,
            },
          },
        },
        take: 3000,
      });

      const rows = jobs
        .map((j) => {
          const shipmentDates = j.shipments
            .map((s) => s.shipment_date)
            .filter((d): d is Date => d != null);
          const minShipDate =
            shipmentDates.length > 0
              ? new Date(Math.min(...shipmentDates.map((d) => d.getTime())))
              : null;
          const effectiveDate =
            dateBasis === "shipment_date"
              ? (minShipDate ?? j.job_date)
              : j.job_date;
          if (!effectiveDate || effectiveDate < from || effectiveDate > to) {
            return null;
          }

          let revenue = 0;
          let cost = 0;
          let uninvoicedSale = 0;
          for (const c of j.charges) {
            const amt =
              c.sale_amount != null && !c.is_cost
                ? Number(c.sale_amount)
                : Number(c.amount_base_currency ?? c.amount ?? 0);
            if (c.is_cost) cost += amt;
            else if (c.is_billable) {
              revenue += amt;
              if (!c.is_invoiced) uninvoicedSale += amt;
            }
          }
          const gp = revenue - cost;
          const gpPct = revenue > 0 ? (gp / revenue) * 100 : 0;

          return {
            job_id: j.id,
            job_number: j.job_number,
            job_type: j.job_type,
            status: j.status,
            job_date: j.job_date,
            shipment_date: minShipDate,
            effective_date: effectiveDate,
            shipment_numbers: j.shipments.map((s) => s.shipment_number),
            branch_id: j.branch_id,
            salesperson_id: j.salesperson_id,
            revenue: Math.round(revenue * 100) / 100,
            cost: Math.round(cost * 100) / 100,
            gp: Math.round(gp * 100) / 100,
            gp_percent: Math.round(gpPct * 100) / 100,
            uninvoiced_sale: Math.round(uninvoicedSale * 100) / 100,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r != null)
        .sort(
          (a, b) =>
            new Date(b.effective_date).getTime() -
            new Date(a.effective_date).getTime(),
        );

      const totals = rows.reduce(
        (acc, r) => {
          acc.revenue += r.revenue;
          acc.cost += r.cost;
          acc.gp += r.gp;
          acc.uninvoiced_sale += r.uninvoiced_sale;
          return acc;
        },
        { revenue: 0, cost: 0, gp: 0, uninvoiced_sale: 0, jobs: rows.length },
      );

      let groups: Array<{
        key: string;
        jobs: number;
        revenue: number;
        cost: number;
        gp: number;
      }> | null = null;
      if (groupBy !== "none") {
        const map = new Map<
          string,
          { jobs: number; revenue: number; cost: number; gp: number }
        >();
        for (const r of rows) {
          const key =
            groupBy === "branch"
              ? (r.branch_id ?? "none")
              : groupBy === "salesperson"
                ? (r.salesperson_id ?? "none")
                : r.job_type;
          const g = map.get(key) ?? {
            jobs: 0,
            revenue: 0,
            cost: 0,
            gp: 0,
          };
          g.jobs += 1;
          g.revenue += r.revenue;
          g.cost += r.cost;
          g.gp += r.gp;
          map.set(key, g);
        }
        groups = [...map.entries()].map(([key, g]) => ({ key, ...g }));
      }

      const total = rows.length;
      const pageRows = rows.slice((page - 1) * limit, page * limit);

      return {
        success: true,
        data: {
          from_date: query.from_date,
          to_date: query.to_date,
          date_basis: dateBasis,
          group_by: groupBy,
          jobs: pageRows,
          groups,
          totals: {
            jobs: totals.jobs,
            revenue: Math.round(totals.revenue * 100) / 100,
            cost: Math.round(totals.cost * 100) / 100,
            gp: Math.round(totals.gp * 100) / 100,
            gp_percent:
              totals.revenue > 0
                ? Math.round((totals.gp / totals.revenue) * 10000) / 100
                : 0,
            uninvoiced_sale: Math.round(totals.uninvoiced_sale * 100) / 100,
          },
          pagination: { page, limit, total },
          download: {
            method: "POST",
            path: "/operations/job-finance-report/download",
            report_code: "JOB_FINANCE_BY_SHIPMENT_DATE_REPORT_FORMAT",
          },
        },
      };
    });
  }

  async jobFinanceRows(tenantId: string, params: Record<string, unknown>) {
    const res = await this.jobFinanceReport(tenantId, {
      from_date: String(params.from_date ?? new Date().toISOString()),
      to_date: String(params.to_date ?? new Date().toISOString()),
      branch_id: params.branch_id ? String(params.branch_id) : undefined,
      job_type: params.job_type as JobType | undefined,
      date_basis:
        params.date_basis === "job_date" ? "job_date" : "shipment_date",
      group_by: "none",
      page: 1,
      limit: 2000,
    });
    return res.data.jobs.map((j) => ({
      job_number: j.job_number,
      job_type: j.job_type,
      shipment_numbers: (j.shipment_numbers ?? []).join(", "),
      shipment_date:
        j.shipment_date instanceof Date
          ? j.shipment_date.toISOString().slice(0, 10)
          : j.shipment_date,
      job_date:
        j.job_date instanceof Date
          ? j.job_date.toISOString().slice(0, 10)
          : j.job_date,
      revenue: j.revenue,
      cost: j.cost,
      gp: j.gp,
      gp_percent: j.gp_percent,
      uninvoiced_sale: j.uninvoiced_sale,
    }));
  }

  async voyageJobsShipments(
    tenantId: string,
    query: VoyageJobsShipmentsQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const v = query.voyage_number.trim();

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const voyageFilter = {
        contains: v,
        mode: "insensitive" as const,
      };
      const [jobs, shipments] = await Promise.all([
        tx.job.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            OR: [
              { sea_fcl_details: { voyage_number: voyageFilter } },
              { sea_lcl_details: { voyage_number: voyageFilter } },
            ],
          },
          select: {
            id: true,
            job_number: true,
            job_type: true,
            status: true,
            sea_fcl_details: { select: { voyage_number: true } },
            sea_lcl_details: { select: { voyage_number: true } },
          },
          take: 500,
        }),
        tx.shipment.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            voyage_number: voyageFilter,
            ...(query.vessel_name
              ? {
                  vessel_name: {
                    contains: query.vessel_name,
                    mode: "insensitive",
                  },
                }
              : {}),
          },
          select: {
            id: true,
            shipment_number: true,
            status: true,
            voyage_number: true,
            vessel_name: true,
            job_id: true,
          },
          take: 500,
        }),
      ]);

      const combined = [
        ...jobs.map((j) => ({
          kind: "JOB" as const,
          id: j.id,
          number: j.job_number,
          status: j.status,
          job_type: j.job_type,
          voyage_number:
            j.sea_fcl_details?.voyage_number ??
            j.sea_lcl_details?.voyage_number ??
            null,
          vessel_name: null as string | null,
          job_id: j.id,
        })),
        ...shipments.map((s) => ({
          kind: "SHIPMENT" as const,
          id: s.id,
          number: s.shipment_number,
          status: s.status,
          job_type: null as JobType | null,
          voyage_number: s.voyage_number,
          vessel_name: s.vessel_name,
          job_id: s.job_id,
        })),
      ];
      const total = combined.length;
      const rows = combined.slice((page - 1) * limit, page * limit);
      return {
        success: true,
        data: {
          voyage_number: v,
          rows,
          pagination: { page, limit, total },
        },
      };
    });
  }

  async exceptions(tenantId: string, query: ExceptionsQueryDto) {
    const from = new Date(query.from_date);
    const to = new Date(query.to_date);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const grace = query.eta_grace_days ?? 7;
    const wanted = new Set(
      (query.rules ??
        "do_uninvoiced,atd_no_bl,ata_missing,atd_no_loading,not_closed_past_eta")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const jobs = await tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...(query.branch_id ? { branch_id: query.branch_id } : {}),
          ...(query.job_type ? { job_type: query.job_type } : {}),
          OR: [
            { job_date: { gte: from, lte: to } },
            { etd: { gte: from, lte: to } },
            { eta: { gte: from, lte: to } },
            {
              sea_fcl_details: {
                sailed_at: { gte: from, lte: to },
              },
            },
            {
              sea_lcl_details: {
                sailed_at: { gte: from, lte: to },
              },
            },
          ],
        },
        include: {
          air_details: { select: { delivery_order_issued_at: true } },
          nvocc_details: { select: { do_issued_at: true } },
          sea_fcl_details: {
            select: { sailed_at: true, actual_eta: true },
          },
          sea_lcl_details: {
            select: { sailed_at: true, actual_eta: true },
          },
          bills_of_lading: {
            where: { deleted_at: null },
            select: {
              is_draft: true,
              is_original: true,
              finalized_at: true,
            },
            take: 5,
          },
          milestones: {
            where: { deleted_at: null },
            select: { milestone: true, actual_date: true },
          },
          containers_job: {
            where: { deleted_at: null },
            select: { gate_in_at: true },
            take: 5,
          },
          charges: {
            where: SALE_UNINVOICED,
            select: { id: true },
            take: 1,
          },
        },
        take: 2000,
      });

      const now = new Date();
      const findings: Array<{
        job_id: string;
        job_number: string;
        job_type: JobType;
        status: JobStatus;
        rule: string;
        detail: string;
      }> = [];

      for (const j of jobs) {
        const doIssued =
          j.air_details?.delivery_order_issued_at ||
          j.nvocc_details?.do_issued_at ||
          j.milestones.some(
            (m) => m.milestone === "DO_ISSUED" && m.actual_date,
          );
        if (
          wanted.has("do_uninvoiced") &&
          doIssued &&
          j.charges.length > 0
        ) {
          findings.push({
            job_id: j.id,
            job_number: j.job_number,
            job_type: j.job_type,
            status: j.status,
            rule: "do_uninvoiced",
            detail: "DO issued with uninvoiced sale charges",
          });
        }

        const atd =
          j.sea_fcl_details?.sailed_at ??
          j.sea_lcl_details?.sailed_at ??
          j.milestones.find((m) => m.milestone === "ATD" && m.actual_date)
            ?.actual_date ??
          null;
        const blIssued = j.bills_of_lading.some(
          (b) => b.finalized_at || (b.is_original && !b.is_draft),
        );
        if (wanted.has("atd_no_bl") && atd && !blIssued) {
          findings.push({
            job_id: j.id,
            job_number: j.job_number,
            job_type: j.job_type,
            status: j.status,
            rule: "atd_no_bl",
            detail: "ATD set but BL not issued",
          });
        }

        const ata =
          j.sea_fcl_details?.actual_eta ??
          j.sea_lcl_details?.actual_eta ??
          j.milestones.find((m) => m.milestone === "ATA" && m.actual_date)
            ?.actual_date ??
          null;
        if (
          wanted.has("ata_missing") &&
          j.status !== JobStatus.CANCELLED &&
          j.eta &&
          j.eta < now &&
          !ata
        ) {
          findings.push({
            job_id: j.id,
            job_number: j.job_number,
            job_type: j.job_type,
            status: j.status,
            rule: "ata_missing",
            detail: "ETA passed without ATA",
          });
        }

        const loadingDate = j.containers_job.some((c) => c.gate_in_at);
        if (wanted.has("atd_no_loading") && atd && !loadingDate) {
          findings.push({
            job_id: j.id,
            job_number: j.job_number,
            job_type: j.job_type,
            status: j.status,
            rule: "atd_no_loading",
            detail: "ATD set but no container gate-in/loading date",
          });
        }

        if (
          wanted.has("not_closed_past_eta") &&
          j.status !== JobStatus.COMPLETED &&
          j.status !== JobStatus.CANCELLED &&
          j.eta
        ) {
          const deadline = new Date(j.eta);
          deadline.setDate(deadline.getDate() + grace);
          if (deadline < now) {
            findings.push({
              job_id: j.id,
              job_number: j.job_number,
              job_type: j.job_type,
              status: j.status,
              rule: "not_closed_past_eta",
              detail: `Not closed ${grace}+ days after ETA`,
            });
          }
        }
      }

      const total = findings.length;
      const rows = findings.slice((page - 1) * limit, page * limit);
      return {
        success: true,
        data: {
          from_date: query.from_date,
          to_date: query.to_date,
          rules: [...wanted],
          exceptions: rows,
          pagination: { page, limit, total },
          download: {
            method: "POST",
            path: "/operations/exceptions/download",
            report_code: "EXCEPTION_REPORT_FORMAT",
          },
        },
      };
    });
  }

  async exceptionRows(tenantId: string, params: Record<string, unknown>) {
    const res = await this.exceptions(tenantId, {
      from_date: String(params.from_date ?? new Date().toISOString()),
      to_date: String(params.to_date ?? new Date().toISOString()),
      branch_id: params.branch_id ? String(params.branch_id) : undefined,
      rules: params.rules ? String(params.rules) : undefined,
      page: 1,
      limit: 2000,
    });
    return res.data.exceptions.map((e) => ({
      job_number: e.job_number,
      job_type: e.job_type,
      status: e.status,
      rule: e.rule,
      detail: e.detail,
    }));
  }

  async kpiStatus(tenantId: string, query: KpiStatusQueryDto) {
    const from = new Date(query.from_date);
    const to = new Date(query.to_date);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const dateBasis = query.date_basis ?? "job_date";

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(dateBasis === "completed_at"
          ? {
              status: JobStatus.COMPLETED,
              updated_at: { gte: from, lte: to },
            }
          : { job_date: { gte: from, lte: to } }),
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(query.job_type ? { job_type: query.job_type } : {}),
      };

      const [jobs, total] = await Promise.all([
        tx.job.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { job_date: "desc" },
          select: {
            id: true,
            job_number: true,
            job_type: true,
            status: true,
            job_date: true,
            updated_at: true,
            etd: true,
            eta: true,
            sea_fcl_details: {
              select: { sailed_at: true, actual_eta: true },
            },
            sea_lcl_details: {
              select: { sailed_at: true, actual_eta: true },
            },
            milestones: {
              where: { deleted_at: null },
              select: {
                milestone: true,
                actual_date: true,
                planned_date: true,
              },
            },
          },
        }),
        tx.job.count({ where }),
      ]);

      const rows = jobs.map((j) => {
        const totalMs = j.milestones.length;
        const doneMs = j.milestones.filter((m) => m.actual_date).length;
        const atd =
          j.sea_fcl_details?.sailed_at ?? j.sea_lcl_details?.sailed_at ?? null;
        const ata =
          j.sea_fcl_details?.actual_eta ??
          j.sea_lcl_details?.actual_eta ??
          null;
        return {
          job_id: j.id,
          job_number: j.job_number,
          job_type: j.job_type,
          status: j.status,
          job_date: j.job_date,
          completed_at:
            j.status === JobStatus.COMPLETED ? j.updated_at : null,
          etd: j.etd,
          eta: j.eta,
          atd,
          ata,
          milestones_total: totalMs,
          milestones_completed: doneMs,
          milestone_pct:
            totalMs > 0 ? Math.round((doneMs / totalMs) * 100) : 0,
          on_time_ata: j.eta && ata ? new Date(ata) <= new Date(j.eta) : null,
        };
      });

      return {
        success: true,
        data: {
          from_date: query.from_date,
          to_date: query.to_date,
          date_basis: dateBasis,
          jobs: rows,
          pagination: { page, limit, total },
          download: {
            method: "POST",
            path: "/operations/kpi-status/download",
            report_code: "KPI_STATUS_BY_COMPLETED_DATE_REPORT_FORMAT",
          },
        },
      };
    });
  }

  async kpiStatusRows(tenantId: string, params: Record<string, unknown>) {
    const res = await this.kpiStatus(tenantId, {
      from_date: String(params.from_date ?? new Date().toISOString()),
      to_date: String(params.to_date ?? new Date().toISOString()),
      date_basis:
        params.date_basis === "completed_at" ? "completed_at" : "job_date",
      page: 1,
      limit: 2000,
    });
    return res.data.jobs.map((j) => ({
      job_number: j.job_number,
      job_type: j.job_type,
      status: j.status,
      job_date: j.job_date,
      completed_at: j.completed_at,
      milestone_pct: j.milestone_pct,
      on_time_ata: j.on_time_ata,
    }));
  }

  async jobListSummary(tenantId: string, query: JobListSummaryQueryDto) {
    const from = new Date(query.from_date);
    const to = new Date(query.to_date);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const dateBasis = query.date_basis ?? "job_date";

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const jobs = await tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...(query.branch_id ? { branch_id: query.branch_id } : {}),
          ...(query.job_type ? { job_type: query.job_type } : {}),
          ...(dateBasis === "job_date"
            ? { job_date: { gte: from, lte: to } }
            : {}),
        },
        select: {
          id: true,
          job_number: true,
          job_type: true,
          status: true,
          job_date: true,
          branch_id: true,
          salesperson_id: true,
          gp_amount: true,
          revenue_total: true,
          cost_total: true,
          pieces: true,
          gross_weight: true,
          volume_cbm: true,
          shipments: {
            where: { deleted_at: null },
            select: { shipment_date: true },
          },
          containers_job: {
            where: { deleted_at: null },
            select: { chargeable_units: true },
          },
          vouchers: {
            where: { deleted_at: null, status: "POSTED" },
            select: { voucher_date: true, posted_at: true },
            take: 5,
          },
        },
        take: 3000,
      });

      const rows = jobs
        .map((j) => {
          const shipDates = j.shipments
            .map((s) => s.shipment_date)
            .filter((d): d is Date => !!d);
          const minShip =
            shipDates.length > 0
              ? new Date(Math.min(...shipDates.map((d) => d.getTime())))
              : null;
          const voucherDates = j.vouchers
            .map((v) => v.posted_at ?? v.voucher_date)
            .filter((d): d is Date => !!d);
          const minVoucher =
            voucherDates.length > 0
              ? new Date(Math.min(...voucherDates.map((d) => d.getTime())))
              : null;

          const effective =
            dateBasis === "shipment_date"
              ? (minShip ?? j.job_date)
              : dateBasis === "voucher_date"
                ? (minVoucher ?? j.job_date)
                : j.job_date;
          if (!effective || effective < from || effective > to) return null;

          const chargeable = j.containers_job.reduce(
            (s, c) => s + Number(c.chargeable_units ?? 0),
            0,
          );
          return {
            job_id: j.id,
            job_number: j.job_number,
            job_type: j.job_type,
            status: j.status,
            job_date: j.job_date,
            effective_date: effective,
            branch_id: j.branch_id,
            salesperson_id: j.salesperson_id,
            revenue_total: Number(j.revenue_total ?? 0),
            cost_total: Number(j.cost_total ?? 0),
            gp_amount: Number(j.gp_amount ?? 0),
            pieces: j.pieces,
            gross_weight: j.gross_weight != null ? Number(j.gross_weight) : null,
            volume_cbm: j.volume_cbm != null ? Number(j.volume_cbm) : null,
            chargeable_units: Math.round(chargeable * 1000) / 1000,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r != null);

      const total = rows.length;
      const pageRows = rows.slice((page - 1) * limit, page * limit);
      return {
        success: true,
        data: {
          from_date: query.from_date,
          to_date: query.to_date,
          date_basis: dateBasis,
          jobs: pageRows,
          pagination: { page, limit, total },
          download: {
            method: "POST",
            path: "/reports/generate",
            report_code: "JOB_LIST_SUMMARY_REPORT_FORMAT",
          },
        },
      };
    });
  }

  async jobListSummaryRows(
    tenantId: string,
    params: Record<string, unknown>,
  ) {
    const res = await this.jobListSummary(tenantId, {
      from_date: String(params.from_date ?? new Date().toISOString()),
      to_date: String(params.to_date ?? new Date().toISOString()),
      date_basis:
        params.date_basis === "shipment_date"
          ? "shipment_date"
          : params.date_basis === "voucher_date"
            ? "voucher_date"
            : "job_date",
      page: 1,
      limit: 2000,
    });
    return res.data.jobs.map((j) => ({
      job_number: j.job_number,
      job_type: j.job_type,
      status: j.status,
      job_date: j.job_date,
      chargeable_units: j.chargeable_units,
      revenue_total: j.revenue_total,
      cost_total: j.cost_total,
      gp_amount: j.gp_amount,
    }));
  }
}
