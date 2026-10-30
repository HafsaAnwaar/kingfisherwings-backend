import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentNumberType, InvoiceType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { ChartOfAccountsService } from "./chart-of-accounts.service";
import { GlAutoPostService } from "./gl-auto-post.service";
import { VouchersService } from "./vouchers.service";
import {
  CoaOpeningBalanceDto,
  PartyOpeningBalanceDto,
} from "./dto/opening-balance.dto";

@Injectable()
export class OpeningBalanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chartOfAccounts: ChartOfAccountsService,
    private readonly vouchers: VouchersService,
    private readonly glAutoPost: GlAutoPostService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  async createPartyOpeningBalance(
    tenantId: string,
    side: "AR" | "AP",
    dto: PartyOpeningBalanceDto,
    actorId?: string,
  ) {
    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: dto.party_id, tenant_id: tenantId, deleted_at: null },
        select: { id: true, code: true, name: true },
      }),
    );
    if (!party) throw new NotFoundException("Party not found.");

    const amount = Number(dto.amount);
    if (!(amount > 0)) {
      throw new BadRequestException("Amount must be greater than zero.");
    }

    const createInvoice = dto.create_manual_invoice !== false;
    const date = dto.date ?? new Date().toISOString().slice(0, 10);
    const narration =
      dto.narration ??
      `Opening balance (${side}) — ${party.code ?? party.name}`;

    let invoice_id: string | null = null;
    let invoice_number: string | null = null;
    let gl_voucher_id: string | null = null;

    if (createInvoice) {
      const created = await this.createAndPostManualInvoice(
        tenantId,
        side,
        dto,
        narration,
        date,
        amount,
        actorId,
      );
      invoice_id = created.invoice_id;
      invoice_number = created.invoice_number;
      gl_voucher_id = created.gl_voucher_id;
    } else {
      const control = await this.chartOfAccounts.ensureAccount(
        tenantId,
        side === "AR" ? "TRADE_RECEIVABLE" : "TRADE_PAYABLE",
        side === "AR" ? "1300" : "2100",
        actorId,
      );
      const equity = await this.chartOfAccounts.ensureAccount(
        tenantId,
        "EQUITY",
        "3200",
        actorId,
      );

      // AR OB: Dr Receivable / Cr Equity; AP OB: Dr Equity / Cr Payable
      const lines =
        side === "AR"
          ? [
              {
                account_id: control.id,
                debit_amount: amount,
                credit_amount: 0,
                party_id: dto.party_id,
                narration,
              },
              {
                account_id: equity.id,
                debit_amount: 0,
                credit_amount: amount,
                narration,
              },
            ]
          : [
              {
                account_id: equity.id,
                debit_amount: amount,
                credit_amount: 0,
                narration,
              },
              {
                account_id: control.id,
                debit_amount: 0,
                credit_amount: amount,
                party_id: dto.party_id,
                narration,
              },
            ];

      const voucher = await this.vouchers.create(
        tenantId,
        {
          voucher_type: "OPENING_BALANCE",
          currency_code: dto.currency_code,
          voucher_date: date,
          narration,
          party_id: dto.party_id,
          company_id: dto.company_id,
          reference_number: `OB-${side}-${party.code ?? party.id.slice(0, 8)}`,
          lines,
        },
        actorId,
      );
      const posted = await this.vouchers.post(tenantId, voucher.id, actorId);
      gl_voucher_id = posted.id;
    }

    let coa_account_id: string | null = null;
    if (dto.link_coa) {
      const control = await this.chartOfAccounts.ensureAccount(
        tenantId,
        side === "AR" ? "TRADE_RECEIVABLE" : "TRADE_PAYABLE",
        side === "AR" ? "1300" : "2100",
        actorId,
      );
      const prev = Number(control.opening_balance ?? 0);
      const nextType: "DEBIT" | "CREDIT" =
        side === "AR" ? "DEBIT" : "CREDIT";
      let signed = prev;
      if (control.opening_balance_type === "CREDIT") signed = -prev;
      signed += side === "AR" ? amount : -amount;
      const abs = Math.abs(signed);
      const type: "DEBIT" | "CREDIT" =
        signed < 0 ? "CREDIT" : signed > 0 ? "DEBIT" : nextType;

      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.chartOfAccount.update({
          where: { id: control.id },
          data: {
            opening_balance: abs,
            opening_balance_type: type,
            updated_by: actorId,
          },
        }),
      );
      coa_account_id = control.id;
    }

    return {
      side,
      party_id: party.id,
      party_code: party.code,
      party_name: party.name,
      amount,
      currency_code: dto.currency_code,
      date,
      create_manual_invoice: createInvoice,
      invoice_id,
      invoice_number,
      gl_voucher_id,
      coa_account_id,
    };
  }

  async setCoaOpeningBalance(
    tenantId: string,
    accountId: string,
    dto: CoaOpeningBalanceDto,
    actorId?: string,
  ) {
    const account = await this.chartOfAccounts.findOne(tenantId, accountId);
    if (!account.is_postable) {
      throw new BadRequestException(
        "Opening balance vouchers require a postable account.",
      );
    }

    const amount = Number(dto.amount);
    const type = dto.opening_balance_type;
    const date = dto.date ?? new Date().toISOString().slice(0, 10);
    const narration =
      dto.narration ??
      `Opening balance — ${account.account_code} ${account.account_name}`;

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.update({
        where: { id: accountId },
        data: {
          opening_balance: amount,
          opening_balance_type: type,
          updated_by: actorId,
        },
      }),
    );

    let gl_voucher_id: string | null = null;
    if (dto.create_voucher !== false && amount > 0) {
      const equity = await this.chartOfAccounts.ensureAccount(
        tenantId,
        "EQUITY",
        "3200",
        actorId,
      );
      if (equity.id === accountId) {
        throw new BadRequestException(
          "Cannot create opening-balance voucher with equity as both sides.",
        );
      }

      const lines =
        type === "DEBIT"
          ? [
              {
                account_id: accountId,
                debit_amount: amount,
                credit_amount: 0,
                narration,
              },
              {
                account_id: equity.id,
                debit_amount: 0,
                credit_amount: amount,
                narration,
              },
            ]
          : [
              {
                account_id: equity.id,
                debit_amount: amount,
                credit_amount: 0,
                narration,
              },
              {
                account_id: accountId,
                debit_amount: 0,
                credit_amount: amount,
                narration,
              },
            ];

      const voucher = await this.vouchers.create(
        tenantId,
        {
          voucher_type: "OPENING_BALANCE",
          currency_code: account.currency_code ?? "AED",
          voucher_date: date,
          narration,
          reference_number: `OB-COA-${account.account_code}`,
          lines,
        },
        actorId,
      );
      const posted = await this.vouchers.post(tenantId, voucher.id, actorId);
      gl_voucher_id = posted.id;
    }

    const updated = await this.chartOfAccounts.findOne(tenantId, accountId);
    return {
      account: updated,
      gl_voucher_id,
      date,
    };
  }

  /**
   * Creates a job-less posted CI/PI for party statements without importing
   * InvoicesModule (avoids Gl ↔ Invoices ↔ Payments circular DI).
   */
  private async createAndPostManualInvoice(
    tenantId: string,
    side: "AR" | "AP",
    dto: PartyOpeningBalanceDto,
    narration: string,
    date: string,
    amount: number,
    actorId?: string,
  ) {
    const invoiceType: InvoiceType =
      side === "AR" ? "CUSTOMER_INVOICE" : "PURCHASE_INVOICE";
    const docType: DocumentNumberType =
      side === "AR" ? "INVOICE" : "PURCHASE_INVOICE";
    const invoiceNumber = await this.numberGenerator.generate(
      tenantId,
      docType,
    );

    const invoice = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const companyId =
        dto.company_id ??
        (
          await tx.company.findFirst({
            where: { tenant_id: tenantId, deleted_at: null, is_active: true },
            orderBy: { created_at: "asc" },
            select: { id: true },
          })
        )?.id;

      const created = await tx.invoice.create({
        data: {
          tenant_id: tenantId,
          company_id: companyId,
          invoice_number: invoiceNumber,
          invoice_type: invoiceType,
          status: "DRAFT",
          job_id: null,
          party_id: dto.party_id,
          invoice_date: new Date(date),
          currency_code: dto.currency_code,
          exchange_rate: 1,
          vat_rate: 0,
          remarks: narration,
          created_by: actorId,
          updated_by: actorId,
          lines: {
            create: [
              {
                tenant_id: tenantId,
                description: narration,
                quantity: 1,
                unit_price: amount,
                amount,
                tax_rate: 0,
                tax_amount: 0,
                is_taxable: false,
                sort_order: 0,
                created_by: actorId,
                updated_by: actorId,
              },
            ],
          },
        },
        select: { id: true, invoice_number: true },
      });

      await tx.invoice.update({
        where: { id: created.id },
        data: {
          subtotal: amount,
          tax_amount: 0,
          total_amount: amount,
          balance_due: amount,
          amount_paid: 0,
          status: "POSTED",
          posted_at: new Date(),
          updated_by: actorId,
        },
      });

      return created;
    });

    const gl = await this.glAutoPost.postInvoiceToGl(
      tenantId,
      invoice.id,
      actorId,
    );

    return {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      gl_voucher_id: gl.voucher_id ?? null,
    };
  }
}
