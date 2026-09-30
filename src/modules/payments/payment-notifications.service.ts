import { Injectable, Logger } from "@nestjs/common";
import { EmailEventType } from "@prisma/client";
import { EmailService } from "../../shared/email/email.service";

function esc(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function button(href: string, label: string, primary = true) {
  const bg = primary ? "#1a56db" : "#ffffff";
  const fg = primary ? "#ffffff" : "#1a56db";
  return `<a href="${esc(href)}" style="display:inline-block;padding:10px 18px;margin:4px 8px 4px 0;border-radius:6px;border:1px solid #1a56db;background:${bg};color:${fg};text-decoration:none;font-weight:600">${esc(label)}</a>`;
}

export interface InvoiceEmailInput {
  to: string;
  companyName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate?: Date | null;
  payUrl?: string | null;
  viewUrl?: string | null;
  message?: string | null;
  pdf?: Buffer;
  createdBy?: string;
  eventType?: EmailEventType;
  requireDelivery?: boolean;
}

/**
 * Payment emails on top of the existing EmailService (same providers,
 * same email_logs). Only renders content — delivery is unchanged.
 */
@Injectable()
export class PaymentNotificationsService {
  private readonly logger = new Logger(PaymentNotificationsService.name);

  constructor(private readonly email: EmailService) {}

  /** Snippet appended to the existing invoice email ("Pay Now" button). */
  payNowHtml(payUrl: string, viewUrl?: string | null) {
    return (
      `<p style="margin-top:16px">You can pay this invoice securely online:</p>` +
      `<p>${button(payUrl, "Pay Now")}${viewUrl ? button(viewUrl, "View Invoice", false) : ""}</p>` +
      `<p style="color:#6b7280;font-size:12px">Payments are processed by Stripe. This link expires; ask us for a new one if needed.</p>`
    );
  }

  async sendInvoiceWithPayLink(tenantId: string, input: InvoiceEmailInput) {
    const due = input.dueDate
      ? `<tr><td>Due date</td><td><strong>${esc(input.dueDate.toISOString().slice(0, 10))}</strong></td></tr>`
      : "";
    const body =
      `<p>Dear customer,</p>` +
      (input.message ? `<p>${esc(input.message)}</p>` : "") +
      `<p><strong>${esc(input.companyName)}</strong> has sent you invoice <strong>${esc(input.invoiceNumber)}</strong>.</p>` +
      `<table cellpadding="4" style="border-collapse:collapse">` +
      `<tr><td>Invoice</td><td><strong>${esc(input.invoiceNumber)}</strong></td></tr>` +
      `<tr><td>Amount due</td><td><strong>${esc(input.amount)} ${esc(input.currency)}</strong></td></tr>` +
      due +
      `</table>` +
      (input.payUrl ? this.payNowHtml(input.payUrl, input.viewUrl) : "") +
      `<p>Thank you,<br/>${esc(input.companyName)}</p>`;

    return this.email.send({
      tenantId,
      eventType: input.eventType ?? "PAYMENT_LINK",
      to: input.to,
      subject: `Invoice ${input.invoiceNumber} from ${input.companyName}`,
      body,
      attachmentBuffer: input.pdf,
      attachmentName: input.pdf ? `${input.invoiceNumber}.pdf` : undefined,
      createdBy: input.createdBy,
      requireDelivery: input.requireDelivery ?? true,
    });
  }

  /** Payment confirmation to the payer. Never throws. */
  async sendReceipt(
    tenantId: string,
    input: {
      to: string;
      invoiceNumber: string;
      amount: string;
      currency: string;
      reference: string;
      companyName?: string;
    },
  ) {
    try {
      await this.email.send({
        tenantId,
        eventType: "PAYMENT_RECEIPT",
        to: input.to,
        subject: `Payment received — ${input.invoiceNumber}`,
        body:
          `<p>Thank you — we received your payment.</p>` +
          `<table cellpadding="4" style="border-collapse:collapse">` +
          `<tr><td>Invoice</td><td><strong>${esc(input.invoiceNumber)}</strong></td></tr>` +
          `<tr><td>Amount</td><td><strong>${esc(input.amount)} ${esc(input.currency)}</strong></td></tr>` +
          `<tr><td>Reference</td><td>${esc(input.reference)}</td></tr>` +
          `</table>` +
          (input.companyName ? `<p>${esc(input.companyName)}</p>` : ""),
        requireDelivery: false,
      });
    } catch (err) {
      this.logger.warn(
        `Receipt email failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
