import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  PartyVerificationDocKind,
  PartyVerificationStatus,
} from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { EmailService } from "../../shared/email/email.service";
import { renderBrandedEmail } from "../../shared/email/branded-email.template";
import {
  REQUIRED_VERIFICATION_DOC_KINDS,
  VERIFICATION_DOC_MAX_BYTES,
  VERIFICATION_DOC_MIME,
} from "./party-verification.constants";

export type VerificationUploaderSide = "portal" | "vendor";

@Injectable()
export class PartyVerificationService {
  private readonly logger = new Logger(PartyVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
  ) {}

  async ensureForParty(tenantId: string, partyId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.partyVerification.findUnique({
        where: { party_id: partyId },
      });
      if (existing) return existing;
      return tx.partyVerification.create({
        data: {
          tenant_id: tenantId,
          party_id: partyId,
          status: PartyVerificationStatus.NOT_STARTED,
        },
      });
    });
  }

  async getStatus(tenantId: string, partyId: string) {
    await this.ensureForParty(tenantId, partyId);
    const [verification, documents] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) => {
        const v = await tx.partyVerification.findUnique({
          where: { party_id: partyId },
        });
        const docs = await tx.partyVerificationDocument.findMany({
          where: { tenant_id: tenantId, party_id: partyId, deleted_at: null },
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            doc_kind: true,
            file_name: true,
            mime_type: true,
            file_size: true,
            uploaded_by_side: true,
            created_at: true,
          },
        });
        return [v, docs] as const;
      },
    );

    const presentKinds = new Set(documents.map((d) => d.doc_kind));
    const missing_required = REQUIRED_VERIFICATION_DOC_KINDS.filter(
      (k) => !presentKinds.has(k),
    );
    const status = verification!.status;
    const can_use =
      status === PartyVerificationStatus.APPROVED;

    return {
      success: true,
      data: {
        party_id: partyId,
        status,
        can_use_portal: can_use,
        can_use_vendor: can_use,
        verification_blocking: !can_use,
        missing_required,
        required_kinds: REQUIRED_VERIFICATION_DOC_KINDS,
        rejection_reason: verification!.rejection_reason,
        submitted_at: verification!.submitted_at,
        reviewed_at: verification!.reviewed_at,
        documents,
      },
    };
  }

  async uploadDocument(
    tenantId: string,
    partyId: string,
    kind: string,
    file: Express.Multer.File | undefined,
    uploader: { side: VerificationUploaderSide; userId: string },
  ) {
    const docKind = this.parseKind(kind);
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "Document file is required (multipart field name: file).",
      );
    }
    if (file.size > VERIFICATION_DOC_MAX_BYTES) {
      throw new BadRequestException("Document exceeds 10 MB limit.");
    }
    if (!VERIFICATION_DOC_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        "Only PDF, JPEG, PNG, or WebP documents are accepted.",
      );
    }

    const verification = await this.ensureForParty(tenantId, partyId);
    if (verification.status === PartyVerificationStatus.APPROVED) {
      throw new ForbiddenException(
        "Verification is already approved; documents cannot be changed.",
      );
    }

    let stored: { fileUrl?: string; s3Key?: string; mimeType?: string; fileSize?: number };
    try {
      stored = await this.storage.saveBuffer(
        tenantId,
        file.buffer,
        file.originalname || `${docKind}.bin`,
        file.mimetype,
      );
    } catch (err) {
      this.logger.error(
        `Verification doc storage failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new ServiceUnavailableException(
        "Could not store verification document.",
      );
    }

    // Soft-replace prior doc of same required kind (keep OTHER additive)
    if (docKind !== PartyVerificationDocKind.OTHER) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.partyVerificationDocument.updateMany({
          where: {
            tenant_id: tenantId,
            party_id: partyId,
            doc_kind: docKind,
            deleted_at: null,
          },
          data: { deleted_at: new Date() },
        }),
      );
    }

    const doc = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyVerificationDocument.create({
        data: {
          tenant_id: tenantId,
          party_id: partyId,
          doc_kind: docKind,
          file_name: (file.originalname || `${docKind}`).slice(0, 255),
          mime_type: stored.mimeType ?? file.mimetype,
          file_url: stored.fileUrl,
          s3_key: stored.s3Key,
          file_size: stored.fileSize ?? file.size,
          uploaded_by_side: uploader.side,
          uploaded_by_user_id: uploader.userId,
        },
      }),
    );

    // Auto-submit when required kinds present
    await this.maybeAdvanceToPendingReview(tenantId, partyId);

    return {
      success: true,
      data: {
        id: doc.id,
        doc_kind: doc.doc_kind,
        file_name: doc.file_name,
        created_at: doc.created_at,
      },
      message: "Document uploaded.",
    };
  }

  async deleteDocument(
    tenantId: string,
    partyId: string,
    documentId: string,
  ) {
    const verification = await this.ensureForParty(tenantId, partyId);
    if (verification.status === PartyVerificationStatus.APPROVED) {
      throw new ForbiddenException(
        "Verification is approved; documents cannot be deleted.",
      );
    }

    const doc = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyVerificationDocument.findFirst({
        where: {
          id: documentId,
          tenant_id: tenantId,
          party_id: partyId,
          deleted_at: null,
        },
      }),
    );
    if (!doc) throw new NotFoundException("Verification document not found.");

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyVerificationDocument.update({
        where: { id: documentId },
        data: { deleted_at: new Date() },
      }),
    );

    // If was pending and now missing required → revert to NOT_STARTED / REJECTED stay
    if (verification.status === PartyVerificationStatus.PENDING_REVIEW) {
      const status = await this.getStatus(tenantId, partyId);
      if (status.data.missing_required.length > 0) {
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.partyVerification.update({
            where: { party_id: partyId },
            data: {
              status: PartyVerificationStatus.NOT_STARTED,
              submitted_at: null,
            },
          }),
        );
      }
    }

    return { success: true, message: "Document removed." };
  }

  async submit(tenantId: string, partyId: string) {
    const status = await this.getStatus(tenantId, partyId);
    if (status.data.status === PartyVerificationStatus.APPROVED) {
      return { success: true, message: "Already approved.", data: status.data };
    }
    if (status.data.missing_required.length > 0) {
      throw new BadRequestException(
        `Missing required documents: ${status.data.missing_required.join(", ")}`,
      );
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyVerification.update({
        where: { party_id: partyId },
        data: {
          status: PartyVerificationStatus.PENDING_REVIEW,
          submitted_at: new Date(),
          rejection_reason: null,
        },
      }),
    );
    await this.notifyTenantAdminsPending(tenantId, partyId);
    return this.getStatus(tenantId, partyId);
  }

  async approve(
    tenantId: string,
    partyId: string,
    actorId: string,
  ) {
    await this.ensureForParty(tenantId, partyId);
    const status = await this.getStatus(tenantId, partyId);
    if (status.data.missing_required.length > 0) {
      throw new BadRequestException(
        `Cannot approve: missing ${status.data.missing_required.join(", ")}`,
      );
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyVerification.update({
        where: { party_id: partyId },
        data: {
          status: PartyVerificationStatus.APPROVED,
          reviewed_at: new Date(),
          reviewed_by: actorId,
          rejection_reason: null,
        },
      }),
    );
    await this.notifyPartyUsers(tenantId, partyId, "approved");
    return this.getStatus(tenantId, partyId);
  }

  async reject(
    tenantId: string,
    partyId: string,
    actorId: string,
    reason: string,
  ) {
    if (!reason?.trim()) {
      throw new BadRequestException("Rejection reason is required.");
    }
    await this.ensureForParty(tenantId, partyId);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyVerification.update({
        where: { party_id: partyId },
        data: {
          status: PartyVerificationStatus.REJECTED,
          reviewed_at: new Date(),
          reviewed_by: actorId,
          rejection_reason: reason.trim(),
          submitted_at: null,
        },
      }),
    );
    await this.notifyPartyUsers(tenantId, partyId, "rejected", reason.trim());
    return this.getStatus(tenantId, partyId);
  }

  async downloadDocument(
    tenantId: string,
    partyId: string,
    documentId: string,
    res: Response,
  ) {
    const doc = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyVerificationDocument.findFirst({
        where: {
          id: documentId,
          tenant_id: tenantId,
          party_id: partyId,
          deleted_at: null,
        },
      }),
    );
    if (!doc) throw new NotFoundException("Verification document not found.");

    const file = await this.storage.readByStoredFile(tenantId, {
      file_name: doc.file_name,
      file_url: doc.file_url ?? "",
      s3_key: doc.s3_key,
      mime_type: doc.mime_type,
    });
    res.setHeader("Content-Type", file.mimeType);
    const inline =
      !!file.mimeType &&
      (file.mimeType.startsWith("image/") ||
        file.mimeType === "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename="${file.fileName.replace(/"/g, "")}"`,
    );
    res.send(file.buffer);
  }

  /** Snapshot for login/me payloads. */
  async snapshotForParty(tenantId: string, partyId: string) {
    const row = await this.getStatus(tenantId, partyId);
    return {
      verification_status: row.data.status,
      verification_blocking: row.data.verification_blocking,
      missing_required: row.data.missing_required,
      can_use: row.data.can_use_portal,
    };
  }

  private async maybeAdvanceToPendingReview(
    tenantId: string,
    partyId: string,
  ) {
    const status = await this.getStatus(tenantId, partyId);
    if (status.data.missing_required.length > 0) return;
    if (
      status.data.status === PartyVerificationStatus.APPROVED ||
      status.data.status === PartyVerificationStatus.PENDING_REVIEW
    ) {
      return;
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyVerification.update({
        where: { party_id: partyId },
        data: {
          status: PartyVerificationStatus.PENDING_REVIEW,
          submitted_at: new Date(),
          rejection_reason: null,
        },
      }),
    );
    await this.notifyTenantAdminsPending(tenantId, partyId);
  }

  private parseKind(kind: string): PartyVerificationDocKind {
    const normalized = kind.trim().toUpperCase().replace(/-/g, "_");
    if (
      !Object.values(PartyVerificationDocKind).includes(
        normalized as PartyVerificationDocKind,
      )
    ) {
      throw new BadRequestException(
        `Invalid document kind. Use: ${Object.values(PartyVerificationDocKind).join(", ")}`,
      );
    }
    return normalized as PartyVerificationDocKind;
  }

  private async notifyTenantAdminsPending(
    tenantId: string,
    partyId: string,
  ) {
    try {
      const party = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.party.findFirst({
          where: { id: partyId, tenant_id: tenantId },
          select: { name: true, code: true },
        }),
      );
      const admins = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.user.findMany({
          where: {
            tenant_id: tenantId,
            role: "TENANT_ADMIN",
            status: "ACTIVE",
            deleted_at: null,
          },
          select: { email: true, first_name: true },
          take: 20,
        }),
      );
      const appUrl = process.env.APP_URL ?? "http://localhost:3000";
      for (const a of admins) {
        if (!a.email) continue;
        const branded = renderBrandedEmail({
          subject: `Verification pending: ${party?.name ?? partyId}`,
          headline: "Party verification pending review",
          recipientName: a.first_name || "Admin",
          organizationName: party?.name,
          intro: [
            `Party ${party?.name ?? partyId} (${party?.code ?? ""}) submitted verification documents for review.`,
          ],
          cta: {
            label: "Review party",
            url: `${appUrl.replace(/\/$/, "")}/parties/${partyId}`,
          },
          audience: "STAFF",
        });
        await this.email.send({
          tenantId,
          eventType: "OTHER",
          to: a.email,
          subject: branded.subject,
          body: branded.html,
        });
      }
    } catch (err) {
      this.logger.warn(
        `Failed to notify admins of verification: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async notifyPartyUsers(
    tenantId: string,
    partyId: string,
    outcome: "approved" | "rejected",
    reason?: string,
  ) {
    try {
      const [portalUsers, vendorUsers] = await this.prisma.runWithTenant(
        tenantId,
        async (tx) => {
          const p = await tx.portalUser.findMany({
            where: { tenant_id: tenantId, party_id: partyId, deleted_at: null },
            select: { email: true, full_name: true },
          });
          const v = await tx.vendorUser.findMany({
            where: { tenant_id: tenantId, party_id: partyId, deleted_at: null },
            select: { email: true, full_name: true },
          });
          return [p, v] as const;
        },
      );
      const recipients = [
        ...portalUsers.map((r) => ({ ...r, audience: "CUSTOMER" as const })),
        ...vendorUsers.map((r) => ({ ...r, audience: "VENDOR" as const })),
      ];
      for (const r of recipients) {
        if (!r.email) continue;
        const approved = outcome === "approved";
        const branded = renderBrandedEmail({
          subject: approved
            ? "Business verification approved"
            : "Business verification rejected",
          headline: approved
            ? "Business verification approved"
            : "Business verification rejected",
          recipientName: r.full_name || "User",
          intro: approved
            ? [
                "Your business documents were approved. You can now use the portal fully.",
              ]
            : [
                "Your business documents were rejected. Please re-upload and resubmit.",
                reason ? `Reason: ${reason}` : "",
              ].filter(Boolean),
          audience: r.audience,
        });
        await this.email.send({
          tenantId,
          eventType: "OTHER",
          to: r.email,
          subject: branded.subject,
          body: branded.html,
        });
      }
    } catch (err) {
      this.logger.warn(
        `Failed to notify party users: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
