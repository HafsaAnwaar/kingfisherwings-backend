import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { REPORT_ROW_LIMIT } from "../constants/reports.constants";
import { loadReportBranding } from "../helpers/report-branding.helper";
import { ReportDataset, ReportListRow } from "../types/report.types";

type Params = Record<string, unknown>;
type Ctx = { party_id?: string; invoice_id?: string };

@Injectable()
export class FinanceDataPackService {
  constructor(private readonly prisma: PrismaService) {}

  supports(rendererKey: string): boolean {
    return rendererKey.startsWith("finance.");
  }

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Params,
    context?: Ctx,
  ): Promise<ReportDataset> {
    const branding = await loadReportBranding(this.prisma, tenantId);
    const generated_at = new Date().toISOString();

    switch (rendererKey) {
      case "finance.aging":
      case "finance.soa":
        return {
          kind: "list",
          title:
            rendererKey === "finance.soa"
              ? "Statement of Account"
              : "Receivables Aging",
          columns: [
            { key: "invoice_number", label: "Invoice #" },
            { key: "party", label: "Party" },
            { key: "invoice_date", label: "Date" },
            { key: "due_date", label: "Due" },
            { key: "balance", label: "Balance" },
            { key: "currency", label: "CCY" },
            { key: "bucket", label: "Bucket" },
          ],
          rows: await this.agingRows(tenantId, parameters, context),
          branding,
          generated_at,
        };
      case "finance.trial_balance":
        return {
          kind: "list",
          title: "Trial Balance (catalog)",
          columns: [
            { key: "code", label: "Account" },
            { key: "name", label: "Name" },
            { key: "debit", label: "Debit" },
            { key: "credit", label: "Credit" },
          ],
          rows: await this.trialBalance(tenantId),
          branding,
          generated_at,
        };
      case "finance.voucher":
        return this.voucherDoc(tenantId, parameters, branding, generated_at);
      case "finance.outstanding_letter":
        return this.outstandingLetter(
          tenantId,
          parameters,
          context,
          branding,
          generated_at,
        );
      default:
        throw new BadRequestException(
          `Unsupported finance renderer: ${rendererKey}`,
        );
    }
  }

  private async agingRows(
    tenantId: string,
    params: Params,
    context?: Ctx,
  ): Promise<ReportListRow[]> {
    const partyId = params.party_id
      ? String(params.party_id)
      : context?.party_id
        ? String(context.party_id)
        : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invoices = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          invoice_type: "CUSTOMER_INVOICE",
          balance_due: { gt: 0 },
          status: { in: ["POSTED", "SENT", "PARTIALLY_PAID"] },
          ...(partyId ? { party_id: partyId } : {}),
        },
        take: REPORT_ROW_LIMIT,
        orderBy: { due_date: "asc" },
        include: { party: { select: { name: true } } },
      }),
    );

    return invoices.map((inv) => {
      const due = inv.due_date ?? inv.invoice_date;
      const days = Math.floor(
        (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
      );
      let bucket = "Current";
      if (days > 90) bucket = "90+";
      else if (days > 60) bucket = "61-90";
      else if (days > 30) bucket = "31-60";
      else if (days > 0) bucket = "1-30";
      return {
        invoice_number: inv.invoice_number,
        party: inv.party?.name ?? "",
        invoice_date: inv.invoice_date.toISOString().slice(0, 10),
        due_date: inv.due_date?.toISOString().slice(0, 10) ?? "",
        balance: Number(inv.balance_due),
        currency: inv.currency_code,
        bucket,
      };
    });
  }

  private async trialBalance(tenantId: string): Promise<ReportListRow[]> {
    const accounts = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.findMany({
        where: { tenant_id: tenantId, deleted_at: null, is_active: true },
        take: 500,
        orderBy: { account_code: "asc" },
        select: {
          account_code: true,
          account_name: true,
          opening_balance: true,
          opening_balance_type: true,
        },
      }),
    );
    return accounts.map((a) => {
      const bal = Number(a.opening_balance ?? 0);
      const isDebit = (a.opening_balance_type || "DEBIT").toUpperCase() === "DEBIT";
      return {
        code: a.account_code,
        name: a.account_name,
        debit: isDebit ? bal : 0,
        credit: isDebit ? 0 : bal,
      };
    });
  }

  private async voucherDoc(
    tenantId: string,
    params: Params,
    branding: Awaited<ReturnType<typeof loadReportBranding>>,
    generated_at: string,
  ): Promise<ReportDataset> {
    const voucherId = String(params.voucher_id ?? "").trim();
    if (!voucherId) {
      throw new BadRequestException("voucher_id is required");
    }
    const voucher = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.findFirst({
        where: { id: voucherId, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: {
            where: { deleted_at: null },
            orderBy: { line_no: "asc" },
            take: 200,
          },
        },
      }),
    );
    if (!voucher) throw new BadRequestException("voucher_id not found");

    return {
      kind: "list",
      title: `Voucher ${voucher.voucher_number}`,
      columns: [
        { key: "account", label: "Account" },
        { key: "narration", label: "Narration" },
        { key: "debit", label: "Debit" },
        { key: "credit", label: "Credit" },
      ],
      rows: voucher.lines.map((l) => ({
        account: l.account_id,
        narration: l.narration ?? "",
        debit: Number(l.debit_amount ?? 0),
        credit: Number(l.credit_amount ?? 0),
      })),
      branding,
      generated_at,
    };
  }

  private async outstandingLetter(
    tenantId: string,
    params: Params,
    context: Ctx | undefined,
    branding: Awaited<ReturnType<typeof loadReportBranding>>,
    generated_at: string,
  ): Promise<ReportDataset> {
    const partyId = String(
      params.party_id ?? context?.party_id ?? "",
    ).trim();
    if (!partyId) {
      throw new BadRequestException("party_id is required");
    }
    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
        select: { name: true, currency_code: true },
      }),
    );
    if (!party) throw new BadRequestException("party_id not found");

    const invoices = await this.agingRows(tenantId, { party_id: partyId });
    const balance = invoices.reduce(
      (s, r) => s + Number(r.balance ?? 0),
      0,
    );

    return {
      kind: "document",
      title: "Outstanding Letter",
      template_key: "finance.outstanding_letter",
      payload: {
        party_name: party.name,
        balance: balance.toFixed(2),
        currency: party.currency_code ?? "AED",
        as_of: new Date().toISOString().slice(0, 10),
        invoices: invoices.map((r) => ({
          number: r.invoice_number,
          date: r.invoice_date,
          due: r.due_date,
          balance: r.balance,
        })),
      },
      branding,
      generated_at,
    };
  }
}
