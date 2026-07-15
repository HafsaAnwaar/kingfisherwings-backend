import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  AccountSubType,
  DocumentNumberType,
  Invoice,
  InvoiceLine,
  Prisma,
  VoucherType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';

type InvoiceWithLines = Invoice & { lines: InvoiceLine[] };

type TxClient = Prisma.TransactionClient;

const VOUCHER_TYPE_PREFIX: Partial<Record<VoucherType, string>> = {
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

/**
 * Resolves default COA accounts and creates balanced posted vouchers
 * when invoices are posted (Ch.17 / Ch.19 invoice → GL auto-post).
 *
 * Account lookup prefers account_sub_type, then well-known seed codes
 * from ChartOfAccountsService.seedDefaults (1300 AR, 2100 AP, etc.).
 */
@Injectable()
export class GlAutoPostService {
  private readonly logger = new Logger(GlAutoPostService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  /**
   * Create a posted sales / purchase / credit-note voucher for an invoice.
   * Idempotent: skips if a non-reversed voucher already exists for the invoice.
   */
  async postInvoiceToGl(
    tenantId: string,
    invoiceId: string,
    actorId?: string,
  ): Promise<{ voucher_id: string | null; skipped: boolean; reason?: string }> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.voucher.findFirst({
        where: {
          tenant_id: tenantId,
          invoice_id: invoiceId,
          deleted_at: null,
          status: { in: ['POSTED', 'DRAFT'] },
          reversal_of_id: null,
        },
      });
      if (existing) {
        return { voucher_id: existing.id, skipped: true, reason: 'Already posted to GL' };
      }

      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
        include: { lines: { where: { deleted_at: null }, orderBy: { sort_order: 'asc' } } },
      });
      if (!invoice) {
        throw new BadRequestException('Invoice not found for GL posting.');
      }

      try {
        const voucherId = await this.createInvoiceVoucher(tx, tenantId, invoice, actorId);
        return { voucher_id: voucherId, skipped: false };
      } catch (err) {
        // Never block operational invoice posting if COA is not seeded yet.
        const message = err instanceof Error ? err.message : 'GL auto-post failed';
        this.logger.warn(`Invoice ${invoice.invoice_number} GL auto-post skipped: ${message}`);
        return { voucher_id: null, skipped: true, reason: message };
      }
    });
  }

  async reverseInvoiceGl(
    tenantId: string,
    invoiceId: string,
    actorId?: string,
  ): Promise<{ reversed: boolean; voucher_id?: string }> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const original = await tx.voucher.findFirst({
        where: {
          tenant_id: tenantId,
          invoice_id: invoiceId,
          deleted_at: null,
          status: 'POSTED',
          reversal_of_id: null,
        },
        include: { lines: { where: { deleted_at: null }, orderBy: { line_no: 'asc' } } },
      });
      if (!original) return { reversed: false };

      const reversalNumber = await this.numberGenerator.generate(
        tenantId,
        DocumentNumberType.VOUCHER,
        { extraSegment: VOUCHER_TYPE_PREFIX[original.voucher_type] ?? 'JV' },
      );

      await tx.voucher.create({
        data: {
          tenant_id: tenantId,
          voucher_number: reversalNumber,
          voucher_type: original.voucher_type,
          status: 'POSTED',
          voucher_date: new Date(),
          currency_code: original.currency_code,
          exchange_rate: original.exchange_rate,
          narration: `Reversal of ${original.voucher_number} (invoice cancelled)`,
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

      return { reversed: true, voucher_id: original.id };
    });
  }

  private async createInvoiceVoucher(
    tx: TxClient,
    tenantId: string,
    invoice: InvoiceWithLines,
    actorId?: string,
  ): Promise<string> {
    const ar = await this.requireAccount(tx, tenantId, 'TRADE_RECEIVABLE', '1300');
    const ap = await this.requireAccount(tx, tenantId, 'TRADE_PAYABLE', '2100');
    const revenue = await this.requireAccount(tx, tenantId, 'REVENUE', '4100');
    const cost = await this.requireAccount(tx, tenantId, 'EXPENSE', '5100');
    const outputVat = await this.requireAccount(tx, tenantId, 'TAX', '2200');
    const inputVat = await this.findAccount(tx, tenantId, 'TAX', '1400') ?? outputVat;

    const subtotal = Number(invoice.subtotal);
    const tax = Number(invoice.tax_amount);
    const total = Number(invoice.total_amount);
    const rate = Number(invoice.exchange_rate) || 1;
    const partyId = invoice.party_id;
    const jobId = invoice.job_id ?? undefined;

    type LineDraft = {
      account_id: string;
      debit: number;
      credit: number;
      narration?: string;
    };

    let voucherType: VoucherType = 'JOURNAL';
    let lines: LineDraft[] = [];

    if (invoice.invoice_type === 'CUSTOMER_INVOICE' || invoice.invoice_type === 'DEBIT_NOTE') {
      voucherType = 'JOURNAL';
      lines = [
        { account_id: ar.id, debit: total, credit: 0, narration: `AR ${invoice.invoice_number}` },
        { account_id: revenue.id, debit: 0, credit: subtotal, narration: `Revenue ${invoice.invoice_number}` },
      ];
      if (tax > 0) {
        lines.push({
          account_id: outputVat.id,
          debit: 0,
          credit: tax,
          narration: `Output VAT ${invoice.invoice_number}`,
        });
      }
    } else if (invoice.invoice_type === 'CREDIT_NOTE') {
      voucherType = 'JOURNAL';
      lines = [
        { account_id: revenue.id, debit: subtotal, credit: 0, narration: `CN revenue ${invoice.invoice_number}` },
        { account_id: ar.id, debit: 0, credit: total, narration: `CN AR ${invoice.invoice_number}` },
      ];
      if (tax > 0) {
        lines.splice(1, 0, {
          account_id: outputVat.id,
          debit: tax,
          credit: 0,
          narration: `CN VAT ${invoice.invoice_number}`,
        });
      }
    } else if (invoice.invoice_type === 'PURCHASE_INVOICE') {
      voucherType = 'PURCHASE_INVOICE';
      lines = [
        { account_id: cost.id, debit: subtotal, credit: 0, narration: `Cost ${invoice.invoice_number}` },
        { account_id: ap.id, debit: 0, credit: total, narration: `AP ${invoice.invoice_number}` },
      ];
      if (tax > 0) {
        lines.splice(1, 0, {
          account_id: inputVat.id,
          debit: tax,
          credit: 0,
          narration: `Input VAT ${invoice.invoice_number}`,
        });
      }
    } else {
      throw new BadRequestException(`Unsupported invoice type for GL: ${invoice.invoice_type}`);
    }

    const debit = lines.reduce((s, l) => s + l.debit, 0);
    const credit = lines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(debit - credit) > 0.02) {
      throw new BadRequestException(
        `Auto-post lines unbalanced for ${invoice.invoice_number} (D ${debit} / C ${credit}).`,
      );
    }

    const voucherNumber = await this.numberGenerator.generate(
      tenantId,
      DocumentNumberType.VOUCHER,
      { extraSegment: VOUCHER_TYPE_PREFIX[voucherType] ?? 'JV' },
    );

    const voucher = await tx.voucher.create({
      data: {
        tenant_id: tenantId,
        voucher_number: voucherNumber,
        voucher_type: voucherType,
        status: 'POSTED',
        voucher_date: invoice.invoice_date,
        currency_code: invoice.currency_code,
        exchange_rate: rate,
        narration: `Auto-post ${invoice.invoice_type} ${invoice.invoice_number}`,
        reference_number: invoice.invoice_number,
        company_id: invoice.company_id,
        branch_id: invoice.branch_id,
        party_id: partyId,
        job_id: jobId,
        invoice_id: invoice.id,
        total_debit: debit,
        total_credit: credit,
        posted_at: new Date(),
        posted_by: actorId,
        created_by: actorId,
        updated_by: actorId,
        lines: {
          create: lines.map((l, idx) => ({
            tenant_id: tenantId,
            account_id: l.account_id,
            line_no: idx + 1,
            debit_amount: l.debit,
            credit_amount: l.credit,
            currency_code: invoice.currency_code,
            exchange_rate: rate,
            debit_base: l.debit * rate,
            credit_base: l.credit * rate,
            narration: l.narration,
            party_id: partyId,
            job_id: jobId,
            created_by: actorId,
            updated_by: actorId,
          })),
        },
      },
    });

    return voucher.id;
  }

  private async requireAccount(
    tx: TxClient,
    tenantId: string,
    subType: AccountSubType,
    fallbackCode: string,
  ) {
    const account = await this.findAccount(tx, tenantId, subType, fallbackCode);
    if (!account) {
      throw new BadRequestException(
        `Missing GL account for ${subType} (seed COA via POST /gl/accounts/seed-defaults).`,
      );
    }
    return account;
  }

  private async findAccount(
    tx: TxClient,
    tenantId: string,
    subType: AccountSubType,
    fallbackCode: string,
  ) {
    const byType = await tx.chartOfAccount.findFirst({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        is_active: true,
        is_postable: true,
        account_sub_type: subType,
      },
      orderBy: { account_code: 'asc' },
    });
    if (byType) return byType;

    return tx.chartOfAccount.findFirst({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        is_active: true,
        account_code: fallbackCode,
      },
    });
  }

  /** Expose account resolver for payment posting. */
  async resolveCashOrBankAccount(
    tenantId: string,
    opts: {
      payment_method: string;
      gl_account_id?: string;
      bank_account_id?: string;
    },
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (opts.gl_account_id) {
        const a = await tx.chartOfAccount.findFirst({
          where: { id: opts.gl_account_id, tenant_id: tenantId, deleted_at: null, is_postable: true },
        });
        if (!a) throw new BadRequestException('GL account not found.');
        return a;
      }
      if (opts.bank_account_id) {
        const bank = await tx.tenantBankAccount.findFirst({
          where: { id: opts.bank_account_id, tenant_id: tenantId, deleted_at: null },
        });
        if (bank?.gl_account_id) {
          const linked = await tx.chartOfAccount.findFirst({
            where: { id: bank.gl_account_id, tenant_id: tenantId, deleted_at: null },
          });
          if (linked) return linked;
        }
      }
      if (opts.payment_method === 'CASH') {
        return this.requireAccount(tx, tenantId, 'CASH', '1100');
      }
      return this.requireAccount(tx, tenantId, 'BANK', '1200');
    });
  }

  async resolveArApAccount(tenantId: string, direction: 'RECEIPT' | 'PAYMENT') {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (direction === 'RECEIPT') {
        return this.requireAccount(tx, tenantId, 'TRADE_RECEIVABLE', '1300');
      }
      return this.requireAccount(tx, tenantId, 'TRADE_PAYABLE', '2100');
    });
  }
}
