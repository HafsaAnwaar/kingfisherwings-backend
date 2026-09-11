import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InvoiceType } from "@prisma/client";
import { DocumentEmailService } from "../../shared/email/document-email.service";
import { DocumentShareEmailDto } from "../../shared/email/dto/document-share-email.dto";
import { StorageService } from "../../shared/storage/storage.service";
import { PrismaService } from "../../prisma/prisma.service";
import { InvoicesService } from "../invoices/invoices.service";
import { PaymentsService } from "../gl/payments.service";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

const MAX_VENDOR_SHARES_PER_HOUR = 20;

@Injectable()
export class VendorDocumentShareService {
  private readonly recent = new Map<string, number[]>();

  constructor(
    private readonly documentEmail: DocumentEmailService,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly invoices: InvoicesService,
    private readonly payments: PaymentsService,
  ) {}

  private assertRateLimit(vendorUserId: string) {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const stamps = (this.recent.get(vendorUserId) ?? []).filter(
      (t) => now - t < windowMs,
    );
    if (stamps.length >= MAX_VENDOR_SHARES_PER_HOUR) {
      throw new HttpException(
        `Vendor share rate limit exceeded (max ${MAX_VENDOR_SHARES_PER_HOUR}/hour).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    stamps.push(now);
    this.recent.set(vendorUserId, stamps);
  }

  async sendInvoicePdf(
    user: CurrentVendorUser,
    invoiceId: string,
    dto: DocumentShareEmailDto,
  ) {
    this.assertRateLimit(user.id);
    const invoice = await this.invoices.findOne(user.tenantId, invoiceId);
    if (
      invoice.party_id !== user.partyId ||
      invoice.invoice_type !== InvoiceType.PURCHASE_INVOICE
    ) {
      throw new NotFoundException("Invoice not found.");
    }

    const fallback = await this.documentEmail.resolveTenantAdminEmails(
      user.tenantId,
    );
    const { to, cc } = this.documentEmail.pickRecipients(dto, fallback);

    let attachmentBuffer: Buffer | undefined;
    let attachmentName: string | undefined;
    if (dto.include_pdf !== false) {
      if (invoice.pdf_url || invoice.pdf_s3_key) {
        const file = await this.storage.readByStoredFile(user.tenantId, {
          file_name: `${invoice.invoice_number}.pdf`,
          file_url: invoice.pdf_url ?? "",
          s3_key: invoice.pdf_s3_key,
          mime_type: "application/pdf",
        });
        attachmentBuffer = file.buffer;
        attachmentName = file.fileName;
      } else {
        const generated = await this.invoices.generatePdf(
          user.tenantId,
          invoiceId,
          user.id,
        );
        attachmentBuffer = generated.buffer;
        attachmentName = `${invoice.invoice_number}.pdf`;
      }
    }

    const body =
      dto.message ??
      `<p>[Vendor Share] Purchase invoice <strong>${invoice.invoice_number}</strong> from vendor party.</p>`;

    return this.documentEmail.sendDocument({
      tenantId: user.tenantId,
      eventType: "VENDOR_SHARE_INVOICE",
      to,
      cc,
      subject: `[Vendor Share] Invoice ${invoice.invoice_number}`,
      bodyHtml: body,
      attachmentBuffer,
      attachmentName,
      createdBy: user.id,
    });
  }

  async sendPaymentProof(
    user: CurrentVendorUser,
    invoiceId: string,
    proofId: string,
    dto: DocumentShareEmailDto,
  ) {
    this.assertRateLimit(user.id);
    await this.sendInvoicePdfGuard(user, invoiceId);

    const proof = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.paymentProof.findFirst({
        where: {
          id: proofId,
          tenant_id: user.tenantId,
          invoice_id: invoiceId,
          deleted_at: null,
        },
      }),
    );
    if (!proof) throw new NotFoundException("Payment proof not found.");

    const fallback = await this.documentEmail.resolveTenantAdminEmails(
      user.tenantId,
    );
    const { to, cc } = this.documentEmail.pickRecipients(dto, fallback);

    let attachmentBuffer: Buffer | undefined;
    let attachmentName: string | undefined;
    if (dto.include_pdf !== false && (proof.file_url || proof.s3_key)) {
      const file = await this.storage.readByStoredFile(user.tenantId, {
        file_name: `payment-proof-${proofId.slice(0, 8)}`,
        file_url: proof.file_url ?? "",
        s3_key: proof.s3_key,
        mime_type: proof.mime_type ?? "application/pdf",
      });
      attachmentBuffer = file.buffer;
      attachmentName = file.fileName;
    }

    const body =
      dto.message ??
      `<p>[Vendor Share] Payment proof for invoice submitted.</p>
       <ul>
         <li>Amount claimed: ${proof.amount_claimed}</li>
         <li>Payment date: ${String(proof.payment_date).slice(0, 10)}</li>
         <li>Reference: ${proof.reference_number ?? "n/a"}</li>
       </ul>`;

    return this.documentEmail.sendDocument({
      tenantId: user.tenantId,
      eventType: "VENDOR_SHARE_PROOF",
      to,
      cc,
      subject: `[Vendor Share] Payment proof ${proofId.slice(0, 8)}`,
      bodyHtml: body,
      attachmentBuffer,
      attachmentName,
      createdBy: user.id,
    });
  }

  async sendDispute(
    user: CurrentVendorUser,
    disputeId: string,
    dto: DocumentShareEmailDto,
  ) {
    this.assertRateLimit(user.id);
    const dispute = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.vendorDispute.findFirst({
        where: {
          id: disputeId,
          tenant_id: user.tenantId,
          party_id: user.partyId,
        },
      }),
    );
    if (!dispute) throw new NotFoundException("Dispute not found.");

    const fallback = await this.documentEmail.resolveTenantAdminEmails(
      user.tenantId,
    );
    const { to, cc } = this.documentEmail.pickRecipients(dto, fallback);

    let attachmentBuffer: Buffer | undefined;
    let attachmentName: string | undefined;
    if (dto.include_pdf !== false && dispute.attachment_path) {
      try {
        const file = await this.storage.readByStoredFile(user.tenantId, {
          file_name: dispute.attachment_path.split("/").pop() ?? "attachment",
          file_url: dispute.attachment_path,
          s3_key: dispute.attachment_path.includes("/")
            ? dispute.attachment_path
            : null,
        });
        attachmentBuffer = file.buffer;
        attachmentName = file.fileName;
      } catch {
        // HTML-only if attachment unreadable
      }
    }

    const body =
      dto.message ??
      `<p>[Vendor Share] Dispute package</p>
       <p><strong>${dispute.reason}</strong></p>
       <p>${dispute.description}</p>
       <p>Status: ${dispute.status}</p>`;

    return this.documentEmail.sendDocument({
      tenantId: user.tenantId,
      eventType: "VENDOR_SHARE_DISPUTE",
      to,
      cc,
      subject: `[Vendor Share] Dispute ${dispute.reason}`,
      bodyHtml: body,
      attachmentBuffer,
      attachmentName,
      createdBy: user.id,
    });
  }

  async sendRemittance(
    user: CurrentVendorUser,
    paymentId: string,
    dto: DocumentShareEmailDto,
  ) {
    this.assertRateLimit(user.id);
    const payment = await this.payments.findOne(user.tenantId, paymentId);
    if (payment.party_id !== user.partyId || payment.direction !== "PAYMENT") {
      throw new NotFoundException("Payment not found.");
    }

    const fallback = await this.documentEmail.resolveTenantAdminEmails(
      user.tenantId,
    );
    const { to, cc } = this.documentEmail.pickRecipients(dto, fallback);

    let attachmentBuffer: Buffer | undefined;
    let attachmentName: string | undefined;
    if (dto.include_pdf !== false) {
      attachmentBuffer =
        await this.documentEmail.buildRemittancePdf(payment);
      attachmentName = `remittance-${payment.payment_number}.pdf`;
    }

    const body =
      dto.message ??
      `<p>[Vendor Share] Remittance copy for payment <strong>${payment.payment_number}</strong>.</p>`;

    return this.documentEmail.sendDocument({
      tenantId: user.tenantId,
      eventType: "REMITTANCE_SEND",
      to,
      cc,
      subject: `[Vendor Share] Remittance ${payment.payment_number}`,
      bodyHtml: body,
      attachmentBuffer,
      attachmentName,
      createdBy: user.id,
    });
  }

  private async sendInvoicePdfGuard(
    user: CurrentVendorUser,
    invoiceId: string,
  ) {
    const invoice = await this.invoices.findOne(user.tenantId, invoiceId);
    if (
      invoice.party_id !== user.partyId ||
      invoice.invoice_type !== InvoiceType.PURCHASE_INVOICE
    ) {
      throw new NotFoundException("Invoice not found.");
    }
  }
}
