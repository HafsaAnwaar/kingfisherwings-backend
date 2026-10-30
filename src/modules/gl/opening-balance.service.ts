import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { InvoiceType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { InvoicesService } from "../invoices/invoices.service";
import { ChartOfAccountsService } from "./chart-of-accounts.service";
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
    @Inject(forwardRef(() => InvoicesService))
    private readonly invoices: InvoicesService,
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
      const invoiceType: InvoiceType =
        side === "AR" ? "CUSTOMER_INVOICE" : "PURCHASE_INVOICE";
      const created = await this.invoices.create(
        tenantId,
        {
          party_id: dto.party_id,
          company_id: dto.company_id,
          currency_code: dto.currency_code,
          invoice_date: date,
          vat_rate: 0,
          remarks: narration,
          lines: [
            {
              description: narration,
              quantity: 1,
              unit_price: amount,
              is_taxable: false,
            },
          ],
        },
        actorId,
        invoiceType,
      );
      const createdId =
        (created as { invoice_id?: string; id?: string }).invoice_id ??
        (created as { id?: string }).id;
      if (!createdId) {
        throw new BadRequestException("Failed to create opening-balance invoice.");
      }
      const posted = await this.invoices.post(tenantId, createdId, actorId);
      invoice_id = posted.id;
      invoice_number = posted.invoice_number;
      gl_voucher_id =
        (posted as { gl_auto_post?: { voucher_id?: string | null } })
          .gl_auto_post?.voucher_id ?? null;
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
      // Normalize previous to signed then re-apply absolute with type
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
}
