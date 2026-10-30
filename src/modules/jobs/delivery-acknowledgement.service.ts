import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DeliveryAcknowledgementStatus,
  DocumentSource,
  DocumentType,
  OpsUploaderSide,
} from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { EmailService } from "../../shared/email/email.service";
import { renderBrandedEmail } from "../../shared/email/branded-email.template";
import { PdfService } from "../../shared/pdf/pdf.service";
import {
  ReceiveDeliveryAcknowledgementDto,
  SubmitDeliveryAcknowledgementDto,
} from "./dto/delivery-acknowledgement.dto";

@Injectable()
export class DeliveryAcknowledgementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
    private readonly pdf: PdfService,
  ) {}

  formalTemplate(job: {
    job_number: string;
    commodity?: string | null;
    pieces?: number | null;
    gross_weight?: unknown;
  }) {
    return {
      title: "Goods Receipt Acknowledgement",
      company: "King Fisher Technologies",
      body: [
        `I/We hereby acknowledge receipt of the goods under job ${job.job_number}.`,
        job.commodity
          ? `Commodity / description: ${job.commodity}.`
          : "Commodity as per shipping documents.",
        job.pieces != null ? `Pieces: ${job.pieces}.` : null,
        job.gross_weight != null
          ? `Gross weight: ${String(job.gross_weight)}.`
          : null,
        "The goods have been received and inspected. Any discrepancies are noted in the remarks below.",
        "This acknowledgement constitutes formal confirmation of delivery to the consignee.",
      ].filter(Boolean) as string[],
      signature_prompt:
        "Please sign below to confirm receipt of the consignment.",
    };
  }

  async getForJob(tenantId: string, jobId: string) {
    const job = await this.assertJob(tenantId, jobId);
    const ack = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgement.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        include: {
          attachments: {
            where: { deleted_at: null },
            orderBy: { created_at: "desc" },
          },
        },
      }),
    );
    return {
      success: true,
      data: {
        job_id: jobId,
        job_number: job.job_number,
        template: this.formalTemplate(job),
        acknowledgement: ack,
        path_hints: {
          submit: `/portal/shipments/{id}/acknowledgement`,
          receive: `/jobs/${jobId}/acknowledgement/receive`,
          upload_signature: `/portal/shipments/{id}/acknowledgement/signature`,
          generate_pdf: `/jobs/${jobId}/acknowledgement/generate-pdf`,
          list_attachments: `/jobs/${jobId}/acknowledgement/attachments`,
          upload_attachment: `/jobs/${jobId}/acknowledgement/attachments`,
        },
      },
    };
  }

  async listAttachments(tenantId: string, jobId: string) {
    const ack = await this.getOrCreateDraft(tenantId, jobId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgementAttachment.findMany({
        where: {
          tenant_id: tenantId,
          acknowledgement_id: ack.id,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      }),
    );
    return {
      success: true,
      data: rows.map((r) => ({
        ...r,
        download_path: `/jobs/${jobId}/acknowledgement/attachments/${r.id}/download`,
      })),
    };
  }

  async uploadAttachment(
    tenantId: string,
    jobId: string,
    file: Express.Multer.File,
    actorId: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }
    const ack = await this.getOrCreateDraft(tenantId, jobId, actorId);
    if (ack.status === DeliveryAcknowledgementStatus.RECEIVED_BY_ADMIN) {
      throw new BadRequestException(
        "Acknowledgement already received by admin; attachments are locked.",
      );
    }
    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname || "acknowledgement-attachment.bin",
      file.mimetype || "application/octet-stream",
    );
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgementAttachment.create({
        data: {
          tenant_id: tenantId,
          acknowledgement_id: ack.id,
          file_name: file.originalname || stored.s3Key,
          file_url: stored.fileUrl,
          s3_key: stored.s3Key,
          mime_type: stored.mimeType,
          file_size: stored.fileSize,
          uploaded_by: actorId,
        },
      }),
    );
    return {
      success: true,
      data: {
        ...row,
        download_path: `/jobs/${jobId}/acknowledgement/attachments/${row.id}/download`,
      },
    };
  }

  async downloadAttachment(
    tenantId: string,
    jobId: string,
    attachmentId: string,
    res: Response,
  ) {
    const ack = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgement.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        select: { id: true },
      }),
    );
    if (!ack) throw new NotFoundException("No acknowledgement found.");

    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgementAttachment.findFirst({
        where: {
          id: attachmentId,
          tenant_id: tenantId,
          acknowledgement_id: ack.id,
          deleted_at: null,
        },
      }),
    );
    if (!row) throw new NotFoundException("Attachment not found.");

    const file = await this.storage.readByStoredFile(tenantId, {
      file_name: row.file_name,
      file_url: row.file_url,
      s3_key: row.s3_key,
      mime_type: row.mime_type,
    });
    res.setHeader("Content-Type", file.mimeType);
    const inline =
      !!file.mimeType &&
      (file.mimeType.startsWith("image/") ||
        file.mimeType === "application/pdf" ||
        file.mimeType.startsWith("text/"));
    res.setHeader(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename="${file.fileName.replace(/"/g, "")}"`,
    );
    res.send(file.buffer);
  }

  async getOrCreateDraft(tenantId: string, jobId: string, actorId?: string) {
    const job = await this.assertJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.deliveryAcknowledgement.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
      });
      if (existing) return existing;
      return tx.deliveryAcknowledgement.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          status: DeliveryAcknowledgementStatus.DRAFT,
          template_snapshot: this.formalTemplate(job) as never,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async submit(
    tenantId: string,
    jobId: string,
    dto: SubmitDeliveryAcknowledgementDto,
    opts: { userId: string; partyId?: string | null },
  ) {
    const job = await this.assertJob(tenantId, jobId);
    const draft = await this.getOrCreateDraft(tenantId, jobId, opts.userId);
    if (draft.status === DeliveryAcknowledgementStatus.RECEIVED_BY_ADMIN) {
      throw new BadRequestException(
        "Acknowledgement already received by admin.",
      );
    }

    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgement.update({
        where: { id: draft.id },
        data: {
          status: DeliveryAcknowledgementStatus.SUBMITTED,
          acknowledged_at: new Date(),
          receiver_name: dto.receiver_name.trim(),
          receiver_title: dto.receiver_title?.trim() ?? null,
          goods_condition: dto.goods_condition?.trim() ?? null,
          remarks: dto.remarks?.trim() ?? null,
          submitted_by_user_id: opts.userId,
          submitted_by_party_id: opts.partyId ?? null,
          template_snapshot: this.formalTemplate(job) as never,
          updated_by: opts.userId,
        },
      }),
    );

    try {
      const branded = renderBrandedEmail({
        subject: `Delivery acknowledgement received — ${job.job_number}`,
        headline: "Customer delivery acknowledgement submitted",
        recipientName: "Operations Team",
        audience: "STAFF",
        intro: [
          `A formal goods receipt acknowledgement has been submitted for job ${job.job_number}.`,
          `Receiver: ${dto.receiver_name}${dto.receiver_title ? ` (${dto.receiver_title})` : ""}.`,
          dto.goods_condition
            ? `Goods condition: ${dto.goods_condition}.`
            : "No goods condition noted.",
        ],
        closing: [
          "Please review the Acknowledgement tab on the job and mark as received.",
        ],
      });
      await this.email.send({
        tenantId,
        eventType: "OTHER",
        to:
          process.env.SUPPORT_EMAIL?.trim() ||
          process.env.SMTP_FROM_EMAIL?.trim() ||
          "support@kingfisherwings.com",
        subject: branded.subject,
        body: branded.html,
        createdBy: opts.userId,
      });
    } catch {
      /* non-fatal */
    }

    return { success: true, data: updated };
  }

  async uploadSignature(
    tenantId: string,
    jobId: string,
    file: Express.Multer.File,
    actorId: string,
  ) {
    await this.assertJob(tenantId, jobId);
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }
    const draft = await this.getOrCreateDraft(tenantId, jobId, actorId);
    if (draft.status === DeliveryAcknowledgementStatus.RECEIVED_BY_ADMIN) {
      throw new BadRequestException(
        "Acknowledgement already received by admin.",
      );
    }
    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname || "signature.png",
      file.mimetype || "image/png",
    );
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgement.update({
        where: { id: draft.id },
        data: {
          signature_s3_key: stored.s3Key,
          signature_file_url: stored.fileUrl,
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async receive(
    tenantId: string,
    jobId: string,
    dto: ReceiveDeliveryAcknowledgementDto,
    actorId: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const ack = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgement.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
      }),
    );
    if (!ack) {
      throw new NotFoundException("No acknowledgement submitted yet.");
    }
    if (ack.status !== DeliveryAcknowledgementStatus.SUBMITTED) {
      throw new BadRequestException(
        `Acknowledgement status is ${ack.status}; expected SUBMITTED.`,
      );
    }

    let proofDocId = ack.proof_of_delivery_id;
    try {
      const generated = await this.generateFormalPdfInternal(
        tenantId,
        jobId,
        ack,
        actorId,
      );
      proofDocId = generated.id;
    } catch {
      /* non-fatal — admin can generate later */
    }

    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgement.update({
        where: { id: ack.id },
        data: {
          status: DeliveryAcknowledgementStatus.RECEIVED_BY_ADMIN,
          received_at: new Date(),
          received_by_user_id: actorId,
          proof_of_delivery_id: proofDocId,
          remarks: dto.notes
            ? `${ack.remarks ?? ""}\n[Admin] ${dto.notes}`.trim()
            : ack.remarks,
          updated_by: actorId,
        },
      }),
    );

    return { success: true, data: updated };
  }

  async generateFormalPdf(tenantId: string, jobId: string, actorId: string) {
    const job = await this.assertJob(tenantId, jobId);
    const ack = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgement.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
      }),
    );
    if (!ack) {
      throw new NotFoundException("No acknowledgement to generate PDF for.");
    }
    const doc = await this.generateFormalPdfInternal(
      tenantId,
      jobId,
      ack,
      actorId,
    );
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.deliveryAcknowledgement.update({
        where: { id: ack.id },
        data: { proof_of_delivery_id: doc.id, updated_by: actorId },
      }),
    );
    return {
      success: true,
      data: {
        job_document_id: doc.id,
        file_url: doc.file_url,
        s3_key: doc.s3_key,
        job_number: job.job_number,
      },
    };
  }

  private async generateFormalPdfInternal(
    tenantId: string,
    jobId: string,
    ack: {
      receiver_name: string | null;
      receiver_title: string | null;
      goods_condition: string | null;
      remarks: string | null;
      acknowledged_at: Date | null;
      signature_file_url: string | null;
      template_snapshot: unknown;
    },
    actorId: string,
  ) {
    const job = await this.assertJob(tenantId, jobId);
    const template = this.formalTemplate(job);
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${template.title}</title>
<style>
  body{font-family:Georgia,serif;color:#0F172A;padding:40px;max-width:720px;margin:0 auto}
  h1{color:#0B5FFF;font-size:22px;margin:0 0 8px}
  .co{color:#475569;font-size:13px;margin-bottom:24px}
  p{line-height:1.55;font-size:14px}
  .meta{margin-top:28px;border-top:1px solid #E2E8F0;padding-top:16px;font-size:13px}
  .sig{margin-top:32px}
  .sig img{max-height:80px;max-width:240px}
</style></head><body>
  <h1>${escapeHtml(template.title)}</h1>
  <div class="co">${escapeHtml(template.company)} · Job ${escapeHtml(job.job_number)}</div>
  ${template.body.map((line) => `<p>${escapeHtml(line)}</p>`).join("\n")}
  <div class="meta">
    <p><strong>Receiver:</strong> ${escapeHtml(ack.receiver_name ?? "—")}${
      ack.receiver_title
        ? ` (${escapeHtml(ack.receiver_title)})`
        : ""
    }</p>
    <p><strong>Goods condition:</strong> ${escapeHtml(ack.goods_condition ?? "—")}</p>
    <p><strong>Acknowledged at:</strong> ${
      ack.acknowledged_at
        ? escapeHtml(ack.acknowledged_at.toISOString())
        : "—"
    }</p>
    <p><strong>Remarks:</strong> ${escapeHtml(ack.remarks ?? "—")}</p>
  </div>
  ${
    ack.signature_file_url
      ? `<div class="sig"><p>Signature:</p><img src="${escapeHtml(ack.signature_file_url)}" alt="Signature"/></div>`
      : ""
  }
</body></html>`;

    const buffer = await this.pdf.renderHtmlToPdf(html);
    const stored = await this.storage.saveBuffer(
      tenantId,
      buffer,
      `delivery-acknowledgement-${job.job_number}.pdf`,
      "application/pdf",
    );

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobDocument.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          document_type: DocumentType.PROOF_OF_DELIVERY,
          file_name: `delivery-acknowledgement-${job.job_number}.pdf`,
          file_url: stored.fileUrl,
          s3_key: stored.s3Key,
          file_size: stored.fileSize,
          mime_type: "application/pdf",
          source: DocumentSource.GENERATED,
          uploader_side: OpsUploaderSide.STAFF,
          visible_to_customer: true,
          generation_status: "COMPLETED",
          uploaded_by: actorId,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_number: true,
          commodity: true,
          pieces: true,
          gross_weight: true,
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
