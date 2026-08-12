import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QuotationsService } from '../quotations/quotations.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { salespersonScope } from './crm-access';
import { CreateBudgetDto, DashboardQueryDto } from './dto/crm.dto';

const REPORT_TYPES = [
  'weekly_sales',
  'monthly_sales',
  'salesman_revenue',
  'customer_revenue',
  'top_customers',
  'top_salesmen',
  'trade_lane',
  'service_type',
  'win_loss',
  'call_log_summary',
  'lead_pipeline',
  'budget_vs_actual',
  'enquiry_conversion',
  'follow_up_overdue',
] as const;

export type CrmReportType = (typeof REPORT_TYPES)[number];

@Injectable()
export class CrmDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotations: QuotationsService,
  ) {}

  async createBudget(user: CurrentUser, dto: CreateBudgetDto) {
    salespersonScope(user, dto.salesperson_id);
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.salespersonBudget.create({
        data: {
          tenant_id: user.tenantId,
          salesperson_id: dto.salesperson_id,
          period_type: dto.period_type,
          period_start: new Date(dto.period_start),
          job_type: dto.job_type ?? null,
          target_amount: dto.target_amount,
          target_volume: dto.target_volume ?? null,
          created_by: user.id,
        },
      }),
    );
    return { success: true, data: row };
  }

  async listBudgets(user: CurrentUser, salespersonId?: string) {
    const scoped = salespersonScope(user, salespersonId);
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.salespersonBudget.findMany({
        where: {
          tenant_id: user.tenantId,
          ...(scoped ? { salesperson_id: scoped } : {}),
        },
        orderBy: { period_start: 'desc' },
      }),
    );
    return { success: true, data: rows };
  }

  async overview(user: CurrentUser, query: DashboardQueryDto) {
    const range = this.range(query);
    const salespersonId = salespersonScope(user, query.salesperson_id);
    const [leads, enquiries, followUps, jobs] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.lead.count({
            where: {
              tenant_id: user.tenantId,
              deleted_at: null,
              created_at: range,
              ...(salespersonId ? { assigned_salesperson_id: salespersonId } : {}),
            },
          }),
          tx.enquiry.count({
            where: {
              tenant_id: user.tenantId,
              deleted_at: null,
              created_at: range,
              ...(salespersonId ? { salesperson_id: salespersonId } : {}),
            },
          }),
          tx.followUp.count({
            where: {
              tenant_id: user.tenantId,
              deleted_at: null,
              status: 'PENDING',
              due_date: { lte: new Date() },
              ...(salespersonId ? { owner_id: salespersonId } : {}),
            },
          }),
          tx.job.aggregate({
            where: this.jobWhere(user.tenantId, salespersonId, range),
            _sum: { revenue_total: true },
            _count: { id: true },
          }),
        ]),
    );

    return {
      success: true,
      data: {
        leads,
        enquiries,
        overdue_follow_ups: followUps,
        job_count: jobs._count.id,
        job_revenue: Number(jobs._sum.revenue_total ?? 0),
      },
    };
  }

  async report(user: CurrentUser, type: string, query: DashboardQueryDto) {
    if (!REPORT_TYPES.includes(type as CrmReportType)) {
      throw new BadRequestException(`Unknown report type. Use one of: ${REPORT_TYPES.join(', ')}`);
    }
    const range = this.range(query);
    const salespersonId = salespersonScope(user, query.salesperson_id);

    switch (type as CrmReportType) {
      case 'weekly_sales':
        return this.periodSales(user.tenantId, salespersonId, range, 'week');
      case 'monthly_sales':
        return this.periodSales(user.tenantId, salespersonId, range, 'month');
      case 'salesman_revenue':
        return this.groupJobRevenue(user.tenantId, salespersonId, range, 'salesperson_id');
      case 'customer_revenue':
        return this.groupJobRevenue(user.tenantId, salespersonId, range, 'billing_party_id');
      case 'top_customers':
        return this.topBy(user.tenantId, salespersonId, range, 'billing_party_id', 10);
      case 'top_salesmen':
        return this.topBy(user.tenantId, salespersonId, range, 'salesperson_id', 10);
      case 'trade_lane':
        return this.tradeLane(user.tenantId, salespersonId, range);
      case 'service_type':
        return this.groupJobRevenue(user.tenantId, salespersonId, range, 'job_type');
      case 'win_loss':
        return this.winLoss(user, salespersonId, query);
      case 'call_log_summary':
        return this.callSummary(user.tenantId, salespersonId, range);
      case 'lead_pipeline':
        return this.leadPipeline(user.tenantId, salespersonId);
      case 'budget_vs_actual':
        return this.budgetVsActual(user.tenantId, salespersonId, range);
      case 'enquiry_conversion':
        return this.enquiryConversion(user.tenantId, salespersonId);
      case 'follow_up_overdue':
        return this.followUpStats(user.tenantId, salespersonId);
      default:
        throw new BadRequestException('Unknown report type.');
    }
  }

  private async periodSales(
    tenantId: string,
    salespersonId: string | undefined,
    range: Prisma.DateTimeFilter,
    grain: 'week' | 'month',
  ) {
    const jobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: this.jobWhere(tenantId, salespersonId, range),
        select: { created_at: true, revenue_total: true },
      }),
    );
    const buckets = new Map<string, { revenue: number; volume: number }>();
    for (const job of jobs) {
      const d = job.created_at;
      const key =
        grain === 'month'
          ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
          : this.isoWeek(d);
      const current = buckets.get(key) ?? { revenue: 0, volume: 0 };
      current.revenue += Number(job.revenue_total);
      current.volume += 1;
      buckets.set(key, current);
    }
    return {
      success: true,
      data: [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, v]) => ({ period, ...v })),
    };
  }

  private async groupJobRevenue(
    tenantId: string,
    salespersonId: string | undefined,
    range: Prisma.DateTimeFilter,
    field: 'salesperson_id' | 'billing_party_id' | 'job_type',
  ) {
    const jobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: this.jobWhere(tenantId, salespersonId, range),
        select: { salesperson_id: true, billing_party_id: true, job_type: true, revenue_total: true },
      }),
    );
    const map = new Map<string, { revenue: number; volume: number }>();
    for (const job of jobs) {
      const key = String(job[field] ?? 'unassigned');
      const current = map.get(key) ?? { revenue: 0, volume: 0 };
      current.revenue += Number(job.revenue_total);
      current.volume += 1;
      map.set(key, current);
    }
    return {
      success: true,
      data: [...map.entries()].map(([key, v]) => ({ key, ...v })),
    };
  }

  private async topBy(
    tenantId: string,
    salespersonId: string | undefined,
    range: Prisma.DateTimeFilter,
    field: 'salesperson_id' | 'billing_party_id',
    take: number,
  ) {
    const grouped = await this.groupJobRevenue(tenantId, salespersonId, range, field);
    return {
      success: true,
      data: [...grouped.data].sort((a, b) => b.revenue - a.revenue).slice(0, take),
    };
  }

  private async tradeLane(
    tenantId: string,
    salespersonId: string | undefined,
    range: Prisma.DateTimeFilter,
  ) {
    const jobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: this.jobWhere(tenantId, salespersonId, range),
        select: { origin_port_id: true, dest_port_id: true, revenue_total: true },
      }),
    );
    const map = new Map<string, { revenue: number; volume: number }>();
    for (const job of jobs) {
      const key = `${job.origin_port_id ?? 'UNK'}>${job.dest_port_id ?? 'UNK'}`;
      const current = map.get(key) ?? { revenue: 0, volume: 0 };
      current.revenue += Number(job.revenue_total);
      current.volume += 1;
      map.set(key, current);
    }
    return {
      success: true,
      data: [...map.entries()].map(([lane, v]) => ({ lane, ...v })),
    };
  }

  private async winLoss(user: CurrentUser, salespersonId: string | undefined, query: DashboardQueryDto) {
    const quotes = await this.quotations.getAnalytics(user.tenantId, {
      from_date: query.from,
      to_date: query.to,
      salesperson_id: salespersonId,
    });
    const leadWhere: Prisma.LeadWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      status: { in: ['WON', 'LOST'] },
      ...(salespersonId ? { assigned_salesperson_id: salespersonId } : {}),
    };
    const [won, lost] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.lead.count({ where: { ...leadWhere, status: 'WON' } }),
        tx.lead.count({ where: { ...leadWhere, status: 'LOST' } }),
      ]),
    );
    return {
      success: true,
      data: {
        quotations: quotes,
        leads: { won, lost, conversion_rate: won + lost > 0 ? (won / (won + lost)) * 100 : 0 },
      },
    };
  }

  private async callSummary(
    tenantId: string,
    salespersonId: string | undefined,
    range: Prisma.DateTimeFilter,
  ) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.callLog.groupBy({
        by: ['call_type', 'outcome'],
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          date_time: range,
          ...(salespersonId ? { owner_id: salespersonId } : {}),
        },
        _count: { id: true },
      }),
    );
    return { success: true, data: rows.map((r) => ({ ...r, count: r._count.id })) };
  }

  private async leadPipeline(tenantId: string, salespersonId?: string) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.lead.groupBy({
        by: ['status'],
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...(salespersonId ? { assigned_salesperson_id: salespersonId } : {}),
        },
        _count: { id: true },
      }),
    );
    return { success: true, data: rows.map((r) => ({ status: r.status, count: r._count.id })) };
  }

  private async budgetVsActual(
    tenantId: string,
    salespersonId: string | undefined,
    range: Prisma.DateTimeFilter,
  ) {
    const [budgets, actual] = await this.prisma.runWithTenant(tenantId, async (tx) =>
      Promise.all([
        tx.salespersonBudget.findMany({
          where: {
            tenant_id: tenantId,
            ...(salespersonId ? { salesperson_id: salespersonId } : {}),
            period_start: range,
          },
        }),
        tx.job.groupBy({
          by: ['salesperson_id'],
          where: this.jobWhere(tenantId, salespersonId, range),
          _sum: { revenue_total: true },
          _count: { id: true },
        }),
      ]),
    );
    return {
      success: true,
      data: budgets.map((b) => {
        const hit = actual.find((a) => a.salesperson_id === b.salesperson_id);
        return {
          budget: b,
          actual_amount: Number(hit?._sum.revenue_total ?? 0),
          actual_volume: hit?._count.id ?? 0,
        };
      }),
    };
  }

  private async enquiryConversion(tenantId: string, salespersonId?: string) {
    const where: Prisma.EnquiryWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(salespersonId ? { salesperson_id: salespersonId } : {}),
    };
    const [total, quoted, booked] = await this.prisma.runWithTenant(tenantId, async (tx) =>
      Promise.all([
        tx.enquiry.count({ where }),
        tx.enquiry.count({ where: { ...where, status: 'QUOTED' } }),
        tx.enquiry.count({ where: { ...where, status: 'BOOKED' } }),
      ]),
    );
    return {
      success: true,
      data: {
        total,
        quoted,
        booked,
        quote_rate: total ? (quoted / total) * 100 : 0,
        book_rate: total ? (booked / total) * 100 : 0,
      },
    };
  }

  private async followUpStats(tenantId: string, salespersonId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const where: Prisma.FollowUpWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(salespersonId ? { owner_id: salespersonId } : {}),
    };
    const [pending, completed, overdue] = await this.prisma.runWithTenant(tenantId, async (tx) =>
      Promise.all([
        tx.followUp.count({ where: { ...where, status: 'PENDING' } }),
        tx.followUp.count({ where: { ...where, status: 'COMPLETED' } }),
        tx.followUp.count({
          where: { ...where, status: 'PENDING', due_date: { lt: today } },
        }),
      ]),
    );
    return {
      success: true,
      data: {
        pending,
        completed,
        overdue,
        completion_rate: pending + completed ? (completed / (pending + completed)) * 100 : 0,
      },
    };
  }

  private jobWhere(
    tenantId: string,
    salespersonId: string | undefined,
    range: Prisma.DateTimeFilter,
  ): Prisma.JobWhereInput {
    return {
      tenant_id: tenantId,
      deleted_at: null,
      created_at: range,
      ...(salespersonId ? { salesperson_id: salespersonId } : {}),
    };
  }

  private range(query: DashboardQueryDto): Prisma.DateTimeFilter {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from ? new Date(query.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { gte: from, lte: to };
  }

  private isoWeek(d: Date): string {
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }
}
