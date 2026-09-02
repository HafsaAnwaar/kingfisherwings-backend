import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaymentProofDirection, PaymentProofStatus } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { StorageService } from "../../../shared/storage/storage.service";
import { NotificationEmitterService } from "../../notifications/notification-emitter.service";

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
  actorId?: string;
}

@Injectable()
export class PaymentProofsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationEmitterService,
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
    if (Number(invoice.balance_due) <= 0.0001) {
      throw new BadRequestException("Invoice has no outstanding balance.");
    }
    if (input.amountClaimed <= 0) {
      throw new BadRequestException("amount_claimed must be positive.");
    }

    let fileMeta: {
      file_url?: string;
      s3_key?: string;
      mime_type?: string;
      file_size?: number;
    } = {};
    if (input.file) {
      const saved = await this.storage.saveBuffer(
        input.tenantId,
        input.file.buffer,
        input.file.originalname,
        input.file.mimetype,
      );
      fileMeta = {
        file_url: saved.fileUrl,
        s3_key: saved.s3Key,
        mime_type: saved.mimeType,
        file_size: saved.fileSize,
      };
    } else {
      throw new BadRequestException("Payment proof file is required.");
    }

    const proof = await this.prisma.runWithTenant(input.tenantId, (tx) =>
      tx.paymentProof.create({
        data: {
          tenant_id: input.tenantId,
          direction: input.direction,
          invoice_id: input.invoiceId,
          submitted_by_party_id: input.submittedByPartyId,
          submitted_by_user_id: input.submittedByUserId,
          submitted_by_staff_id: input.submittedByStaffId,
          amount_claimed: input.amountClaimed,
          payment_date: new Date(input.paymentDate),
          reference_number: input.referenceNumber,
          notes: input.notes,
          ...fileMeta,
          created_by: input.actorId,
          updated_by: input.actorId,
        },
      }),
    );

    await this.notifications.notifyFinanceStaff(input.tenantId, {
      type: "PAYMENT_PROOF_SUBMITTED",
      title: "Payment proof submitted",
      message: `Payment proof submitted for invoice ${invoice.invoice_number}.`,
      entity_type: "payment_proof",
      entity_id: proof.id,
      link_path: `/invoices/${invoice.id}`,
    });

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
    if (proof.status !== "SUBMITTED") {
      throw new BadRequestException("Only submitted proofs can be reviewed.");
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
              : "Payment proof rejected",
          message: `Your payment proof for invoice was ${status.toLowerCase()}.`,
          entity_type: "payment_proof",
          entity_id: proof.id,
          link_path: `/portal/invoices/${proof.invoice_id}`,
        },
      );
    }

    return { success: true, data: updated };
  }
}
