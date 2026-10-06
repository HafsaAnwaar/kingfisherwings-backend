import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  forwardRef,
} from "@nestjs/common";
import { PaymentProofDirection, PaymentProofStatus } from "@prisma/client";
import * as fs from "fs/promises";
import { PrismaService } from "../../../prisma/prisma.service";
import { StorageService } from "../../../shared/storage/storage.service";
import { NotificationEmitterService } from "../../notifications/notification-emitter.service";
import { PaymentsService } from "../../gl/payments.service";

export interface CreatePaymentProofInput {
  tenantId: string;
  direction: PaymentProofDirection;
  invoiceId: string;
  amountClaimed: number;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  submittedByPartyId?: string;
  submittedByUserId?: string;
  submittedByStaffId?: string;
  file?: Express.Multer.File;
  /** When set, proof is stored as ACKNOWLEDGED and linked to a posted payment. */
  linkedPaymentId?: string;
  status?: PaymentProofStatus;
  /** Allow create without a file (portal cash claim with optional proof). */
  fileOptional?: boolean;
  actorId?: string;
}

@Injectable()
export class PaymentProofsService {
  private readonly logger = new Logger(PaymentProofsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationEmitterService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly payments: PaymentsService,
  ) {}

  async listForInvoice(tenantId: string, invoiceId: string) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentProof.findMany({
        where: { tenant_id: tenantId, invoice_id: invoiceId, deleted_at: null },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data: rows };
  }

  async create(input: CreatePaymentProofInput) {
    const amount = Number(input.amountClaimed);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException("amount_claimed must be a positive number.");
    }

    const paymentDate = this.parsePaymentDate(input.paymentDate);

    const invoice = await this.prisma.runWithTenant(input.tenantId, (tx) =>
      tx.invoice.findFirst({
        where: {
          id: input.invoiceId,
          tenant_id: input.tenantId,
          deleted_at: null,
        },
      }),
    );
    if (!invoice) throw new NotFoundException("Invoice not found.");
    if (Number(invoice.balance_due) <= 0.0001 && !input.linkedPaymentId) {
      throw new BadRequestException("Invoice has no outstanding balance.");
    }
    if (amount - Number(invoice.balance_due) > 0.0001 && !input.linkedPaymentId) {
      throw new BadRequestException(
        `amount_claimed exceeds balance due (${invoice.balance_due}).`,
      );
    }

    let fileMeta: {
      file_url?: string;
      s3_key?: string;
      mime_type?: string;
      file_size?: number;
    } = {};

    if (input.file || !input.fileOptional) {
      const buffer = await this.resolveUploadBuffer(input.file);
      const originalName =
        input.file?.originalname?.trim() || `payment-proof-${Date.now()}.bin`;
      const mimeType =
        input.file?.mimetype?.trim() || "application/octet-stream";

      try {
        const saved = await this.storage.saveBuffer(
          input.tenantId,
          buffer,
          originalName,
          mimeType,
        );
        fileMeta = {
          file_url: saved.fileUrl,
          s3_key: saved.s3Key,
          mime_type: saved.mimeType,
          file_size: saved.fileSize,
        };
      } catch (err) {
        this.logger.error(
          `Payment proof storage failed: ${err instanceof Error ? err.message : String(err)}`,
        );
        throw new ServiceUnavailableException(
          "Could not store payment proof file. Check STORAGE_PATH / S3 configuration.",
        );
      }
    }

    const status = input.status ?? (input.linkedPaymentId ? "ACKNOWLEDGED" : "SUBMITTED");

    let proof;
    try {
      proof = await this.prisma.runWithTenant(input.tenantId, (tx) =>
        tx.paymentProof.create({
          data: {
            tenant_id: input.tenantId,
            direction: input.direction,
            invoice_id: input.invoiceId,
            submitted_by_party_id: input.submittedByPartyId,
            submitted_by_user_id: input.submittedByUserId,
            submitted_by_staff_id: input.submittedByStaffId,
            amount_claimed: amount,
            payment_date: paymentDate,
            reference_number: input.referenceNumber,
            notes: input.notes,
            linked_payment_id: input.linkedPaymentId,
            status,
            reviewed_at: status === "ACKNOWLEDGED" ? new Date() : undefined,
            ...fileMeta,
            created_by: input.actorId,
            updated_by: input.actorId,
          },
        }),
      );
    } catch (err) {
      this.logger.error(
        `Payment proof DB create failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new BadRequestException(
        "Could not save payment proof. Verify amount_claimed and payment_date.",
      );
    }

    if (status === "SUBMITTED") {
      await this.notifications.notifyFinanceStaff(input.tenantId, {
        type: "PAYMENT_PROOF_SUBMITTED",
        title: "Payment proof submitted",
        message: `Payment proof submitted for invoice ${invoice.invoice_number}.`,
        entity_type: "payment_proof",
        entity_id: proof.id,
        link_path: `/invoices/${invoice.id}`,
      });
    } else {
      await this.notifications.notifyFinanceStaff(input.tenantId, {
        type: "PAYMENT_PROOF_SUBMITTED",
        title: "Portal payment recorded",
        message: `Customer recorded payment of ${amount} for invoice ${invoice.invoice_number}. Balance updated.`,
        entity_type: "payment_proof",
        entity_id: proof.id,
        link_path: `/invoices/${invoice.id}`,
      });
    }

    return { success: true, data: proof };
  }

  async review(
    tenantId: string,
    id: string,
    status: PaymentProofStatus,
    reviewNotes: string | undefined,
    actorId?: string,
  ) {
    const proof = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentProof.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!proof) throw new NotFoundException("Payment proof not found.");

    // Portal auto-posted payments land as ACKNOWLEDGED; staff may still reject → cancel RECEIPT.
    const reviewable =
      proof.status === "SUBMITTED" ||
      (proof.status === "ACKNOWLEDGED" &&
        proof.linked_payment_id &&
        status === "REJECTED");
    if (!reviewable) {
      throw new BadRequestException(
        "Only submitted proofs (or acknowledged portal payments when rejecting) can be reviewed.",
      );
    }

    if (status === "REJECTED" && proof.linked_payment_id) {
      try {
        await this.payments.cancel(tenantId, proof.linked_payment_id, actorId);
      } catch (err) {
        this.logger.warn(
          `Could not cancel linked payment ${proof.linked_payment_id}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        throw new BadRequestException(
          `Reject requires reversing linked payment: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    if (status === "ACKNOWLEDGED" && proof.status === "ACKNOWLEDGED") {
      return { success: true, data: proof };
    }

    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentProof.update({
        where: { id },
        data: {
          status,
          review_notes: reviewNotes,
          reviewed_by: actorId,
          reviewed_at: new Date(),
          updated_by: actorId,
        },
      }),
    );

    if (proof.submitted_by_user_id) {
      await this.notifications.notifyPortalUser(
        tenantId,
        proof.submitted_by_user_id,
        {
          type: "PAYMENT_PROOF_REVIEWED",
          title:
            status === "ACKNOWLEDGED"
              ? "Payment proof acknowledged"
              : "Payment rejected — balance restored",
          message: `Your payment proof for invoice was ${status.toLowerCase()}.`,
          entity_type: "payment_proof",
          entity_id: proof.id,
          link_path: `/portal/invoices/${proof.invoice_id}`,
        },
      );
    }

    return { success: true, data: updated };
  }

  private parsePaymentDate(raw: string): Date {
    if (!raw || typeof raw !== "string") {
      throw new BadRequestException(
        "payment_date is required (YYYY-MM-DD).",
      );
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(
        "payment_date must be a valid date (YYYY-MM-DD).",
      );
    }
    return d;
  }

  private async resolveUploadBuffer(
    file?: Express.Multer.File,
  ): Promise<Buffer> {
    if (!file) {
      throw new BadRequestException("Payment proof file is required.");
    }
    if (file.buffer && Buffer.isBuffer(file.buffer) && file.buffer.length > 0) {
      return file.buffer;
    }
    // Disk-storage fallback (some hosts configure multer to disk)
    if (file.path) {
      try {
        const buf = await fs.readFile(file.path);
        if (buf.length > 0) return buf;
      } catch (err) {
        this.logger.warn(
          `Failed reading multer disk file: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    throw new BadRequestException(
      "Payment proof file is empty or could not be read. Send multipart field 'file' with memory upload.",
    );
  }
}
