import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountGroup, AccountSubType, AccountType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ChartOfAccountQueryDto,
  CreateChartOfAccountDto,
  LedgerQueryDto,
  TrialBalanceQueryDto,
  UpdateChartOfAccountDto,
} from './dto/gl.dto';

type DefaultAccountSeed = {
  account_code: string;
  account_name: string;
  account_group: AccountGroup;
  account_type: AccountType;
  account_sub_type: AccountSubType;
  is_header?: boolean;
  is_postable?: boolean;
  is_bank_account?: boolean;
  is_cash_account?: boolean;
  sort_order: number;
};

const DEFAULT_COA: DefaultAccountSeed[] = [
  { account_code: '1000', account_name: 'Current Assets', account_group: 'ASSETS', account_type: 'CURRENT_ASSET', account_sub_type: 'GENERAL', is_header: true, is_postable: false, sort_order: 10 },
  { account_code: '1100', account_name: 'Cash on Hand', account_group: 'ASSETS', account_type: 'CURRENT_ASSET', account_sub_type: 'CASH', is_cash_account: true, sort_order: 11 },
  { account_code: '1200', account_name: 'Bank Accounts', account_group: 'ASSETS', account_type: 'CURRENT_ASSET', account_sub_type: 'BANK', is_bank_account: true, sort_order: 12 },
  { account_code: '1300', account_name: 'Trade Receivables', account_group: 'ASSETS', account_type: 'CURRENT_ASSET', account_sub_type: 'TRADE_RECEIVABLE', sort_order: 13 },
  { account_code: '1400', account_name: 'Input VAT / Tax Recoverable', account_group: 'ASSETS', account_type: 'CURRENT_ASSET', account_sub_type: 'TAX', sort_order: 14 },
  { account_code: '2000', account_name: 'Current Liabilities', account_group: 'LIABILITIES', account_type: 'CURRENT_LIABILITY', account_sub_type: 'GENERAL', is_header: true, is_postable: false, sort_order: 20 },
  { account_code: '2100', account_name: 'Trade Payables', account_group: 'LIABILITIES', account_type: 'CURRENT_LIABILITY', account_sub_type: 'TRADE_PAYABLE', sort_order: 21 },
  { account_code: '2200', account_name: 'Output VAT / Tax Payable', account_group: 'LIABILITIES', account_type: 'CURRENT_LIABILITY', account_sub_type: 'TAX', sort_order: 22 },
  { account_code: '3000', account_name: 'Equity', account_group: 'EQUITY', account_type: 'EQUITY', account_sub_type: 'EQUITY', is_header: true, is_postable: false, sort_order: 30 },
  { account_code: '3100', account_name: 'Owner Capital', account_group: 'EQUITY', account_type: 'EQUITY', account_sub_type: 'EQUITY', sort_order: 31 },
  { account_code: '3200', account_name: 'Retained Earnings', account_group: 'EQUITY', account_type: 'EQUITY', account_sub_type: 'EQUITY', sort_order: 32 },
  { account_code: '4000', account_name: 'Revenue', account_group: 'REVENUE', account_type: 'REVENUE', account_sub_type: 'REVENUE', is_header: true, is_postable: false, sort_order: 40 },
  { account_code: '4100', account_name: 'Freight Revenue', account_group: 'REVENUE', account_type: 'REVENUE', account_sub_type: 'REVENUE', sort_order: 41 },
  { account_code: '4200', account_name: 'Other Income', account_group: 'REVENUE', account_type: 'OTHER_INCOME', account_sub_type: 'REVENUE', sort_order: 42 },
  { account_code: '5000', account_name: 'Cost of Sales', account_group: 'EXPENSES', account_type: 'COST_OF_SALES', account_sub_type: 'EXPENSE', is_header: true, is_postable: false, sort_order: 50 },
  { account_code: '5100', account_name: 'Freight Cost', account_group: 'EXPENSES', account_type: 'COST_OF_SALES', account_sub_type: 'EXPENSE', sort_order: 51 },
  { account_code: '6000', account_name: 'Operating Expenses', account_group: 'EXPENSES', account_type: 'EXPENSE', account_sub_type: 'EXPENSE', is_header: true, is_postable: false, sort_order: 60 },
  { account_code: '6100', account_name: 'General & Admin Expenses', account_group: 'EXPENSES', account_type: 'EXPENSE', account_sub_type: 'EXPENSE', sort_order: 61 },
  { account_code: '6200', account_name: 'Salaries & Wages', account_group: 'EXPENSES', account_type: 'EXPENSE', account_sub_type: 'EXPENSE', sort_order: 62 },
  { account_code: '2300', account_name: 'Payroll Payable', account_group: 'LIABILITIES', account_type: 'CURRENT_LIABILITY', account_sub_type: 'GENERAL', sort_order: 23 },
];

@Injectable()
export class ChartOfAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: ChartOfAccountQueryDto) {
    const where: Prisma.ChartOfAccountWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };
    if (query.account_group) where.account_group = query.account_group;
    if (query.account_type) where.account_type = query.account_type;
    if (query.is_postable !== undefined) where.is_postable = query.is_postable;
    if (query.is_active !== undefined) where.is_active = query.is_active;
    if (query.search) {
      where.OR = [
        { account_code: { contains: query.search, mode: 'insensitive' } },
        { account_name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.findMany({
        where,
        orderBy: [{ sort_order: 'asc' }, { account_code: 'asc' }],
      }),
    );
  }

  async getTree(tenantId: string) {
    const accounts = await this.findAll(tenantId, {});
    type Node = (typeof accounts)[number] & { children: Node[] };
    const byId = new Map<string, Node>();
    for (const a of accounts) byId.set(a.id, { ...a, children: [] });
    const roots: Node[] = [];
    for (const node of byId.values()) {
      if (node.parent_id && byId.has(node.parent_id)) {
        byId.get(node.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async findOne(tenantId: string, id: string) {
    const account = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: { children: { where: { deleted_at: null }, orderBy: { account_code: 'asc' } } },
      }),
    );
    if (!account) throw new NotFoundException('Account not found.');
    return account;
  }

  async create(tenantId: string, dto: CreateChartOfAccountDto, actorId?: string) {
    if (dto.parent_id) {
      await this.findOne(tenantId, dto.parent_id);
    }
    const isHeader = dto.is_header ?? false;
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.create({
        data: {
          tenant_id: tenantId,
          account_code: dto.account_code,
          account_name: dto.account_name,
          account_name_ar: dto.account_name_ar,
          account_group: dto.account_group,
          account_type: dto.account_type,
          account_sub_type: dto.account_sub_type ?? 'GENERAL',
          company_id: dto.company_id,
          parent_id: dto.parent_id,
          is_header: isHeader,
          is_postable: dto.is_postable ?? !isHeader,
          is_bank_account: dto.is_bank_account ?? false,
          is_cash_account: dto.is_cash_account ?? false,
          currency_code: dto.currency_code,
          opening_balance: dto.opening_balance ?? 0,
          opening_balance_type: dto.opening_balance_type ?? 'DEBIT',
          allow_manual_entry: dto.allow_manual_entry ?? true,
          is_active: dto.is_active ?? true,
          sort_order: dto.sort_order ?? 0,
          notes: dto.notes,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async update(tenantId: string, id: string, dto: UpdateChartOfAccountDto, actorId?: string) {
    await this.findOne(tenantId, id);
    if (dto.parent_id === id) {
      throw new BadRequestException('An account cannot be its own parent.');
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.update({
        where: { id },
        data: {
          ...dto,
          updated_by: actorId,
        },
      }),
    );
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    const linked = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucherLine.count({
        where: { tenant_id: tenantId, account_id: id, deleted_at: null },
      }),
    );
    if (linked > 0) {
      throw new BadRequestException('Cannot delete an account that has voucher lines. Deactivate it instead.');
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.update({
        where: { id },
        data: { deleted_at: new Date(), is_active: false, updated_by: actorId },
      }),
    );
  }

  async seedDefaults(tenantId: string, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.chartOfAccount.count({
        where: { tenant_id: tenantId, deleted_at: null },
      });
      if (existing > 0) {
        throw new BadRequestException('Chart of accounts already has accounts. Seed skipped.');
      }

      const created = [];
      for (const seed of DEFAULT_COA) {
        const row = await tx.chartOfAccount.create({
          data: {
            tenant_id: tenantId,
            account_code: seed.account_code,
            account_name: seed.account_name,
            account_group: seed.account_group,
            account_type: seed.account_type,
            account_sub_type: seed.account_sub_type,
            is_header: seed.is_header ?? false,
            is_postable: seed.is_postable ?? !(seed.is_header ?? false),
            is_bank_account: seed.is_bank_account ?? false,
            is_cash_account: seed.is_cash_account ?? false,
            sort_order: seed.sort_order,
            created_by: actorId,
            updated_by: actorId,
          },
        });
        created.push(row);
      }
      return { success: true, count: created.length, accounts: created };
    });
  }

  async getLedger(tenantId: string, accountId: string, query: LedgerQueryDto) {
    const account = await this.findOne(tenantId, accountId);
    const where: Prisma.VoucherLineWhereInput = {
      tenant_id: tenantId,
      account_id: accountId,
      deleted_at: null,
      voucher: {
        tenant_id: tenantId,
        status: 'POSTED',
        deleted_at: null,
      },
    };
    if (query.from_date || query.to_date) {
      where.voucher = {
        ...(where.voucher as Prisma.VoucherWhereInput),
        voucher_date: {
          ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
          ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
        },
      };
    }

    const lines = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucherLine.findMany({
        where,
        include: {
          voucher: {
            select: {
              id: true,
              voucher_number: true,
              voucher_type: true,
              voucher_date: true,
              narration: true,
              status: true,
            },
          },
        },
        orderBy: [{ voucher: { voucher_date: 'asc' } }, { line_no: 'asc' }],
      }),
    );

    let opening = Number(account.opening_balance);
    if (account.opening_balance_type === 'CREDIT') opening = -opening;

    let running = opening;
    const entries = lines.map((line) => {
      const debit = Number(line.debit_base);
      const credit = Number(line.credit_base);
      running += debit - credit;
      return {
        ...line,
        debit_base: debit,
        credit_base: credit,
        running_balance: running,
      };
    });

    return {
      account,
      opening_balance: opening,
      closing_balance: running,
      entries,
    };
  }

  async getTrialBalance(tenantId: string, query: TrialBalanceQueryDto) {
    const hideZero = query.hide_zero !== false;
    const accounts = await this.findAll(tenantId, { is_active: true });

    const lineWhere: Prisma.VoucherLineWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      voucher: {
        tenant_id: tenantId,
        status: 'POSTED',
        deleted_at: null,
        ...(query.from_date || query.to_date
          ? {
              voucher_date: {
                ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
                ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
              },
            }
          : {}),
      },
    };

    const aggregates = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucherLine.groupBy({
        by: ['account_id'],
        where: lineWhere,
        _sum: { debit_base: true, credit_base: true },
      }),
    );
    const byAccount = new Map(
      aggregates.map((a) => [
        a.account_id,
        {
          debit: Number(a._sum.debit_base ?? 0),
          credit: Number(a._sum.credit_base ?? 0),
        },
      ]),
    );

    const rows = accounts
      .filter((a) => a.is_postable)
      .map((a) => {
        let opening = Number(a.opening_balance);
        if (a.opening_balance_type === 'CREDIT') opening = -opening;
        const move = byAccount.get(a.id) ?? { debit: 0, credit: 0 };
        const net = opening + move.debit - move.credit;
        const debit_balance = net >= 0 ? net : 0;
        const credit_balance = net < 0 ? Math.abs(net) : 0;
        return {
          account_id: a.id,
          account_code: a.account_code,
          account_name: a.account_name,
          account_group: a.account_group,
          opening_balance: opening,
          period_debit: move.debit,
          period_credit: move.credit,
          debit_balance,
          credit_balance,
        };
      })
      .filter((r) => !hideZero || r.debit_balance !== 0 || r.credit_balance !== 0 || r.period_debit !== 0 || r.period_credit !== 0);

    const totals = rows.reduce(
      (acc, r) => {
        acc.debit += r.debit_balance;
        acc.credit += r.credit_balance;
        return acc;
      },
      { debit: 0, credit: 0 },
    );

    return {
      from_date: query.from_date ?? null,
      to_date: query.to_date ?? null,
      rows,
      totals,
      is_balanced: Math.abs(totals.debit - totals.credit) < 0.0001,
    };
  }
}
