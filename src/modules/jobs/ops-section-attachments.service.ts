import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OpsEntityType, OpsUploaderSide } from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { OpsActivityService } from "../ops-activity/ops-activity.service";
import { JobDocumentUploadService } from "./job-document-upload.service";
import {
  isOpsSection,
  opsKind,
  OPS_SECTION_DOCUMENT_TYPE,
  OPS_SECTION_VISIBILITY,
  type OpsSection,
} from "./ops-section-attachments.constants";

export type OpsOwner = "JOB" | "SHIPMENT" | "QUOTATION";

@Injectable()
export class OpsSectionAttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documents: JobDocumentUploadService,
    private readonly ops: OpsActivityService,
  ) {}

  parseSection(raw: string): OpsSection {
    const key = raw.trim().toLowerCase().replace(/-/g, "_");
    if (!isOpsSection(key)) {
      throw new BadRequestException(
        `Unknown section "${raw}". Allowed: customs_status, cfs_storage, transhipment_link, deposits, free_days, damage_reports, part_deliveries, pods, payment_requests, sub_jobs, bills_of_lading, stuffing_records.`,
      );
    }
    return key;
  }

  pathHints(owner: OpsOwner, ownerId: string, section: OpsSection) {
    const base = this.basePath(owner, ownerId);
    return {
      upload: `${base}/${section}/attachments`,
      list: `${base}/${section}/attachments`,
      download: `${base}/${section}/attachments/:documentId/download`,
      documents_tab:
        owner === "JOB"
          ? `/jobs/${ownerId}/documents`
          : owner === "SHIPMENT"
            ? `/shipments/${ownerId}/detail`
            : `/quotations/${ownerId}/detail`,
    };
  }

  async decorateList<T>(
    tenantId: string,
    owner: OpsOwner,
    ownerId: string,
    sectionRaw: string,
    rows: T[],
  ) {
    const section = this.parseSection(sectionRaw);
    const files = await this.list(tenantId, owner, ownerId, section);
    const byRecord = new Map<string, typeof files.data>();
    for (const file of files.data) {
      const key = file.record_id ?? "_section";
      const list = byRecord.get(key) ?? [];
      list.push(file);
      byRecord.set(key, list);
    }
    const data = rows.map((row) => {
      const rec = row as { id?: string };
      const attached = [
        ...(rec.id ? (byRecord.get(rec.id) ?? []) : []),
        ...(byRecord.get("_section") ?? []),
      ];
      return { ...row, attachments: attached };
    });
    return {
      success: true,
      data,
      attachments: files.data,
      actions: { can_upload: true, can_download: true, can_open: true },
      path_hints: this.pathHints(owner, ownerId, section),
    };
  }

  async list(
    tenantId: string,
    owner: OpsOwner,
    ownerId: string,
    sectionRaw: string,
    recordId?: string,
  ) {
    const section = this.parseSection(sectionRaw);
    const jobId = await this.resolveJobId(tenantId, owner, ownerId);
    const kind = opsKind(section);
    const jobDocs = jobId
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.jobDocument.findMany({
            where: {
              tenant_id: tenantId,
              job_id: jobId,
              booking_form_kind: kind,
              deleted_at: null,
              ...(recordId ? { reference_number: recordId } : {}),
            },
            orderBy: { created_at: "desc" },
          }),
        )
      : [];

    const opsType = owner as OpsEntityType;
    const opsList = await this.ops.listAttachments(tenantId, opsType, ownerId, "STAFF");
    const opsDocs = (opsList.data ?? []).filter(
      (row) =>
        (row.notes ?? "").startsWith(`section=${section}`) &&
        (!recordId || (row.notes ?? "").includes(`record=${recordId}`)),
    );

    const data = [
      ...jobDocs.map((d) => this.toFile(owner, ownerId, section, d, "job")),
      ...opsDocs
        .filter((o) => !jobDocs.some((d) => d.s3_key && d.s3_key === o.storage_key))
        .map((o) => this.toOpsFile(owner, ownerId, section, o)),
    ];

    return {
      success: true,
      data,
      actions: { can_upload: true, can_download: true, can_open: true },
      path_hints: this.pathHints(owner, ownerId, section),
    };
  }

  async upload(
    tenantId: string,
    owner: OpsOwner,
    ownerId: string,
    sectionRaw: string,
    file: Express.Multer.File,
    actorId: string,
    opts?: {
      record_id?: string;
      visible_to_customer?: boolean;
      visible_to_vendor?: boolean;
      downloadable_by_customer?: boolean;
      downloadable_by_vendor?: boolean;
    },
  ) {
    const section = this.parseSection(sectionRaw);
    const vis = OPS_SECTION_VISIBILITY[section];
    const visibleCustomer = opts?.visible_to_customer ?? vis.customer;
    const visibleVendor = opts?.visible_to_vendor ?? vis.vendor;
    const downloadableCustomer = opts?.downloadable_by_customer ?? true;
    const downloadableVendor = opts?.downloadable_by_vendor ?? true;
    const jobId = await this.resolveJobId(tenantId, owner, ownerId);

    const notes = [
      `section=${section}`,
      opts?.record_id ? `record=${opts.record_id}` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const opsRow = await this.ops.uploadAttachmentFile(
      tenantId,
      owner as OpsEntityType,
      ownerId,
      file,
      actorId,
      {
        uploader_side: OpsUploaderSide.STAFF,
        notes,
        visible_to_customer: visibleCustomer,
        visible_to_vendor: visibleVendor,
      },
    );

    let jobDoc = null as Awaited<
      ReturnType<JobDocumentUploadService["uploadForJob"]>
    > | null;
    if (jobId) {
      jobDoc = await this.documents.uploadForJob(
        tenantId,
        jobId,
        OPS_SECTION_DOCUMENT_TYPE[section],
        file,
        { userId: actorId, side: OpsUploaderSide.STAFF },
        {
          skip_allowlist: true,
          booking_form_kind: opsKind(section),
          reference_number: opts?.record_id,
          visible_to_customer: visibleCustomer,
          visible_to_vendor: visibleVendor,
          downloadable_by_customer: downloadableCustomer,
          downloadable_by_vendor: downloadableVendor,
        },
      );
    }

    return {
      success: true,
      data: {
        job_document: jobDoc
          ? this.toFile(owner, ownerId, section, jobDoc, "job")
          : null,
        ops_attachment: opsRow.data,
        shown_in_documents: !!jobDoc,
        visible_to_customer: visibleCustomer,
        visible_to_vendor: visibleVendor,
        downloadable_by_customer: downloadableCustomer,
        downloadable_by_vendor: downloadableVendor,
      },
      path_hints: this.pathHints(owner, ownerId, section),
    };
  }

  async download(
    tenantId: string,
    owner: OpsOwner,
    ownerId: string,
    sectionRaw: string,
    documentId: string,
    res: Response,
  ) {
    this.parseSection(sectionRaw);
    const jobId = await this.resolveJobId(tenantId, owner, ownerId);
    if (jobId) {
      const doc = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobDocument.findFirst({
          where: {
            id: documentId,
            tenant_id: tenantId,
            job_id: jobId,
            deleted_at: null,
          },
        }),
      );
      if (doc) {
        return this.documents.download(
          tenantId,
          jobId,
          documentId,
          res,
          "STAFF",
        );
      }
    }
    return this.ops.downloadAttachment(
      tenantId,
      owner as OpsEntityType,
      ownerId,
      documentId,
      res,
      "STAFF",
    );
  }

  private basePath(owner: OpsOwner, ownerId: string) {
    if (owner === "JOB") return `/jobs/${ownerId}`;
    if (owner === "SHIPMENT") return `/shipments/${ownerId}`;
    return `/quotations/${ownerId}`;
  }

  private async resolveJobId(
    tenantId: string,
    owner: OpsOwner,
    ownerId: string,
  ): Promise<string | null> {
    if (owner === "JOB") {
      const job = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.findFirst({
          where: { id: ownerId, tenant_id: tenantId, deleted_at: null },
          select: { id: true },
        }),
      );
      if (!job) throw new NotFoundException("Job not found.");
      return job.id;
    }
    if (owner === "SHIPMENT") {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.shipment.findFirst({
          where: { id: ownerId, tenant_id: tenantId, deleted_at: null },
          select: { id: true, job_id: true },
        }),
      );
      if (!row) throw new NotFoundException("Shipment not found.");
      return row.job_id;
    }
    const quote = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id: ownerId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, converted_job_id: true },
      }),
    );
    if (!quote) throw new NotFoundException("Quotation not found.");
    return quote.converted_job_id;
  }

  private toFile(
    owner: OpsOwner,
    ownerId: string,
    section: OpsSection,
    d: {
      id: string;
      file_name: string;
      mime_type: string | null;
      file_size: number | null;
      visible_to_customer: boolean;
      visible_to_vendor: boolean;
      downloadable_by_customer?: boolean;
      downloadable_by_vendor?: boolean;
      reference_number: string | null;
      created_at: Date;
    },
    source: "job",
  ) {
    const hints = this.pathHints(owner, ownerId, section);
    return {
      id: d.id,
      source,
      file_name: d.file_name,
      mime_type: d.mime_type,
      file_size: d.file_size,
      record_id: d.reference_number,
      visible_to_customer: d.visible_to_customer,
      visible_to_vendor: d.visible_to_vendor,
      downloadable_by_customer: d.downloadable_by_customer ?? true,
      downloadable_by_vendor: d.downloadable_by_vendor ?? true,
      created_at: d.created_at,
      open_url: hints.download.replace(":documentId", d.id),
      download_url: hints.download.replace(":documentId", d.id),
    };
  }

  private toOpsFile(
    owner: OpsOwner,
    ownerId: string,
    section: OpsSection,
    o: {
      id: string;
      file_name: string;
      mime_type: string | null;
      size_bytes: number | null;
      visible_to_customer: boolean;
      visible_to_vendor: boolean;
      notes: string | null;
      created_at: Date;
    },
  ) {
    const record =
      o.notes?.match(/record=([0-9a-f-]{36})/i)?.[1] ?? null;
    return {
      id: o.id,
      source: "ops" as const,
      file_name: o.file_name,
      mime_type: o.mime_type,
      file_size: o.size_bytes,
      record_id: record,
      visible_to_customer: o.visible_to_customer,
      visible_to_vendor: o.visible_to_vendor,
      created_at: o.created_at,
      open_url: `/ops/${owner}/${ownerId}/attachments/${o.id}/download`,
      download_url: `/ops/${owner}/${ownerId}/attachments/${o.id}/download`,
    };
  }
}
