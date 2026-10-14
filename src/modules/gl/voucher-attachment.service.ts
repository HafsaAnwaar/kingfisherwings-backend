import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OpsUploaderSide } from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";

export type VoucherAttachmentActor = {
  userId: string;
  side: OpsUploaderSide;
  partyId?: string | null;
};

@Injectable()
export class VoucherAttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list(tenantId: string, voucherId: string) {
    await this.assertVoucher(tenantId, voucherId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucherAttachment.findMany({
        where: {
          tenant_id: tenantId,
          voucher_id: voucherId,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  async upload(
    tenantId: string,
    voucherId: string,
    file: Express.Multer.File,
    actor: VoucherAttachmentActor,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }
    await this.assertVoucher(tenantId, voucherId);
    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname || "voucher-attachment.bin",
      file.mimetype || "application/octet-stream",
    );
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucherAttachment.create({
        data: {
          tenant_id: tenantId,
          voucher_id: voucherId,
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
    voucherId: string,
    attachmentId: string,
    res: Response,
  ) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucherAttachment.findFirst({
        where: {
          id: attachmentId,
          tenant_id: tenantId,
          voucher_id: voucherId,
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
    voucherId: string,
    partyId: string,
  ) {
    const voucher = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.findFirst({
        where: {
          id: voucherId,
          tenant_id: tenantId,
          party_id: partyId,
          deleted_at: null,
        },
        select: { id: true },
      }),
    );
    if (!voucher) throw new NotFoundException("Voucher not found.");
    return voucher;
  }

  private async assertVoucher(tenantId: string, voucherId: string) {
    const voucher = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.findFirst({
        where: { id: voucherId, tenant_id: tenantId, deleted_at: null },
        select: { id: true },
      }),
    );
    if (!voucher) throw new NotFoundException("Voucher not found.");
  }
}
