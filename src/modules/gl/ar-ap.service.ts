import { Injectable } from "@nestjs/common";
import { InvoiceType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AgingQueryDto } from "./dto/ar-ap.dto";

const STATEMENT_ROW_CAP = 500;

type AgingBucket =
  | "current"
  | "days_1_30"
  | "days_31_60"
  | "days_61_90"
  | "days_90_plus";

@Injectable()
export class ArApService {
  constructor(private readonly prisma: PrismaService) {}

  async arAging(tenantId: string, query: AgingQueryDto) {
    return this.buildAging(
      tenantId,
      query,
      ["CUSTOMER_INVOICE", "DEBIT_NOTE"],
      "AR",
    );
  }

  async apAging(tenantId: string, query: AgingQueryDto) {
    return this.buildAging(tenantId, query, ["PURCHASE_INVOICE"], "AP");
  }

  async partyStatement(
    tenantId: string,
    partyId: string,
    query: AgingQueryDto,
    side: "AR" | "AP",
  ) {
    const asOf = query.as_of ? new Date(query.as_of) : new Date();
    const types: InvoiceType[] =
      side === "AR"
        ? ["CUSTOMER_INVOICE", "DEBIT_NOTE", "CREDIT_NOTE"]
        : ["PURCHASE_INVOICE"];

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const party = await tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          code: true,
          name: true,
          credit_limit: true,
          credit_days: true,
        },
      });
      if (!party)
        return {
          party: null,
          as_of: asOf,
          invoices: [],
          payments: [],
          summary: null,
        };

      const invoices = await tx.invoice.findMany({
        where: {
          tenant_id: tenantId,
          party_id: partyId,
          deleted_at: null,
          invoice_type: { in: types },
          status: { notIn: ["DRAFT", "CANCELLED", "VOID"] },
          ...(query.company_id ? { company_id: query.company_id } : {}),
        },
        orderBy: { invoice_date: "asc" },
        take: STATEMENT_ROW_CAP,
        select: {
          id: true,
          invoice_number: true,
          invoice_type: true,
          invoice_date: true,
          due_date: true,
          status: true,
          currency_code: true,
          total_amount: true,
          amount_paid: true,
          balance_due: true,
        },
      });

      const payments = await tx.payment.findMany({
        where: {
          tenant_id: tenantId,
          party_id: partyId,
          deleted_at: null,
          status: "POSTED",
          direction: side === "AR" ? "RECEIPT" : "PAYMENT",
        },
        orderBy: { payment_date: "asc" },
        take: STATEMENT_ROW_CAP,
        select: {
          id: true,
          payment_number: true,
          payment_date: true,
          amount: true,
          currency_code: true,
          unallocated_amount: true,
          reference_number: true,
        },
      });

      const openBalance = invoices
        .filter((i) => Number(i.balance_due) > 0.0001)
        .reduce(
          (s, i) =>
            s +
            Number(i.balance_due) * (i.invoice_type === "CREDIT_NOTE" ? -1 : 1),
          0,
        );

      return {
        party,
        as_of: asOf.toISOString().slice(0, 10),
        side,
        invoices,
        payments,
        summary: {
          invoice_count: invoices.length,
          open_balance: openBalance,
          advances_unallocated: payments.reduce(
            (s, p) => s + Number(p.unallocated_amount),
            0,
          ),
          truncated:
            invoices.length >= STATEMENT_ROW_CAP ||
            payments.length >= STATEMENT_ROW_CAP,
        },
      };
    });
  }

  private async buildAging(
    tenantId: string,
    query: AgingQueryDto,
    types: InvoiceType[],
    side: "AR" | "AP",
  ) {
    const asOf = query.as_of ? new Date(query.as_of) : new Date();
    asOf.setHours(0, 0, 0, 0);

    const invoices = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          invoice_type: { in: types },
          status: { in: ["POSTED", "SENT", "PARTIALLY_PAID"] },
          balance_due: { gt: 0 },
          ...(query.party_id ? { party_id: query.party_id } : {}),
          ...(query.company_id ? { company_id: query.company_id } : {}),
        },
        include: {
          party: { select: { id: true, code: true, name: true } },
        },
        orderBy: [{ party_id: "asc" }, { due_date: "asc" }],
      }),
    );

    type PartyRow = {
      party_id: string;
      party_code: string;
      party_name: string;
      currency_code: string;
      current: number;
      days_1_30: number;
      days_31_60: number;
      days_61_90: number;
      days_90_plus: number;
      total: number;
      invoices: Array<{
        invoice_id: string;
        invoice_number: string;
        invoice_date: string;
        due_date: string | null;
        balance_due: number;
        bucket: AgingBucket;
        days_overdue: number;
      }>;
    };

    const byParty = new Map<string, PartyRow>();

    for (const inv of invoices) {
      const due = inv.due_date ?? inv.invoice_date;
      const dueDate = new Date(due);
      dueDate.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor(
        (asOf.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const bucket = this.bucketFor(daysOverdue);
      const balance = Number(inv.balance_due);

      const key = inv.party_id;
      if (!byParty.has(key)) {
        byParty.set(key, {
          party_id: inv.party_id,
          party_code: inv.party.code,
          party_name: inv.party.name,
          currency_code: inv.currency_code,
          current: 0,
          days_1_30: 0,
          days_31_60: 0,
          days_61_90: 0,
          days_90_plus: 0,
          total: 0,
          invoices: [],
        });
      }
      const row = byParty.get(key)!;
      row[bucket] += balance;
      row.total += balance;
      row.invoices.push({
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        invoice_date: inv.invoice_date.toISOString().slice(0, 10),
        due_date: inv.due_date ? inv.due_date.toISOString().slice(0, 10) : null,
        balance_due: balance,
        bucket,
        days_overdue: Math.max(daysOverdue, 0),
      });
    }

    const parties = [...byParty.values()].sort((a, b) => b.total - a.total);
    const totals = parties.reduce(
      (acc, p) => ({
        current: acc.current + p.current,
        days_1_30: acc.days_1_30 + p.days_1_30,
        days_31_60: acc.days_31_60 + p.days_31_60,
        days_61_90: acc.days_61_90 + p.days_61_90,
        days_90_plus: acc.days_90_plus + p.days_90_plus,
        total: acc.total + p.total,
      }),
      {
        current: 0,
        days_1_30: 0,
        days_31_60: 0,
        days_61_90: 0,
        days_90_plus: 0,
        total: 0,
      },
    );

    return {
      side,
      as_of: asOf.toISOString().slice(0, 10),
      party_count: parties.length,
      totals,
      parties,
    };
  }

  private bucketFor(daysOverdue: number): AgingBucket {
    if (daysOverdue <= 0) return "current";
    if (daysOverdue <= 30) return "days_1_30";
    if (daysOverdue <= 60) return "days_31_60";
    if (daysOverdue <= 90) return "days_61_90";
    return "days_90_plus";
  }
}
