import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AirWorkflowService } from "./air-workflow.service";
import { UpsertAirBookingFormDto } from "./dto/air-workflow.dto";

@Injectable()
export class AirBookingFormService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: AirWorkflowService,
  ) {}

  async get(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const form = await tx.airBookingForm.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
        include: { parties: true },
      });
      if (!form) throw new NotFoundException("Air booking form not found.");
      return form;
    });
  }

  async upsert(
    tenantId: string,
    jobId: string,
    dto: UpsertAirBookingFormDto,
    actor: { id: string; role: UserRole },
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: [JobType.AIR_EXPORT, JobType.AIR_IMPORT] },
        },
        include: { air_details: true },
      });
      if (!job?.air_details) {
        throw new BadRequestException(
          "Job has no air details. Create air job details first.",
        );
      }

      const markComplete = dto.mark_complete !== false;
      if (markComplete) {
        this.validateMandatory(job.job_type, dto);
        this.workflow.assertCanEnterStage(actor.role, "BOOKING_FORM_COMPLETE", {
          override: dto.admin_override,
          overrideReason: dto.stage_override_reason,
        });
        const allowed = [
          "CUSTOMER_ACCEPTED",
          "BOOKING_FORM_COMPLETE",
          "QUOTE_REQUESTED",
          "CS_TRIAGED",
          "QUOTE_SENT",
        ];
        if (
          !allowed.includes(job.air_details.workflow_stage) &&
          !dto.admin_override
        ) {
          throw new BadRequestException(
            `Cannot complete booking form from stage ${job.air_details.workflow_stage}.`,
          );
        }
      }

      const existing = await tx.airBookingForm.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      const data = {
        pieces: dto.pieces,
        gross_weight_kg: dto.gross_weight_kg,
        chargeable_weight_kg: dto.chargeable_weight_kg,
        commodity: dto.commodity,
        special_handling: dto.special_handling,
        notes: dto.notes,
        is_dg: dto.is_dg ?? false,
        flight_number: dto.flight_number,
        flight_date: dto.flight_date ? new Date(dto.flight_date) : null,
        origin_airport_code: dto.origin_airport_code,
        dest_airport_code: dto.dest_airport_code,
        arrival_flight_number: dto.arrival_flight_number,
        mawb_from_origin: dto.mawb_from_origin,
        agent_at_origin: dto.agent_at_origin,
        delivery_address: dto.delivery_address,
        customs_value: dto.customs_value,
        is_complete: markComplete,
        completed_at: markComplete ? new Date() : null,
        completed_by: markComplete ? actor.id : null,
        updated_by: actor.id,
      };

      let form;
      if (existing) {
        form = await tx.airBookingForm.update({
          where: { id: existing.id },
          data,
          include: { parties: true },
        });
      } else {
        form = await tx.airBookingForm.create({
          data: {
            tenant_id: tenantId,
            job_id: jobId,
            air_job_detail_id: job.air_details.id,
            ...data,
            created_by: actor.id,
          },
          include: { parties: true },
        });
      }

      if (dto.parties?.length) {
        for (const p of dto.parties) {
          await tx.airBookingFormParty.upsert({
            where: {
              tenant_id_form_id_party_kind: {
                tenant_id: tenantId,
                form_id: form.id,
                party_kind: p.party_kind,
              },
            },
            create: {
              tenant_id: tenantId,
              form_id: form.id,
              party_kind: p.party_kind,
              full_name: p.full_name,
              address: p.address,
              city: p.city,
              country: p.country,
              entity_kind: p.entity_kind,
              other_details: p.other_details,
            },
            update: {
              full_name: p.full_name,
              address: p.address,
              city: p.city,
              country: p.country,
              entity_kind: p.entity_kind,
              other_details: p.other_details,
            },
          });
        }
      }

      if (
        markComplete &&
        job.air_details.workflow_stage !== "BOOKING_FORM_COMPLETE"
      ) {
        this.workflow.assertForwardTransition(
          job.job_type,
          job.air_details.workflow_stage,
          "BOOKING_FORM_COMPLETE",
          { allowSkip: dto.admin_override },
        );
        await tx.airJobDetail.update({
          where: { id: job.air_details.id },
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

      return tx.airBookingForm.findFirst({
        where: { id: form.id },
        include: { parties: true },
      });
    });
  }

  private validateMandatory(jobType: string, dto: UpsertAirBookingFormDto) {
    const missing: string[] = [];
    if (!dto.commodity?.trim()) missing.push("commodity");
    if (!dto.origin_airport_code?.trim()) missing.push("origin_airport_code");
    if (!dto.dest_airport_code?.trim()) missing.push("dest_airport_code");

    if (jobType === "AIR_EXPORT") {
      if (!dto.flight_number?.trim()) missing.push("flight_number");
    }
    if (jobType === "AIR_IMPORT") {
      if (!dto.arrival_flight_number?.trim() && !dto.flight_number?.trim()) {
        missing.push("arrival_flight_number");
      }
      if (!dto.mawb_from_origin?.trim()) missing.push("mawb_from_origin");
    }

    const kinds = new Set((dto.parties ?? []).map((p) => p.party_kind));
    if (!kinds.has("SHIPPER")) missing.push("parties.SHIPPER");
    if (!kinds.has("CONSIGNEE")) missing.push("parties.CONSIGNEE");

    if (missing.length) {
      throw new BadRequestException(
        `Air booking form incomplete: ${missing.join(", ")}`,
      );
    }
  }
}
