import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailEventType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PdfService } from "../pdf/pdf.service";
import { EmailService } from "./email.service";
import { DocumentShareEmailDto } from "./dto/document-share-email.dto";

export type ShareSendResult = {
  success: boolean;
  email_log_id: string;
  status: string;
  to: string[];
  cc: string[];
  pdf_attached: boolean;
};

@Injectable()
export class DocumentEmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly pdf: PdfService,
    private readonly config: ConfigService,
  ) {}

  async resolvePartyEmails(
    tenantId: string,
    partyId: string,
    kind: "portal" | "vendor" | "any" = "any",
  ): Promise<string[]> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const party = await tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
        select: { email: true },
      });
      const emails = new Set<string>();
      if (party?.email) emails.add(party.email.toLowerCase());

      if (kind === "portal" || kind === "any") {
        const portalUsers = await tx.portalUser.findMany({
          where: {
            tenant_id: tenantId,
            party_id: partyId,
            deleted_at: null,
            status: "ACTIVE",
          },
          select: { email: true },
          take: 50,
        });
        for (const u of portalUsers) {
          if (u.email) emails.add(u.email.toLowerCase());
        }
      }

      if (kind === "vendor" || kind === "any") {
        const vendorUsers = await tx.vendorUser.findMany({
          where: {
            tenant_id: tenantId,
            party_id: partyId,
            deleted_at: null,
            status: "ACTIVE",
          },
          select: { email: true },
          take: 50,
        });
        for (const u of vendorUsers) {
          if (u.email) emails.add(u.email.toLowerCase());
        }
      }

      return [...emails];
    });
  }

  async resolveTenantAdminEmails(tenantId: string): Promise<string[]> {
    const notify = this.config.get<string>("smtp.vendorNotifyEmail");
    const emails = new Set<string>();
    if (notify) emails.add(notify.toLowerCase());

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        select: { email: true },
      });
      if (tenant?.email) emails.add(tenant.email.toLowerCase());

      const company = await tx.company.findFirst({
        where: { tenant_id: tenantId, is_default: true, is_active: true },
        select: { email: true },
      });
      if (company?.email) emails.add(company.email.toLowerCase());

      const financeUsers = await tx.user.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: "ACTIVE",
          OR: [{ is_finance: true }, { role: "FINANCE_MANAGER" }],
        },
        select: { email: true },
        take: 20,
      });
      for (const u of financeUsers) {
        if (u.email) emails.add(u.email.toLowerCase());
      }
    });

    return [...emails];
  }

  pickRecipients(
    dto: DocumentShareEmailDto,
    fallback: string[],
  ): { to: string[]; cc: string[] } {
    const to = (dto.to?.length ? dto.to : fallback).map((e) =>
      e.trim().toLowerCase(),
    );
    const cc = (dto.cc ?? []).map((e) => e.trim().toLowerCase());
    const uniqueTo = [...new Set(to.filter(Boolean))];
    const uniqueCc = [...new Set(cc.filter(Boolean))].filter(
      (e) => !uniqueTo.includes(e),
    );
    if (!uniqueTo.length) {
      throw new BadRequestException(
        "No recipients. Provide `to` or ensure the party has an email / active users.",
      );
    }
    return { to: uniqueTo, cc: uniqueCc };
  }

  async sendDocument(options: {
    tenantId: string;
    eventType: EmailEventType;
    to: string[];
    cc?: string[];
    subject: string;
    bodyHtml: string;
    attachmentBuffer?: Buffer;
    attachmentName?: string;
    createdBy?: string;
    replyTo?: string;
    quotationId?: string;
    jobId?: string;
  }): Promise<ShareSendResult> {
    const toJoined = options.to.join(", ");
    const ccJoined = options.cc?.length ? options.cc.join(", ") : undefined;

    const log = await this.email.send({
      tenantId: options.tenantId,
      eventType: options.eventType,
      to: toJoined,
      cc: ccJoined,
      subject: options.subject,
      body: options.bodyHtml,
      attachmentBuffer: options.attachmentBuffer,
      attachmentName: options.attachmentName,
      createdBy: options.createdBy,
      replyTo: options.replyTo,
      quotationId: options.quotationId,
      jobId: options.jobId,
      requireDelivery: true,
    });

    return {
      success: log.status === "SENT",
      email_log_id: log.id,
      status: log.status,
      to: options.to,
      cc: options.cc ?? [],
      pdf_attached: Boolean(options.attachmentBuffer),
    };
  }

  async buildStatementPdf(options: {
    title: string;
    partyName: string;
    asOf: string;
    openBalance: number;
    invoices: Array<{
      invoice_number: string;
      invoice_type: string;
      invoice_date: unknown;
      due_date?: unknown;
      total_amount: unknown;
      balance_due: unknown;
    }>;
  }): Promise<Buffer> {
    const rows = options.invoices
      .map(
        (inv) =>
          `<tr>
            <td>${inv.invoice_number}</td>
            <td>${inv.invoice_type}</td>
            <td>${String(inv.invoice_date).slice(0, 10)}</td>
            <td>${inv.due_date ? String(inv.due_date).slice(0, 10) : ""}</td>
            <td style="text-align:right">${Number(inv.total_amount).toFixed(2)}</td>
            <td style="text-align:right">${Number(inv.balance_due).toFixed(2)}</td>
          </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${options.title}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;color:#222;padding:24px}
        h1{font-size:18px;margin:0 0 8px}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border:1px solid #ccc;padding:6px 8px}
        th{background:#f3f3f3;text-align:left}
      </style></head><body>
      <h1>${options.title}</h1>
      <p><strong>${options.partyName}</strong><br/>As of ${options.asOf}</p>
      <p>Open balance: <strong>${options.openBalance.toFixed(2)}</strong></p>
      <table>
        <thead><tr><th>Invoice</th><th>Type</th><th>Date</th><th>Due</th><th>Total</th><th>Balance</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6">No invoices</td></tr>'}</tbody>
      </table>
      </body></html>`;

    return this.pdf.renderHtmlToPdf(html);
  }

  async buildRemittancePdf(payment: {
    payment_number: string;
    payment_date?: Date | null;
    currency_code: string;
    amount: unknown;
    unallocated_amount: unknown;
    allocations?: Array<{
      amount: unknown;
      invoice?: { invoice_number?: string } | null;
    }>;
  }): Promise<Buffer> {
    const html = `<!DOCTYPE html><html><body>
      <h1>Remittance Advice</h1>
      <p>Payment ${payment.payment_number}</p>
      <p>Date: ${payment.payment_date?.toISOString().slice(0, 10) ?? ""}</p>
      <p>Amount: ${payment.currency_code} ${payment.amount}</p>
      <p>Unallocated: ${payment.unallocated_amount}</p>
      <table border="1" cellpadding="6"><tr><th>Invoice</th><th>Allocated</th></tr>
      ${(payment.allocations ?? [])
        .map(
          (a) =>
            `<tr><td>${a.invoice?.invoice_number ?? ""}</td><td>${a.amount}</td></tr>`,
        )
        .join("")}
      </table></body></html>`;
    return this.pdf.renderHtmlToPdf(html);
  }

  async requireParty(tenantId: string, partyId: string) {
    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, name: true, email: true },
      }),
    );
    if (!party) throw new NotFoundException("Party not found");
    return party;
  }
}
