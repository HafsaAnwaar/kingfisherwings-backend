import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertJobTrackingProfileDto } from "./dto/job-tracking-profile.dto";

/** Empty table schemas for FE forms (field keys match staff upsert DTOs). */
export const TRACKING_SECTION_SCHEMAS = {
  arrival_report_status: [
    "status",
    "sending_time",
    "receipt_time",
    "container_no",
    "sub_container_no",
    "vessel_name",
    "voyage_no",
    "imo",
  ],
  customs_status: [
    "carrier_operator",
    "customs_released",
    "sub_customs_no",
    "quantity",
    "weight",
    "volume",
    "customs_declaration_no",
    "customs_inspection_status",
    "customs_inspection_time",
  ],
  manifest_status: [
    "sub_customs_no",
    "status",
    "sending_time",
    "receipt_receiving_time",
    "container_no",
    "vessel_name",
    "voyage_no",
    "imo",
  ],
  qty_gw_vol: [
    "quantity",
    "gross_weight",
    "net_weight",
    "volume",
    "chargeable_weight",
    "qty_unit",
    "weight_unit",
    "volume_unit",
    "lines",
  ],
  port_of_call: [
    "role",
    "port_name",
    "un_locode",
    "eta",
    "ata",
    "etd",
    "atd",
    "vessel_name",
    "voyage_number",
  ],
  leg: [
    "leg_no",
    "vessel_name",
    "voyage_number",
    "imo",
    "pol",
    "pod",
    "label",
  ],
} as const;

@Injectable()
export class JobTrackingProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.loadJobSeed(tx, tenantId, jobId);
      let row = await tx.jobTrackingProfile.findFirst({
        where: { tenant_id: tenantId, job_id: jobId },
      });
      if (!row) {
        const seed = this.seedFromJob(job);
        row = await tx.jobTrackingProfile.create({
          data: {
            tenant_id: tenantId,
            job_id: jobId,
            bl_number: seed.bl_number,
            origin_label: seed.origin_port,
            dest_label: seed.dest_port,
            legs: seed.legs as unknown as Prisma.InputJsonValue,
            port_of_call: seed.port_of_call as unknown as Prisma.InputJsonValue,
            qty_gw_vol: seed.qty_gw_vol as unknown as Prisma.InputJsonValue,
            detailed_data:
              seed.detailed_data as unknown as Prisma.InputJsonValue,
          },
        });
      }
      return {
        success: true,
        data: this.toStaffView(row, job),
      };
    });
  }

  async upsert(
    tenantId: string,
    jobId: string,
    dto: UpsertJobTrackingProfileDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.loadJobSeed(tx, tenantId, jobId);
      const origin =
        dto.origin_port !== undefined
          ? dto.origin_port
          : dto.origin_label !== undefined
            ? dto.origin_label
            : undefined;
      const dest =
        dto.dest_port !== undefined
          ? dto.dest_port
          : dto.dest_label !== undefined
            ? dto.dest_label
            : undefined;

      const data: Prisma.JobTrackingProfileUncheckedUpdateInput = {
        updated_by: actorId,
        ...(dto.bl_number !== undefined ? { bl_number: dto.bl_number } : {}),
        ...(origin !== undefined ? { origin_label: origin } : {}),
        ...(dest !== undefined ? { dest_label: dest } : {}),
        ...(dto.at_before !== undefined
          ? {
              at_before: dto.at_before ? new Date(dto.at_before) : null,
            }
          : {}),
        ...(dto.terminal_cutoff_at !== undefined
          ? {
              terminal_cutoff_at: dto.terminal_cutoff_at
                ? new Date(dto.terminal_cutoff_at)
                : null,
            }
          : {}),
        ...(dto.legs !== undefined
          ? { legs: dto.legs as unknown as Prisma.InputJsonValue }
          : {}),
        ...(dto.port_of_call !== undefined
          ? {
              port_of_call:
                dto.port_of_call as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.container_events !== undefined
          ? {
              container_events:
                dto.container_events as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.arrival_report !== undefined
          ? {
              arrival_report:
                dto.arrival_report as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.customs_status !== undefined
          ? {
              customs_status:
                dto.customs_status as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.detailed_data !== undefined
          ? {
              detailed_data:
                dto.detailed_data as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.pre_manifest !== undefined
          ? {
              pre_manifest:
                dto.pre_manifest as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.qty_gw_vol !== undefined
          ? {
              qty_gw_vol: dto.qty_gw_vol as unknown as Prisma.InputJsonValue,
            }
          : {}),
      };

      const row = await tx.jobTrackingProfile.upsert({
        where: { job_id: jobId },
        create: {
          tenant_id: tenantId,
          job_id: jobId,
          bl_number: dto.bl_number ?? this.seedFromJob(job).bl_number,
          origin_label:
            origin ?? this.seedFromJob(job).origin_port ?? null,
          dest_label: dest ?? this.seedFromJob(job).dest_port ?? null,
          at_before: dto.at_before ? new Date(dto.at_before) : null,
          terminal_cutoff_at: dto.terminal_cutoff_at
            ? new Date(dto.terminal_cutoff_at)
            : null,
          legs: (dto.legs ??
            this.seedFromJob(job).legs) as unknown as Prisma.InputJsonValue,
          port_of_call: (dto.port_of_call ??
            this.seedFromJob(job)
              .port_of_call) as unknown as Prisma.InputJsonValue,
          container_events: (dto.container_events ??
            []) as unknown as Prisma.InputJsonValue,
          arrival_report: (dto.arrival_report ??
            []) as unknown as Prisma.InputJsonValue,
          customs_status: (dto.customs_status ??
            []) as unknown as Prisma.InputJsonValue,
          detailed_data: (dto.detailed_data ??
            this.seedFromJob(job)
              .detailed_data) as unknown as Prisma.InputJsonValue,
          pre_manifest: (dto.pre_manifest ??
            []) as unknown as Prisma.InputJsonValue,
          qty_gw_vol: (dto.qty_gw_vol ??
            this.seedFromJob(job)
              .qty_gw_vol) as unknown as Prisma.InputJsonValue,
          updated_by: actorId,
        },
        update: data,
      });
      return {
        success: true,
        data: this.toStaffView(row, job),
      };
    });
  }

  private toStaffView(
    row: {
      id: string;
      tenant_id: string;
      job_id: string;
      bl_number: string | null;
      origin_label: string | null;
      dest_label: string | null;
      at_before: Date | null;
      terminal_cutoff_at: Date | null;
      legs: Prisma.JsonValue;
      port_of_call: Prisma.JsonValue;
      container_events: Prisma.JsonValue;
      arrival_report: Prisma.JsonValue;
      customs_status: Prisma.JsonValue;
      detailed_data: Prisma.JsonValue;
      pre_manifest: Prisma.JsonValue;
      qty_gw_vol: Prisma.JsonValue;
      created_at: Date;
      updated_at: Date;
      updated_by: string | null;
    },
    job: JobSeed,
  ) {
    const seed = this.seedFromJob(job);
    const legs = Array.isArray(row.legs) ? row.legs : seed.legs;
    const sortedLegs = [...legs].sort(
      (a, b) =>
        Number((a as { leg_no?: number }).leg_no ?? 0) -
        Number((b as { leg_no?: number }).leg_no ?? 0),
    );
    const detailedStaff =
      row.detailed_data && typeof row.detailed_data === "object"
        ? (row.detailed_data as Record<string, unknown>)
        : {};

    return {
      id: row.id,
      job_id: row.job_id,
      bl_number: row.bl_number ?? seed.bl_number,
      origin_port: row.origin_label ?? seed.origin_port,
      dest_port: row.dest_label ?? seed.dest_port,
      at_before: row.at_before,
      terminal_cutoff_at: row.terminal_cutoff_at,
      first_leg: sortedLegs.find(
        (l) => Number((l as { leg_no?: number }).leg_no) === 1,
      ) ??
        sortedLegs[0] ??
        null,
      second_leg: sortedLegs.find(
        (l) => Number((l as { leg_no?: number }).leg_no) === 2,
      ) ??
        sortedLegs[1] ??
        null,
      legs: sortedLegs,
      port_of_call: Array.isArray(row.port_of_call)
        ? row.port_of_call
        : seed.port_of_call,
      container_events: Array.isArray(row.container_events)
        ? row.container_events
        : [],
      cargo_info: {
        arrival_report_status: Array.isArray(row.arrival_report)
          ? row.arrival_report
          : [],
        customs_status: Array.isArray(row.customs_status)
          ? row.customs_status
          : [],
        detailed_data: { ...seed.detailed_data, ...detailedStaff },
      },
      pre_manifest: {
        manifest_status: Array.isArray(row.pre_manifest)
          ? row.pre_manifest
          : [],
      },
      qty_gw_vol:
        row.qty_gw_vol &&
        typeof row.qty_gw_vol === "object" &&
        Object.keys(row.qty_gw_vol as object).length
          ? row.qty_gw_vol
          : seed.qty_gw_vol,
      field_schemas: TRACKING_SECTION_SCHEMAS,
      created_at: row.created_at,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
    };
  }

  private seedFromJob(job: JobSeed) {
    const bl =
      job.sea_fcl_details?.hbl_number ??
      job.sea_lcl_details?.hbl_number ??
      job.nvocc_details?.hbl_number ??
      job.sea_fcl_details?.mbl_number ??
      job.sea_lcl_details?.mbl_number ??
      job.nvocc_details?.mbl_number ??
      job.air_details?.hawb_number ??
      job.air_details?.mawb_number ??
      null;
    const originPort =
      job.origin_port?.name ??
      job.land_details?.origin_city_country ??
      job.courier_details?.pickup_address ??
      null;
    const destPort =
      job.dest_port?.name ??
      job.land_details?.destination_city_country ??
      job.courier_details?.delivery_address ??
      null;
    const vesselName = job.vessel_name ?? job.vessel?.name ?? null;
    const voyage =
      job.voyage_number ??
      job.sea_fcl_details?.voyage_number ??
      job.sea_lcl_details?.voyage_number ??
      null;
    const etd =
      job.etd ?? job.sea_fcl_details?.etd ?? job.sea_lcl_details?.etd ?? null;
    const eta =
      job.eta ?? job.sea_fcl_details?.eta ?? job.sea_lcl_details?.eta ?? null;

    const legs = [
      {
        leg_no: 1,
        vessel_name: vesselName,
        voyage_number: voyage,
        imo: null as string | null,
        pol: originPort,
        pod: destPort,
        label: "1st leg",
      },
    ];

    const port_of_call = [
      {
        role: "ORIGIN",
        port_name: originPort,
        un_locode: job.origin_port?.un_locode ?? null,
        eta: null as string | null,
        ata: null as string | null,
        etd: etd ? etd.toISOString() : null,
        atd: null as string | null,
        vessel_name: vesselName,
        voyage_number: voyage,
      },
      {
        role: "DEST",
        port_name: destPort,
        un_locode: job.dest_port?.un_locode ?? null,
        eta: eta ? eta.toISOString() : null,
        ata: null as string | null,
        etd: null as string | null,
        atd: null as string | null,
        vessel_name: vesselName,
        voyage_number: voyage,
      },
    ];

    const qty_gw_vol = {
      quantity: job.pieces ?? null,
      gross_weight:
        job.gross_weight != null ? Number(job.gross_weight) : null,
      net_weight: null as number | null,
      volume: job.volume_cbm != null ? Number(job.volume_cbm) : null,
      chargeable_weight:
        job.chargeable_weight != null
          ? Number(job.chargeable_weight)
          : null,
      qty_unit: "PKG",
      weight_unit: "KG",
      volume_unit: "CBM",
      lines: [] as unknown[],
    };

    const detailed_data: Record<string, unknown> = {
      job_number: job.job_number,
      job_type: job.job_type,
      status: job.status,
      commodity: job.commodity,
      pieces: job.pieces,
      gross_weight: job.gross_weight,
      volume_cbm: job.volume_cbm,
      chargeable_weight: job.chargeable_weight,
      vessel_name: vesselName,
      voyage_number: voyage,
      etd,
      eta,
      origin_port: originPort,
      dest_port: destPort,
      hbl_number:
        job.sea_fcl_details?.hbl_number ??
        job.sea_lcl_details?.hbl_number ??
        job.nvocc_details?.hbl_number ??
        null,
      mbl_number:
        job.sea_fcl_details?.mbl_number ??
        job.sea_lcl_details?.mbl_number ??
        job.nvocc_details?.mbl_number ??
        null,
      hawb_number: job.air_details?.hawb_number ?? null,
      mawb_number: job.air_details?.mawb_number ?? null,
      booking_number:
        job.sea_fcl_details?.booking_number ??
        job.sea_lcl_details?.booking_number ??
        null,
      primary_container_number: job.primary_container_number,
      location_terminal: job.location_terminal,
      rotation_number: job.rotation_number,
    };

    return {
      bl_number: bl,
      origin_port: originPort,
      dest_port: destPort,
      legs,
      port_of_call,
      qty_gw_vol,
      detailed_data,
    };
  }

  private async loadJobSeed(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
  ): Promise<JobSeed> {
    const job = await tx.job.findFirst({
      where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      select: {
        id: true,
        job_number: true,
        job_type: true,
        status: true,
        commodity: true,
        pieces: true,
        gross_weight: true,
        volume_cbm: true,
        chargeable_weight: true,
        vessel_name: true,
        voyage_number: true,
        etd: true,
        eta: true,
        primary_container_number: true,
        location_terminal: true,
        rotation_number: true,
        origin_port_id: true,
        dest_port_id: true,
        air_details: {
          select: {
            hawb_number: true,
            mawb_number: true,
          },
        },
        sea_fcl_details: {
          select: {
            hbl_number: true,
            mbl_number: true,
            booking_number: true,
            voyage_number: true,
            vessel_id: true,
            etd: true,
            eta: true,
          },
        },
        sea_lcl_details: {
          select: {
            hbl_number: true,
            mbl_number: true,
            booking_number: true,
            voyage_number: true,
            vessel_id: true,
            etd: true,
            eta: true,
          },
        },
        nvocc_details: {
          select: { hbl_number: true, mbl_number: true },
        },
        land_details: {
          select: {
            origin_city_country: true,
            destination_city_country: true,
          },
        },
        courier_details: {
          select: { pickup_address: true, delivery_address: true },
        },
      },
    });
    if (!job) throw new NotFoundException("Job not found.");

    const portIds = [job.origin_port_id, job.dest_port_id].filter(
      Boolean,
    ) as string[];
    const ports = portIds.length
      ? await tx.port.findMany({
          where: {
            tenant_id: tenantId,
            id: { in: portIds },
            deleted_at: null,
          },
          select: { id: true, name: true, un_locode: true },
        })
      : [];
    const portMap = new Map(ports.map((p) => [p.id, p]));
    const vesselId =
      job.sea_fcl_details?.vessel_id ?? job.sea_lcl_details?.vessel_id;
    const vessel = vesselId
      ? await tx.vessel.findFirst({
          where: {
            tenant_id: tenantId,
            id: vesselId,
            deleted_at: null,
          },
          select: { name: true },
        })
      : null;

    return {
      ...job,
      origin_port: job.origin_port_id
        ? portMap.get(job.origin_port_id) ?? null
        : null,
      dest_port: job.dest_port_id
        ? portMap.get(job.dest_port_id) ?? null
        : null,
      vessel,
    };
  }
}

type JobSeed = {
  id: string;
  job_number: string;
  job_type: string;
  status: string;
  commodity: string | null;
  pieces: number | null;
  gross_weight: unknown;
  volume_cbm: unknown;
  chargeable_weight: unknown;
  vessel_name: string | null;
  voyage_number: string | null;
  etd: Date | null;
  eta: Date | null;
  primary_container_number: string | null;
  location_terminal: string | null;
  rotation_number: string | null;
  origin_port_id: string | null;
  dest_port_id: string | null;
  air_details: { hawb_number: string | null; mawb_number: string | null } | null;
  sea_fcl_details: {
    hbl_number: string | null;
    mbl_number: string | null;
    booking_number: string | null;
    voyage_number: string | null;
    vessel_id: string | null;
    etd: Date | null;
    eta: Date | null;
  } | null;
  sea_lcl_details: {
    hbl_number: string | null;
    mbl_number: string | null;
    booking_number: string | null;
    voyage_number: string | null;
    vessel_id: string | null;
    etd: Date | null;
    eta: Date | null;
  } | null;
  nvocc_details: {
    hbl_number: string | null;
    mbl_number: string | null;
  } | null;
  land_details: {
    origin_city_country: string | null;
    destination_city_country: string | null;
  } | null;
  courier_details: {
    pickup_address: string | null;
    delivery_address: string | null;
  } | null;
  origin_port: { id: string; name: string; un_locode: string | null } | null;
  dest_port: { id: string; name: string; un_locode: string | null } | null;
  vessel: { name: string } | null;
};
