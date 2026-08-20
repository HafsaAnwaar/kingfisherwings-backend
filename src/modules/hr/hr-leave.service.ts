import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  HrLeaveRequestStatus,
  HrLeaveType,
  HrStaffGrade,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { HR_PERMISSIONS } from './constants/hr-permission.constants';
import {
  AbsentReportQueryDto,
  DocumentExpiryQueryDto,
  LeaveCalendarQueryDto,
  LeaveEncashmentDto,
  LeavePolicyDto,
  LeaveRequestDto,
  LeaveReviewDto,
  UpdateLeavePolicyDto,
} from './dto/hr-leave.dto';
import {
  alertBandForDays,
  countBusinessDays,
  formatDateOnly,
  toUtcDateOnly,
} from './utils/hr-date.util';

@Injectable()
export class HrLeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async listPolicies(user: CurrentUser) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeavePolicy.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        orderBy: [{ leave_type: 'asc' }, { staff_grade: 'asc' }],
      }),
    );
    return { success: true, data };
  }

  async createPolicy(user: CurrentUser, dto: LeavePolicyDto) {
    const policy = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeavePolicy.create({
        data: {
          tenant_id: user.tenantId,
          leave_type: dto.leave_type,
          staff_grade: dto.staff_grade,
          entitlement_days: dto.entitlement_days,
          carry_forward_max: dto.carry_forward_max ?? 0,
          encashment_allowed: dto.encashment_allowed ?? false,
          created_by: user.id,
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: policy };
  }

  async updatePolicy(user: CurrentUser, id: string, dto: UpdateLeavePolicyDto) {
    await this.requirePolicy(user.tenantId, id);
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeavePolicy.update({
        where: { id },
        data: {
          ...(dto.leave_type !== undefined ? { leave_type: dto.leave_type } : {}),
          ...(dto.staff_grade !== undefined ? { staff_grade: dto.staff_grade } : {}),
          ...(dto.entitlement_days !== undefined ? { entitlement_days: dto.entitlement_days } : {}),
          ...(dto.carry_forward_max !== undefined ? { carry_forward_max: dto.carry_forward_max } : {}),
          ...(dto.encashment_allowed !== undefined ? { encashment_allowed: dto.encashment_allowed } : {}),
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async deletePolicy(user: CurrentUser, id: string) {
    await this.requirePolicy(user.tenantId, id);
    await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeavePolicy.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: user.id },
      }),
    );
    return { success: true, data: { id, deleted: true } };
  }

  async ensureEntitlementsForEmployee(tenantId: string, employeeId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    const employee = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEmployee.findFirst({
        where: { id: employeeId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!employee) throw new NotFoundException('Employee not found.');

    const policies = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrLeavePolicy.findMany({
        where: { tenant_id: tenantId, staff_grade: employee.staff_grade, deleted_at: null },
      }),
    );

    for (const policy of policies) {
      const entitled = Number(policy.entitlement_days);
      await this.prisma.runWithTenant(tenantId, async (tx) => {
        await tx.hrLeaveEntitlement.upsert({
          where: {
            tenant_id_employee_id_leave_type_year: {
              tenant_id: tenantId,
              employee_id: employeeId,
              leave_type: policy.leave_type,
              year: y,
            },
          },
          create: {
            tenant_id: tenantId,
            employee_id: employeeId,
            leave_type: policy.leave_type,
            year: y,
            entitled,
            carried: 0,
          },
          update: { entitled },
        });

        const existingBalance = await tx.hrLeaveBalance.findUnique({
          where: {
            tenant_id_employee_id_leave_type_year: {
              tenant_id: tenantId,
              employee_id: employeeId,
              leave_type: policy.leave_type,
              year: y,
            },
          },
        });

        if (!existingBalance) {
          await tx.hrLeaveBalance.create({
            data: {
              tenant_id: tenantId,
              employee_id: employeeId,
              leave_type: policy.leave_type,
              year: y,
              used: 0,
              remaining: entitled,
            },
          });
        } else {
          const used = Number(existingBalance.used);
          await tx.hrLeaveBalance.update({
            where: { id: existingBalance.id },
            data: { remaining: Math.max(0, entitled - used) },
          });
        }
      });
    }

    return { success: true, data: { employee_id: employeeId, year: y } };
  }

  async getBalances(user: CurrentUser, employeeId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    await this.ensureEntitlementsForEmployee(user.tenantId, employeeId, y);
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeaveBalance.findMany({
        where: { tenant_id: user.tenantId, employee_id: employeeId, year: y },
      }),
    );
    return { success: true, data };
  }

  async createRequest(user: CurrentUser, dto: LeaveRequestDto) {
    const start = toUtcDateOnly(dto.start_date);
    const end = toUtcDateOnly(dto.end_date);
    if (end.getTime() < start.getTime()) {
      throw new BadRequestException('end_date must be on or after start_date.');
    }

    const countryCode = user.countryCode ?? user.preferredCountryCode ?? 'AE';
    const holidays = await this.loadHolidaySet(user.tenantId, countryCode, start, end);
    const days = countBusinessDays(start, end, holidays, countryCode);

    const request = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeaveRequest.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: dto.employee_id,
          leave_type: dto.leave_type,
          start_date: start,
          end_date: end,
          days,
          reason: dto.reason ?? null,
          attachment_path: dto.attachment_path ?? null,
          status: 'PENDING',
          created_by: user.id,
        },
        include: { employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } } },
      }),
    );

    return { success: true, data: request };
  }

  async listRequests(user: CurrentUser, employeeId?: string, status?: HrLeaveRequestStatus) {
    const where: Prisma.HrLeaveRequestWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(employeeId ? { employee_id: employeeId } : {}),
      ...(status ? { status } : {}),
    };
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeaveRequest.findMany({
        where,
        orderBy: { created_at: 'desc' },
        include: {
          employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
        },
      }),
    );
    return { success: true, data };
  }

  async reviewRequest(user: CurrentUser, id: string, dto: LeaveReviewDto) {
    const request = await this.requireRequest(user.tenantId, id);
    if (!['APPROVED', 'REJECTED', 'RETURNED'].includes(dto.status)) {
      throw new BadRequestException('Review status must be APPROVED, REJECTED, or RETURNED.');
    }

    const employee = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.findFirst({ where: { id: request.employee_id, user_id: user.id } }),
    );
    const isSelf = !!employee;
    const canManageLeave = user.permissions.includes(HR_PERMISSIONS.MANAGE_LEAVE);
    if (isSelf && !canManageLeave) {
      throw new ForbiddenException('You cannot approve your own leave request.');
    }

    const updated = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const row = await tx.hrLeaveRequest.update({
        where: { id },
        data: {
          status: dto.status,
          review_notes: dto.review_notes ?? null,
          reviewer_id: user.id,
          reviewed_at: new Date(),
        },
      });

      if (dto.status === 'APPROVED') {
        const year = row.start_date.getUTCFullYear();
        await this.deductBalance(tx, user.tenantId, row.employee_id, row.leave_type, year, Number(row.days));
      }

      return row;
    });

    return { success: true, data: updated };
  }

  async leaveCalendar(user: CurrentUser, query: LeaveCalendarQueryDto) {
    const from = toUtcDateOnly(query.from);
    const to = toUtcDateOnly(query.to);
    const where: Prisma.HrLeaveRequestWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      status: 'APPROVED',
      start_date: { lte: to },
      end_date: { gte: from },
      ...(query.department_id ? { employee: { department_id: query.department_id } } : {}),
    };

    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeaveRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employee_code: true,
              first_name: true,
              last_name: true,
              department_id: true,
            },
          },
        },
      }),
    );
    return { success: true, data };
  }

  async absentReport(user: CurrentUser, query: AbsentReportQueryDto) {
    const date = toUtcDateOnly(query.date);
    const countryCode = user.countryCode ?? 'AE';
    const holidays = await this.loadHolidaySet(user.tenantId, countryCode, date, date);
    if (holidays.has(formatDateOnly(date))) {
      return { success: true, data: [], meta: { date: query.date, reason: 'Holiday' } };
    }

    const day = date.getUTCDay();
    const isFriSat = ['AE', 'SA', 'QA', 'BH', 'OM', 'KW'].includes(countryCode.toUpperCase());
    const weekend = isFriSat ? day === 5 || day === 6 : day === 0 || day === 6;
    if (weekend) {
      return { success: true, data: [], meta: { date: query.date, reason: 'Weekend' } };
    }

    const employees = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          status: 'ACTIVE',
          ...(query.department_id ? { department_id: query.department_id } : {}),
        },
        select: { id: true, employee_code: true, first_name: true, last_name: true },
      }),
    );

    const onLeave = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeaveRequest.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          status: 'APPROVED',
          start_date: { lte: date },
          end_date: { gte: date },
        },
        select: { employee_id: true },
      }),
    );
    const onLeaveSet = new Set(onLeave.map((r) => r.employee_id));

    const withTimesheet = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrTimesheet.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          work_date: date,
        },
        select: { employee_id: true },
      }),
    );
    const timesheetSet = new Set(withTimesheet.map((t) => t.employee_id));

    const withAttendance = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrAttendanceLog.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          work_date: date,
          clock_in_at: { not: null },
        },
        select: { employee_id: true },
      }),
    );
    const attendanceSet = new Set(withAttendance.map((a) => a.employee_id));

    const absent = employees.filter(
      (e) => !onLeaveSet.has(e.id) && !timesheetSet.has(e.id) && !attendanceSet.has(e.id),
    );

    return { success: true, data: absent, meta: { date: query.date, count: absent.length } };
  }

  async leaveEncashment(user: CurrentUser, dto: LeaveEncashmentDto) {
    const year = dto.year ?? new Date().getFullYear();
    await this.ensureEntitlementsForEmployee(user.tenantId, dto.employee_id, year);

    const employee = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.findFirst({ where: { id: dto.employee_id, tenant_id: user.tenantId, deleted_at: null } }),
    );
    if (!employee) throw new NotFoundException('Employee not found.');

    const staffPolicy = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeavePolicy.findFirst({
        where: {
          tenant_id: user.tenantId,
          leave_type: dto.leave_type,
          staff_grade: employee.staff_grade,
          deleted_at: null,
          encashment_allowed: true,
        },
      }),
    );
    if (!staffPolicy) {
      throw new BadRequestException('Encashment is not allowed for this leave type.');
    }

    const balance = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeaveBalance.findUnique({
        where: {
          tenant_id_employee_id_leave_type_year: {
            tenant_id: user.tenantId,
            employee_id: dto.employee_id,
            leave_type: dto.leave_type,
            year,
          },
        },
      }),
    );
    if (!balance || Number(balance.remaining) < dto.days) {
      throw new BadRequestException('Insufficient leave balance for encashment.');
    }

    const dailyRate = Number(employee.basic_salary) / 30;
    const amount = Number((dailyRate * dto.days).toFixed(4));

    await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      await tx.hrLeaveBalance.update({
        where: { id: balance.id },
        data: {
          used: { increment: dto.days },
          remaining: { decrement: dto.days },
        },
      });
    });

    return {
      success: true,
      data: {
        employee_id: dto.employee_id,
        leave_type: dto.leave_type,
        days: dto.days,
        daily_rate: dailyRate,
        encashment_amount: amount,
        year,
      },
    };
  }

  async documentExpiryReport(user: CurrentUser, query: DocumentExpiryQueryDto) {
    const within = query.within_days ?? 90;
    const horizon = new Date();
    horizon.setUTCDate(horizon.getUTCDate() + within);

    const docs = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeDocument.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          expires_at: { not: null, lte: horizon },
        },
        include: {
          employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
        },
        orderBy: { expires_at: 'asc' },
      }),
    );

    const deps = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeDependent.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          OR: [
            { passport_expires_at: { not: null, lte: horizon } },
            { visa_expires_at: { not: null, lte: horizon } },
          ],
        },
        include: {
          employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
        },
      }),
    );

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const mapDoc = (expiresAt: Date | null, row: Record<string, unknown>) => {
      if (!expiresAt) return null;
      const days = Math.floor((expiresAt.getTime() - today.getTime()) / 86_400_000);
      return { ...row, expires_at: formatDateOnly(expiresAt), days_until_expiry: days, alert_band: alertBandForDays(days) };
    };

    const documentRows = docs
      .map((d) =>
        mapDoc(d.expires_at, {
          source: 'employee_document',
          id: d.id,
          document_type: d.document_type,
          document_no: d.document_no,
          employee: d.employee,
        }),
      )
      .filter(Boolean);

    const dependentRows = deps.flatMap((d) => {
      const rows = [];
      if (d.passport_expires_at) {
        rows.push(
          mapDoc(d.passport_expires_at, {
            source: 'dependent_passport',
            id: d.id,
            dependent_name: d.full_name,
            document_no: d.passport_no,
            employee: d.employee,
          }),
        );
      }
      if (d.visa_expires_at) {
        rows.push(
          mapDoc(d.visa_expires_at, {
            source: 'dependent_visa',
            id: d.id,
            dependent_name: d.full_name,
            document_no: d.visa_no,
            employee: d.employee,
          }),
        );
      }
      return rows.filter(Boolean);
    });

    return { success: true, data: [...documentRows, ...dependentRows] };
  }

  private async deductBalance(
    tx: Prisma.TransactionClient,
    tenantId: string,
    employeeId: string,
    leaveType: HrLeaveType,
    year: number,
    days: number,
  ) {
    const balance = await tx.hrLeaveBalance.findUnique({
      where: {
        tenant_id_employee_id_leave_type_year: {
          tenant_id: tenantId,
          employee_id: employeeId,
          leave_type: leaveType,
          year,
        },
      },
    });
    if (!balance) return;
    const remaining = Math.max(0, Number(balance.remaining) - days);
    await tx.hrLeaveBalance.update({
      where: { id: balance.id },
      data: {
        used: { increment: days },
        remaining,
      },
    });
  }

  private async loadHolidaySet(
    tenantId: string,
    countryCode: string,
    start: Date,
    end: Date,
  ): Promise<Set<string>> {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.holiday.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          country_code: countryCode.toUpperCase(),
          date: { gte: start, lte: end },
        },
      }),
    );
    return new Set(rows.map((h) => formatDateOnly(h.date)));
  }

  private async requirePolicy(tenantId: string, id: string) {
    const policy = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrLeavePolicy.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!policy) throw new NotFoundException('Leave policy not found.');
    return policy;
  }

  private async requireRequest(tenantId: string, id: string) {
    const request = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrLeaveRequest.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!request) throw new NotFoundException('Leave request not found.');
    return request;
  }
}
