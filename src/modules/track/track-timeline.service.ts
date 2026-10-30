import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  publicTrackUrl,
  sortTrackHistory,
  TrackHistoryEvent,
} from "./tracking-ref.util";

export type TrackSummary = {
  current_status: string;
  current_status_label: string;
  status_code: string | null;
  headline: string;
  detail: string | null;
  is_on_hold: boolean;
  last_event: TrackHistoryEvent | null;
  next_event: TrackHistoryEvent | null;
  progress: { completed: number; total: number; percent: number };
  updated_at: Date | null;
};

export type TrackTimelinePayload = {
  job_id: string;
  job_number: string;
  job_type: string;
  shipment_id: string | null;
  shipment_number: string | null;
  shipment_status: string | null;
  status: string;
  status_code: string | null;
  status_label: string;
  etd: Date | null;
  eta: Date | null;
  /** Planned / promised delivery date (same source as eta when set). */
  expected_delivery: Date | null;
  hold: {
    is_on_hold: boolean;
    hold_reason: string | null;
    held_at: Date | null;
    expected_release_at: Date | null;
    resume_reason: string | null;
    resumed_at: Date | null;
  };
  commodity: string | null;
  pieces: number | null;
  gross_weight: unknown;
  origin: {
    name: string;
    code: string | null;
    country_code: string | null;
  } | null;
  destination: {
    name: string;
    code: string | null;
    country_code: string | null;
  } | null;
  references: Record<string, unknown>;
  containers: Array<{
    container_number: string | null;
    status: string;
    seal_number: string | null;
    kind?: string | null;
    gate_in_at: Date | null;
    returned_at: Date | null;
  }>;
  linked_shipments: Array<{
    shipment_number: string;
    status: string;
    hbl_number: string | null;
    mbl_number: string | null;
  }>;
  milestones: Array<{
    milestone: string;
    planned_date: Date | null;
    actual_date: Date | null;
    completed_at?: Date | null;
    is_completed: boolean;
    description?: string | null;
    notes?: string | null;
  }>;
  history: TrackHistoryEvent[];
  summary: TrackSummary;
  tracking_token: string | null;
  public_url: string | null;
};

function humanLabel(code: string): string {
  return code
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Lifecycle / status audit actions that belong on track history. */
const LIFECYCLE_ACTIONS = new Set([
  "JOB_CREATED",
  "JOB_STATUS_CHANGE",
  "JOB_CLOSED",
  "JOB_CANCELLED",
  "JOB_REOPENED",
  "JOB_ON_HOLD",
  "JOB_RESUMED",
  "SHIPMENT_CREATED",
  "SHIPMENT_STATUS_CHANGE",
  "SHIPMENT_BL_STATUS_CHANGE",
  "SHIPMENT_GENERATE_JOB",
  "QUOTATION_STATUS_CHANGE",
  "CREATE",
]);

@Injectable()
export class TrackTimelineService {
  private readonly logger = new Logger(TrackTimelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  buildHistory(parts: {
    created_at?: Date | null;
    initial_status?: string | null;
    milestones: Array<{
      milestone: string;
      planned_date: Date | null;
      actual_date: Date | null;
      completed_at?: Date | null;
      description?: string | null;
      notes?: string | null;
    }>;
    courier_checkpoints: Array<{
      checkpoint: string;
      scanned_at: Date;
      location: string | null;
      notes?: string | null;
    }>;
    containers: Array<{
      container_number: string | null;
      status: string;
      gate_in_at: Date | null;
      returned_at: Date | null;
    }>;
    status_changes?: Array<{
      from: string | null;
      to: string;
      to_code?: string | null;
      at: Date;
      reason?: string | null;
      action?: string | null;
    }>;
    hold?: {
      hold_reason?: string | null;
      held_at?: Date | null;
      expected_release_at?: Date | null;
      resume_reason?: string | null;
      resumed_at?: Date | null;
    } | null;
    includeNotes?: boolean;
  }): TrackHistoryEvent[] {
    const events: TrackHistoryEvent[] = [];
    const notes = !!parts.includeNotes;

    if (parts.created_at) {
      events.push({
        type: "STATUS",
        code: "CREATED",
        label: "Shipment created",
        planned_at: null,
        actual_at: parts.created_at,
        is_completed: true,
      });
    }

    for (const sc of parts.status_changes ?? []) {
      const action = (sc.action ?? "").toUpperCase();
      let code = sc.to_code ?? sc.to;
      let label: string;

      if (action.includes("CREATED") || action === "CREATE") {
        // Synthetic create already added from entity created_at — skip dupes
        // unless we have no created_at.
        if (parts.created_at) continue;
        code = "CREATED";
        label = "Shipment created";
      } else if (action === "JOB_CLOSED" || /CLOSED/.test(action)) {
        code = "CLOSED";
        label = "Shipment closed";
      } else if (action === "JOB_CANCELLED" || /CANCEL/.test(action)) {
        code = "CANCELLED";
        label = "Shipment cancelled";
      } else if (action === "JOB_REOPENED" || /REOPEN/.test(action)) {
        code = "REOPENED";
        label = "Shipment reopened";
      } else if (
        action === "JOB_ON_HOLD" ||
        /ON_HOLD/i.test(sc.to) ||
        /ON_HOLD/i.test(sc.to_code ?? "")
      ) {
        code = "ON_HOLD";
        label = "Shipment placed on hold";
      } else if (action === "JOB_RESUMED" || /RESUMED/.test(action)) {
        code = "RESUMED";
        label = "Shipment resumed from hold";
      } else if (/APPROV/.test(action) || /APPROV/i.test(sc.to)) {
        code = sc.to_code ?? sc.to ?? "APPROVED";
        label = sc.from
          ? `Approved (was ${humanLabel(sc.from)})`
          : "Approved";
      } else if (/VERIF/.test(action) || /VERIF/i.test(sc.to)) {
        code = sc.to_code ?? sc.to ?? "VERIFIED";
        label = "Verified";
      } else {
        const toLabel = humanLabel(sc.to_code ?? sc.to);
        label = sc.from
          ? `Status updated to ${toLabel}`
          : `Status set to ${toLabel}`;
      }

      events.push({
        type: "STATUS",
        code,
        label,
        planned_at: null,
        actual_at: sc.at,
        is_completed: true,
        notes: notes ? (sc.reason ?? null) : null,
      });
    }

    const hold = parts.hold;
    if (hold?.held_at) {
      const releaseNote = hold.expected_release_at
        ? `Expected release: ${hold.expected_release_at.toISOString().slice(0, 10)}.`
        : null;
      const reasonNote = hold.hold_reason?.trim() || null;
      events.push({
        type: "STATUS",
        code: "ON_HOLD",
        label: "Shipment placed on hold",
        planned_at: hold.expected_release_at ?? null,
        actual_at: hold.held_at,
        is_completed: true,
        notes: notes
          ? [reasonNote, releaseNote].filter(Boolean).join(" ") || null
          : null,
      });
    }
    if (hold?.resumed_at) {
      events.push({
        type: "STATUS",
        code: "RESUMED",
        label: "Shipment resumed from hold",
        planned_at: null,
        actual_at: hold.resumed_at,
        is_completed: true,
        notes: notes ? (hold.resume_reason?.trim() || null) : null,
      });
    }

    for (const m of parts.milestones) {
      const description = m.description ?? m.notes ?? null;
      events.push({
        type: "MILESTONE",
        code: m.milestone,
        label: humanLabel(m.milestone),
        planned_at: m.planned_date,
        // Prefer precise completed_at (date + time) for customer timelines.
        actual_at: m.completed_at ?? m.actual_date,
        is_completed: Boolean(m.actual_date ?? m.completed_at),
        description,
        // Always surface customer-facing description (not gated).
        notes: description,
      });
    }

    for (const cp of parts.courier_checkpoints) {
      events.push({
        type: "COURIER_CHECKPOINT",
        code: cp.checkpoint,
        label: humanLabel(cp.checkpoint),
        planned_at: null,
        actual_at: cp.scanned_at,
        is_completed: true,
        location: cp.location,
        notes: notes ? (cp.notes ?? null) : null,
      });
    }

    for (const c of parts.containers) {
      if (!c.container_number) continue;
      if (c.gate_in_at) {
        events.push({
          type: "CONTAINER",
          code: "GATE_IN",
          label: `Container ${c.container_number} gate in`,
          planned_at: null,
          actual_at: c.gate_in_at,
          is_completed: true,
          container_number: c.container_number,
        });
      }
      if (c.returned_at) {
        events.push({
          type: "CONTAINER",
          code: "RETURNED",
          label: `Container ${c.container_number} returned`,
          planned_at: null,
          actual_at: c.returned_at,
          is_completed: true,
          container_number: c.container_number,
        });
      }
      if (!c.gate_in_at && !c.returned_at) {
        events.push({
          type: "CONTAINER",
          code: c.status,
          label: `Container ${c.container_number} · ${humanLabel(c.status)}`,
          planned_at: null,
          actual_at: null,
          is_completed: false,
          container_number: c.container_number,
        });
      }
    }

    return sortTrackHistory(events);
  }

  buildSummary(
    history: TrackHistoryEvent[],
    status: string,
    statusCode?: string | null,
    updatedAt?: Date | null,
    hold?: {
      hold_reason?: string | null;
      held_at?: Date | null;
      expected_release_at?: Date | null;
    } | null,
  ): TrackSummary {
    const completed = history.filter((e) => e.is_completed);
    const pending = history.filter((e) => !e.is_completed);
    const last =
      completed.length > 0
        ? [...completed].sort(
            (a, b) =>
              (b.actual_at?.getTime() ?? 0) - (a.actual_at?.getTime() ?? 0),
          )[0]
        : null;
    const next = pending[0] ?? null;
    const total = history.length;
    const done = completed.length;
    const statusLabel = humanLabel(statusCode ?? status);
    let headline = `Current status: ${statusLabel}`;
    let detail: string | null = null;
    if (status === "ON_HOLD") {
      headline = "Shipment is currently on hold";
      const bits = [
        hold?.hold_reason?.trim()
          ? `Reason: ${hold.hold_reason.trim()}.`
          : null,
        hold?.expected_release_at
          ? `Expected release: ${hold.expected_release_at.toISOString().slice(0, 10)}.`
          : null,
      ].filter(Boolean);
      detail = bits.length ? bits.join(" ") : "Operations will resume movement once the hold is cleared.";
    } else if (status === "DELIVERED" || status === "COMPLETED") {
      headline = "Shipment delivered";
      detail = last?.label ? `Latest update: ${last.label}.` : null;
    } else if (status === "CANCELLED") {
      headline = "Shipment cancelled";
      detail = last?.notes ?? null;
    } else if (next?.label) {
      headline = `In progress — next: ${next.label}`;
      detail = last?.label ? `Latest update: ${last.label}.` : null;
    } else if (last?.label) {
      headline = statusLabel;
      detail = `Latest update: ${last.label}.`;
    }

    return {
      current_status: status,
      current_status_label: statusLabel,
      status_code: statusCode ?? null,
      headline,
      detail,
      is_on_hold: status === "ON_HOLD",
      last_event: last,
      next_event: next,
      progress: {
        completed: done,
        total,
        percent: total ? Math.round((done / total) * 100) : 0,
      },
      updated_at: updatedAt ?? last?.actual_at ?? null,
    };
  }

  /**
   * Full track timeline for a job (staff / portal / public builder).
   * Includes milestones, courier scans, containers, and lifecycle history.
   */
  async getTimelineForJob(
    tenantId: string,
    jobId: string,
    opts?: {
      includeNotes?: boolean;
      shipmentId?: string | null;
      tenantSlug?: string | null;
    },
  ): Promise<TrackTimelinePayload> {
    const includeNotes = opts?.includeNotes ?? true;

    // Core job + mode details. Courier checkpoints loaded separately so a
    // missing/legacy table cannot 500 every track request.
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          air_details: {
            select: {
              hawb_number: true,
              mawb_number: true,
              flight_number: true,
              arrival_flight_number: true,
              origin_airport_id: true,
              dest_airport_id: true,
            },
          },
          sea_fcl_details: {
            select: {
              voyage_number: true,
              hbl_number: true,
              mbl_number: true,
              booking_number: true,
              vessel_id: true,
              etd: true,
              eta: true,
            },
          },
          sea_lcl_details: {
            select: {
              voyage_number: true,
              hbl_number: true,
              mbl_number: true,
              booking_number: true,
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
              vehicle_number: true,
              driver_name: true,
              origin_city_country: true,
              destination_city_country: true,
              etd: true,
              eta: true,
            },
          },
          courier_details: {
            select: {
              tracking_number: true,
              service_type: true,
              pickup_address: true,
              delivery_address: true,
            },
          },
          road_freight_details: {
            select: { vehicle_number: true },
          },
          milestones: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" },
            select: {
              milestone: true,
              planned_date: true,
              actual_date: true,
              completed_at: true,
              description: true,
              notes: true,
            },
          },
          containers_job: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" },
            select: {
              container_number: true,
              status: true,
              seal_number: true,
              gate_in_at: true,
              returned_at: true,
              container_kind: true,
            },
          },
          shipments: {
            where: { deleted_at: null },
            orderBy: { created_at: "desc" },
            take: 20,
            select: {
              id: true,
              shipment_number: true,
              status: true,
              hbl_number: true,
              mbl_number: true,
              created_at: true,
            },
          },
        },
      }),
    );

    if (!job) throw new NotFoundException("Job not found.");

    const courier_checkpoints = await this.safeCourierCheckpoints(
      tenantId,
      jobId,
    );

    const linkedIds = job.shipments.map((s) => s.id);
    const entityIds = [jobId, ...linkedIds];

    const statusLogs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.findMany({
        where: {
          tenant_id: tenantId,
          entity_id: { in: entityIds },
        },
        orderBy: { created_at: "asc" },
        take: 300,
        select: {
          created_at: true,
          metadata: true,
          new_values: true,
          old_values: true,
          action: true,
          entity: true,
          entity_id: true,
        },
      }),
    );

    const status_changes = statusLogs
      .filter((row) => this.isLifecycleAudit(row.action, row.entity))
      .map((row) => {
        const meta = (row.metadata ?? {}) as Record<string, unknown>;
        const nv = (row.new_values ?? {}) as Record<string, unknown>;
        const ov = (row.old_values ?? {}) as Record<string, unknown>;
        const to =
          (typeof meta.to === "string" && meta.to) ||
          (typeof meta.to_status === "string" && meta.to_status) ||
          (typeof meta.to_code === "string" && meta.to_code) ||
          (typeof meta.new_status === "string" && meta.new_status) ||
          (typeof nv.status === "string" && nv.status) ||
          (typeof nv.status_code === "string" && nv.status_code) ||
          row.action.replace(/^JOB_|^SHIPMENT_/, "") ||
          "UPDATED";
        const from =
          (typeof meta.from === "string" && meta.from) ||
          (typeof meta.from_status === "string" && meta.from_status) ||
          (typeof meta.old_status === "string" && meta.old_status) ||
          (typeof ov.status === "string" && ov.status) ||
          null;
        const reason =
          (typeof meta.reason === "string" && meta.reason) ||
          (typeof meta.notes === "string" && meta.notes) ||
          null;
        return {
          from,
          to,
          to_code:
            typeof meta.to_code === "string"
              ? meta.to_code
              : typeof nv.status_code === "string"
                ? nv.status_code
                : null,
          at: row.created_at,
          reason,
          action: row.action,
        };
      });

    const [ports, airports, vessel, tenant] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) => {
        const portIds = [job.origin_port_id, job.dest_port_id].filter(
          Boolean,
        ) as string[];
        const airportIds = [
          job.air_details?.origin_airport_id,
          job.air_details?.dest_airport_id,
        ].filter(Boolean) as string[];
        const vesselId =
          job.sea_fcl_details?.vessel_id ?? job.sea_lcl_details?.vessel_id;
        return Promise.all([
          portIds.length
            ? tx.port.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: portIds },
                  deleted_at: null,
                },
                select: {
                  id: true,
                  name: true,
                  un_locode: true,
                  country_code: true,
                },
              })
            : [],
          airportIds.length
            ? tx.airport.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: airportIds },
                  deleted_at: null,
                },
                select: {
                  id: true,
                  name: true,
                  iata_code: true,
                  country_code: true,
                },
              })
            : [],
          vesselId
            ? tx.vessel.findFirst({
                where: {
                  tenant_id: tenantId,
                  id: vesselId,
                  deleted_at: null,
                },
                select: { name: true },
              })
            : null,
          tx.tenant.findFirst({
            where: { id: tenantId },
            select: { slug: true },
          }),
        ]);
      },
    );

    const portMap = new Map(ports.map((p) => [p.id, p]));
    const airportMap = new Map(airports.map((a) => [a.id, a]));
    const originPort = job.origin_port_id
      ? portMap.get(job.origin_port_id)
      : null;
    const destPort = job.dest_port_id ? portMap.get(job.dest_port_id) : null;
    const originAirport = job.air_details?.origin_airport_id
      ? airportMap.get(job.air_details.origin_airport_id)
      : null;
    const destAirport = job.air_details?.dest_airport_id
      ? airportMap.get(job.air_details.dest_airport_id)
      : null;

    const holdInfo = {
      hold_reason: job.hold_reason ?? null,
      held_at: job.held_at ?? null,
      expected_release_at: job.expected_release_at ?? null,
      resume_reason: job.resume_reason ?? null,
      resumed_at: job.resumed_at ?? null,
    };

    const history = this.buildHistory({
      created_at: job.created_at,
      milestones: job.milestones,
      courier_checkpoints,
      containers: job.containers_job,
      status_changes,
      hold: holdInfo,
      includeNotes,
    });

    const summary = this.buildSummary(
      history,
      job.status,
      job.status_code,
      job.updated_at,
      holdInfo,
    );

    const linked = job.shipments;
    const focusShipment =
      (opts?.shipmentId
        ? linked.find((s) => s.id === opts.shipmentId)
        : null) ??
      linked[0] ??
      null;

    const slug = opts?.tenantSlug ?? tenant?.slug ?? null;
    const token = job.tracking_token ?? null;

    return {
      job_id: job.id,
      job_number: job.job_number,
      job_type: job.job_type,
      shipment_id: focusShipment?.id ?? null,
      shipment_number: focusShipment?.shipment_number ?? null,
      shipment_status: focusShipment?.status ?? null,
      status: job.status,
      status_code: job.status_code,
      status_label: summary.current_status_label,
      etd:
        job.etd ??
        job.sea_fcl_details?.etd ??
        job.sea_lcl_details?.etd ??
        job.land_details?.etd ??
        null,
      eta:
        job.eta ??
        job.sea_fcl_details?.eta ??
        job.sea_lcl_details?.eta ??
        job.land_details?.eta ??
        null,
      expected_delivery:
        job.eta ??
        job.sea_fcl_details?.eta ??
        job.sea_lcl_details?.eta ??
        job.land_details?.eta ??
        null,
      hold: {
        is_on_hold: job.status === "ON_HOLD",
        hold_reason: holdInfo.hold_reason,
        held_at: holdInfo.held_at,
        expected_release_at: holdInfo.expected_release_at,
        resume_reason: holdInfo.resume_reason,
        resumed_at: holdInfo.resumed_at,
      },
      commodity: job.commodity,
      pieces: job.pieces,
      gross_weight: job.gross_weight,
      origin: originPort
        ? {
            name: originPort.name,
            code: originPort.un_locode,
            country_code: originPort.country_code,
          }
        : originAirport
          ? {
              name: originAirport.name,
              code: originAirport.iata_code,
              country_code: originAirport.country_code,
            }
          : job.land_details?.origin_city_country
            ? {
                name: job.land_details.origin_city_country,
                code: null,
                country_code: null,
              }
            : job.courier_details?.pickup_address
              ? {
                  name: job.courier_details.pickup_address,
                  code: null,
                  country_code: null,
                }
              : null,
      destination: destPort
        ? {
            name: destPort.name,
            code: destPort.un_locode,
            country_code: destPort.country_code,
          }
        : destAirport
          ? {
              name: destAirport.name,
              code: destAirport.iata_code,
              country_code: destAirport.country_code,
            }
          : job.land_details?.destination_city_country
            ? {
                name: job.land_details.destination_city_country,
                code: null,
                country_code: null,
              }
            : job.courier_details?.delivery_address
              ? {
                  name: job.courier_details.delivery_address,
                  code: null,
                  country_code: null,
                }
              : null,
      references: {
        hawb_number: job.air_details?.hawb_number ?? null,
        mawb_number: job.air_details?.mawb_number ?? null,
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
        booking_number:
          job.sea_fcl_details?.booking_number ??
          job.sea_lcl_details?.booking_number ??
          null,
        shipment_numbers: linked.map((s) => s.shipment_number),
        container_numbers: job.containers_job
          .map((c) => c.container_number)
          .filter(Boolean),
        flight_number:
          job.air_details?.flight_number ??
          job.air_details?.arrival_flight_number ??
          null,
        voyage_number:
          job.sea_fcl_details?.voyage_number ??
          job.sea_lcl_details?.voyage_number ??
          null,
        vessel_name: vessel?.name ?? null,
        vehicle_number:
          job.land_details?.vehicle_number ??
          job.road_freight_details?.vehicle_number ??
          null,
        driver_name: job.land_details?.driver_name ?? null,
        tracking_number: job.courier_details?.tracking_number ?? null,
        courier_service_type: job.courier_details?.service_type ?? null,
      },
      containers: job.containers_job.map((c) => ({
        container_number: c.container_number,
        status: c.status,
        seal_number: c.seal_number,
        kind: c.container_kind,
        gate_in_at: c.gate_in_at,
        returned_at: c.returned_at,
      })),
      linked_shipments: linked.map((s) => ({
        shipment_number: s.shipment_number,
        status: s.status,
        hbl_number: s.hbl_number,
        mbl_number: s.mbl_number,
      })),
      milestones: job.milestones.map((m) => {
        const description = m.description ?? m.notes ?? null;
        const completedAt = m.completed_at ?? null;
        return {
          milestone: m.milestone,
          planned_date: m.planned_date,
          actual_date: m.actual_date,
          /** Precise date + time for customer UI. */
          completed_at: completedAt,
          is_completed: Boolean(m.actual_date ?? completedAt),
          description,
          notes: description,
        };
      }),
      history,
      summary,
      tracking_token: token,
      public_url: token
        ? publicTrackUrl(token, slug)
        : publicTrackUrl(job.job_number, slug),
    };
  }

  private isLifecycleAudit(action: string, entity: string): boolean {
    const a = action.toUpperCase();
    const e = entity.toUpperCase();
    if (!/(JOB|SHIPMENT|QUOTATION)/.test(e) && e !== "JOB" && e !== "SHIPMENT") {
      // Human-readable actions like "Updated Job (Stop)" / "Deleted Job"
      if (/JOB|SHIPMENT|STATUS|APPROV|VERIF|CREATE|CLOS|CANCEL|REOPEN/i.test(action)) {
        return true;
      }
      return false;
    }
    if (LIFECYCLE_ACTIONS.has(a)) return true;
    if (
      /STATUS|CREATED|APPROV|VERIF|CLOSED|CANCEL|REOPEN|GENERATE|HOLD|RESUMED/.test(
        a,
      )
    ) {
      return true;
    }
    // Free-text audit actions from older writers
    if (
      /changed status|approved|verified|created|closed|cancelled|reopened|on hold|resumed/i.test(
        action,
      )
    ) {
      return true;
    }
    return false;
  }

  private async safeCourierCheckpoints(
    tenantId: string,
    jobId: string,
  ): Promise<
    Array<{
      checkpoint: string;
      scanned_at: Date;
      location: string | null;
      notes: string | null;
    }>
  > {
    try {
      return await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.courierDeliveryCheckpoint.findMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          orderBy: { scanned_at: "asc" },
          select: {
            checkpoint: true,
            scanned_at: true,
            location: true,
            notes: true,
          },
        }),
      );
    } catch (err) {
      this.logger.warn(
        `Courier checkpoints unavailable for job ${jobId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return [];
    }
  }
}
