import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
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
