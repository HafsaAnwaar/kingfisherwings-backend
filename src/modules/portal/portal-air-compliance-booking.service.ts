import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { AirComplianceBookingFormService } from "../jobs/air-compliance-booking-form.service";
import {
  COMPLIANCE_DOC_KINDS,
  ComplianceDocKind,
  SubmitAirComplianceFormDto,
  UpsertAirComplianceBookingFormDto,
} from "../jobs/booking-forms/dto/air-compliance-booking-form.dto";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { portalJobOwnershipWhere } from "./helpers/portal-ownership.helper";

@Injectable()
export class PortalAirComplianceBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly forms: AirComplianceBookingFormService,
    private readonly storage: StorageService,
  ) {}

  private async assertOwnedAirJob(user: CurrentPortalUser, jobId: string) {
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: user.tenantId,
          deleted_at: null,
          job_type: { in: [JobType.AIR_EXPORT, JobType.AIR_IMPORT] },
          ...portalJobOwnershipWhere(user.partyId),
        },
        include: { air_details: true },
      }),
    );
    if (!job?.air_details) {
      throw new NotFoundException("Shipment not found.");
    }
    return job;
  }

  async acceptQuote(user: CurrentPortalUser, jobId: string) {
    const job = await this.assertOwnedAirJob(user, jobId);
    const stage = job.air_details!.workflow_stage;
    if (stage === "CUSTOMER_ACCEPTED") {
      return { success: true, data: job.air_details, message: "Already accepted." };
    }
    if (stage !== "QUOTE_SENT") {
      throw new ForbiddenException(`Cannot accept from stage ${stage}.`);
    }
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.airJobDetail.update({
        where: { id: job.air_details!.id },
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

  async get(user: CurrentPortalUser, jobId: string) {
    const job = await this.assertOwnedAirJob(user, jobId);
    const form = await this.forms.getOrEmpty(user.tenantId, jobId);
    return {
      success: true,
      data: {
        job_id: job.id,
        job_number: job.job_number,
        job_type: job.job_type,
        workflow_stage: job.air_details!.workflow_stage,
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
    jobId: string,
    dto: UpsertAirComplianceBookingFormDto,
  ) {
    await this.assertOwnedAirJob(user, jobId);
    const form = await this.forms.upsertDraft(
      user.tenantId,
      jobId,
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
    jobId: string,
    dto: SubmitAirComplianceFormDto,
  ) {
    await this.assertOwnedAirJob(user, jobId);
    const form = await this.forms.submitAsCustomer(
      user.tenantId,
      jobId,
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
    jobId: string,
    kind: string,
    file: Express.Multer.File,
  ) {
    await this.assertOwnedAirJob(user, jobId);
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
      jobId,
      kind as ComplianceDocKind,
      stored.s3Key,
      user.id,
    );
    return {
      success: true,
      data: {
        kind,
        s3_key: stored.s3Key,
        file_url: stored.fileUrl,
        form,
      },
    };
  }
}
