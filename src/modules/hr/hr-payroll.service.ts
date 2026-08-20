import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HrSalaryComponentCode, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../shared/email/email.service';
import { PdfService } from '../../shared/pdf/pdf.service';
import { StorageService } from '../../shared/storage/storage.service';
import { GlAutoPostService } from '../gl/gl-auto-post.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import {
  CreatePayrollRunDto,
  GratuityQueryDto,
  PayrollGlSettingDto,
  PayslipEmailDto,
  SalaryComponentDto,
} from './dto/hr-payroll.dto';
import { calculateUaeGratuity, formatDateOnly, toUtcDateOnly } from './utils/hr-date.util';

const DEFAULT_SALARY_COMPONENTS: Array<{
  code: HrSalaryComponentCode;
  name: string;
  is_earning: boolean;
  sort_order: number;
}> = [
  { code: 'BASIC', name: 'Basic Salary', is_earning: true, sort_order: 1 },
  { code: 'HOUSING', name: 'Housing Allowance', is_earning: true, sort_order: 2 },
  { code: 'TRANSPORT', name: 'Transport Allowance', is_earning: true, sort_order: 3 },
  { code: 'MOBILE', name: 'Mobile Allowance', is_earning: true, sort_order: 4 },
  { code: 'OVERTIME', name: 'Overtime', is_earning: true, sort_order: 5 },
  { code: 'OTHER', name: 'Other Allowance', is_earning: true, sort_order: 6 },
];

@Injectable()
export class HrPayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
    private readonly glAutoPost: GlAutoPostService,
  ) {}

  async listSalaryComponents(user: CurrentUser) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrSalaryComponent.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        orderBy: { sort_order: 'asc' },
      }),
    );
    return { success: true, data };
  }

  async seedSalaryComponents(user: CurrentUser) {
    const created = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const rows = [];
      for (const seed of DEFAULT_SALARY_COMPONENTS) {
        const row = await tx.hrSalaryComponent.upsert({
          where: {
            tenant_id_code: { tenant_id: user.tenantId, code: seed.code },
          },
          create: {
            tenant_id: user.tenantId,
            code: seed.code,
            name: seed.name,
            is_earning: seed.is_earning,
            sort_order: seed.sort_order,
            created_by: user.id,
          },
          update: { name: seed.name, is_earning: seed.is_earning, sort_order: seed.sort_order },
        });
        rows.push(row);
      }
      return rows;
    });
    return { success: true, data: created };
  }

  async upsertSalaryComponent(user: CurrentUser, dto: SalaryComponentDto) {
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrSalaryComponent.upsert({
        where: { tenant_id_code: { tenant_id: user.tenantId, code: dto.code } },
        create: {
          tenant_id: user.tenantId,
          code: dto.code,
          name: dto.name,
          is_earning: dto.is_earning ?? true,
          sort_order: dto.sort_order ?? 0,
          created_by: user.id,
        },
        update: {
          name: dto.name,
          is_earning: dto.is_earning ?? true,
          sort_order: dto.sort_order ?? 0,
        },
      }),
    );
    return { success: true, data: row };
  }

  async createPayrollRun(user: CurrentUser, dto: CreatePayrollRunDto) {
    const periodStart = new Date(Date.UTC(dto.payroll_year, dto.payroll_month - 1, 1));
    const periodEnd = new Date(Date.UTC(dto.payroll_year, dto.payroll_month, 0));

    const run = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrPayrollRun.create({
        data: {
          tenant_id: user.tenantId,
          company_id: dto.company_id ?? null,
          payroll_year: dto.payroll_year,
          payroll_month: dto.payroll_month,
          period_start: periodStart,
          period_end: periodEnd,
          currency_code: dto.currency_code ?? 'AED',
          status: 'DRAFT',
          created_by: user.id,
          updated_by: user.id,
        },
      }),
    );

    return { success: true, data: run };
  }

  async listPayrollRuns(user: CurrentUser) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrPayrollRun.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        orderBy: [{ payroll_year: 'desc' }, { payroll_month: 'desc' }],
        include: { _count: { select: { lines: true } } },
      }),
    );
    return { success: true, data };
  }

  async getPayrollRun(user: CurrentUser, id: string) {
    const run = await this.requireRun(user.tenantId, id);
    return { success: true, data: run };
  }

  async generateLines(user: CurrentUser, runId: string) {
    const run = await this.requireRun(user.tenantId, runId);
    if (run.status !== 'DRAFT') {
      throw new BadRequestException('Payroll run must be in DRAFT status to generate lines.');
    }

    const settings = await this.resolveGlSettings(user.tenantId, run.company_id);
    const bonusRate = Number(settings?.bonus_percent_per_score_point ?? 0.1);

    const employees = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null, status: 'ACTIVE' },
      }),
    );

    const monthStart = run.period_start;
    const monthEnd = run.period_end;

    const lines = [];
    for (const emp of employees) {
      const otRows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.hrTimesheet.findMany({
          where: {
            tenant_id: user.tenantId,
            employee_id: emp.id,
            deleted_at: null,
            status: 'APPROVED',
            work_date: { gte: monthStart, lte: monthEnd },
          },
        }),
      );
      const otHours = otRows.reduce((s, r) => s + Number(r.overtime_hours), 0);
      const otRate = Number(emp.overtime_rate);
      const overtime = Number((otHours * otRate).toFixed(4));

      const score = Number(emp.performance_evaluation_score ?? 0);
      const bonus = Number((score * bonusRate).toFixed(4));

      const emiDue = await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.hrLoanRepayment.findMany({
          where: {
            tenant_id: user.tenantId,
            due_date: { gte: monthStart, lte: monthEnd },
            paid_at: null,
            loan: { employee_id: emp.id, status: 'ACTIVE' },
          },
        }),
      );
      const loanDeduction = emiDue.reduce((s, r) => s + Number(r.amount), 0);

      const advances = await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.hrAdvance.findMany({
          where: {
            tenant_id: user.tenantId,
            employee_id: emp.id,
            deleted_at: null,
            status: 'OPEN',
            outstanding: { gt: 0 },
          },
        }),
      );
      const advanceDeduction = advances.reduce((s, a) => s + Number(a.outstanding), 0);

      const basic = Number(emp.basic_salary);
      const housing = Number(emp.housing_allowance);
      const transport = Number(emp.transport_allowance);
      const mobile = Number(emp.mobile_allowance);
      const other = Number(emp.other_allowance);
      const social = Number(emp.social_security_amount);

      const gross = basic + housing + transport + mobile + other + overtime + bonus;
      const totalDeductions = loanDeduction + advanceDeduction + social;
      const net = gross - totalDeductions;

      const line = await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.hrPayrollLine.upsert({
          where: {
            payroll_run_id_employee_id: { payroll_run_id: runId, employee_id: emp.id },
          },
          create: {
            tenant_id: user.tenantId,
            payroll_run_id: runId,
            employee_id: emp.id,
            basic,
            housing,
            transport,
            mobile,
            overtime,
            overtime_hours: otHours,
            other_allowance: other,
            bonus,
            loan_deduction: loanDeduction,
            advance_deduction: advanceDeduction,
            social_security: social,
            gross_pay: gross,
            total_deductions: totalDeductions,
            net_pay: net,
          },
          update: {
            basic,
            housing,
            transport,
            mobile,
            overtime,
            overtime_hours: otHours,
            other_allowance: other,
            bonus,
            loan_deduction: loanDeduction,
            advance_deduction: advanceDeduction,
            social_security: social,
            gross_pay: gross,
            total_deductions: totalDeductions,
            net_pay: net,
          },
        }),
      );
      lines.push(line);
    }

    await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrPayrollRun.update({
        where: { id: runId },
        data: { generated_at: new Date(), updated_by: user.id },
      }),
    );

    return { success: true, data: { run_id: runId, lines_generated: lines.length, lines } };
  }

  async finalizeRun(user: CurrentUser, runId: string) {
    const run = await this.requireRun(user.tenantId, runId);
    if (run.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT payroll runs can be finalized.');
    }

    const companyId = run.company_id;
    const company = companyId
      ? await this.prisma.runWithTenant(user.tenantId, (tx) =>
          tx.company.findFirst({ where: { id: companyId, tenant_id: user.tenantId } }),
        )
      : await this.prisma.runWithTenant(user.tenantId, (tx) =>
          tx.company.findFirst({ where: { tenant_id: user.tenantId, is_default: true, deleted_at: null } }),
        );

    if (!company?.wps_employer_mol_id) {
      throw new BadRequestException('Company WPS employer MOL ID (wps_employer_mol_id) is required.');
    }

    const lines = run.lines ?? [];
    const missingWps = lines.filter((l) => {
      const emp = l.employee;
      return !emp?.mol_employee_id || !emp?.iban;
    });
    if (missingWps.length > 0) {
      throw new BadRequestException(
        `${missingWps.length} employee(s) missing mol_employee_id or IBAN for WPS.`,
      );
    }

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrPayrollRun.update({
        where: { id: runId },
        data: { status: 'FINALIZED', finalized_at: new Date(), updated_by: user.id },
      }),
    );

    return { success: true, data: updated };
  }

  async postToGl(user: CurrentUser, runId: string) {
    const result = await this.glAutoPost.postPayrollRunToGl(user.tenantId, runId, user.id);
    if (result.voucher_id) {
      await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.hrPayrollRun.update({
          where: { id: runId },
          data: { status: 'GL_POSTED', posted_at: new Date(), updated_by: user.id },
        }),
      );
    }
    return { success: true, data: result };
  }

  async calculateGratuity(user: CurrentUser, query: GratuityQueryDto) {
    const employee = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.findFirst({
        where: { id: query.employee_id, tenant_id: user.tenantId, deleted_at: null },
      }),
    );
    if (!employee) throw new NotFoundException('Employee not found.');

    const asOf = query.as_of ? toUtcDateOnly(query.as_of) : new Date();
    const join = employee.joining_date;
    const ms = asOf.getTime() - join.getTime();
    let serviceYears = ms / (365.25 * 86_400_000);

    const unpaidDays = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLeaveRequest.findMany({
        where: {
          tenant_id: user.tenantId,
          employee_id: employee.id,
          deleted_at: null,
          status: 'APPROVED',
          leave_type: 'UNPAID',
          end_date: { lte: asOf },
        },
        select: { days: true },
      }),
    );
    const totalUnpaid = unpaidDays.reduce((s, r) => s + Number(r.days), 0);
    serviceYears = Math.max(0, serviceYears - totalUnpaid / 365.25);

    const result = calculateUaeGratuity(Number(employee.basic_salary), serviceYears);
    return {
      success: true,
      data: {
        employee_id: employee.id,
        as_of: formatDateOnly(asOf),
        unpaid_leave_days_deducted: totalUnpaid,
        ...result,
      },
    };
  }

  async generateWpsSif(user: CurrentUser, runId: string) {
    const run = await this.requireRun(user.tenantId, runId);
    const company = run.company_id
      ? await this.prisma.runWithTenant(user.tenantId, (tx) =>
          tx.company.findFirst({ where: { id: run.company_id! } }),
        )
      : await this.prisma.runWithTenant(user.tenantId, (tx) =>
          tx.company.findFirst({ where: { tenant_id: user.tenantId, is_default: true } }),
        );

    const employerMol = company?.wps_employer_mol_id ?? '';
    const agentRouting = company?.wps_agent_routing_code ?? '';
    const payStart = formatDateOnly(run.period_start).replace(/-/g, '');
    const payEnd = formatDateOnly(run.period_end).replace(/-/g, '');

    const header = ['EDR', employerMol, agentRouting, payStart, payEnd, run.currency_code].join(',');
    const edrRows = (run.lines ?? []).map((line) => {
      const emp = line.employee!;
      return [
        'EDR',
        emp.mol_employee_id ?? '',
        emp.iban ?? '',
        payStart,
        payEnd,
        Number(line.net_pay).toFixed(2),
        '0.00',
        '0.00',
      ].join(',');
    });

    const csv = [header, ...edrRows].join('\n');
    return { success: true, data: { payroll_run_id: runId, csv } };
  }

  async generatePayslip(user: CurrentUser, runId: string, employeeId: string) {
    const run = await this.requireRun(user.tenantId, runId);
    const line = run.lines?.find((l) => l.employee_id === employeeId);
    if (!line) throw new NotFoundException('Payroll line not found for employee.');

    const emp = line.employee!;
    const html = this.buildPayslipHtml(run, line, emp);
    const buffer = await this.pdf.renderHtmlToPdf(html);
    const stored = await this.storage.saveBuffer(
      user.tenantId,
      buffer,
      `payslip-${run.payroll_year}-${run.payroll_month}-${emp.employee_code}.pdf`,
    );

    await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrPayrollLine.update({
        where: { id: line.id },
        data: { payslip_path: stored.s3Key },
      }),
    );

    return { success: true, data: { payslip_path: stored.s3Key, file_url: stored.fileUrl } };
  }

  async emailPayslip(user: CurrentUser, runId: string, employeeId: string, dto: PayslipEmailDto) {
    const run = await this.requireRun(user.tenantId, runId);
    const line = run.lines?.find((l) => l.employee_id === employeeId);
    if (!line?.employee) throw new NotFoundException('Payroll line not found.');

    let payslipPath = line.payslip_path;
    if (!payslipPath) {
      const gen = await this.generatePayslip(user, runId, employeeId);
      payslipPath = gen.data.payslip_path;
    }

    const emp = line.employee;
    if (!emp.email) throw new BadRequestException('Employee has no email address.');

    const subject =
      dto.subject ??
      `Payslip ${run.payroll_year}-${String(run.payroll_month).padStart(2, '0')} — ${emp.first_name} ${emp.last_name}`;
    const body =
      dto.body ??
      `Dear ${emp.first_name},\n\nPlease find attached your payslip for ${run.payroll_year}-${run.payroll_month}.\n\nRegards,\nHR`;

    await this.email.send({
      tenantId: user.tenantId,
      eventType: 'OTHER',
      to: emp.email,
      subject,
      body,
      attachmentPath: payslipPath ?? undefined,
      attachmentName: `payslip-${emp.employee_code}.pdf`,
      createdBy: user.id,
    });

    return { success: true, data: { emailed_to: emp.email } };
  }

  async upsertGlSettings(user: CurrentUser, dto: PayrollGlSettingDto) {
    const salaryAccount =
      dto.salary_expense_account_id ??
      (await this.findAccountByCode(user.tenantId, '6200'))?.id ??
      (await this.findAccountByCode(user.tenantId, '6100'))?.id;
    const payableAccount =
      dto.payroll_payable_account_id ??
      (await this.findAccountByCode(user.tenantId, '2300'))?.id ??
      (await this.findAccountByCode(user.tenantId, '2100'))?.id;

    if (!salaryAccount || !payableAccount) {
      throw new BadRequestException('Salary expense and payroll payable GL accounts are required.');
    }

    const companyId = dto.company_id ?? null;

    const row = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const existing = await tx.hrPayrollGlSetting.findFirst({
        where: { tenant_id: user.tenantId, company_id: companyId },
      });

      const data = {
        salary_expense_account_id: salaryAccount,
        payroll_payable_account_id: payableAccount,
        deduction_account_id: dto.deduction_account_id ?? null,
        bonus_percent_per_score_point: dto.bonus_percent_per_score_point ?? 0.1,
        updated_by: user.id,
      };

      if (existing) {
        return tx.hrPayrollGlSetting.update({ where: { id: existing.id }, data });
      }

      return tx.hrPayrollGlSetting.create({
        data: {
          tenant_id: user.tenantId,
          company_id: companyId,
          ...data,
        },
      });
    });

    return { success: true, data: row };
  }

  private buildPayslipHtml(
    run: { payroll_year: number; payroll_month: number; currency_code: string; period_start: Date; period_end: Date },
    line: {
      basic: Prisma.Decimal;
      housing: Prisma.Decimal;
      transport: Prisma.Decimal;
      mobile: Prisma.Decimal;
      overtime: Prisma.Decimal;
      bonus: Prisma.Decimal;
      loan_deduction: Prisma.Decimal;
      advance_deduction: Prisma.Decimal;
      social_security: Prisma.Decimal;
      gross_pay: Prisma.Decimal;
      total_deductions: Prisma.Decimal;
      net_pay: Prisma.Decimal;
    },
    emp: { employee_code: string; first_name: string; last_name: string },
  ): string {
    const fmt = (n: Prisma.Decimal | number) => Number(n).toFixed(2);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payslip</title>
<style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px;text-align:left}</style>
</head><body>
<h1>Payslip — ${run.payroll_year}-${String(run.payroll_month).padStart(2, '0')}</h1>
<p><strong>${emp.first_name} ${emp.last_name}</strong> (${emp.employee_code})</p>
<p>Period: ${formatDateOnly(run.period_start)} to ${formatDateOnly(run.period_end)}</p>
<h2>Earnings</h2>
<table>
<tr><th>Component</th><th>Amount (${run.currency_code})</th></tr>
<tr><td>Basic</td><td>${fmt(line.basic)}</td></tr>
<tr><td>Housing</td><td>${fmt(line.housing)}</td></tr>
<tr><td>Transport</td><td>${fmt(line.transport)}</td></tr>
<tr><td>Mobile</td><td>${fmt(line.mobile)}</td></tr>
<tr><td>Overtime</td><td>${fmt(line.overtime)}</td></tr>
<tr><td>Bonus</td><td>${fmt(line.bonus)}</td></tr>
<tr><td><strong>Gross</strong></td><td><strong>${fmt(line.gross_pay)}</strong></td></tr>
</table>
<h2>Deductions</h2>
<table>
<tr><td>Loan EMI</td><td>${fmt(line.loan_deduction)}</td></tr>
<tr><td>Advance</td><td>${fmt(line.advance_deduction)}</td></tr>
<tr><td>Social Security</td><td>${fmt(line.social_security)}</td></tr>
<tr><td><strong>Total Deductions</strong></td><td><strong>${fmt(line.total_deductions)}</strong></td></tr>
</table>
<p><strong>Net Pay: ${fmt(line.net_pay)} ${run.currency_code}</strong></p>
</body></html>`;
  }

  private async requireRun(tenantId: string, id: string) {
    const run = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrPayrollRun.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: {
            include: {
              employee: {
                select: {
                  id: true,
                  employee_code: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  mol_employee_id: true,
                  iban: true,
                  basic_salary: true,
                },
              },
            },
          },
        },
      }),
    );
    if (!run) throw new NotFoundException('Payroll run not found.');
    return run;
  }

  private async resolveGlSettings(tenantId: string, companyId: string | null) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrPayrollGlSetting.findFirst({
        where: { tenant_id: tenantId, company_id: companyId },
      }),
    );
  }

  private async findAccountByCode(tenantId: string, code: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.findFirst({
        where: { tenant_id: tenantId, account_code: code, deleted_at: null },
      }),
    );
  }
}
