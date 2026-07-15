import { Injectable } from '@nestjs/common';
import { AccountGroup, AccountType, Prisma, VoucherType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import {
  AsOfReportQueryDto,
  ReportPeriodQueryDto,
  VatReturnQueryDto,
} from './dto/financial-reports.dto';
import { TrialBalanceQueryDto } from './dto/gl.dto';

type AccountBalanceRow = {
  account_id: string;
  account_code: string;
  account_name: string;
  account_group: AccountGroup;
  account_type: AccountType;
  account_sub_type: string;
  is_bank_account: boolean;
  is_cash_account: boolean;
  opening: number;
  period_debit: number;
  period_credit: number;
  /** Signed balance: positive = debit nature net, negative = credit nature net */
  balance: number;
};

@Injectable()
export class FinancialReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chartOfAccounts: ChartOfAccountsService,
  ) {}

  async trialBalance(tenantId: string, query: TrialBalanceQueryDto) {
    return this.chartOfAccounts.getTrialBalance(tenantId, query);
  }

  /**
   * Balance Sheet as of a date (Ch.20.1).
   * Assets / Liabilities / Equity from cumulative account balances;
   * current-year P&L rolled into equity as retained earnings of the period.
   */
  async balanceSheet(tenantId: string, query: AsOfReportQueryDto) {
    const asOf = query.as_of ? new Date(query.as_of) : new Date();
    asOf.setHours(23, 59, 59, 999);
    const hideZero = query.hide_zero !== false;

    const yearStart = new Date(asOf.getFullYear(), 0, 1);
    const rows = await this.computeAccountBalances(tenantId, {
      toDate: asOf,
      companyId: query.company_id,
    });

    const assets = this.filterSection(rows, ['ASSETS'], hideZero);
    const liabilities = this.filterSection(rows, ['LIABILITIES'], hideZero);
    const equityAccounts = this.filterSection(rows, ['EQUITY'], hideZero);

    // Period P&L (YTD through as_of) — credit nature means profit is negative in our signed balance
    const ytd = await this.computeAccountBalances(tenantId, {
      fromDate: yearStart,
      toDate: asOf,
      companyId: query.company_id,
      groups: ['REVENUE', 'EXPENSES'],
    });
    const revenue = ytd.filter((r) => r.account_group === 'REVENUE');
    const expenses = ytd.filter((r) => r.account_group === 'EXPENSES');
    // Revenue credit balances appear as negative `balance`; profit = -sum(revenue balance) - sum(expense balance)
    // Expense debit balances are positive.
    const revenueTotal = revenue.reduce((s, r) => s + -r.balance, 0); // convert credit to positive revenue
    const expenseTotal = expenses.reduce((s, r) => s + r.balance, 0);
    const netIncome = revenueTotal - expenseTotal;

    const totalAssets = assets.reduce((s, r) => s + r.balance, 0);
    const totalLiabilities = liabilities.reduce((s, r) => s + -r.balance, 0);
    const totalEquityAccounts = equityAccounts.reduce((s, r) => s + -r.balance, 0);
    const totalEquity = totalEquityAccounts + netIncome;
    const totalLiabEquity = totalLiabilities + totalEquity;

    return {
      report: 'BALANCE_SHEET',
      as_of: asOf.toISOString().slice(0, 10),
      company_id: query.company_id ?? null,
      assets: {
        lines: assets.map((r) => this.toDisplayLine(r, 'debit')),
        total: round2(totalAssets),
      },
      liabilities: {
        lines: liabilities.map((r) => this.toDisplayLine(r, 'credit')),
        total: round2(totalLiabilities),
      },
      equity: {
        lines: [
          ...equityAccounts.map((r) => this.toDisplayLine(r, 'credit')),
          {
            account_code: 'CY-NI',
            account_name: 'Current Year Net Income / (Loss)',
            amount: round2(netIncome),
          },
        ],
        total: round2(totalEquity),
        current_year_net_income: round2(netIncome),
      },
      totals: {
        assets: round2(totalAssets),
        liabilities_and_equity: round2(totalLiabEquity),
        is_balanced: Math.abs(totalAssets - totalLiabEquity) < 0.05,
        difference: round2(totalAssets - totalLiabEquity),
      },
    };
  }

  /** Profit & Loss for a period (Ch.20.1). */
  async profitAndLoss(tenantId: string, query: ReportPeriodQueryDto) {
    const { from, to } = this.resolvePeriod(query);
    const hideZero = query.hide_zero !== false;

    const rows = await this.computeAccountBalances(tenantId, {
      fromDate: from,
      toDate: to,
      companyId: query.company_id,
      groups: ['REVENUE', 'EXPENSES'],
      openingIgnored: true,
    });

    const revenue = rows.filter((r) => r.account_group === 'REVENUE' && r.account_type !== 'OTHER_INCOME');
    const otherIncome = rows.filter((r) => r.account_type === 'OTHER_INCOME');
    const cogs = rows.filter((r) => r.account_type === 'COST_OF_SALES');
    const opex = rows.filter((r) => r.account_type === 'EXPENSE' || r.account_type === 'OTHER_EXPENSE');

    const mapCredit = (list: AccountBalanceRow[]) =>
      list
        .filter((r) => !hideZero || r.period_debit !== 0 || r.period_credit !== 0)
        .map((r) => ({
          account_id: r.account_id,
          account_code: r.account_code,
          account_name: r.account_name,
          amount: round2(r.period_credit - r.period_debit),
        }));

    const mapDebit = (list: AccountBalanceRow[]) =>
      list
        .filter((r) => !hideZero || r.period_debit !== 0 || r.period_credit !== 0)
        .map((r) => ({
          account_id: r.account_id,
          account_code: r.account_code,
          account_name: r.account_name,
          amount: round2(r.period_debit - r.period_credit),
        }));

    const revenueLines = mapCredit(revenue);
    const otherIncomeLines = mapCredit(otherIncome);
    const cogsLines = mapDebit(cogs);
    const opexLines = mapDebit(opex);

    const totalRevenue = revenueLines.reduce((s, l) => s + l.amount, 0);
    const totalOtherIncome = otherIncomeLines.reduce((s, l) => s + l.amount, 0);
    const totalCogs = cogsLines.reduce((s, l) => s + l.amount, 0);
    const totalOpex = opexLines.reduce((s, l) => s + l.amount, 0);
    const grossProfit = totalRevenue - totalCogs;
    const netIncome = grossProfit + totalOtherIncome - totalOpex;

    return {
      report: 'PROFIT_AND_LOSS',
      from_date: from.toISOString().slice(0, 10),
      to_date: to.toISOString().slice(0, 10),
      company_id: query.company_id ?? null,
      revenue: { lines: revenueLines, total: round2(totalRevenue) },
      cost_of_sales: { lines: cogsLines, total: round2(totalCogs) },
      gross_profit: round2(grossProfit),
      other_income: { lines: otherIncomeLines, total: round2(totalOtherIncome) },
      operating_expenses: { lines: opexLines, total: round2(totalOpex) },
      net_income: round2(netIncome),
    };
  }

  /**
   * Cash Flow — indirect-lite from bank/cash voucher activity (Ch.20.1).
   * Operating = net bank+cash movements excluding CONTRA inter-bank transfers counted twice.
   */
  async cashFlow(tenantId: string, query: ReportPeriodQueryDto) {
    const { from, to } = this.resolvePeriod(query);

    const accounts = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          is_active: true,
          OR: [{ is_bank_account: true }, { is_cash_account: true }, { account_sub_type: { in: ['BANK', 'CASH'] } }],
          ...(query.company_id ? { company_id: query.company_id } : {}),
        },
        select: { id: true, account_code: true, account_name: true },
      }),
    );

    const accountIds = accounts.map((a) => a.id);
    if (!accountIds.length) {
      return {
        report: 'CASH_FLOW',
        from_date: from.toISOString().slice(0, 10),
        to_date: to.toISOString().slice(0, 10),
        opening_cash: 0,
        operating: { inflows: 0, outflows: 0, net: 0, lines: [] as unknown[] },
        investing: { net: 0, lines: [] as unknown[] },
        financing: { net: 0, lines: [] as unknown[] },
        closing_cash: 0,
        by_account: [],
      };
    }

    const openingRows = await this.computeAccountBalances(tenantId, {
      toDate: new Date(from.getTime() - 86400000),
      companyId: query.company_id,
      accountIds,
    });
    const openingCash = openingRows.reduce((s, r) => s + r.balance, 0);

    const lines = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucherLine.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          account_id: { in: accountIds },
          voucher: {
            status: 'POSTED',
            deleted_at: null,
            voucher_date: { gte: from, lte: to },
            ...(query.company_id ? { company_id: query.company_id } : {}),
          },
        },
        include: {
          voucher: {
            select: {
              id: true,
              voucher_number: true,
              voucher_type: true,
              voucher_date: true,
              narration: true,
            },
          },
          account: { select: { account_code: true, account_name: true } },
        },
        orderBy: { created_at: 'asc' },
      }),
    );

    const operatingTypes: VoucherType[] = [
      'BANK_RECEIPT',
      'CASH_RECEIPT',
      'BANK_PAYMENT',
      'CASH_PAYMENT',
      'JOURNAL',
      'PURCHASE_INVOICE',
      'PURCHASE_CREDIT_NOTE',
      'OPENING_BALANCE',
      'RECURRING',
    ];

    let inflows = 0;
    let outflows = 0;
    const operatingLines: Array<Record<string, unknown>> = [];
    const investingLines: Array<Record<string, unknown>> = [];
    const financingLines: Array<Record<string, unknown>> = [];
    let investingNet = 0;
    let financingNet = 0;

    for (const line of lines) {
      const debit = Number(line.debit_base);
      const credit = Number(line.credit_base);
      const net = debit - credit; // cash increase when debiting bank
      const entry = {
        voucher_number: line.voucher.voucher_number,
        voucher_type: line.voucher.voucher_type,
        voucher_date: line.voucher.voucher_date,
        account_code: line.account.account_code,
        account_name: line.account.account_name,
        narration: line.narration ?? line.voucher.narration,
        inflow: net > 0 ? round2(net) : 0,
        outflow: net < 0 ? round2(Math.abs(net)) : 0,
        net: round2(net),
      };

      if (line.voucher.voucher_type === 'CONTRA') {
        // Skip netting both sides of same contra (would cancel); attribute nothing
        continue;
      }

      if (operatingTypes.includes(line.voucher.voucher_type)) {
        if (net > 0) inflows += net;
        else outflows += Math.abs(net);
        operatingLines.push(entry);
      }
    }

    const closingCash = openingCash + inflows - outflows + investingNet + financingNet;

    const byAccount = await Promise.all(
      accounts.map(async (a) => {
        const bal = await this.computeAccountBalances(tenantId, {
          toDate: to,
          companyId: query.company_id,
          accountIds: [a.id],
        });
        return {
          account_id: a.id,
          account_code: a.account_code,
          account_name: a.account_name,
          balance: round2(bal[0]?.balance ?? 0),
        };
      }),
    );

    return {
      report: 'CASH_FLOW',
      from_date: from.toISOString().slice(0, 10),
      to_date: to.toISOString().slice(0, 10),
      opening_cash: round2(openingCash),
      operating: {
        inflows: round2(inflows),
        outflows: round2(outflows),
        net: round2(inflows - outflows),
        lines: operatingLines,
      },
      investing: { net: round2(investingNet), lines: investingLines },
      financing: { net: round2(financingNet), lines: financingLines },
      closing_cash: round2(closingCash),
      by_account: byAccount,
    };
  }

  /**
   * UAE VAT return draft from posted sales / purchase invoices (Ch.20.2).
   * Also includes GL movements on TAX subtype accounts for reconciliation.
   */
  async vatReturn(tenantId: string, query: VatReturnQueryDto) {
    const from = new Date(query.from_date);
    const to = new Date(query.to_date);
    to.setHours(23, 59, 59, 999);

    const invoices = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: { in: ['POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID'] },
          invoice_date: { gte: from, lte: to },
          ...(query.company_id ? { company_id: query.company_id } : {}),
        },
        select: {
          id: true,
          invoice_number: true,
          invoice_type: true,
          invoice_date: true,
          subtotal: true,
          tax_amount: true,
          total_amount: true,
          currency_code: true,
          vat_rate: true,
          party: { select: { id: true, name: true, vat_number: true } },
        },
        orderBy: { invoice_date: 'asc' },
      }),
    );

    const sales = invoices.filter((i) => i.invoice_type === 'CUSTOMER_INVOICE' || i.invoice_type === 'DEBIT_NOTE');
    const creditNotes = invoices.filter((i) => i.invoice_type === 'CREDIT_NOTE');
    const purchases = invoices.filter((i) => i.invoice_type === 'PURCHASE_INVOICE');

    const outputVat =
      sales.reduce((s, i) => s + Number(i.tax_amount), 0) -
      creditNotes.reduce((s, i) => s + Number(i.tax_amount), 0);
    const taxableSupplies =
      sales.reduce((s, i) => s + Number(i.subtotal), 0) -
      creditNotes.reduce((s, i) => s + Number(i.subtotal), 0);
    const inputVat = purchases.reduce((s, i) => s + Number(i.tax_amount), 0);
    const taxablePurchases = purchases.reduce((s, i) => s + Number(i.subtotal), 0);
    const netVat = outputVat - inputVat;

    const taxAccounts = await this.computeAccountBalances(tenantId, {
      fromDate: from,
      toDate: to,
      companyId: query.company_id,
      openingIgnored: true,
    });
    const glTax = taxAccounts.filter((a) => a.account_sub_type === 'TAX');

    return {
      report: 'VAT_RETURN',
      regime: 'UAE_VAT',
      from_date: query.from_date,
      to_date: query.to_date,
      company_id: query.company_id ?? null,
      boxes: {
        box1_standard_rated_supplies: round2(taxableSupplies),
        box2_output_vat: round2(outputVat),
        box3_expenses_subject_to_input_vat: round2(taxablePurchases),
        box4_input_vat: round2(inputVat),
        box5_net_vat_due: round2(netVat),
      },
      sales_invoices: sales.length,
      credit_notes: creditNotes.length,
      purchase_invoices: purchases.length,
      documents: {
        sales: sales.map((i) => this.mapVatDoc(i)),
        credit_notes: creditNotes.map((i) => this.mapVatDoc(i)),
        purchases: purchases.map((i) => this.mapVatDoc(i)),
      },
      gl_tax_accounts: glTax.map((a) => ({
        account_code: a.account_code,
        account_name: a.account_name,
        period_debit: round2(a.period_debit),
        period_credit: round2(a.period_credit),
      })),
    };
  }

  // ─── helpers ───────────────────────────────────────────────

  private mapVatDoc(i: {
    id: string;
    invoice_number: string;
    invoice_date: Date;
    subtotal: Prisma.Decimal | number;
    tax_amount: Prisma.Decimal | number;
    total_amount: Prisma.Decimal | number;
    vat_rate: Prisma.Decimal | number;
    party: { id: string; name: string; vat_number: string | null };
  }) {
    return {
      invoice_id: i.id,
      invoice_number: i.invoice_number,
      invoice_date: i.invoice_date.toISOString().slice(0, 10),
      party_name: i.party.name,
      party_vat: i.party.vat_number,
      subtotal: round2(Number(i.subtotal)),
      tax_amount: round2(Number(i.tax_amount)),
      total: round2(Number(i.total_amount)),
      vat_rate: Number(i.vat_rate),
    };
  }

  private resolvePeriod(query: ReportPeriodQueryDto) {
    const to = query.to_date ? new Date(query.to_date) : new Date();
    to.setHours(23, 59, 59, 999);
    const from = query.from_date
      ? new Date(query.from_date)
      : new Date(to.getFullYear(), to.getMonth(), 1);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  private filterSection(rows: AccountBalanceRow[], groups: AccountGroup[], hideZero: boolean) {
    return rows.filter(
      (r) =>
        groups.includes(r.account_group) &&
        (!hideZero || Math.abs(r.balance) > 0.0001 || r.period_debit !== 0 || r.period_credit !== 0),
    );
  }

  private toDisplayLine(r: AccountBalanceRow, nature: 'debit' | 'credit') {
    const amount = nature === 'debit' ? r.balance : -r.balance;
    return {
      account_id: r.account_id,
      account_code: r.account_code,
      account_name: r.account_name,
      account_type: r.account_type,
      amount: round2(amount),
    };
  }

  private async computeAccountBalances(
    tenantId: string,
    opts: {
      fromDate?: Date;
      toDate: Date;
      companyId?: string;
      groups?: AccountGroup[];
      accountIds?: string[];
      openingIgnored?: boolean;
    },
  ): Promise<AccountBalanceRow[]> {
    const accounts = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          is_active: true,
          is_postable: true,
          ...(opts.companyId ? { OR: [{ company_id: opts.companyId }, { company_id: null }] } : {}),
          ...(opts.groups ? { account_group: { in: opts.groups } } : {}),
          ...(opts.accountIds ? { id: { in: opts.accountIds } } : {}),
        },
        orderBy: [{ sort_order: 'asc' }, { account_code: 'asc' }],
      }),
    );

    const aggregates = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucherLine.groupBy({
        by: ['account_id'],
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...(opts.accountIds ? { account_id: { in: opts.accountIds } } : {}),
          voucher: {
            status: 'POSTED',
            deleted_at: null,
            voucher_date: {
              ...(opts.fromDate ? { gte: opts.fromDate } : {}),
              lte: opts.toDate,
            },
            ...(opts.companyId ? { company_id: opts.companyId } : {}),
          },
        },
        _sum: { debit_base: true, credit_base: true },
      }),
    );

    const byId = new Map(
      aggregates.map((a) => [
        a.account_id,
        { debit: Number(a._sum.debit_base ?? 0), credit: Number(a._sum.credit_base ?? 0) },
      ]),
    );

    return accounts.map((a) => {
      let opening = 0;
      if (!opts.openingIgnored) {
        opening = Number(a.opening_balance);
        if (a.opening_balance_type === 'CREDIT') opening = -opening;
      }
      const move = byId.get(a.id) ?? { debit: 0, credit: 0 };
      return {
        account_id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        account_group: a.account_group,
        account_type: a.account_type,
        account_sub_type: a.account_sub_type,
        is_bank_account: a.is_bank_account,
        is_cash_account: a.is_cash_account,
        opening,
        period_debit: move.debit,
        period_credit: move.credit,
        balance: opening + move.debit - move.credit,
      };
    });
  }
}

function round2(n: number) {
  return Math.round(n * 10000) / 10000;
}
