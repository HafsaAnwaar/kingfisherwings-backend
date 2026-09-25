import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, Prisma, ServiceScope } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { markJobMilestoneIfPresent } from "../utils/mark-milestone.util";
import {
  assertCargoDocs,
  assertContainerLines,
  assertRequiredParties,
  assertServiceScopeAndDoors,
  ContainerSizeLine,
  requireFields,
} from "./booking-form-shared";
import {
  ModeBookingFormBaseDto,
  UpsertCourierBookingFormDto,
  UpsertLandBookingFormDto,
  UpsertRoadFreightBookingFormDto,
  UpsertSeaFclBookingFormDto,
  UpsertSeaLclBookingFormDto,
} from "./dto/mode-booking-form.dto";

type FormKind = "sea_fcl" | "sea_lcl" | "land" | "road_freight" | "courier";

const JOB_TYPES: Record<FormKind, JobType[]> = {
  sea_fcl: ["SEA_FCL_EXPORT", "SEA_FCL_IMPORT"],
  sea_lcl: ["SEA_LCL_EXPORT", "SEA_LCL_IMPORT"],
  land: ["LAND"],
  road_freight: ["ROAD_FREIGHT"],
  courier: ["COURIER"],
};

const DEFAULT_SCOPE: Record<FormKind, ServiceScope> = {
  sea_fcl: "PORT_TO_PORT",
  sea_lcl: "PORT_TO_PORT",
  land: "DOOR_TO_DOOR",
  road_freight: "DOOR_TO_DOOR",
  courier: "DOOR_TO_DOOR",
};

@Injectable()
export class ModeBookingFormService {
  constructor(private readonly prisma: PrismaService) {}

  async get(kind: FormKind, tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertJob(tx, tenantId, jobId, kind);
      let form = await this.findForm(tx, kind, tenantId, jobId);
      if (!form) {
        form = await this.createEmpty(tx, kind, tenantId, jobId);
      }
      return form;
    });
  }

  async upsert(
    kind: FormKind,
    tenantId: string,
    jobId: string,
    dto: ModeBookingFormBaseDto,
    actorId?: string,
  ) {
    const markComplete = dto.mark_complete === true;
    if (markComplete) {
      this.validateComplete(kind, dto as unknown as Record<string, unknown>);
      if (!dto.consent_accepted) {
        throw new BadRequestException(
          "Consent confirmation is required to complete the booking form.",
        );
      }
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertJob(tx, tenantId, jobId, kind);
      let form = await this.findForm(tx, kind, tenantId, jobId);
      if (!form) {
        form = await this.createEmpty(tx, kind, tenantId, jobId, actorId);
      }

      const data = this.toUpdateData(
        kind,
        dto as ModeBookingFormBaseDto & Record<string, unknown>,
        actorId,
        markComplete,
      );
      const updated = await this.updateForm(tx, kind, form.id, data);

      if (dto.parties?.length) {
        await this.upsertParties(tx, kind, tenantId, form.id, dto.parties);
      }

      const scope =
        (dto.service_scope as ServiceScope | undefined) ?? undefined;
      await tx.job.update({
        where: { id: jobId },
        data: {
          ...(scope ? { service_scope: scope } : {}),
          ...(dto.origin_door_address !== undefined
            ? { origin_door_address: dto.origin_door_address as string }
            : {}),
          ...(dto.dest_door_address !== undefined
            ? { dest_door_address: dto.dest_door_address as string }
            : {}),
          ...(dto.cargo_category !== undefined
            ? { cargo_category: dto.cargo_category }
            : {}),
          updated_by: actorId,
        },
      });

      if (markComplete) {
        await markJobMilestoneIfPresent(
          tx,
          tenantId,
          jobId,
          "BOOKING_FORM_COMPLETE",
          new Date(),
          actorId,
        );
      }

      return this.findForm(tx, kind, tenantId, jobId);
    });
  }

  async complete(kind: FormKind, tenantId: string, jobId: string, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const form = await this.findForm(tx, kind, tenantId, jobId);
      if (!form) throw new NotFoundException("Booking form not found.");
      this.validateComplete(kind, form as unknown as Record<string, unknown>);
      if (!(form as { consent_accepted_at?: Date | null }).consent_accepted_at) {
        throw new BadRequestException("Consent confirmation is required.");
      }
      await this.updateForm(tx, kind, (form as { id: string }).id, {
        is_complete: true,
        completed_at: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      });
      await markJobMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        "BOOKING_FORM_COMPLETE",
        new Date(),
        actorId,
      );
      return this.findForm(tx, kind, tenantId, jobId);
    });
  }

  private validateComplete(kind: FormKind, dto: Record<string, unknown>) {
    const parties =
      (dto.parties as { party_kind: string }[] | undefined) ?? undefined;
    assertServiceScopeAndDoors({
      service_scope: dto.service_scope as ServiceScope | null,
      origin_door_address: dto.origin_door_address as string | null,
      dest_door_address: dto.dest_door_address as string | null,
    });
    assertRequiredParties(parties);
    assertCargoDocs({
      cargo_category: dto.cargo_category as never,
      is_dg: dto.is_dg as boolean,
      attach_commercial_invoice: dto.attach_commercial_invoice as boolean,
      attach_carnet: dto.attach_carnet as boolean,
      attach_vehicle_title: dto.attach_vehicle_title as boolean,
      attach_msds: dto.attach_msds as boolean,
      attach_dangerous_goods_declaration:
        dto.attach_dangerous_goods_declaration as boolean,
      attach_health_veterinary: dto.attach_health_veterinary as boolean,
      attach_fda_moh: dto.attach_fda_moh as boolean,
    });

    if (kind === "sea_fcl") {
      const d = dto as UpsertSeaFclBookingFormDto;
      requireFields("Sea FCL booking form", [
        [!!d.pol?.trim(), "pol"],
        [!!d.pod?.trim(), "pod"],
        [d.gross_weight_kg != null, "gross_weight_kg"],
        [!!d.commodity?.trim(), "commodity"],
      ]);
      const containers =
        (d.containers as ContainerSizeLine[] | undefined) ??
        (dto.containers_json as ContainerSizeLine[] | undefined);
      if (containers?.length) {
        assertContainerLines(containers);
      } else if (d.teu_count == null && (dto as { teu_count?: number }).teu_count == null) {
        throw new BadRequestException(
          "Sea FCL booking form incomplete: containers or teu_count",
        );
      }
    }

    if (kind === "sea_lcl") {
      const d = dto as UpsertSeaLclBookingFormDto;
      requireFields("Sea LCL booking form", [
        [!!d.pol?.trim(), "pol"],
        [!!d.pod?.trim(), "pod"],
        [d.volume_cbm != null || (dto as { volume_cbm?: number }).volume_cbm != null, "volume_cbm"],
        [d.gross_weight_kg != null, "gross_weight_kg"],
        [!!d.commodity?.trim(), "commodity"],
        [!!d.attach_packing_list || !!(dto as { attach_packing_list?: boolean }).attach_packing_list, "attach_packing_list"],
        [!!(d.cfs_warehouse?.trim() || (dto as { cfs_warehouse?: string }).cfs_warehouse?.trim()), "cfs_warehouse"],
      ]);
    }

    if (kind === "land" || kind === "road_freight") {
      const d = dto as UpsertLandBookingFormDto | UpsertRoadFreightBookingFormDto;
      requireFields(kind === "land" ? "Land booking form" : "Road freight booking form", [
        [!!(d.origin_city_country?.trim() || (dto as { origin_city_country?: string }).origin_city_country?.trim()), "origin_city_country"],
        [!!(d.dest_city_country?.trim() || (dto as { dest_city_country?: string }).dest_city_country?.trim()), "dest_city_country"],
        [d.gross_weight_kg != null, "gross_weight_kg"],
        [!!d.commodity?.trim(), "commodity"],
      ]);
    }

    if (kind === "courier") {
      const d = dto as UpsertCourierBookingFormDto;
      requireFields("Courier booking form", [
        [d.pieces != null || (dto as { pieces?: number }).pieces != null, "pieces"],
        [!!(d.tracking_number?.trim() || (dto as { tracking_number?: string }).tracking_number?.trim() || d.client_booking_no?.trim()), "tracking_number_or_client_booking_no"],
        [d.gross_weight_kg != null, "gross_weight_kg"],
        [!!d.commodity?.trim(), "commodity"],
      ]);
    }
  }

  private toUpdateData(
    kind: FormKind,
    dto: ModeBookingFormBaseDto & Record<string, unknown>,
    actorId?: string,
    markComplete?: boolean,
  ): Record<string, unknown> {
    const {
      parties: _p,
      mark_complete: _m,
      consent_accepted,
      date_of_request,
      etd,
      eta,
      containers,
      ...rest
    } = dto;

    const data: Record<string, unknown> = {
      ...rest,
      updated_by: actorId,
    };
    if (date_of_request) data.date_of_request = new Date(date_of_request);
    if (typeof etd === "string" && etd) data.etd = new Date(etd);
    if (typeof eta === "string" && eta) data.eta = new Date(eta);
    if (kind === "sea_fcl" && containers) {
      data.containers_json = JSON.parse(JSON.stringify(containers));
    }
    if (consent_accepted) data.consent_accepted_at = new Date();
    if (markComplete) {
      data.is_complete = true;
      data.completed_at = new Date();
      data.completed_by = actorId;
    }
    delete data.containers;
    return data;
  }

  private async assertJob(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    kind: FormKind,
  ) {
    const job = await tx.job.findFirst({
      where: {
        id: jobId,
        tenant_id: tenantId,
        deleted_at: null,
        job_type: { in: JOB_TYPES[kind] },
      },
    });
    if (!job) {
      throw new BadRequestException(
        `Job not found or wrong type for ${kind} booking form.`,
      );
    }
  }

  private findForm(
    tx: Prisma.TransactionClient,
    kind: FormKind,
    tenantId: string,
    jobId: string,
  ) {
    const where = { job_id: jobId, tenant_id: tenantId, deleted_at: null };
    const include = { parties: true };
    switch (kind) {
      case "sea_fcl":
        return tx.seaFclBookingForm.findFirst({ where, include });
      case "sea_lcl":
        return tx.seaLclBookingForm.findFirst({ where, include });
      case "land":
        return tx.landBookingForm.findFirst({ where, include });
      case "road_freight":
        return tx.roadFreightBookingForm.findFirst({ where, include });
      case "courier":
        return tx.courierBookingForm.findFirst({ where, include });
    }
  }

  private createEmpty(
    tx: Prisma.TransactionClient,
    kind: FormKind,
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    const data = {
      tenant_id: tenantId,
      job_id: jobId,
      service_scope: DEFAULT_SCOPE[kind],
      created_by: actorId,
      updated_by: actorId,
    };
    switch (kind) {
      case "sea_fcl":
        return tx.seaFclBookingForm.create({ data, include: { parties: true } });
      case "sea_lcl":
        return tx.seaLclBookingForm.create({ data, include: { parties: true } });
      case "land":
        return tx.landBookingForm.create({ data, include: { parties: true } });
      case "road_freight":
        return tx.roadFreightBookingForm.create({
          data,
          include: { parties: true },
        });
      case "courier":
        return tx.courierBookingForm.create({
          data,
          include: { parties: true },
        });
    }
  }

  private updateForm(
    tx: Prisma.TransactionClient,
    kind: FormKind,
    id: string,
    data: Record<string, unknown>,
  ) {
    switch (kind) {
      case "sea_fcl":
        return tx.seaFclBookingForm.update({ where: { id }, data });
      case "sea_lcl":
        return tx.seaLclBookingForm.update({ where: { id }, data });
      case "land":
        return tx.landBookingForm.update({ where: { id }, data });
      case "road_freight":
        return tx.roadFreightBookingForm.update({ where: { id }, data });
      case "courier":
        return tx.courierBookingForm.update({ where: { id }, data });
    }
  }

  private async upsertParties(
    tx: Prisma.TransactionClient,
    kind: FormKind,
    tenantId: string,
    formId: string,
    parties: ModeBookingFormBaseDto["parties"],
  ) {
    for (const p of parties ?? []) {
      const base = {
        full_name: p.full_name,
        address: p.address,
        city: p.city,
        country: p.country,
        entity_kind: p.entity_kind,
        other_details: p.other_details,
      };
      const key = {
        tenant_id: tenantId,
        form_id: formId,
        party_kind: p.party_kind,
      };
      switch (kind) {
        case "sea_fcl":
          await tx.seaFclBookingFormParty.upsert({
            where: { tenant_id_form_id_party_kind: key },
            create: { ...key, ...base },
            update: base,
          });
          break;
        case "sea_lcl":
          await tx.seaLclBookingFormParty.upsert({
            where: { tenant_id_form_id_party_kind: key },
            create: { ...key, ...base },
            update: base,
          });
          break;
        case "land":
          await tx.landBookingFormParty.upsert({
            where: { tenant_id_form_id_party_kind: key },
            create: { ...key, ...base },
            update: base,
          });
          break;
        case "road_freight":
          await tx.roadFreightBookingFormParty.upsert({
            where: { tenant_id_form_id_party_kind: key },
            create: { ...key, ...base },
            update: base,
          });
          break;
        case "courier":
          await tx.courierBookingFormParty.upsert({
            where: { tenant_id_form_id_party_kind: key },
            create: { ...key, ...base },
            update: base,
          });
          break;
      }
    }
  }
}

export type { FormKind };
export { JOB_TYPES, DEFAULT_SCOPE };
