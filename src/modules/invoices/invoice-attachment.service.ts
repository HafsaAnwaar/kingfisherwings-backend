import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InvoiceType, OpsUploaderSide } from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";

export type FinanceAttachmentActor = {
  userId: string;
  side: OpsUploaderSide;
  partyId?: string | null;
};

@Injectable()
export class InvoiceAttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list(tenantId: string, invoiceId: string) {
    await this.assertInvoice(tenantId, invoiceId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoiceAttachment.findMany({
        where: {
          tenant_id: tenantId,
          invoice_id: invoiceId,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  async upload(
    tenantId: string,
    invoiceId: string,
    file: Express.Multer.File,
    actor: FinanceAttachmentActor,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }
    await this.assertInvoice(tenantId, invoiceId);
    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname || "invoice-attachment.bin",
      file.mimetype || "application/octet-stream",
    );
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoiceAttachment.create({
        data: {
          tenant_id: tenantId,
          invoice_id: invoiceId,
          file_name: file.originalname || stored.s3Key,
          file_url: stored.fileUrl,
          s3_key: stored.s3Key,
          mime_type: stored.mimeType,
          file_size: stored.fileSize,
          uploader_side: actor.side,
          uploaded_by_party_id: actor.partyId ?? null,
          uploaded_by: actor.userId,
        },
      }),
    );
  }

  async download(
    tenantId: string,
    invoiceId: string,
    attachmentId: string,
    res: Response,
  ) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoiceAttachment.findFirst({
        where: {
          id: attachmentId,
          tenant_id: tenantId,
          invoice_id: invoiceId,
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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName.replace(/"/g, "")}"`,
    );
    res.send(file.buffer);
  }

  async assertOwnedByParty(
    tenantId: string,
    invoiceId: string,
    partyId: string,
    types?: InvoiceType[],
  ) {
    const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({
        where: {
          id: invoiceId,
          tenant_id: tenantId,
          party_id: partyId,
          deleted_at: null,
          ...(types?.length ? { invoice_type: { in: types } } : {}),
        },
        select: { id: true, invoice_type: true },
      }),
    );
    if (!invoice) throw new NotFoundException("Invoice not found.");
    return invoice;
  }

  private async assertInvoice(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({
        where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
        select: { id: true },
      }),
    );
    if (!invoice) throw new NotFoundException("Invoice not found.");
  }
}
