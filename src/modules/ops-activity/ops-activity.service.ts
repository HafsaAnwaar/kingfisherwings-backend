import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  OpsEntityType,
  OpsUploaderSide,
  Prisma,
} from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import {
  CreateOpsAttachmentMetaDto,
  CreateOpsComplaintDto,
  CreateOpsFollowUpDto,
  CreateOpsLinkDto,
  CreateOpsReferenceDto,
  CreateOpsTagDto,
  PatchOpsComplaintDto,
} from "./dto/ops-activity.dto";

export type OpsAttachmentAudience = "STAFF" | "CUSTOMER" | "VENDOR";

@Injectable()
export class OpsActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private async assertEntityExists(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    const ok = await this.prisma.runWithTenant(tenantId, async (tx) => {
      switch (entityType) {
        case "ENQUIRY":
          return tx.enquiry.findFirst({
            where: { id: entityId, tenant_id: tenantId, deleted_at: null },
            select: { id: true },
          });
        case "QUOTATION":
          return tx.quotation.findFirst({
            where: { id: entityId, tenant_id: tenantId, deleted_at: null },
            select: { id: true },
          });
        case "SHIPMENT":
          return tx.shipment.findFirst({
            where: { id: entityId, tenant_id: tenantId, deleted_at: null },
            select: { id: true },
          });
        case "JOB":
          return tx.job.findFirst({
            where: { id: entityId, tenant_id: tenantId, deleted_at: null },
            select: { id: true },
          });
        default:
          return null;
      }
    });
    if (!ok) {
      throw new NotFoundException(`${entityType} not found.`);
    }
  }

  private followUpFk(
    entityType: OpsEntityType,
    entityId: string,
  ): Prisma.FollowUpWhereInput {
    switch (entityType) {
      case "ENQUIRY":
        return { enquiry_id: entityId };
      case "QUOTATION":
        return { quotation_id: entityId };
      case "SHIPMENT":
        return { shipment_id: entityId };
      case "JOB":
        return { job_id: entityId };
    }
  }

  private followUpCreateData(
    entityType: OpsEntityType,
    entityId: string,
  ): Partial<Prisma.FollowUpUncheckedCreateInput> {
    switch (entityType) {
      case "ENQUIRY":
        return { enquiry_id: entityId };
      case "QUOTATION":
        return { quotation_id: entityId };
      case "SHIPMENT":
        return { shipment_id: entityId };
      case "JOB":
        return { job_id: entityId };
    }
  }

  async listFollowUps(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.followUp.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...this.followUpFk(entityType, entityId),
        },
        orderBy: { due_date: "asc" },
      }),
    );
    return { success: true, data };
  }

  async createFollowUp(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    dto: CreateOpsFollowUpDto,
    actorId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.followUp.create({
        data: {
          tenant_id: tenantId,
          owner_id: dto.owner_id ?? actorId,
          due_date: new Date(dto.due_date),
          subject: dto.subject,
          notes: dto.notes,
          created_by: actorId,
          ...this.followUpCreateData(entityType, entityId),
        },
      }),
    );
    await this.writeHistory(tenantId, entityType, entityId, actorId, "FOLLOW_UP_CREATE", {
      follow_up_id: data.id,
      subject: data.subject,
    });
    return { success: true, data };
  }

  /**
   * Customer portal must own the commercial party on the entity.
   * Vendor must have a job-offer / vendor-quote link (JOB/SHIPMENT only).
   */
  async assertAudienceAccess(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    audience: OpsAttachmentAudience,
    partyId?: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    if (audience === "STAFF") return;

    if (!partyId) {
      throw new ForbiddenException("Party context required.");
    }

    if (audience === "CUSTOMER") {
      const owned = await this.customerOwnsEntity(
        tenantId,
        entityType,
        entityId,
        partyId,
      );
      if (!owned) {
        throw new ForbiddenException("Not allowed to access this record.");
      }
      return;
    }

    // VENDOR
    if (entityType === "ENQUIRY" || entityType === "QUOTATION") {
      throw new ForbiddenException(
        "Vendors can only access shipment/job continuum attachments.",
      );
    }
    const linked = await this.vendorLinkedToEntity(
      tenantId,
      entityType,
      entityId,
      partyId,
    );
    if (!linked) {
      throw new ForbiddenException("Vendor is not linked to this job/shipment.");
    }
  }

  private async customerOwnsEntity(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    partyId: string,
  ): Promise<boolean> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      switch (entityType) {
        case "ENQUIRY": {
          const row = await tx.enquiry.findFirst({
            where: { id: entityId, tenant_id: tenantId, deleted_at: null },
            select: { party_id: true, shipper_id: true, consignee_id: true },
          });
          return (
            !!row &&
            [row.party_id, row.shipper_id, row.consignee_id].includes(partyId)
          );
        }
        case "QUOTATION": {
          const row = await tx.quotation.findFirst({
            where: { id: entityId, tenant_id: tenantId, deleted_at: null },
            select: { customer_id: true },
          });
          return row?.customer_id === partyId;
        }
        case "SHIPMENT": {
          const row = await tx.shipment.findFirst({
            where: { id: entityId, tenant_id: tenantId, deleted_at: null },
            select: {
              customer_id: true,
              shipper_id: true,
              consignee_id: true,
              notify_party_id: true,
            },
          });
          return (
            !!row &&
            [
              row.customer_id,
              row.shipper_id,
              row.consignee_id,
              row.notify_party_id,
            ].includes(partyId)
          );
        }
        case "JOB": {
          const row = await tx.job.findFirst({
            where: { id: entityId, tenant_id: tenantId, deleted_at: null },
            select: {
              shipper_id: true,
              consignee_id: true,
              billing_party_id: true,
            },
          });
          return (
            !!row &&
            [row.shipper_id, row.consignee_id, row.billing_party_id].includes(
              partyId,
            )
          );
        }
        default:
          return false;
      }
    });
  }

  private async vendorLinkedToEntity(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    partyId: string,
  ): Promise<boolean> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      let jobId = entityId;
      if (entityType === "SHIPMENT") {
        const ship = await tx.shipment.findFirst({
          where: { id: entityId, tenant_id: tenantId, deleted_at: null },
          select: { job_id: true },
        });
        if (!ship?.job_id) return false;
        jobId = ship.job_id;
      }
      const offer = await tx.vendorQuote.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          vendor_party_id: partyId,
          deleted_at: null,
        },
        select: { id: true },
      });
      return !!offer;
    });
  }

  async listAttachments(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    audience: OpsAttachmentAudience = "STAFF",
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const where: Prisma.OpsEntityAttachmentWhereInput = {
      tenant_id: tenantId,
      entity_type: entityType,
      entity_id: entityId,
      deleted_at: null,
      ...(audience === "CUSTOMER" ? { visible_to_customer: true } : {}),
      ...(audience === "VENDOR" ? { visible_to_vendor: true } : {}),
    };
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityAttachment.findMany({
        where,
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data };
  }

  async addAttachment(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    dto: CreateOpsAttachmentMetaDto,
    actorId: string,
    opts?: {
      uploader_side?: OpsUploaderSide;
      party_id?: string;
    },
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const side = opts?.uploader_side ?? dto.uploader_side ?? "STAFF";
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityAttachment.create({
        data: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          file_name: dto.file_name,
          storage_key: dto.storage_key,
          file_url: dto.file_url,
          mime_type: dto.mime_type,
          size_bytes: dto.size_bytes,
          notes: dto.notes,
          uploader_side: side,
          uploaded_by_party_id: opts?.party_id,
          visible_to_customer: dto.visible_to_customer ?? true,
          visible_to_vendor: dto.visible_to_vendor ?? true,
          created_by: actorId,
        },
      }),
    );
    await this.writeHistory(tenantId, entityType, entityId, actorId, "ATTACHMENT_ADD", {
      attachment_id: data.id,
      file_name: data.file_name,
      uploader_side: side,
    });
    return { success: true, data };
  }

  /** Multipart upload → Cloudflare R2 (or local fallback) + metadata row. */
  async uploadAttachmentFile(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    file: Express.Multer.File,
    actorId: string,
    opts?: {
      uploader_side?: OpsUploaderSide;
      party_id?: string;
      notes?: string;
      visible_to_customer?: boolean;
      visible_to_vendor?: boolean;
    },
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }
    await this.assertEntityExists(tenantId, entityType, entityId);
    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname || "attachment.bin",
      file.mimetype || "application/octet-stream",
    );
    return this.addAttachment(
      tenantId,
      entityType,
      entityId,
      {
        file_name: file.originalname || stored.s3Key,
        storage_key: stored.s3Key,
        file_url: stored.fileUrl,
        mime_type: stored.mimeType,
        size_bytes: stored.fileSize,
        notes: opts?.notes,
        visible_to_customer: opts?.visible_to_customer,
        visible_to_vendor: opts?.visible_to_vendor,
      },
      actorId,
      {
        uploader_side: opts?.uploader_side ?? "STAFF",
        party_id: opts?.party_id,
      },
    );
  }

  async downloadAttachment(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    attachmentId: string,
    res: Response,
    audience: OpsAttachmentAudience = "STAFF",
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const doc = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityAttachment.findFirst({
        where: {
          id: attachmentId,
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          deleted_at: null,
          ...(audience === "CUSTOMER" ? { visible_to_customer: true } : {}),
          ...(audience === "VENDOR" ? { visible_to_vendor: true } : {}),
        },
      }),
    );
    if (!doc) throw new NotFoundException("Attachment not found.");

    const file = await this.storage.readByStoredFile(tenantId, {
      file_name: doc.file_name,
      file_url: doc.file_url ?? "",
      s3_key: doc.storage_key,
      mime_type: doc.mime_type,
    });

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName.replace(/"/g, "")}"`,
    );
    res.send(file.buffer);
  }

  /** Presigned GET URL for R2 (preferred for large files in FE). */
  async getAttachmentDownloadUrl(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    attachmentId: string,
    audience: OpsAttachmentAudience = "STAFF",
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const doc = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityAttachment.findFirst({
        where: {
          id: attachmentId,
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          deleted_at: null,
          ...(audience === "CUSTOMER" ? { visible_to_customer: true } : {}),
          ...(audience === "VENDOR" ? { visible_to_vendor: true } : {}),
        },
      }),
    );
    if (!doc) throw new NotFoundException("Attachment not found.");

    if (this.storage.isDurable()) {
      const url = await this.storage.presignedGetUrl(doc.storage_key);
      return {
        success: true,
        data: {
          id: doc.id,
          file_name: doc.file_name,
          mime_type: doc.mime_type,
          download_url: url,
          expires_in_seconds: 3600,
        },
      };
    }

    return {
      success: true,
      data: {
        id: doc.id,
        file_name: doc.file_name,
        mime_type: doc.mime_type,
        download_url: doc.file_url,
        expires_in_seconds: null,
        note: "Local storage — use binary download endpoint.",
      },
    };
  }

  async listReferences(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityReference.findMany({
        where: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data };
  }

  async addReference(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    dto: CreateOpsReferenceDto,
    actorId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityReference.create({
        data: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          ref_type: dto.ref_type,
          ref_value: dto.ref_value,
          notes: dto.notes,
          created_by: actorId,
        },
      }),
    );
    await this.writeHistory(tenantId, entityType, entityId, actorId, "REFERENCE_ADD", {
      reference_id: data.id,
    });
    return { success: true, data };
  }

  async listTags(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityTag.findMany({
        where: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          deleted_at: null,
        },
        orderBy: { tag: "asc" },
      }),
    );
    return { success: true, data };
  }

  async addTag(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    dto: CreateOpsTagDto,
    actorId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const tag = dto.tag.trim();
    if (!tag) throw new BadRequestException("Tag is required.");
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityTag.upsert({
        where: {
          tenant_id_entity_type_entity_id_tag: {
            tenant_id: tenantId,
            entity_type: entityType,
            entity_id: entityId,
            tag,
          },
        },
        create: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          tag,
          created_by: actorId,
        },
        update: { deleted_at: null, created_by: actorId },
      }),
    );
    await this.writeHistory(tenantId, entityType, entityId, actorId, "TAG_ADD", {
      tag,
    });
    return { success: true, data };
  }

  async removeTag(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    tagId: string,
    actorId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityTag.updateMany({
        where: {
          id: tagId,
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          deleted_at: null,
        },
        data: { deleted_at: new Date() },
      }),
    );
    await this.writeHistory(tenantId, entityType, entityId, actorId, "TAG_REMOVE", {
      tag_id: tagId,
    });
    return { success: true };
  }

  async listLinks(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityLink.findMany({
        where: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data };
  }

  async addLink(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    dto: CreateOpsLinkDto,
    actorId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityLink.create({
        data: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          title: dto.title,
          url: dto.url,
          created_by: actorId,
        },
      }),
    );
    await this.writeHistory(tenantId, entityType, entityId, actorId, "LINK_ADD", {
      link_id: data.id,
    });
    return { success: true, data };
  }

  async listLikes(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityLike.findMany({
        where: { tenant_id: tenantId, entity_type: entityType, entity_id: entityId },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data, count: data.length };
  }

  async toggleLike(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    userId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.opsEntityLike.findUnique({
        where: {
          tenant_id_entity_type_entity_id_user_id: {
            tenant_id: tenantId,
            entity_type: entityType,
            entity_id: entityId,
            user_id: userId,
          },
        },
      });
      if (existing) {
        await tx.opsEntityLike.delete({ where: { id: existing.id } });
        await this.writeHistoryTx(tx, tenantId, entityType, entityId, userId, "LIKE_REMOVE", {});
        return { success: true, liked: false };
      }
      await tx.opsEntityLike.create({
        data: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          user_id: userId,
        },
      });
      await this.writeHistoryTx(tx, tenantId, entityType, entityId, userId, "LIKE_ADD", {});
      return { success: true, liked: true };
    });
  }

  async listComplaints(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityComplaint.findMany({
        where: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data };
  }

  async addComplaint(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    dto: CreateOpsComplaintDto,
    actorId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityComplaint.create({
        data: {
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          subject: dto.subject,
          body: dto.body,
          created_by: actorId,
        },
      }),
    );
    await this.writeHistory(tenantId, entityType, entityId, actorId, "COMPLAINT_CREATE", {
      complaint_id: data.id,
    });
    return { success: true, data };
  }

  async patchComplaint(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    complaintId: string,
    dto: PatchOpsComplaintDto,
    actorId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.opsEntityComplaint.updateMany({
        where: {
          id: complaintId,
          tenant_id: tenantId,
          entity_type: entityType,
          entity_id: entityId,
          deleted_at: null,
        },
        data: {
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.status === "CLOSED" ? { closed_at: new Date() } : {}),
        },
      }),
    );
    if (!data.count) throw new NotFoundException("Complaint not found.");
    await this.writeHistory(tenantId, entityType, entityId, actorId, "COMPLAINT_UPDATE", {
      complaint_id: complaintId,
      status: dto.status,
    });
    return { success: true };
  }

  /**
   * History = AuditLog rows for this entity (field changes + continuum actions).
   */
  async listHistory(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    await this.assertEntityExists(tenantId, entityType, entityId);
    const entities = [entityType, entityType.toLowerCase(), `Ops${entityType}`];
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.findMany({
        where: {
          tenant_id: tenantId,
          entity_id: entityId,
          OR: entities.map((e) => ({ entity: { equals: e, mode: "insensitive" } })),
        },
        orderBy: { created_at: "desc" },
        take: 200,
      }),
    );
    return { success: true, data };
  }

  private async writeHistory(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    userId: string,
    action: string,
    metadata: Record<string, unknown>,
  ) {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      this.writeHistoryTx(tx, tenantId, entityType, entityId, userId, action, metadata),
    );
  }

  private writeHistoryTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    userId: string,
    action: string,
    metadata: Record<string, unknown>,
  ) {
    return tx.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        action,
        entity: entityType,
        entity_id: entityId,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  }
}
