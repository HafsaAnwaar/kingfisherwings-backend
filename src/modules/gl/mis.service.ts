import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  MisDashboardQueryDto,
  ProfitabilityQueryDto,
} from "./dto/financial-reports.dto";

const OPEN_JOB_STATUSES = [
  "ENQUIRY",
  "QUOTATION",
  "BOOKING_CONFIRMED",
  "IN_PROGRESS",
  "DOCS_PENDING",
  "CUSTOMS_CLEARANCE",
  "ON_HOLD",
] as const;

const OPEN_QUOTE_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "SENT"] as const;

@Injectable()
export class MisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Management dashboard widgets (Ch.23 / Week 12) — ops + finance summary.
   */
  async dashboard(tenantId: string, query: MisDashboardQueryDto) {
    const { from, to } = this.resolvePeriod(query);

    const companyFilter = query.company_id
      ? { company_id: query.company_id }
      : {};
    const branchFilter = query.branch_id ? { branch_id: query.branch_id } : {};

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [
        openJobs,
        jobsByType,
        overdueInvoices,
        quotesOpen,
        quotesWon,
        quotesTotal,
        pdcDue,
        periodJobTotals,
        recentJobs,
      ] = await Promise.all([
        tx.job.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: { in: [...OPEN_JOB_STATUSES] },
            ...companyFilter,
            ...branchFilter,
          },
        }),
        tx.job.groupBy({
          by: ["job_type"],
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            created_at: { gte: from, lte: to },
            ...companyFilter,
          },
          _count: { _all: true },
        }),
        tx.invoice.aggregate({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            invoice_type: { in: ["CUSTOMER_INVOICE", "DEBIT_NOTE"] },
            status: { in: ["POSTED", "SENT", "PARTIALLY_PAID"] },
            balance_due: { gt: 0 },
            due_date: { lt: to },
            ...companyFilter,
          },
          _sum: { balance_due: true },
          _count: { _all: true },
        }),
        tx.quotation.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: { in: [...OPEN_QUOTE_STATUSES] },
            ...companyFilter,
          },
        }),
        tx.quotation.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: "WON",
            updated_at: { gte: from, lte: to },
            ...companyFilter,
          },
        }),
        tx.quotation.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            created_at: { gte: from, lte: to },
            ...companyFilter,
          },
        }),
        tx.cheque.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            is_pdc: true,
            status: "PENDING",
            due_date: { lte: addDays(to, 30) },
          },
        }),
        tx.job.aggregate({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            created_at: { gte: from, lte: to },
            ...companyFilter,
            ...branchFilter,
          },
          _sum: { revenue_total: true, cost_total: true, gp_amount: true },
          _count: { _all: true },
        }),
        tx.job.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            ...companyFilter,
          },
          orderBy: { created_at: "desc" },
          take: 10,
          select: {
            id: true,
            job_number: true,
            job_type: true,
            status: true,
            gp_amount: true,
            created_at: true,
          },
        }),
      ]);

      const sales = Number(periodJobTotals._sum.revenue_total ?? 0);
      const cost = Number(periodJobTotals._sum.cost_total ?? 0);
      const gp = Number(periodJobTotals._sum.gp_amount ?? 0);
      const overdueAmount = Number(overdueInvoices._sum.balance_due ?? 0);
      const conversionRate =
        quotesTotal > 0 ? (quotesWon / quotesTotal) * 100 : 0;

      const bankAccounts = await tx.chartOfAccount.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          is_active: true,
          OR: [{ is_bank_account: true }, { is_cash_account: true }],
        },
        select: { id: true, opening_balance: true, opening_balance_type: true },
      });

      let cashBankTotal = 0;
      if (bankAccounts.length) {
        const aggs = await tx.voucherLine.groupBy({
          by: ["account_id"],
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            account_id: { in: bankAccounts.map((a) => a.id) },
            voucher: {
              status: "POSTED",
              deleted_at: null,
              voucher_date: { lte: to },
            },
          },
          _sum: { debit_base: true, credit_base: true },
        });
        const byId = new Map(aggs.map((a) => [a.account_id, a]));
        for (const a of bankAccounts) {
          let opening = Number(a.opening_balance);
          if (a.opening_balance_type === "CREDIT") opening = -opening;
          const m = byId.get(a.id);
          cashBankTotal +=
            opening +
            Number(m?._sum.debit_base ?? 0) -
            Number(m?._sum.credit_base ?? 0);
        }
      }

      return {
        report: "MIS_DASHBOARD",
        from_date: from.toISOString().slice(0, 10),
        to_date: to.toISOString().slice(0, 10),
        widgets: {
          open_jobs: openJobs,
          jobs_created_by_type: jobsByType.map((j) => ({
            job_type: j.job_type,
            count: j._count._all,
          })),
          overdue_ar: {
            count: overdueInvoices._count._all,
            amount: round2(overdueAmount),
          },
          quotations_open: quotesOpen,
          quotation_conversion_pct: round2(conversionRate),
          period_sales: round2(sales),
          period_cost: round2(cost),
          period_gp: round2(gp),
          period_gp_pct: sales > 0 ? round2((gp / sales) * 100) : 0,
          pdc_due_30d: pdcDue,
          cash_and_bank_total: round2(cashBankTotal),
        },
        recent_jobs: recentJobs.map((j) => ({
          ...j,
          gp_amount: Number(j.gp_amount),
        })),
      };
    });
  }

  /** Job profitability grouped by shipper / job_type / branch / salesperson (Ch.23). */
  async jobProfitability(tenantId: string, query: ProfitabilityQueryDto) {
    const { from, to } = this.resolvePeriod(query);
    const groupBy = query.group_by ?? "customer";

    const jobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          created_at: { gte: from, lte: to },
          ...(query.company_id ? { company_id: query.company_id } : {}),
          ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        },
        select: {
          id: true,
          job_number: true,
          job_type: true,
          branch_id: true,
          salesperson_id: true,
          shipper_id: true,
          revenue_total: true,
          cost_total: true,
          gp_amount: true,
        },
      }),
    );

    const shipperIds = [
      ...new Set(
        jobs.map((j) => j.shipper_id).filter((id): id is string => Boolean(id)),
      ),
    ];
    const shippers = shipperIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.party.findMany({
            where: {
              tenant_id: tenantId,
              id: { in: shipperIds },
              deleted_at: null,
            },
            select: { id: true, code: true, name: true },
          }),
        )
      : [];
    const shipperMap = new Map(shippers.map((p) => [p.id, p]));

    type Bucket = {
      key: string;
      label: string;
      jobs: number;
      sales: number;
      cost: number;
      gp: number;
    };
    const buckets = new Map<string, Bucket>();

    for (const job of jobs) {
      let key = "unknown";
      let label = "Unknown";
      if (groupBy === "job_type") {
        key = job.job_type;
        label = job.job_type;
      } else if (groupBy === "branch") {
        key = job.branch_id ?? "none";
        label = job.branch_id ?? "No branch";
      } else if (groupBy === "salesperson") {
        key = job.salesperson_id ?? "none";
        label = job.salesperson_id ?? "Unassigned";
      } else {
        key = job.shipper_id ?? "none";
        const shipper = job.shipper_id
          ? shipperMap.get(job.shipper_id)
          : undefined;
        label = shipper ? `${shipper.code} — ${shipper.name}` : "No shipper";
      }

      if (!buckets.has(key)) {
        buckets.set(key, { key, label, jobs: 0, sales: 0, cost: 0, gp: 0 });
      }
      const b = buckets.get(key)!;
      b.jobs += 1;
      b.sales += Number(job.revenue_total);
      b.cost += Number(job.cost_total);
      b.gp += Number(job.gp_amount);
    }

    const rows = [...buckets.values()]
      .map((b) => ({
        ...b,
        sales: round2(b.sales),
        cost: round2(b.cost),
        gp: round2(b.gp),
        gp_pct: b.sales > 0 ? round2((b.gp / b.sales) * 100) : 0,
      }))
      .sort((a, b) => b.gp - a.gp);

    const totals = rows.reduce(
      (acc, r) => {
        acc.jobs += r.jobs;
        acc.sales += r.sales;
        acc.cost += r.cost;
        acc.gp += r.gp;
        return acc;
      },
      { jobs: 0, sales: 0, cost: 0, gp: 0 },
    );

    return {
      report: "JOB_PROFITABILITY",
      group_by: groupBy,
      from_date: from.toISOString().slice(0, 10),
      to_date: to.toISOString().slice(0, 10),
      rows,
      totals: {
        jobs: totals.jobs,
        sales: round2(totals.sales),
        cost: round2(totals.cost),
        gp: round2(totals.gp),
        gp_pct: totals.sales > 0 ? round2((totals.gp / totals.sales) * 100) : 0,
      },
    };
  }

  /** Operational snapshot: pending docs, open payment requests, jobs without invoices. */
  async operationalSummary(tenantId: string, query: MisDashboardQueryDto) {
    const { from, to } = this.resolvePeriod(query);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [
        pendingPaymentRequests,
        draftInvoices,
        uninvoicedCharges,
        jobsMissingDocs,
      ] = await Promise.all([
        tx.paymentRequest.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: { in: ["PENDING", "APPROVED"] },
          },
        }),
        tx.invoice.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: "DRAFT",
            ...(query.company_id ? { company_id: query.company_id } : {}),
          },
        }),
        tx.jobCharge.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            is_billable: true,
            is_invoiced: false,
            is_provisional: false,
            created_at: { gte: from, lte: to },
          },
        }),
        tx.job.count({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: { in: [...OPEN_JOB_STATUSES] },
            documents: { none: { deleted_at: null } },
            ...(query.company_id ? { company_id: query.company_id } : {}),
          },
        }),
      ]);

      return {
        report: "OPERATIONAL_SUMMARY",
        from_date: from.toISOString().slice(0, 10),
        to_date: to.toISOString().slice(0, 10),
        pending_payment_requests: pendingPaymentRequests,
        draft_invoices: draftInvoices,
        uninvoiced_charges: uninvoicedCharges,
        jobs_without_documents: jobsMissingDocs,
      };
    });
  }

  private resolvePeriod(query: MisDashboardQueryDto) {
    const to = query.to_date ? new Date(query.to_date) : new Date();
    to.setHours(23, 59, 59, 999);
    const from = query.from_date
      ? new Date(query.from_date)
      : new Date(to.getFullYear(), to.getMonth(), 1);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }
}

function round2(n: number) {
  return Math.round(n * 10000) / 10000;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
