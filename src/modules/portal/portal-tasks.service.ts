import { Injectable } from "@nestjs/common";
import { InvoiceStatus, InvoiceType, JobStatus, QuotationStatus } from "@prisma/client";
import { TasksQueryDto } from "../../common/dto/dashboard-period-query.dto";
import { resolveDashboardPeriod } from "../../common/utils/dashboard-period.util";
import { summarizeOnTimePerformance } from "../../common/utils/on-time.util";
import { PrismaService } from "../../prisma/prisma.service";
import { portalJobOwnershipWhere } from "./helpers/portal-ownership.helper";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";

export type DashboardTask = {
  id: string;
  type: string;
  title: string;
  status: "OPEN" | "DONE";
  done: boolean;
  due_date: string | null;
  entity_type: string;
  entity_id: string;
  href_hint: string;
};

@Injectable()
export class PortalTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async listTasks(user: CurrentPortalUser, query: TasksQueryDto) {
    const { from, to, period } = query.resolve("30d");
    const includeDone = Boolean(query.include_done);
    const tasks = await this.buildTasks(user, from, to);
    const filtered = includeDone ? tasks : tasks.filter((t) => !t.done);

    return {
      success: true,
      data: filtered,
      meta: { period, from: from.toISOString(), to: to.toISOString(), total: filtered.length },
    };
  }

  async preview(user: CurrentPortalUser, limit = 5) {
    const { from, to } = resolveDashboardPeriod({ period: "30d" }, "30d");
    const tasks = (await this.buildTasks(user, from, to)).filter((t) => !t.done);
    return tasks.slice(0, limit);
  }

  async alertCounts(user: CurrentPortalUser) {
    const base = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...portalJobOwnershipWhere(user.partyId),
    };

    const [customs_count, docs_pending_count] = await this.prisma.runWithTenant(
      user.tenantId,
      (tx) =>
        Promise.all([
          tx.job.count({
            where: { ...base, status: JobStatus.CUSTOMS_CLEARANCE },
          }),
          tx.job.count({
            where: { ...base, status: JobStatus.DOCS_PENDING },
          }),
        ]),
    );

    return { customs_count, docs_pending_count };
  }

  async onTimeSummary(user: CurrentPortalUser, from: Date, to: Date) {
    const jobs = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          eta: { gte: from, lte: to },
          ...portalJobOwnershipWhere(user.partyId),
        },
        select: {
          eta: true,
          status: true,
          air_details: { select: { actual_eta: true } },
          sea_fcl_details: { select: { actual_eta: true } },
          sea_lcl_details: { select: { actual_eta: true } },
        },
      }),
    );

    return summarizeOnTimePerformance(
      jobs.map((j) => ({
        eta: j.eta,
        status: j.status,
        actual_eta:
          j.air_details?.actual_eta ??
          j.sea_fcl_details?.actual_eta ??
          j.sea_lcl_details?.actual_eta ??
          null,
      })),
      to,
    );
  }

  private async buildTasks(
    user: CurrentPortalUser,
    from: Date,
    to: Date,
  ): Promise<DashboardTask[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [overdueInvoices, awaitingQuotes, alertJobs] =
      await this.prisma.runWithTenant(user.tenantId, async (tx) => {
        return Promise.all([
          tx.invoice.findMany({
            where: {
              tenant_id: user.tenantId,
              party_id: user.partyId,
              deleted_at: null,
              invoice_type: {
                in: [InvoiceType.CUSTOMER_INVOICE, InvoiceType.DEBIT_NOTE],
              },
              status: {
                in: [
                  InvoiceStatus.POSTED,
                  InvoiceStatus.SENT,
                  InvoiceStatus.PARTIALLY_PAID,
                ],
              },
              balance_due: { gt: 0 },
              due_date: { lt: today },
              invoice_date: { gte: from, lte: to },
            },
            select: {
              id: true,
              invoice_number: true,
              due_date: true,
              balance_due: true,
              status: true,
            },
            take: 50,
            orderBy: { due_date: "asc" },
          }),
          tx.quotation.findMany({
            where: {
              tenant_id: user.tenantId,
              deleted_at: null,
              customer_id: user.partyId,
              status: {
                in: [
                  QuotationStatus.SENT,
                  QuotationStatus.NEGOTIATING,
                  QuotationStatus.CUSTOMER_REVIEW,
                ],
              },
              created_at: { gte: from, lte: to },
            },
            select: {
              id: true,
              quotation_number: true,
              status: true,
              valid_until: true,
            },
            take: 50,
            orderBy: { updated_at: "desc" },
          }),
          tx.job.findMany({
            where: {
              tenant_id: user.tenantId,
              deleted_at: null,
              status: {
                in: [JobStatus.CUSTOMS_CLEARANCE, JobStatus.DOCS_PENDING],
              },
              ...portalJobOwnershipWhere(user.partyId),
            },
            select: {
              id: true,
              job_number: true,
              status: true,
              eta: true,
            },
            take: 50,
            orderBy: { updated_at: "desc" },
          }),
        ]);
      });

    const tasks: DashboardTask[] = [];

    for (const inv of overdueInvoices) {
      const done = inv.status === InvoiceStatus.PAID || Number(inv.balance_due) <= 0;
      tasks.push({
        id: `invoice:${inv.id}`,
        type: "OVERDUE_INVOICE",
        title: `Pay overdue invoice ${inv.invoice_number}`,
        status: done ? "DONE" : "OPEN",
        done,
        due_date: inv.due_date?.toISOString() ?? null,
        entity_type: "invoice",
        entity_id: inv.id,
        href_hint: `/portal/invoices/${inv.id}`,
      });
    }

    for (const q of awaitingQuotes) {
      const done =
        q.status !== QuotationStatus.SENT &&
        q.status !== QuotationStatus.NEGOTIATING &&
        q.status !== QuotationStatus.CUSTOMER_REVIEW;
      tasks.push({
        id: `quotation:${q.id}`,
        type: "QUOTE_ACTION",
        title: `Respond to quotation ${q.quotation_number}`,
        status: done ? "DONE" : "OPEN",
        done,
        due_date: q.valid_until?.toISOString() ?? null,
        entity_type: "quotation",
        entity_id: q.id,
        href_hint: `/portal/quotations/${q.id}`,
      });
    }

    for (const job of alertJobs) {
      const done =
        job.status !== JobStatus.CUSTOMS_CLEARANCE &&
        job.status !== JobStatus.DOCS_PENDING;
      tasks.push({
        id: `shipment:${job.id}`,
        type:
          job.status === JobStatus.CUSTOMS_CLEARANCE
            ? "CUSTOMS_ALERT"
            : "DOCS_PENDING",
        title:
          job.status === JobStatus.CUSTOMS_CLEARANCE
            ? `Customs clearance in progress — ${job.job_number}`
            : `Documents pending — ${job.job_number}`,
        status: done ? "DONE" : "OPEN",
        done,
        due_date: job.eta?.toISOString() ?? null,
        entity_type: "shipment",
        entity_id: job.id,
        href_hint: `/portal/shipments/${job.id}`,
      });
    }

    return tasks;
  }
}
