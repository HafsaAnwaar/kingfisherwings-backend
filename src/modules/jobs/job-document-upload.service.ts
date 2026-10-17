import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DocumentSource,
  DocumentType,
  JobType,
  OpsUploaderSide,
  Prisma,
} from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { assertDocumentAllowedForJobType } from "./constants/job-document-allowlist";
import {
  bookingKindToDocumentType,
  defaultVisibleToCustomer,
  parseDocumentTypeParam,
} from "./utils/job-document-visibility.util";

export type DocumentAudience = "STAFF" | "CUSTOMER" | "VENDOR";

export type UploadActor = {
  userId: string;
  side: OpsUploaderSide;
  partyId?: string | null;
};

@Injectable()
export class JobDocumentUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async uploadForJob(
    tenantId: string,
    jobId: string,
    documentTypeRaw: string,
    file: Express.Multer.File,
    actor: UploadActor,
    opts?: {
      booking_form_kind?: string;
      skip_allowlist?: boolean;
      visible_to_customer?: boolean;
      visible_to_vendor?: boolean;
      reference_number?: string;
    },
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }
    const documentType = parseDocumentTypeParam(documentTypeRaw);
    if (!documentType) {
      throw new BadRequestException(`Invalid document type: ${documentTypeRaw}`);
    }

    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_type: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");

    if (!opts?.skip_allowlist) {
      assertDocumentAllowedForJobType(job.job_type, documentType);
    }

    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname || `${documentType}.bin`,
      file.mimetype || "application/octet-stream",
    );

    const visibleCustomer =
      opts?.visible_to_customer ??
      (actor.side === OpsUploaderSide.CUSTOMER
        ? true
        : defaultVisibleToCustomer(documentType));
    const visibleVendor =
      opts?.visible_to_vendor ??
      (actor.side === OpsUploaderSide.VENDOR ? true : false);

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobDocument.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          document_type: documentType,
          file_name: file.originalname || stored.s3Key,
          file_url: stored.fileUrl,
          s3_key: stored.s3Key,
          file_size: stored.fileSize,
          mime_type: stored.mimeType,
          reference_number: opts?.reference_number,
          generation_status: "COMPLETED",
          source: DocumentSource.UPLOADED,
          uploader_side: actor.side,
          uploaded_by_party_id: actor.partyId ?? null,
          visible_to_customer: visibleCustomer,
          visible_to_vendor: visibleVendor,
          booking_form_kind: opts?.booking_form_kind ?? null,
          uploaded_by: actor.userId,
          created_by: actor.userId,
          updated_by: actor.userId,
        },
      }),
    );
  }

  /**
   * Mirror a booking-form upload into JobDocument (idempotent replace per kind).
   */
  async mirrorBookingUpload(
    tenantId: string,
    jobId: string,
    kind: string,
    stored: { s3Key: string; fileUrl: string; fileSize: number; mimeType: string },
    fileName: string,
    actor: UploadActor,
    jobType?: JobType | null,
  ) {
    const documentType = bookingKindToDocumentType(kind, jobType);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobDocument.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          booking_form_kind: kind,
          deleted_at: null,
        },
      });
      const data = {
        document_type: documentType,
        file_name: fileName,
        file_url: stored.fileUrl,
        s3_key: stored.s3Key,
        file_size: stored.fileSize,
        mime_type: stored.mimeType,
        source: DocumentSource.UPLOADED,
        uploader_side: actor.side,
        uploaded_by_party_id: actor.partyId ?? null,
        visible_to_customer:
          actor.side === OpsUploaderSide.CUSTOMER
            ? true
            : defaultVisibleToCustomer(documentType),
        visible_to_vendor: actor.side === OpsUploaderSide.VENDOR,
        booking_form_kind: kind,
        generation_status: "COMPLETED" as const,
        uploaded_by: actor.userId,
        updated_by: actor.userId,
        deleted_at: null,
      };
      if (existing) {
        return tx.jobDocument.update({
          where: { id: existing.id },
          data,
        });
      }
      return tx.jobDocument.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          ...data,
          created_by: actor.userId,
        },
      });
    });
  }

  async listForAudience(
    tenantId: string,
    jobId: string,
    audience: DocumentAudience,
    query?: { uploader_side?: OpsUploaderSide },
  ) {
    await this.assertJob(tenantId, jobId);
    const where: Prisma.JobDocumentWhereInput = {
      tenant_id: tenantId,
      job_id: jobId,
      deleted_at: null,
      ...(query?.uploader_side ? { uploader_side: query.uploader_side } : {}),
    };
    if (audience === "CUSTOMER") {
      where.visible_to_customer = true;
      where.document_type = { notIn: CUSTOMER_BLOCKED_RUNTIME };
    }
    if (audience === "VENDOR") {
      where.OR = [
        { visible_to_vendor: true },
        { uploader_side: OpsUploaderSide.VENDOR },
      ];
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobDocument.findMany({
        where,
        orderBy: { created_at: "desc" },
      }),
    );
  }

  async download(
    tenantId: string,
    jobId: string,
    documentId: string,
    res: Response,
    audience: DocumentAudience,
    opts?: { partyId?: string },
  ) {
    const docs = await this.listForAudience(tenantId, jobId, audience);
    let doc = docs.find((d) => d.id === documentId);
    if (
      !doc &&
      audience === "VENDOR" &&
      opts?.partyId
    ) {
      doc =
        (await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.jobDocument.findFirst({
            where: {
              id: documentId,
              tenant_id: tenantId,
              job_id: jobId,
              deleted_at: null,
              OR: [
                { visible_to_vendor: true },
                {
                  uploader_side: OpsUploaderSide.VENDOR,
                  uploaded_by_party_id: opts.partyId,
                },
              ],
            },
          }),
        )) ?? undefined;
    }
    if (!doc) throw new NotFoundException("Document not found.");

    const file = await this.storage.readByStoredFile(tenantId, {
      file_name: doc.file_name,
      file_url: doc.file_url,
      s3_key: doc.s3_key,
      mime_type: doc.mime_type,
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

  async patchVisibility(
    tenantId: string,
    jobId: string,
    documentId: string,
    dto: { visible_to_customer?: boolean; visible_to_vendor?: boolean },
    actorId: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertJobTx(tx, tenantId, jobId);
      const doc = await tx.jobDocument.findFirst({
        where: {
          id: documentId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!doc) throw new NotFoundException("Document not found.");
      return tx.jobDocument.update({
        where: { id: documentId },
        data: {
          ...(dto.visible_to_customer !== undefined
            ? { visible_to_customer: dto.visible_to_customer }
            : {}),
          ...(dto.visible_to_vendor !== undefined
            ? { visible_to_vendor: dto.visible_to_vendor }
            : {}),
          updated_by: actorId,
        },
      });
    });
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { id: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
  }

  private async assertJobTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
  ) {
    const job = await tx.job.findFirst({
      where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      select: { id: true },
    });
    if (!job) throw new NotFoundException("Job not found.");
  }
}

const CUSTOMER_BLOCKED_RUNTIME: DocumentType[] = [
  DocumentType.JOB_PNL,
  DocumentType.JOB_COSTING,
  DocumentType.JOB_CARD,
  DocumentType.FREIGHT_MANIFEST,
];
