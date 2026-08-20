import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HrTimesheetStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import {
  AttendanceDto,
  CreateTimesheetDto,
  ExportTimesheetPayrollDto,
  MissingTimesheetQueryDto,
  TimesheetQueryDto,
  UpdateTimesheetDto,
} from './dto/hr-timesheet.dto';
import { formatDateOnly, isWeekend, toUtcDateOnly } from './utils/hr-date.util';

@Injectable()
export class HrTimesheetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: CurrentUser, dto: CreateTimesheetDto) {
    const workDate = toUtcDateOnly(dto.work_date);
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrTimesheet.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: dto.employee_id,
          work_date: workDate,
          hours: dto.hours,
          overtime_hours: dto.overtime_hours ?? 0,
          job_id: dto.job_id ?? null,
          billable: dto.billable ?? false,
          notes: dto.notes ?? null,
          status: dto.status ?? 'DRAFT',
          created_by: user.id,
        },
        include: { employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } } },
      }),
    );
    return { success: true, data: row };
  }

  async findAll(user: CurrentUser, query: TimesheetQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.HrTimesheetWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(query.employee_id ? { employee_id: query.employee_id } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            work_date: {
              ...(query.from ? { gte: toUtcDateOnly(query.from) } : {}),
              ...(query.to ? { lte: toUtcDateOnly(query.to) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.hrTimesheet.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { work_date: 'desc' },
          include: { employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } } },
        }),
        tx.hrTimesheet.count({ where }),
      ]),
    );

    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async update(user: CurrentUser, id: string, dto: UpdateTimesheetDto) {
    await this.requireTimesheet(user.tenantId, id);
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrTimesheet.update({
        where: { id },
        data: {
          ...(dto.hours !== undefined ? { hours: dto.hours } : {}),
          ...(dto.overtime_hours !== undefined ? { overtime_hours: dto.overtime_hours } : {}),
          ...(dto.job_id !== undefined ? { job_id: dto.job_id } : {}),
          ...(dto.billable !== undefined ? { billable: dto.billable } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
        },
      }),
    );
    return { success: true, data: updated };
  }

  async approve(user: CurrentUser, id: string) {
    const ts = await this.requireTimesheet(user.tenantId, id);
    if (ts.status !== 'SUBMITTED' && ts.status !== 'DRAFT') {
      throw new BadRequestException('Timesheet must be DRAFT or SUBMITTED to approve.');
    }
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrTimesheet.update({
        where: { id },
        data: { status: 'APPROVED', reviewer_id: user.id, reviewed_at: new Date() },
      }),
    );
    return { success: true, data: updated };
  }

  async remove(user: CurrentUser, id: string) {
    await this.requireTimesheet(user.tenantId, id);
    await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrTimesheet.update({ where: { id }, data: { deleted_at: new Date() } }),
    );
    return { success: true, data: { id, deleted: true } };
  }

  async clockIn(user: CurrentUser, dto: AttendanceDto) {
    const workDate = dto.work_date ? toUtcDateOnly(dto.work_date) : toUtcDateOnly(new Date());
    const log = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrAttendanceLog.upsert({
        where: {
          tenant_id_employee_id_work_date: {
            tenant_id: user.tenantId,
            employee_id: dto.employee_id,
            work_date: workDate,
          },
        },
        create: {
          tenant_id: user.tenantId,
          employee_id: dto.employee_id,
          work_date: workDate,
          clock_in_at: new Date(),
          created_by: user.id,
        },
        update: {
          clock_in_at: new Date(),
        },
      }),
    );
    return { success: true, data: log };
  }

  async listAttendance(user: CurrentUser, employeeId?: string, from?: string, to?: string) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrAttendanceLog.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(employeeId ? { employee_id: employeeId } : {}),
          ...(from || to
            ? {
                work_date: {
                  ...(from ? { gte: toUtcDateOnly(from) } : {}),
                  ...(to ? { lte: toUtcDateOnly(to) } : {}),
                },
              }
            : {}),
        },
        orderBy: { work_date: 'desc' },
        include: { employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } } },
        take: 200,
      }),
    );
    return { success: true, data };
  }

  async clockOut(user: CurrentUser, dto: AttendanceDto) {
    const workDate = dto.work_date ? toUtcDateOnly(dto.work_date) : toUtcDateOnly(new Date());
    const existing = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrAttendanceLog.findUnique({
        where: {
          tenant_id_employee_id_work_date: {
            tenant_id: user.tenantId,
            employee_id: dto.employee_id,
            work_date: workDate,
          },
        },
      }),
    );
    if (!existing?.clock_in_at) {
      throw new BadRequestException('Clock-in record not found for this date.');
    }

    const log = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrAttendanceLog.update({
        where: { id: existing.id },
        data: { clock_out_at: new Date() },
      }),
    );
    return { success: true, data: log };
  }

  async missingReport(user: CurrentUser, query: MissingTimesheetQueryDto) {
    const countryCode = user.countryCode ?? 'AE';
    const target = query.date ? toUtcDateOnly(query.date) : this.previousWorkingDay(countryCode, user.tenantId);

    const employees = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null, status: 'ACTIVE' },
        select: { id: true, employee_code: true, first_name: true, last_name: true, reporting_manager_id: true },
      }),
    );

    const withTimesheet = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrTimesheet.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null, work_date: target },
        select: { employee_id: true },
      }),
    );
    const tsSet = new Set(withTimesheet.map((t) => t.employee_id));

    const missing = employees.filter((e) => !tsSet.has(e.id));
    return {
      success: true,
      data: missing,
      meta: { work_date: formatDateOnly(target), count: missing.length },
    };
  }

  async exportOtToPayroll(user: CurrentUser, dto: ExportTimesheetPayrollDto) {
    const run = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrPayrollRun.findFirst({
        where: {
          tenant_id: user.tenantId,
          payroll_year: dto.payroll_year,
          payroll_month: dto.payroll_month,
          status: 'DRAFT',
          deleted_at: null,
        },
      }),
    );
    if (!run) {
      throw new NotFoundException('No DRAFT payroll run found for the specified period.');
    }

    const monthStart = run.period_start;
    const monthEnd = run.period_end;

    const timesheets = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrTimesheet.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          status: 'APPROVED',
          work_date: { gte: monthStart, lte: monthEnd },
        },
      }),
    );

    const byEmployee = new Map<string, { otHours: number }>();
    for (const ts of timesheets) {
      const cur = byEmployee.get(ts.employee_id) ?? { otHours: 0 };
      cur.otHours += Number(ts.overtime_hours);
      byEmployee.set(ts.employee_id, cur);
    }

    let updated = 0;
    for (const [employeeId, agg] of byEmployee) {
      const emp = await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.hrEmployee.findFirst({ where: { id: employeeId } }),
      );
      if (!emp) continue;

      const otAmount = Number((agg.otHours * Number(emp.overtime_rate)).toFixed(4));
      const existing = await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.hrPayrollLine.findUnique({
          where: { payroll_run_id_employee_id: { payroll_run_id: run.id, employee_id: employeeId } },
        }),
      );

      if (existing) {
        const gross =
          Number(existing.basic) +
          Number(existing.housing) +
          Number(existing.transport) +
          Number(existing.mobile) +
          Number(existing.other_allowance) +
          otAmount +
          Number(existing.bonus);
        const net = gross - Number(existing.total_deductions);
        await this.prisma.runWithTenant(user.tenantId, (tx) =>
          tx.hrPayrollLine.update({
            where: { id: existing.id },
            data: {
              overtime_hours: agg.otHours,
              overtime: otAmount,
              gross_pay: gross,
              net_pay: net,
            },
          }),
        );
      } else {
        const basic = Number(emp.basic_salary);
        const housing = Number(emp.housing_allowance);
        const transport = Number(emp.transport_allowance);
        const mobile = Number(emp.mobile_allowance);
        const other = Number(emp.other_allowance);
        const gross = basic + housing + transport + mobile + other + otAmount;
        await this.prisma.runWithTenant(user.tenantId, (tx) =>
          tx.hrPayrollLine.create({
            data: {
              tenant_id: user.tenantId,
              payroll_run_id: run.id,
              employee_id: employeeId,
              basic,
              housing,
              transport,
              mobile,
              overtime: otAmount,
              overtime_hours: agg.otHours,
              other_allowance: other,
              gross_pay: gross,
              net_pay: gross,
            },
          }),
        );
      }
      updated += 1;
    }

    return { success: true, data: { payroll_run_id: run.id, employees_updated: updated } };
  }

  private previousWorkingDay(countryCode: string, tenantId: string): Date {
    const cursor = toUtcDateOnly(new Date());
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    for (let i = 0; i < 14; i += 1) {
      if (!isWeekend(cursor, countryCode)) {
        return cursor;
      }
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return cursor;
  }

  private async requireTimesheet(tenantId: string, id: string) {
    const ts = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrTimesheet.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!ts) throw new NotFoundException('Timesheet not found.');
    return ts;
  }
}
