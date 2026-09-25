import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  NvoccActivitySector,
  Prisma,
  UserRole,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NvoccWorkflowService } from "./nvocc-workflow.service";
import { UpsertNvoccBookingFormDto } from "./dto/nvocc-booking-form.dto";
import { departmentsForRole } from "../../common/workflow/workflow-dept";
import { validateComplianceFormSubmit } from "../../common/workflow/compliance-form-validate";

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

  async getOrEmpty(tenantId: string, bookingId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const form = await tx.nvoccBookingForm.findFirst({
        where: { booking_id: bookingId, tenant_id: tenantId, deleted_at: null },
        include: { parties: true },
      });
      return form;
    });
  }

  /**
   * Staff correction / save. Completing the form requires Admin override —
   * customers complete via portal submit.
   */
  async upsert(
    tenantId: string,
    bookingId: string,
    dto: UpsertNvoccBookingFormDto,
    actor: { id: string; role: UserRole },
  ) {
    const markComplete = dto.mark_complete === true;
    if (markComplete) {
      const depts = departmentsForRole(actor.role);
      if (!depts.includes("ADMIN") || !dto.admin_override) {
        throw new ForbiddenException(
          "Compliance form is completed by the customer portal. Staff may correct drafts; Admin override required to mark complete.",
        );
      }
      this.workflow.assertCanEnterStage(actor.role, "BOOKING_FORM_COMPLETE", {
        override: true,
        overrideReason: dto.stage_override_reason,
      });
    }

    if (markComplete) {
      this.validateSubmit(dto);
    }

    return this.persist(tenantId, bookingId, dto, {
      actorId: actor.id,
      markComplete,
      consentAccepted: markComplete && dto.consent_accepted === true,
    });
  }

  /**
   * Portal draft save — partial fields allowed; does not complete stage.
   */
  async upsertDraft(
    tenantId: string,
    bookingId: string,
    dto: UpsertNvoccBookingFormDto,
    actorId: string,
  ) {
    return this.persist(tenantId, bookingId, dto, {
      actorId,
      markComplete: false,
      consentAccepted: false,
      ensureCustomerAccepted: true,
    });
  }

  /**
   * Portal submit — full validation + consent → BOOKING_FORM_COMPLETE.
   */
  async submitAsCustomer(
    tenantId: string,
    bookingId: string,
    dto: UpsertNvoccBookingFormDto & { consent_accepted: boolean },
    actorId: string,
  ) {
    if (!dto.consent_accepted) {
      throw new BadRequestException(
        "Consent confirmation is required to submit the compliance booking form.",
      );
    }
    this.validateSubmit(dto);
    return this.persist(tenantId, bookingId, dto, {
      actorId,
      markComplete: true,
      consentAccepted: true,
      ensureCustomerAccepted: true,
    });
  }

  async attachDocument(
    tenantId: string,
    bookingId: string,
    kind:
      | "commercial_invoice"
      | "correspondence"
      | "cod_form"
      | "licence",
    s3Key: string,
    actorId: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const booking = await tx.nvoccBooking.findFirst({
        where: { id: bookingId, tenant_id: tenantId, deleted_at: null },
      });
      if (!booking) throw new NotFoundException("Booking not found.");

      let form = await tx.nvoccBookingForm.findFirst({
        where: { booking_id: bookingId, tenant_id: tenantId, deleted_at: null },
      });
      if (!form) {
        form = await tx.nvoccBookingForm.create({
          data: {
            tenant_id: tenantId,
            booking_id: bookingId,
            booking_agent_line: "KINGFISHER",
            created_by: actorId,
            updated_by: actorId,
          },
        });
      }

      const patch: Record<string, unknown> = { updated_by: actorId };
      if (kind === "commercial_invoice") {
        patch.doc_commercial_invoice_key = s3Key;
        patch.attach_commercial_invoice = true;
      } else if (kind === "correspondence") {
        patch.doc_correspondence_key = s3Key;
        patch.attach_correspondence = true;
      } else if (kind === "cod_form") {
        patch.doc_cod_form_key = s3Key;
        patch.attach_cod_form = true;
      } else {
        patch.doc_licence_key = s3Key;
        patch.attach_licence = true;
      }

      return tx.nvoccBookingForm.update({
        where: { id: form.id },
        data: patch,
        include: { parties: true },
      });
    });
  }

  private async persist(
    tenantId: string,
    bookingId: string,
    dto: UpsertNvoccBookingFormDto,
    opts: {
      actorId: string;
      markComplete: boolean;
      consentAccepted: boolean;
      ensureCustomerAccepted?: boolean;
    },
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const booking = await tx.nvoccBooking.findFirst({
        where: { id: bookingId, tenant_id: tenantId, deleted_at: null },
      });
      if (!booking) throw new NotFoundException("Booking not found.");

      if (opts.ensureCustomerAccepted) {
        const allowed = new Set([
          "QUOTE_SENT",
          "CUSTOMER_ACCEPTED",
          "BOOKING_FORM_COMPLETE",
        ]);
        if (!allowed.has(booking.workflow_stage)) {
          throw new BadRequestException(
            `Compliance form is available after quote is sent. Current stage: ${booking.workflow_stage}.`,
          );
        }
        if (booking.workflow_stage === "QUOTE_SENT") {
          await tx.nvoccBooking.update({
            where: { id: bookingId },
            data: {
              workflow_stage: "CUSTOMER_ACCEPTED",
              stage_changed_at: new Date(),
              stage_changed_by: opts.actorId,
              updated_by: opts.actorId,
            },
          });
        }
      }

      if (opts.markComplete && booking.workflow_stage !== "BOOKING_FORM_COMPLETE") {
        const fromStage =
          booking.workflow_stage === "QUOTE_SENT"
            ? "CUSTOMER_ACCEPTED"
            : booking.workflow_stage;
        this.workflow.assertForwardTransition(
          fromStage,
          "BOOKING_FORM_COMPLETE",
          { allowSkip: false },
        );
      }

      const existing = await tx.nvoccBookingForm.findFirst({
        where: { booking_id: bookingId, tenant_id: tenantId, deleted_at: null },
      });

      const data = {
        date_of_request: dto.date_of_request
          ? new Date(dto.date_of_request)
          : existing?.date_of_request ?? null,
        voyage_ref: dto.voyage_ref ?? existing?.voyage_ref,
        client_booking_no: dto.client_booking_no ?? existing?.client_booking_no,
        gross_weight_kg:
          dto.gross_weight_kg !== undefined
            ? dto.gross_weight_kg
            : existing?.gross_weight_kg,
        net_weight_kg:
          dto.net_weight_kg !== undefined
            ? dto.net_weight_kg
            : existing?.net_weight_kg,
        pol: dto.pol ?? existing?.pol,
        pod: dto.pod ?? existing?.pod,
        shipper_owned_container:
          dto.shipper_owned_container ??
          existing?.shipper_owned_container ??
          false,
        is_dg: dto.is_dg ?? existing?.is_dg ?? false,
        teu_count:
          dto.teu_count !== undefined ? dto.teu_count : existing?.teu_count,
        containers_json:
          dto.containers !== undefined
            ? (dto.containers as unknown as Prisma.InputJsonValue)
            : (existing?.containers_json as
                | Prisma.InputJsonValue
                | undefined),
        service_scope:
          dto.service_scope !== undefined
            ? dto.service_scope
            : existing?.service_scope ?? undefined,
        origin_door_address:
          dto.origin_door_address !== undefined
            ? dto.origin_door_address
            : existing?.origin_door_address,
        dest_door_address:
          dto.dest_door_address !== undefined
            ? dto.dest_door_address
            : existing?.dest_door_address,
        commodity: dto.commodity ?? existing?.commodity,
        hs_code: dto.hs_code ?? existing?.hs_code,
        final_use: dto.final_use ?? existing?.final_use,
        activity_sector:
          dto.activity_sector ??
          (existing?.activity_sector as NvoccActivitySector | null),
        insurance_details:
          dto.insurance_details ?? existing?.insurance_details,
        lc_bank_details: dto.lc_bank_details ?? existing?.lc_bank_details,
        attach_commercial_invoice:
          dto.attach_commercial_invoice ??
          existing?.attach_commercial_invoice ??
          false,
        attach_correspondence:
          dto.attach_correspondence ??
          existing?.attach_correspondence ??
          false,
        attach_cod_form:
          dto.attach_cod_form ?? existing?.attach_cod_form ?? false,
        attach_licence: dto.attach_licence ?? existing?.attach_licence ?? false,
        booking_agent_line:
          dto.booking_agent_line ??
          existing?.booking_agent_line ??
          "KINGFISHER",
        agent_requester_name:
          dto.agent_requester_name ?? existing?.agent_requester_name,
        sq_bl_booking_reference:
          dto.sq_bl_booking_reference ?? existing?.sq_bl_booking_reference,
        request_details: dto.request_details ?? existing?.request_details,
        is_complete: opts.markComplete,
        completed_at: opts.markComplete ? new Date() : null,
        completed_by: opts.markComplete ? opts.actorId : null,
        consent_accepted_at: opts.consentAccepted
          ? new Date()
          : existing?.consent_accepted_at ?? null,
        updated_by: opts.actorId,
      };

      let formId: string;
      if (existing) {
        if (dto.parties) {
          await tx.nvoccBookingFormParty.deleteMany({
            where: { form_id: existing.id, tenant_id: tenantId },
          });
        }
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
            created_by: opts.actorId,
          },
        });
        formId = created.id;
      }

      if (dto.parties?.length) {
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
      }

      if (opts.markComplete && booking.workflow_stage !== "BOOKING_FORM_COMPLETE") {
        await tx.nvoccBooking.update({
          where: { id: bookingId },
          data: {
            workflow_stage: "BOOKING_FORM_COMPLETE",
            stage_changed_at: new Date(),
            stage_changed_by: opts.actorId,
            stage_override_reason: dto.admin_override
              ? dto.stage_override_reason
              : undefined,
            updated_by: opts.actorId,
          },
        });
      }

      if (dto.service_scope || dto.origin_door_address || dto.dest_door_address) {
        const jobId = booking.converted_job_id;
        if (jobId) {
          await tx.job.update({
            where: { id: jobId },
            data: {
              ...(dto.service_scope ? { service_scope: dto.service_scope } : {}),
              ...(dto.origin_door_address !== undefined
                ? { origin_door_address: dto.origin_door_address }
                : {}),
              ...(dto.dest_door_address !== undefined
                ? { dest_door_address: dto.dest_door_address }
                : {}),
              updated_by: opts.actorId,
            },
          });
        }
      }

      return tx.nvoccBookingForm.findFirst({
        where: { id: formId },
        include: { parties: true },
      });
    });
  }

  validateSubmit(dto: UpsertNvoccBookingFormDto) {
    validateComplianceFormSubmit(dto);
  }
}
