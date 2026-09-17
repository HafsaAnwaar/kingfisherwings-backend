import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NvoccBookingPartyKind, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NvoccWorkflowService } from "./nvocc-workflow.service";
import { UpsertNvoccBookingFormDto } from "./dto/nvocc-booking-form.dto";

const REQUIRED_PARTIES: NvoccBookingPartyKind[] = [
  "SHIPPER",
  "CONSIGNEE",
  "NOTIFY",
];

@Injectable()
export class NvoccBookingFormService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: NvoccWorkflowService,
  ) {}

  async get(tenantId: string, bookingId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const form = await tx.nvoccBookingForm.findFirst({
        where: { booking_id: bookingId, tenant_id: tenantId, deleted_at: null },
        include: { parties: true },
      });
      if (!form) throw new NotFoundException("Booking form not found.");
      return form;
    });
  }

  async upsert(
    tenantId: string,
    bookingId: string,
    dto: UpsertNvoccBookingFormDto,
    actor: { id: string; role: UserRole },
  ) {
    this.validateMandatory(dto);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const booking = await tx.nvoccBooking.findFirst({
        where: { id: bookingId, tenant_id: tenantId, deleted_at: null },
      });
      if (!booking) throw new NotFoundException("Booking not found.");

      const markComplete = dto.mark_complete !== false;
      if (markComplete) {
        this.workflow.assertCanEnterStage(actor.role, "BOOKING_FORM_COMPLETE", {
          override: dto.admin_override,
          overrideReason: dto.stage_override_reason,
        });
        if (
          booking.workflow_stage !== "CUSTOMER_ACCEPTED" &&
          booking.workflow_stage !== "BOOKING_FORM_COMPLETE"
        ) {
          this.workflow.assertForwardTransition(
            booking.workflow_stage,
            "BOOKING_FORM_COMPLETE",
            { allowSkip: dto.admin_override },
          );
        }
      }

      const existing = await tx.nvoccBookingForm.findFirst({
        where: { booking_id: bookingId, tenant_id: tenantId, deleted_at: null },
      });

      const data = {
        date_of_request: dto.date_of_request
          ? new Date(dto.date_of_request)
          : null,
        voyage_ref: dto.voyage_ref,
        gross_weight_kg: dto.gross_weight_kg,
        pol: dto.pol,
        pod: dto.pod,
        shipper_owned_container: dto.shipper_owned_container ?? false,
        is_dg: dto.is_dg ?? false,
        teu_count: dto.teu_count,
        commodity: dto.commodity,
        hs_code: dto.hs_code,
        final_use: dto.final_use,
        activity_sector: dto.activity_sector,
        insurance_details: dto.insurance_details,
        lc_bank_details: dto.lc_bank_details,
        attach_commercial_invoice: dto.attach_commercial_invoice ?? false,
        attach_correspondence: dto.attach_correspondence ?? false,
        attach_cod_form: dto.attach_cod_form ?? false,
        attach_licence: dto.attach_licence ?? false,
        booking_agent_line: dto.booking_agent_line ?? "KINGFISHER",
        agent_requester_name: dto.agent_requester_name,
        sq_bl_booking_reference: dto.sq_bl_booking_reference,
        request_details: dto.request_details,
        is_complete: markComplete,
        completed_at: markComplete ? new Date() : null,
        completed_by: markComplete ? actor.id : null,
        updated_by: actor.id,
      };

      let formId: string;
      if (existing) {
        await tx.nvoccBookingFormParty.deleteMany({
          where: { form_id: existing.id, tenant_id: tenantId },
        });
        await tx.nvoccBookingForm.update({
          where: { id: existing.id },
          data,
        });
        formId = existing.id;
      } else {
        const created = await tx.nvoccBookingForm.create({
          data: {
            tenant_id: tenantId,
            booking_id: bookingId,
            ...data,
            created_by: actor.id,
          },
        });
        formId = created.id;
      }

      await tx.nvoccBookingFormParty.createMany({
        data: dto.parties.map((p) => ({
          tenant_id: tenantId,
          form_id: formId,
          party_kind: p.party_kind,
          full_name: p.full_name,
          address: p.address,
          city: p.city,
          country: p.country,
          entity_kind: p.entity_kind,
          other_details: p.other_details,
        })),
      });

      if (markComplete && booking.workflow_stage !== "BOOKING_FORM_COMPLETE") {
        await tx.nvoccBooking.update({
          where: { id: bookingId },
          data: {
            workflow_stage: "BOOKING_FORM_COMPLETE",
            stage_changed_at: new Date(),
            stage_changed_by: actor.id,
            stage_override_reason: dto.admin_override
              ? dto.stage_override_reason
              : undefined,
            updated_by: actor.id,
          },
        });
      }

      return tx.nvoccBookingForm.findFirst({
        where: { id: formId },
        include: { parties: true },
      });
    });
  }

  private validateMandatory(dto: UpsertNvoccBookingFormDto) {
    if (!dto.pol?.trim() || !dto.pod?.trim() || !dto.commodity?.trim()) {
      throw new BadRequestException("POL, POD and commodity are mandatory.");
    }
    const kinds = new Set(dto.parties?.map((p) => p.party_kind) ?? []);
    for (const k of REQUIRED_PARTIES) {
      if (!kinds.has(k)) {
        throw new BadRequestException(
          `Booking form requires party block: ${k}`,
        );
      }
    }
    for (const p of dto.parties) {
      if (!p.full_name?.trim() || !p.address?.trim()) {
        throw new BadRequestException(
          `${p.party_kind} requires full_name and address.`,
        );
      }
    }
  }
}
