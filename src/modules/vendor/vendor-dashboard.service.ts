import { Injectable } from "@nestjs/common";
import { InvoiceType, PortalDisputeStatus } from "@prisma/client";
import {
  DashboardPeriodQueryDto,
  TasksQueryDto,
} from "../../common/dto/dashboard-period-query.dto";
import { resolveDashboardPeriod } from "../../common/utils/dashboard-period.util";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";
import { VendorFinanceService } from "./vendor-finance.service";

const VISIBLE = [
  "DRAFT",
  "POSTED",
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
] as const;

@Injectable()
export class VendorDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: VendorFinanceService,
  ) {}

  async dashboard(user: CurrentVendorUser, query: DashboardPeriodQueryDto) {
    const resolved = query.resolve("30d");
    const [summary, schedule, aging, tasks_preview, quotesOpen] =
      await Promise.all([
        this.finance.invoiceSummary(user, resolved),
        this.finance.schedule(user),
        this.finance.aging(user),
        this.previewTasks(user, 5),
        this.prisma.runWithTenant(user.tenantId, (tx) =>
          tx.vendorQuote.count({
            where: {
              tenant_id: user.tenantId,
              vendor_party_id: user.partyId,
              deleted_at: null,
              status: {
                in: ["SENT", "NEGOTIATING", "VENDOR_REVIEW", "PRICED"],
              },
            },
          }),
        ),
      ]);

    const scheduleRows = Array.isArray(schedule?.data)
      ? schedule.data
      : Array.isArray(schedule)
        ? schedule
        : [];

    return {
      success: true,
      data: {
        period: resolved.period,
        from: resolved.from.toISOString(),
        to: resolved.to.toISOString(),
        kpis: {
          invoice_count: summary.data.count,
          outstanding: summary.data.outstanding,
          overdue: summary.data.overdue,
          quotes_open: quotesOpen,
        },
        schedule_upcoming: scheduleRows.slice(0, 10),
        credit_aging_summary: aging?.data ?? aging,
        tasks_preview,
      },
    };
  }

  async listTasks(user: CurrentVendorUser, query: TasksQueryDto) {
    const { from, to, period } = query.resolve("30d");
    const includeDone = Boolean(query.include_done);
    const tasks = await this.buildTasks(user, from, to);
    const filtered = includeDone ? tasks : tasks.filter((t) => !t.done);
    return {
      success: true,
      data: filtered,
      meta: {
        period,
        from: from.toISOString(),
        to: to.toISOString(),
        total: filtered.length,
      },
    };
  }

  async previewTasks(user: CurrentVendorUser, limit = 5) {
    const { from, to } = resolveDashboardPeriod({ period: "30d" }, "30d");
    return (await this.buildTasks(user, from, to))
      .filter((t) => !t.done)
      .slice(0, limit);
  }

  private async buildTasks(
    user: CurrentVendorUser,
    from: Date,
    to: Date,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [overduePis, paymentRequests, disputes] =
      await this.prisma.runWithTenant(user.tenantId, (tx) =>
        Promise.all([
          tx.invoice.findMany({
            where: {
              tenant_id: user.tenantId,
              party_id: user.partyId,
              deleted_at: null,
              invoice_type: InvoiceType.PURCHASE_INVOICE,
              status: { in: [...VISIBLE] },
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
          tx.paymentRequest.findMany({
            where: {
              tenant_id: user.tenantId,
              party_id: user.partyId,
              deleted_at: null,
              status: { in: ["PENDING", "APPROVED"] },
              created_at: { gte: from, lte: to },
            },
            select: {
              id: true,
              request_number: true,
              status: true,
              due_date: true,
            },
            take: 50,
            orderBy: { created_at: "desc" },
          }),
          tx.vendorDispute.findMany({
            where: {
              tenant_id: user.tenantId,
              party_id: user.partyId,
              status: {
                in: [
                  PortalDisputeStatus.OPEN,
                  PortalDisputeStatus.UNDER_REVIEW,
                ],
              },
            },
            select: {
              id: true,
              reason: true,
              status: true,
              created_at: true,
            },
            take: 50,
            orderBy: { created_at: "desc" },
          }),
        ]),
      );

    const tasks = [];

    for (const inv of overduePis) {
      const done = Number(inv.balance_due) <= 0 || inv.status === "PAID";
      tasks.push({
        id: `invoice:${inv.id}`,
        type: "OVERDUE_PURCHASE_INVOICE",
        title: `Follow up overdue PI ${inv.invoice_number}`,
        status: done ? "DONE" : "OPEN",
        done,
        due_date: inv.due_date?.toISOString() ?? null,
        entity_type: "invoice",
        entity_id: inv.id,
        href_hint: `/vendor/invoices/${inv.id}`,
      });
    }

    for (const pr of paymentRequests) {
      const done = !["PENDING", "APPROVED"].includes(pr.status);
      tasks.push({
        id: `payment_request:${pr.id}`,
        type: "PAYMENT_REQUEST",
        title: `Payment request ${pr.request_number ?? pr.id}`,
        status: done ? "DONE" : "OPEN",
        done,
        due_date: pr.due_date?.toISOString() ?? null,
        entity_type: "payment_request",
        entity_id: pr.id,
        href_hint: `/vendor/payment-requests/${pr.id}`,
      });
    }

    for (const d of disputes) {
      const done =
        d.status !== PortalDisputeStatus.OPEN &&
        d.status !== PortalDisputeStatus.UNDER_REVIEW;
      tasks.push({
        id: `dispute:${d.id}`,
        type: "VENDOR_DISPUTE",
        title: `Open dispute: ${d.reason}`,
        status: done ? "DONE" : "OPEN",
        done,
        due_date: d.created_at?.toISOString() ?? null,
        entity_type: "vendor_dispute",
        entity_id: d.id,
        href_hint: `/vendor/disputes/${d.id}`,
      });
    }

    return tasks;
  }
}
