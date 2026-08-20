import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentNumberType, Prisma, VoucherType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { lockVoucherRow } from '../../common/utils/row-lock.util';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import {
  CreateVoucherDto,
  CreateVoucherLineDto,
  UpdateVoucherDto,
  UpdateVoucherLineDto,
  VoucherQueryDto,
} from './dto/gl.dto';

const VOUCHER_TYPE_PREFIX: Record<VoucherType, string> = {
  JOURNAL: 'JV',
  BANK_PAYMENT: 'BPV',
  CASH_PAYMENT: 'CPV',
  BANK_RECEIPT: 'BRV',
  CASH_RECEIPT: 'CRV',
  CONTRA: 'CV',
  PURCHASE_INVOICE: 'PIV',
  PURCHASE_CREDIT_NOTE: 'PCN',
  OPENING_BALANCE: 'OB',
  RECURRING: 'RV',
};

@Injectable()
export class VouchersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  async findAll(tenantId: string, query: VoucherQueryDto) {
    const where: Prisma.VoucherWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };
    if (query.voucher_type) where.voucher_type = query.voucher_type;
    if (query.status) where.status = query.status;
    if (query.party_id) where.party_id = query.party_id;
    if (query.job_id) where.job_id = query.job_id;
    if (query.from_date || query.to_date) {
      where.voucher_date = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }
    if (query.search) {
      where.OR = [
        { voucher_number: { contains: query.search, mode: 'insensitive' } },
        { narration: { contains: query.search, mode: 'insensitive' } },
        { reference_number: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.findMany({
        where,
        include: { lines: { where: { deleted_at: null }, orderBy: { line_no: 'asc' } } },
        orderBy: [{ voucher_date: 'desc' }, { created_at: 'desc' }],
      }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const voucher = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: {
            where: { deleted_at: null },
            orderBy: { line_no: 'asc' },
            include: {
              account: {
                select: { id: true, account_code: true, account_name: true, account_group: true },
              },
            },
          },
        },
      }),
    );
    if (!voucher) throw new NotFoundException('Voucher not found.');
    return voucher;
  }

  async create(tenantId: string, dto: CreateVoucherDto, actorId?: string) {
    const voucherNumber = await this.numberGenerator.generate(
      tenantId,
      DocumentNumberType.VOUCHER,
      { extraSegment: VOUCHER_TYPE_PREFIX[dto.voucher_type] },
    );

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (dto.lines?.length) {
        await this.assertPostableAccounts(tx, tenantId, dto.lines.map((l) => l.account_id));
      }

      const voucher = await tx.voucher.create({
        data: {
          tenant_id: tenantId,
          voucher_number: voucherNumber,
          voucher_type: dto.voucher_type,
          currency_code: dto.currency_code ?? 'AED',
          exchange_rate: dto.exchange_rate ?? 1,
          voucher_date: dto.voucher_date ? new Date(dto.voucher_date) : new Date(),
          narration: dto.narration,
          reference_number: dto.reference_number,
          company_id: dto.company_id,
          branch_id: dto.branch_id,
          party_id: dto.party_id,
          job_id: dto.job_id,
          invoice_id: dto.invoice_id,
          created_by: actorId,
          updated_by: actorId,
          lines: dto.lines?.length
            ? {
                create: dto.lines.map((line, idx) =>
                  this.mapLineCreate(tenantId, line, idx + 1, dto.exchange_rate ?? 1, actorId),
                ),
              }
            : undefined,
        },
        include: { lines: { where: { deleted_at: null }, orderBy: { line_no: 'asc' } } },
      });

      return this.recalculateTotals(tx, voucher.id);
    });
  }

  async update(tenantId: string, id: string, dto: UpdateVoucherDto, actorId?: string) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft vouchers can be updated.');
    }

    const { lines: _ignore, ...header } = dto;
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.update({
        where: { id },
        data: {
          ...(header.voucher_type !== undefined ? { voucher_type: header.voucher_type } : {}),
          ...(header.currency_code !== undefined ? { currency_code: header.currency_code } : {}),
          ...(header.exchange_rate !== undefined ? { exchange_rate: header.exchange_rate } : {}),
          ...(header.voucher_date !== undefined ? { voucher_date: new Date(header.voucher_date) } : {}),
          ...(header.narration !== undefined ? { narration: header.narration } : {}),
          ...(header.reference_number !== undefined ? { reference_number: header.reference_number } : {}),
          ...(header.company_id !== undefined ? { company_id: header.company_id } : {}),
          ...(header.branch_id !== undefined ? { branch_id: header.branch_id } : {}),
          ...(header.party_id !== undefined ? { party_id: header.party_id } : {}),
          ...(header.job_id !== undefined ? { job_id: header.job_id } : {}),
          ...(header.invoice_id !== undefined ? { invoice_id: header.invoice_id } : {}),
          updated_by: actorId,
        },
      }),
    );
    return this.findOne(tenantId, id);
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft vouchers can be deleted.');
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.update({
        where: { id },
        data: { deleted_at: new Date(), status: 'CANCELLED', updated_by: actorId },
      }),
    );
  }

  async addLine(tenantId: string, voucherId: string, dto: CreateVoucherLineDto, actorId?: string) {
    const voucher = await this.findOne(tenantId, voucherId);
    if (voucher.status !== 'DRAFT') {
      throw new BadRequestException('Only draft vouchers can be edited.');
    }
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertPostableAccounts(tx, tenantId, [dto.account_id]);
      const nextNo = (voucher.lines.reduce((m, l) => Math.max(m, l.line_no), 0) || 0) + 1;
      await tx.voucherLine.create({
        data: this.mapLineUncheckedCreate(
          tenantId,
          voucherId,
          dto,
          nextNo,
          Number(voucher.exchange_rate),
          actorId,
        ),
      });
      return this.recalculateTotals(tx, voucherId);
    });
  }

  async updateLine(
    tenantId: string,
    voucherId: string,
    lineId: string,
    dto: UpdateVoucherLineDto,
    actorId?: string,
  ) {
    const voucher = await this.findOne(tenantId, voucherId);
    if (voucher.status !== 'DRAFT') {
      throw new BadRequestException('Only draft vouchers can be edited.');
    }
    const line = voucher.lines.find((l) => l.id === lineId);
    if (!line) throw new NotFoundException('Voucher line not found.');

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (dto.account_id) await this.assertPostableAccounts(tx, tenantId, [dto.account_id]);
      const rate = Number(dto.exchange_rate ?? line.exchange_rate ?? voucher.exchange_rate);
      const debit = Number(dto.debit_amount ?? line.debit_amount);
      const credit = Number(dto.credit_amount ?? line.credit_amount);
      this.assertLineAmounts(debit, credit);

      await tx.voucherLine.update({
        where: { id: lineId },
        data: {
          ...(dto.account_id !== undefined ? { account_id: dto.account_id } : {}),
          ...(dto.debit_amount !== undefined ? { debit_amount: debit, debit_base: debit * rate } : {}),
          ...(dto.credit_amount !== undefined ? { credit_amount: credit, credit_base: credit * rate } : {}),
          ...(dto.currency_code !== undefined ? { currency_code: dto.currency_code } : {}),
          ...(dto.exchange_rate !== undefined ? { exchange_rate: rate } : {}),
          ...(dto.narration !== undefined ? { narration: dto.narration } : {}),
          ...(dto.party_id !== undefined ? { party_id: dto.party_id } : {}),
          ...(dto.job_id !== undefined ? { job_id: dto.job_id } : {}),
          ...(dto.cost_center !== undefined ? { cost_center: dto.cost_center } : {}),
          updated_by: actorId,
        },
      });
      return this.recalculateTotals(tx, voucherId);
    });
  }

  async removeLine(tenantId: string, voucherId: string, lineId: string, actorId?: string) {
    const voucher = await this.findOne(tenantId, voucherId);
    if (voucher.status !== 'DRAFT') {
      throw new BadRequestException('Only draft vouchers can be edited.');
    }
    if (!voucher.lines.some((l) => l.id === lineId)) {
      throw new NotFoundException('Voucher line not found.');
    }
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.voucherLine.update({
        where: { id: lineId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
      return this.recalculateTotals(tx, voucherId);
    });
  }

  async post(tenantId: string, id: string, actorId?: string) {
    const voucher = await this.findOne(tenantId, id);
    if (voucher.status !== 'DRAFT') {
      throw new BadRequestException('Only draft vouchers can be posted.');
    }
    if (!voucher.lines.length) {
      throw new BadRequestException('Cannot post a voucher with no lines.');
    }

    const debit = Number(voucher.total_debit);
    const credit = Number(voucher.total_credit);
    if (Math.abs(debit - credit) > 0.0001) {
      throw new BadRequestException(
        `Voucher is not balanced (debit ${debit} ≠ credit ${credit}).`,
      );
    }
    if (debit <= 0) {
      throw new BadRequestException('Voucher totals must be greater than zero.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const locked = await lockVoucherRow(tx, tenantId, id);
      if (!locked || locked.status !== 'DRAFT') {
        throw new BadRequestException('Only draft vouchers can be posted.');
      }

      return tx.voucher.update({
        where: { id },
        data: {
          status: 'POSTED',
          posted_at: new Date(),
          posted_by: actorId,
          updated_by: actorId,
        },
        include: { lines: { where: { deleted_at: null }, orderBy: { line_no: 'asc' } } },
      });
    });
  }

  async reverse(tenantId: string, id: string, actorId?: string) {
    const original = await this.findOne(tenantId, id);
    if (original.status !== 'POSTED') {
      throw new BadRequestException('Only posted vouchers can be reversed.');
    }

    const reversalNumber = await this.numberGenerator.generate(
      tenantId,
      DocumentNumberType.VOUCHER,
      { extraSegment: VOUCHER_TYPE_PREFIX[original.voucher_type] },
    );

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const reversal = await tx.voucher.create({
        data: {
          tenant_id: tenantId,
          voucher_number: reversalNumber,
          voucher_type: original.voucher_type,
          status: 'POSTED',
          voucher_date: new Date(),
          currency_code: original.currency_code,
          exchange_rate: original.exchange_rate,
          narration: `Reversal of ${original.voucher_number}${original.narration ? ` — ${original.narration}` : ''}`,
          reference_number: original.reference_number,
          company_id: original.company_id,
          branch_id: original.branch_id,
          party_id: original.party_id,
          job_id: original.job_id,
          invoice_id: original.invoice_id,
          reversal_of_id: original.id,
          total_debit: original.total_credit,
          total_credit: original.total_debit,
          posted_at: new Date(),
          posted_by: actorId,
          created_by: actorId,
          updated_by: actorId,
          lines: {
            create: original.lines.map((line, idx) => ({
              tenant_id: tenantId,
              account_id: line.account_id,
              line_no: idx + 1,
              debit_amount: line.credit_amount,
              credit_amount: line.debit_amount,
              currency_code: line.currency_code,
              exchange_rate: line.exchange_rate,
              debit_base: line.credit_base,
              credit_base: line.debit_base,
              narration: line.narration,
              party_id: line.party_id,
              job_id: line.job_id,
              cost_center: line.cost_center,
              created_by: actorId,
              updated_by: actorId,
            })),
          },
        },
        include: { lines: { where: { deleted_at: null }, orderBy: { line_no: 'asc' } } },
      });

      await tx.voucher.update({
        where: { id: original.id },
        data: {
          status: 'REVERSED',
          reversed_at: new Date(),
          reversed_by: actorId,
          updated_by: actorId,
        },
      });

      return reversal;
    });
  }

  private mapLineCreate(
    tenantId: string,
    dto: CreateVoucherLineDto,
    lineNo: number,
    headerRate: number,
    actorId?: string,
  ): Prisma.VoucherLineCreateWithoutVoucherInput {
    const debit = Number(dto.debit_amount ?? 0);
    const credit = Number(dto.credit_amount ?? 0);
    this.assertLineAmounts(debit, credit);
    const rate = Number(dto.exchange_rate ?? headerRate);

    return {
      tenant_id: tenantId,
      line_no: lineNo,
      debit_amount: debit,
      credit_amount: credit,
      currency_code: dto.currency_code,
      exchange_rate: rate,
      debit_base: debit * rate,
      credit_base: credit * rate,
      narration: dto.narration,
      cost_center: dto.cost_center,
      created_by: actorId,
      updated_by: actorId,
      account: { connect: { id: dto.account_id } },
      ...(dto.party_id ? { party: { connect: { id: dto.party_id } } } : {}),
      ...(dto.job_id ? { job: { connect: { id: dto.job_id } } } : {}),
    };
  }

  private mapLineUncheckedCreate(
    tenantId: string,
    voucherId: string,
    dto: CreateVoucherLineDto,
    lineNo: number,
    headerRate: number,
    actorId?: string,
  ): Prisma.VoucherLineUncheckedCreateInput {
    const debit = Number(dto.debit_amount ?? 0);
    const credit = Number(dto.credit_amount ?? 0);
    this.assertLineAmounts(debit, credit);
    const rate = Number(dto.exchange_rate ?? headerRate);

    return {
      tenant_id: tenantId,
      voucher_id: voucherId,
      account_id: dto.account_id,
      line_no: lineNo,
      debit_amount: debit,
      credit_amount: credit,
      currency_code: dto.currency_code,
      exchange_rate: rate,
      debit_base: debit * rate,
      credit_base: credit * rate,
      narration: dto.narration,
      party_id: dto.party_id,
      job_id: dto.job_id,
      cost_center: dto.cost_center,
      created_by: actorId,
      updated_by: actorId,
    };
  }

  private assertLineAmounts(debit: number, credit: number) {
    if (debit < 0 || credit < 0) {
      throw new BadRequestException('Debit and credit amounts cannot be negative.');
    }
    if (debit > 0 && credit > 0) {
      throw new BadRequestException('A voucher line cannot have both debit and credit.');
    }
    if (debit === 0 && credit === 0) {
      throw new BadRequestException('A voucher line must have either a debit or a credit amount.');
    }
  }

  private async assertPostableAccounts(
    tx: Prisma.TransactionClient,
    tenantId: string,
    accountIds: string[],
  ) {
    const unique = [...new Set(accountIds)];
    const accounts = await tx.chartOfAccount.findMany({
      where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
    });
    if (accounts.length !== unique.length) {
      throw new BadRequestException('One or more GL accounts were not found.');
    }
    for (const a of accounts) {
      if (!a.is_active || !a.is_postable || a.is_header) {
        throw new BadRequestException(
          `Account ${a.account_code} is not postable. Use a leaf/postable account.`,
        );
      }
    }
  }

  private async recalculateTotals(tx: Prisma.TransactionClient, voucherId: string) {
    const lines = await tx.voucherLine.findMany({
      where: { voucher_id: voucherId, deleted_at: null },
    });
    const totalDebit = lines.reduce((s, l) => s + Number(l.debit_base), 0);
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit_base), 0);
    return tx.voucher.update({
      where: { id: voucherId },
      data: { total_debit: totalDebit, total_credit: totalCredit },
      include: {
        lines: {
          where: { deleted_at: null },
          orderBy: { line_no: 'asc' },
          include: {
            account: {
              select: { id: true, account_code: true, account_name: true, account_group: true },
            },
          },
        },
      },
    });
  }
}
