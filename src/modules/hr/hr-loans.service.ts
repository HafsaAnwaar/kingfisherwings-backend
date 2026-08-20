import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HrLoanStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { CreateAdvanceDto, CreateLoanDto, LoanReviewDto } from './dto/hr-loan.dto';

@Injectable()
export class HrLoansService {
  constructor(private readonly prisma: PrismaService) {}

  async createLoan(user: CurrentUser, dto: CreateLoanDto) {
    const loan = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLoan.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: dto.employee_id,
          principal: dto.principal,
          interest_rate: dto.interest_rate ?? 0,
          tenure_months: dto.tenure_months,
          outstanding: dto.principal,
          status: 'PENDING',
          purpose: dto.purpose ?? null,
          created_by: user.id,
        },
        include: { employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } } },
      }),
    );
    return { success: true, data: loan };
  }

  async listLoans(user: CurrentUser, employeeId?: string, status?: HrLoanStatus) {
    const where: Prisma.HrLoanWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(employeeId ? { employee_id: employeeId } : {}),
      ...(status ? { status } : {}),
    };
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLoan.findMany({
        where,
        orderBy: { created_at: 'desc' },
        include: {
          employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
          schedule: { orderBy: { installment_no: 'asc' } },
        },
      }),
    );
    return { success: true, data };
  }

  async reviewLoan(user: CurrentUser, id: string, dto: LoanReviewDto) {
    const loan = await this.requireLoan(user.tenantId, id);
    if (loan.status !== 'PENDING') {
      throw new BadRequestException('Only pending loans can be reviewed.');
    }

    if (dto.status === 'REJECTED') {
      const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.hrLoan.update({
          where: { id },
          data: {
            status: 'REJECTED',
            review_notes: dto.review_notes ?? null,
            reviewer_id: user.id,
            reviewed_at: new Date(),
          },
        }),
      );
      return { success: true, data: updated };
    }

    if (dto.status !== 'APPROVED') {
      throw new BadRequestException('Review status must be APPROVED or REJECTED.');
    }

    const principal = Number(loan.principal);
    const rate = Number(loan.interest_rate) / 100 / 12;
    const n = loan.tenure_months;
    let emi: number;
    if (rate <= 0) {
      emi = principal / n;
    } else {
      emi = (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    }
    emi = Number(emi.toFixed(4));

    const startDate = new Date();
    startDate.setUTCDate(1);
    startDate.setUTCMonth(startDate.getUTCMonth() + 1);

    const updated = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const row = await tx.hrLoan.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          emi_amount: emi,
          outstanding: principal,
          review_notes: dto.review_notes ?? null,
          reviewer_id: user.id,
          reviewed_at: new Date(),
          start_date: startDate,
        },
      });

      const schedule = [];
      let balance = principal;
      for (let i = 1; i <= n; i += 1) {
        const interest = rate > 0 ? balance * rate : 0;
        const principalPart = emi - interest;
        balance = Math.max(0, balance - principalPart);
        const due = new Date(startDate);
        due.setUTCMonth(due.getUTCMonth() + i - 1);

        const installment = await tx.hrLoanRepayment.create({
          data: {
            tenant_id: user.tenantId,
            loan_id: id,
            installment_no: i,
            due_date: due,
            amount: emi,
          },
        });
        schedule.push(installment);
      }

      return { ...row, schedule };
    });

    return { success: true, data: updated };
  }

  async getSchedule(user: CurrentUser, id: string) {
    const loan = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLoan.findFirst({
        where: { id, tenant_id: user.tenantId, deleted_at: null },
        include: { schedule: { orderBy: { installment_no: 'asc' } } },
      }),
    );
    if (!loan) throw new NotFoundException('Loan not found.');
    return { success: true, data: loan.schedule };
  }

  async outstandingReport(user: CurrentUser) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLoan.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          status: { in: ['ACTIVE', 'APPROVED'] },
          outstanding: { gt: 0 },
        },
        include: {
          employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
          schedule: {
            where: { paid_at: null },
            orderBy: { due_date: 'asc' },
            take: 3,
          },
        },
        orderBy: { outstanding: 'desc' },
      }),
    );
    return { success: true, data };
  }

  async createAdvance(user: CurrentUser, dto: CreateAdvanceDto) {
    const advance = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrAdvance.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: dto.employee_id,
          amount: dto.amount,
          outstanding: dto.amount,
          reason: dto.reason ?? null,
          status: 'OPEN',
          created_by: user.id,
        },
        include: { employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } } },
      }),
    );
    return { success: true, data: advance };
  }

  async listAdvances(user: CurrentUser, employeeId?: string) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrAdvance.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(employeeId ? { employee_id: employeeId } : {}),
        },
        orderBy: { created_at: 'desc' },
        include: {
          employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
        },
      }),
    );
    return { success: true, data };
  }

  async closeAdvance(user: CurrentUser, id: string) {
    await this.requireAdvance(user.tenantId, id);
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrAdvance.update({
        where: { id },
        data: { status: 'CLOSED', outstanding: 0 },
      }),
    );
    return { success: true, data: updated };
  }

  private async requireLoan(tenantId: string, id: string) {
    const loan = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrLoan.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!loan) throw new NotFoundException('Loan not found.');
    return loan;
  }

  private async requireAdvance(tenantId: string, id: string) {
    const advance = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrAdvance.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!advance) throw new NotFoundException('Advance not found.');
    return advance;
  }
}
