import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, OpsUploaderSide } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { JobDocumentUploadService } from "../jobs/job-document-upload.service";
import { NvoccBookingFormService } from "../nvocc/nvocc-booking-form.service";
import {
  COMPLIANCE_DOC_KINDS,
  ComplianceDocKind,
  SubmitNvoccComplianceFormDto,
  UpsertNvoccBookingFormDto,
} from "../nvocc/dto/nvocc-booking-form.dto";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";

@Injectable()
export class PortalComplianceBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly forms: NvoccBookingFormService,
    private readonly storage: StorageService,
    private readonly documentUpload: JobDocumentUploadService,
  ) {}

  private async assertOwnedBooking(user: CurrentPortalUser, bookingId: string) {
    const booking = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.nvoccBooking.findFirst({
        where: {
          id: bookingId,
          tenant_id: user.tenantId,
          deleted_at: null,
          OR: [
            { shipper_id: user.partyId },
            { consignee_id: user.partyId },
            { notify_id: user.partyId },
          ],
        },
      }),
    );
    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }
    return booking;
  }

  async get(user: CurrentPortalUser, bookingId: string) {
    const booking = await this.assertOwnedBooking(user, bookingId);
    const form = await this.forms.getOrEmpty(user.tenantId, bookingId);
    return {
      success: true,
      data: {
        booking_id: booking.id,
        booking_number: booking.booking_number,
        workflow_stage: booking.workflow_stage,
        form: form ?? {
          booking_agent_line: "KINGFISHER",
          agent_requester_name: user.fullName,
          parties: [],
        },
        prefill: {
          booking_agent_line: "KINGFISHER",
          agent_requester_name: user.fullName,
        },
      },
    };
  }

  async saveDraft(
    user: CurrentPortalUser,
    bookingId: string,
    dto: UpsertNvoccBookingFormDto,
  ) {
    await this.assertOwnedBooking(user, bookingId);
    const form = await this.forms.upsertDraft(
      user.tenantId,
      bookingId,
      {
        ...dto,
        booking_agent_line: dto.booking_agent_line ?? "KINGFISHER",
        agent_requester_name: dto.agent_requester_name ?? user.fullName,
        mark_complete: false,
      },
      user.id,
    );
    return { success: true, data: form };
  }

  async submit(
    user: CurrentPortalUser,
    bookingId: string,
    dto: SubmitNvoccComplianceFormDto,
  ) {
    await this.assertOwnedBooking(user, bookingId);
    const form = await this.forms.submitAsCustomer(
      user.tenantId,
      bookingId,
      {
        ...dto,
        booking_agent_line: dto.booking_agent_line ?? "KINGFISHER",
        agent_requester_name: dto.agent_requester_name ?? user.fullName,
        consent_accepted: dto.consent_accepted,
      },
      user.id,
    );
    return {
      success: true,
      message: "Compliance booking form submitted.",
      data: form,
    };
  }

  async uploadDocument(
    user: CurrentPortalUser,
    bookingId: string,
    kind: string,
    file: Express.Multer.File,
  ) {
    await this.assertOwnedBooking(user, bookingId);
    if (!COMPLIANCE_DOC_KINDS.includes(kind as ComplianceDocKind)) {
      throw new BadRequestException(
        `Invalid document kind. Use: ${COMPLIANCE_DOC_KINDS.join(", ")}`,
      );
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }

    const stored = await this.storage.saveBuffer(
      user.tenantId,
      file.buffer,
      file.originalname || `${kind}.bin`,
      file.mimetype || "application/octet-stream",
    );

    const form = await this.forms.attachDocument(
      user.tenantId,
      bookingId,
      kind as ComplianceDocKind,
      stored.s3Key,
      user.id,
    );

    const booking = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.nvoccBooking.findFirst({
        where: { id: bookingId, tenant_id: user.tenantId, deleted_at: null },
        select: {
          converted_job_id: true,
          job_type: true,
          shipper_id: true,
          consignee_id: true,
          agent_pol_id: true,
          voyage_id: true,
          commodity: true,
          hs_code: true,
          gross_weight: true,
          cbm_allocated: true,
          pieces: true,
          container_type_id: true,
          container_count: true,
          incoterms: true,
          is_dg: true,
          dg_class: true,
        },
      }),
    );

    let jobId = booking?.converted_job_id ?? null;
    const jobType = (booking?.job_type ?? JobType.NVOCC_EXPORT) as JobType;

    // Ensure a provisional job exists so JobDocuments are always downloadable.
    if (!jobId && booking) {
      jobId = await this.ensureProvisionalJob(
        user.tenantId,
        bookingId,
        booking,
        user.id,
      );
    }

    let jobDocument: {
      id: string;
      document_type: string;
      file_url: string;
      s3_key: string | null;
    } | null = null;

    if (jobId) {
      jobDocument = await this.documentUpload.mirrorBookingUpload(
        user.tenantId,
        jobId,
        kind,
        {
          s3Key: stored.s3Key,
          fileUrl: stored.fileUrl,
          fileSize: stored.fileSize,
          mimeType: stored.mimeType,
        },
        file.originalname || `${kind}.bin`,
        {
          userId: user.id,
          side: OpsUploaderSide.CUSTOMER,
          partyId: user.partyId,
        },
        jobType,
      );
    }

    return {
      success: true,
      data: {
        kind,
        id: jobDocument?.id ?? null,
        document_type: jobDocument?.document_type ?? null,
        s3_key: stored.s3Key,
        file_url: stored.fileUrl,
        job_id: jobId,
        download_path:
          jobDocument && jobId
            ? `/jobs/${jobId}/documents/${jobDocument.id}/download`
            : null,
        form,
      },
    };
  }

  /** Create a provisional job for compliance uploads before staff convert. */
  private async ensureProvisionalJob(
    tenantId: string,
    bookingId: string,
    booking: {
      shipper_id?: string | null;
      consignee_id?: string | null;
      agent_pol_id?: string | null;
      voyage_id?: string | null;
      commodity?: string | null;
      hs_code?: string | null;
      gross_weight?: unknown;
      cbm_allocated?: unknown;
      pieces?: number | null;
      container_type_id?: string | null;
      container_count?: number | null;
      incoterms?: string | null;
      is_dg?: boolean | null;
      dg_class?: string | null;
      job_type?: string | null;
    },
    actorId: string,
  ): Promise<string> {
    const { mintTrackingToken } = await import(
      "../jobs/utils/tracking-token.util"
    );
    const jobType = (booking.job_type ?? JobType.NVOCC_EXPORT) as JobType;
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
    const jobNumber = `PNV-${suffix}`.slice(0, 30);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.nvoccBooking.findFirst({
        where: { id: bookingId, tenant_id: tenantId },
        select: { converted_job_id: true },
      });
      if (existing?.converted_job_id) return existing.converted_job_id;

      const voyage = booking.voyage_id
        ? await tx.nvoccVoyage.findFirst({
            where: { id: booking.voyage_id, tenant_id: tenantId },
            select: { pol_id: true, pod_id: true, etd: true, eta: true },
          })
        : null;

      const job = await tx.job.create({
        data: {
          tenant_id: tenantId,
          job_number: jobNumber,
          tracking_token: mintTrackingToken(),
          job_type: jobType,
          status: "BOOKING_CONFIRMED",
          shipper_id: booking.shipper_id ?? undefined,
          consignee_id: booking.consignee_id ?? undefined,
          agent_id: booking.agent_pol_id ?? undefined,
          origin_port_id: voyage?.pol_id ?? undefined,
          dest_port_id: voyage?.pod_id ?? undefined,
          commodity: booking.commodity ?? undefined,
          hs_code: booking.hs_code ?? undefined,
          gross_weight: booking.gross_weight as never,
          volume_cbm: booking.cbm_allocated as never,
          pieces: booking.pieces ?? undefined,
          container_type_id: booking.container_type_id ?? undefined,
          container_count: booking.container_count ?? undefined,
          incoterms: booking.incoterms ?? undefined,
          is_dg: booking.is_dg ?? false,
          dg_class: booking.dg_class ?? undefined,
          etd: voyage?.etd ? new Date(voyage.etd) : undefined,
          eta: voyage?.eta ? new Date(voyage.eta) : undefined,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await tx.nvoccBooking.update({
        where: { id: bookingId },
        data: { converted_job_id: job.id, updated_by: actorId },
      });

      return job.id;
    });
  }

  async acceptQuote(user: CurrentPortalUser, bookingId: string) {
    const booking = await this.assertOwnedBooking(user, bookingId);
    if (booking.workflow_stage !== "QUOTE_SENT") {
      if (booking.workflow_stage === "CUSTOMER_ACCEPTED") {
        return { success: true, data: booking, message: "Already accepted." };
      }
      throw new ForbiddenException(
        `Cannot accept from stage ${booking.workflow_stage}.`,
      );
    }
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.nvoccBooking.update({
        where: { id: bookingId },
        data: {
          workflow_stage: "CUSTOMER_ACCEPTED",
          stage_changed_at: new Date(),
          stage_changed_by: user.id,
          updated_by: user.id,
        },
      }),
    );
    return {
      success: true,
      message: "Quote accepted. Complete the compliance booking form.",
      data: updated,
    };
  }
}
