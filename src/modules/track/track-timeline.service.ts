import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  buildRouteLegs,
  containerMoveLabel,
  enrichHistoryEvents,
  isoSizeFromContainerSize,
  pickFocusContainer,
  resolveCurrentStatus,
  type TrackContainerView,
  type TrackRouteLeg,
} from "./track-payload.util";
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
  /** Human move text for FE (e.g. GATE IN EMPTY AT DEPOT). */
  current_status: string;
  container_number: string | null;
  container_type: string | null;
  iso_size: string | null;
  container_kind: string | null;
  /** Depot / terminal from job show_all. */
  location_terminal: string | null;
  terminal: string | null;
  location: string | null;
  /** POL / PTS / POD legs — same array as route_legs / ports. */
  progress_legs: TrackRouteLeg[];
  route_legs: TrackRouteLeg[];
  ports: TrackRouteLeg[];
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
  vessel_name: string | null;
  voyage_number: string | null;
  references: Record<string, unknown>;
  containers: TrackContainerView[];
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
  /** Aliases for FE: history / moves / events / timeline (milestone + container/ops only). */
  history: TrackHistoryEvent[];
  moves: TrackHistoryEvent[];
  events: TrackHistoryEvent[];
  timeline: TrackHistoryEvent[];
  /** YQN-style route header (from tracking profile + job ports). */
  route: {
    bl_number: string | null;
    origin_port: string | null;
    dest_port: string | null;
    /** @deprecated prefer origin_port / dest_port */
    from: string | null;
    to: string | null;
    first_leg: unknown | null;
    second_leg: unknown | null;
    legs: unknown[];
    port_of_call: unknown[];
    at_before: Date | null;
    terminal_cutoff_at: Date | null;
    progress_legs: TrackRouteLeg[];
  };
  /** Section 1 — Cargo Info */
  cargo_info: {
    arrival_report_status: unknown[];
    customs_status: unknown[];
    detailed_data: Record<string, unknown>;
  };
  /** Section 2 — Pre-manifest */
  pre_manifest: {
    manifest_status: unknown[];
  };
  /** Section 3 — QTY / G.W. / VOL */
  qty_gw_vol: Record<string, unknown>;
  tracking_profile_updated_at: Date | null;
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
      created_at?: Date | null;
      updated_at?: Date | null;
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
    ops_events?: Array<{
      code: string;
      label: string;
      at: Date;
      notes?: string | null;
      container_number?: string | null;
    }>;
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
      // Tracking shows completed milestones only (no planned/pending rows).
      if (!m.actual_date && !m.completed_at) continue;
      const description = m.description ?? m.notes ?? null;
      events.push({
        type: "MILESTONE",
        code: m.milestone,
        label: humanLabel(m.milestone),
        planned_at: m.planned_date,
        // Prefer precise completed_at (date + time) for customer timelines.
        actual_at: m.completed_at ?? m.actual_date,
        is_completed: true,
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
      if (c.created_at) {
        events.push({
          type: "CONTAINER",
          code: "ALLOCATED",
          label: `Container ${c.container_number} allocated`,
          planned_at: null,
          actual_at: c.created_at,
          is_completed: true,
          container_number: c.container_number,
        });
      }
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
      // Current status move (completed when we have a timestamp beyond allocation).
      const statusAt =
        c.updated_at &&
        c.created_at &&
        c.updated_at.getTime() > c.created_at.getTime()
          ? c.updated_at
          : c.gate_in_at || c.returned_at
            ? null
            : c.updated_at ?? null;
      if (c.status && statusAt) {
        events.push({
          type: "CONTAINER",
          code: c.status,
          label: `Container ${c.container_number} · ${humanLabel(c.status)}`,
          planned_at: null,
          actual_at: statusAt,
          is_completed: true,
          container_number: c.container_number,
        });
      }
      // Skip pending container status rows (no timestamp) — tracking is completed-only.
    }

    for (const op of parts.ops_events ?? []) {
      events.push({
        type: "OPS",
        code: op.code,
        label: op.label,
        planned_at: null,
        actual_at: op.at,
        is_completed: true,
        container_number: op.container_number ?? null,
        notes: op.notes ?? null,
      });
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
   * Milestone + container/ops events only — status-notification noise omitted.
   * Same payload shape for public `/track` and staff `GET /jobs/:id/tracking`.
   */
  async getTimelineForJob(
    tenantId: string,
    jobId: string,
    opts?: {
      includeNotes?: boolean;
      shipmentId?: string | null;
      tenantSlug?: string | null;
      /** When tracking by container number, prefer that unit. */
      focusContainerNumber?: string | null;
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
              flight_status: true,
              flight_date: true,
              shipment_date: true,
              arrival_flight_number: true,
              actual_eta: true,
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
              place_of_receipt: true,
              place_of_delivery: true,
              transhipment_port: true,
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
              place_of_receipt: true,
              place_of_delivery: true,
              transhipment_port: true,
            },
          },
          nvocc_details: {
            select: {
              hbl_number: true,
              mbl_number: true,
              port_token_obtained_at: true,
              port_token_form: true,
              draft_bl_requested_at: true,
              draft_bl_issued_at: true,
              draft_bl_customer_comment: true,
              workflow_stage: true,
              stage_changed_at: true,
            },
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
              container_type_id: true,
              created_at: true,
              updated_at: true,
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
          tracking_profile: true,
        },
      }),
    );

    if (!job) throw new NotFoundException("Job not found.");

    const courier_checkpoints = await this.safeCourierCheckpoints(
      tenantId,
      jobId,
    );

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

    const ops_events: Array<{
      code: string;
      label: string;
      at: Date;
      notes?: string | null;
      container_number?: string | null;
    }> = [];
    const nvocc = job.nvocc_details;
    if (nvocc?.port_token_obtained_at) {
      const form = (nvocc.port_token_form ?? null) as Record<
        string,
        unknown
      > | null;
      const ctr =
        (typeof form?.container_number === "string" &&
          form.container_number) ||
        job.primary_container_number ||
        null;
      const bits = [
        typeof form?.bl_number === "string" ? `BL ${form.bl_number}` : null,
        typeof form?.delivery_location === "string"
          ? `Delivery: ${form.delivery_location}`
          : null,
        typeof form?.receiver_name === "string"
          ? `Receiver: ${form.receiver_name}`
          : null,
      ].filter(Boolean);
      ops_events.push({
        code: "PORT_TOKEN",
        label: "Port gate token confirmed",
        at: nvocc.port_token_obtained_at,
        notes: bits.length ? bits.join(" · ") : null,
        container_number: ctr,
      });
    }
    if (nvocc?.draft_bl_requested_at) {
      const comment = nvocc.draft_bl_customer_comment?.trim() || null;
      ops_events.push({
        code: "DRAFT_BL_REQUESTED",
        label: "Draft BL requested",
        at: nvocc.draft_bl_requested_at,
        notes: comment
          ? comment.length > 160
            ? `${comment.slice(0, 157)}…`
            : comment
          : null,
      });
    }
    if (nvocc?.draft_bl_issued_at) {
      ops_events.push({
        code: "DRAFT_BL_ISSUED",
        label: "Draft BL issued",
        at: nvocc.draft_bl_issued_at,
      });
    }
    if (
      nvocc?.stage_changed_at &&
      nvocc.workflow_stage &&
      nvocc.workflow_stage !== "BOOKING_FORM_COMPLETE"
    ) {
      ops_events.push({
        code: `NVOCC_${nvocc.workflow_stage}`,
        label: `NVOCC stage · ${humanLabel(nvocc.workflow_stage)}`,
        at: nvocc.stage_changed_at,
      });
    }

    const profile = job.tracking_profile;
    const profileContainerEvents = Array.isArray(profile?.container_events)
      ? (profile!.container_events as Array<Record<string, unknown>>)
      : [];
    for (const ev of profileContainerEvents) {
      const atRaw = ev.occurred_at ?? ev.at ?? ev.actual_at;
      if (!atRaw) continue;
      const at = new Date(String(atRaw));
      if (Number.isNaN(at.getTime())) continue;
      const code = String(ev.event_code ?? ev.code ?? "CONTAINER_EVENT");
      const label =
        typeof ev.label === "string" && ev.label.trim()
          ? ev.label.trim()
          : humanLabel(code);
      const place =
        typeof ev.place === "string"
          ? ev.place
          : typeof ev.location === "string"
            ? ev.location
            : null;
      ops_events.push({
        code,
        label,
        at,
        notes: place,
        container_number:
          typeof ev.container_no === "string"
            ? ev.container_no
            : typeof ev.container_number === "string"
              ? ev.container_number
              : null,
      });
    }

    const typeIds = [
      ...new Set(
        job.containers_job
          .map((c) => c.container_type_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const containerTypes = typeIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.containerType.findMany({
            where: {
              tenant_id: tenantId,
              id: { in: typeIds },
              deleted_at: null,
            },
            select: { id: true, code: true, name: true, size: true },
          }),
        )
      : [];
    const typeMap = new Map(containerTypes.map((t) => [t.id, t]));

    const containersSorted = [...job.containers_job].sort((a, b) => {
      const ak = a.container_kind === "ACTUAL" ? 0 : 1;
      const bk = b.container_kind === "ACTUAL" ? 0 : 1;
      if (ak !== bk) return ak - bk;
      return a.created_at.getTime() - b.created_at.getTime();
    });

    const focusContainer = pickFocusContainer(containersSorted, {
      focusNumber: opts?.focusContainerNumber,
      primaryNumber: job.primary_container_number,
    });
    const focusType = focusContainer?.container_type_id
      ? typeMap.get(focusContainer.container_type_id)
      : null;

    const origin = originPort
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
            : null;
    const destination = destPort
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
            : null;

    const isAir =
      job.job_type === "AIR_EXPORT" || job.job_type === "AIR_IMPORT";
    const flightNumber =
      job.air_details?.flight_number ??
      job.air_details?.arrival_flight_number ??
      null;
    const vesselName = isAir
      ? null
      : (job.vessel_name ?? vessel?.name ?? null);
    const voyageNumber = isAir
      ? null
      : (job.voyage_number ??
        job.sea_fcl_details?.voyage_number ??
        job.sea_lcl_details?.voyage_number ??
        null);

    // Milestone + container/courier/ops only — omit STATUS / hold-resume notification noise.
    const rawHistory = this.buildHistory({
      milestones: job.milestones,
      courier_checkpoints,
      containers: containersSorted,
      ops_events,
      includeNotes,
    }).filter((e) => e.type !== "STATUS");

    const history = enrichHistoryEvents(rawHistory, {
      vessel_name: vesselName,
      voyage_number: voyageNumber,
      origin_name: origin?.name ?? null,
      dest_name: destination?.name ?? null,
      location_terminal: job.location_terminal ?? null,
    }).filter((e) => e.is_completed);

    const summary = this.buildSummary(
      history,
      job.status,
      job.status_code,
      job.updated_at,
      holdInfo,
    );

    const containerStatus =
      focusContainer?.status ?? job.primary_container_status ?? null;
    const currentStatus = resolveCurrentStatus({
      hold: job.status === "ON_HOLD",
      job_status: job.status,
      container_status: containerStatus,
      last_event: summary.last_event,
    });
    summary.current_status = currentStatus;
    summary.current_status_label = currentStatus;

    const legs = buildRouteLegs({
      origin,
      destination,
      place_of_receipt:
        job.sea_fcl_details?.place_of_receipt ??
        job.sea_lcl_details?.place_of_receipt ??
        null,
      place_of_delivery:
        job.sea_fcl_details?.place_of_delivery ??
        job.sea_lcl_details?.place_of_delivery ??
        null,
      transhipment_port:
        job.sea_fcl_details?.transhipment_port ??
        job.sea_lcl_details?.transhipment_port ??
        null,
      container_status: containerStatus,
      job_status: job.status,
    });

    const linked = job.shipments;
    const focusShipment =
      (opts?.shipmentId
        ? linked.find((s) => s.id === opts.shipmentId)
        : null) ??
      linked[0] ??
      null;

    const slug = opts?.tenantSlug ?? tenant?.slug ?? null;
    const token = job.tracking_token ?? null;

    const containerViews: TrackContainerView[] = containersSorted.map((c) => {
      const t = c.container_type_id ? typeMap.get(c.container_type_id) : null;
      return {
        container_number: c.container_number,
        status: c.status,
        status_label: containerMoveLabel(c.status),
        seal_number: c.seal_number,
        kind: c.container_kind,
        container_type: t?.code ?? t?.name ?? null,
        iso_size: isoSizeFromContainerSize(t?.size ?? null),
        gate_in_at: c.gate_in_at,
        returned_at: c.returned_at,
      };
    });

    const focusNumber =
      focusContainer?.container_number ??
      job.primary_container_number ??
      null;

    return {
      job_id: job.id,
      job_number: job.job_number,
      job_type: job.job_type,
      shipment_id: focusShipment?.id ?? null,
      shipment_number: focusShipment?.shipment_number ?? null,
      shipment_status: focusShipment?.status ?? null,
      status: job.status,
      status_code: job.status_code,
      status_label: currentStatus,
      current_status: currentStatus,
      container_number: focusNumber,
      container_type: focusType?.code ?? focusType?.name ?? null,
      iso_size: isoSizeFromContainerSize(focusType?.size ?? null),
      container_kind: focusContainer?.container_kind ?? null,
      progress_legs: legs,
      route_legs: legs,
      ports: legs,
      etd: isAir
        ? (job.air_details?.flight_date ??
          job.etd ??
          null)
        : (job.etd ??
          job.sea_fcl_details?.etd ??
          job.sea_lcl_details?.etd ??
          job.land_details?.etd ??
          null),
      eta: isAir
        ? (job.air_details?.actual_eta ??
          job.eta ??
          null)
        : (job.eta ??
          job.sea_fcl_details?.eta ??
          job.sea_lcl_details?.eta ??
          job.land_details?.eta ??
          null),
      expected_delivery: isAir
        ? (job.air_details?.actual_eta ??
          job.eta ??
          null)
        : (job.eta ??
          job.sea_fcl_details?.eta ??
          job.sea_lcl_details?.eta ??
          job.land_details?.eta ??
          null),
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
      origin,
      destination,
      vessel_name: vesselName,
      voyage_number: voyageNumber,
      location_terminal: job.location_terminal ?? null,
      terminal: job.location_terminal ?? null,
      location: job.location_terminal ?? null,
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
        container_number: focusNumber,
        container_numbers: [
          ...(job.primary_container_number
            ? [job.primary_container_number]
            : []),
          ...containersSorted
            .map((c) => c.container_number)
            .filter((n): n is string => Boolean(n)),
        ].filter((v, i, a) => a.indexOf(v) === i),
        container_status: containerStatus,
        container_type: focusType?.code ?? focusType?.name ?? null,
        iso_size: isoSizeFromContainerSize(focusType?.size ?? null),
        rotation_number: job.rotation_number ?? null,
        flight_number: flightNumber,
        flight_date: job.air_details?.flight_date ?? null,
        shipment_date: job.air_details?.shipment_date ?? null,
        flight_status: job.air_details?.flight_status ?? null,
        arrival_flight_number:
          job.air_details?.arrival_flight_number ?? null,
        voyage_number: voyageNumber,
        vessel_name: vesselName,
        vehicle_number:
          job.land_details?.vehicle_number ??
          job.road_freight_details?.vehicle_number ??
          null,
        driver_name: job.land_details?.driver_name ?? null,
        tracking_number: job.courier_details?.tracking_number ?? null,
        courier_service_type: job.courier_details?.service_type ?? null,
      },
      containers: containerViews,
      linked_shipments: linked.map((s) => ({
        shipment_number: s.shipment_number,
        status: s.status,
        hbl_number: s.hbl_number,
        mbl_number: s.mbl_number,
      })),
      milestones: job.milestones
        .filter((m) => Boolean(m.actual_date ?? m.completed_at))
        .map((m) => {
          const description = m.description ?? m.notes ?? null;
          const completedAt = m.completed_at ?? null;
          return {
            milestone: m.milestone,
            planned_date: m.planned_date,
            actual_date: m.actual_date,
            completed_at: completedAt,
            is_completed: true,
            description,
            notes: description,
          };
        }),
      history,
      moves: history,
      events: history,
      timeline: history,
      route: (() => {
        const originPort =
          profile?.origin_label?.trim() || origin?.name || null;
        const destPort =
          profile?.dest_label?.trim() || destination?.name || null;
        const blNumber = isAir
          ? profile?.bl_number?.trim() ||
            job.air_details?.mawb_number ||
            job.air_details?.hawb_number ||
            null
          : profile?.bl_number?.trim() ||
            job.sea_fcl_details?.hbl_number ||
            job.sea_lcl_details?.hbl_number ||
            job.nvocc_details?.hbl_number ||
            job.sea_fcl_details?.mbl_number ||
            job.sea_lcl_details?.mbl_number ||
            job.nvocc_details?.mbl_number ||
            null;
        const rawLegs = Array.isArray(profile?.legs)
          ? ([...profile!.legs] as unknown[])
          : [];
        const sortedLegs = rawLegs.sort(
          (a, b) =>
            Number((a as { leg_no?: number }).leg_no ?? 0) -
            Number((b as { leg_no?: number }).leg_no ?? 0),
        );
        if (!sortedLegs.length) {
          if (isAir && flightNumber) {
            sortedLegs.push({
              leg_no: 1,
              flight_number: flightNumber,
              flight_date: job.air_details?.flight_date
                ? job.air_details.flight_date.toISOString().slice(0, 10)
                : null,
              vessel_name: null,
              voyage_number: null,
              pol: originPort,
              pod: destPort,
              label: "1st flight",
            });
          } else if (vesselName || voyageNumber) {
            sortedLegs.push({
              leg_no: 1,
              vessel_name: vesselName,
              voyage_number: voyageNumber,
              imo: null,
              pol: originPort,
              pod: destPort,
              label: "1st leg",
            });
          }
        }
        let portOfCall: unknown[] = Array.isArray(profile?.port_of_call)
          ? (profile!.port_of_call as unknown[])
          : [];
        if (!portOfCall.length) {
          const etdFallback = isAir
            ? job.air_details?.flight_date ?? job.etd ?? null
            : job.etd ??
              job.sea_fcl_details?.etd ??
              job.sea_lcl_details?.etd ??
              null;
          const etaFallback = isAir
            ? job.air_details?.actual_eta ?? job.eta ?? null
            : job.eta ??
              job.sea_fcl_details?.eta ??
              job.sea_lcl_details?.eta ??
              null;
          portOfCall = [
            {
              role: "ORIGIN",
              port_name: originPort,
              un_locode: origin?.code ?? null,
              eta: null,
              ata: null,
              etd: etdFallback ? new Date(etdFallback).toISOString() : null,
              atd: null,
              ...(isAir
                ? {
                    flight_number: flightNumber,
                    vessel_name: null,
                    voyage_number: null,
                  }
                : {
                    vessel_name: vesselName,
                    voyage_number: voyageNumber,
                  }),
            },
            {
              role: "DEST",
              port_name: destPort,
              un_locode: destination?.code ?? null,
              eta: etaFallback ? new Date(etaFallback).toISOString() : null,
              ata: null,
              etd: null,
              atd: null,
              ...(isAir
                ? {
                    flight_number: flightNumber,
                    vessel_name: null,
                    voyage_number: null,
                  }
                : {
                    vessel_name: vesselName,
                    voyage_number: voyageNumber,
                  }),
            },
          ];
        }
        return {
          bl_number: blNumber,
          origin_port: originPort,
          dest_port: destPort,
          from: originPort,
          to: destPort,
          first_leg:
            sortedLegs.find(
              (l) => Number((l as { leg_no?: number }).leg_no) === 1,
            ) ??
            sortedLegs[0] ??
            null,
          second_leg:
            sortedLegs.find(
              (l) => Number((l as { leg_no?: number }).leg_no) === 2,
            ) ??
            sortedLegs[1] ??
            null,
          legs: sortedLegs,
          port_of_call: portOfCall,
          at_before: profile?.at_before ?? null,
          terminal_cutoff_at: profile?.terminal_cutoff_at ?? null,
          progress_legs: legs,
          ...(isAir
            ? {
                mawb_number: job.air_details?.mawb_number ?? null,
                hawb_number: job.air_details?.hawb_number ?? null,
                flight_number: flightNumber,
                flight_date: job.air_details?.flight_date ?? null,
                shipment_date: job.air_details?.shipment_date ?? null,
                flight_status: job.air_details?.flight_status ?? null,
                arrival_flight_number:
                  job.air_details?.arrival_flight_number ?? null,
              }
            : {}),
        };
      })(),
      cargo_info: (() => {
        const staffDetailed =
          profile?.detailed_data &&
          typeof profile.detailed_data === "object" &&
          !Array.isArray(profile.detailed_data)
            ? (profile.detailed_data as Record<string, unknown>)
            : {};
        const jobDetailed: Record<string, unknown> = {
          job_number: job.job_number,
          job_type: job.job_type,
          status: job.status,
          commodity: job.commodity,
          pieces: job.pieces,
          gross_weight: job.gross_weight,
          volume_cbm: (job as { volume_cbm?: unknown }).volume_cbm ?? null,
          chargeable_weight:
            (job as { chargeable_weight?: unknown }).chargeable_weight ?? null,
          vessel_name: vesselName,
          voyage_number: voyageNumber,
          etd:
            job.etd ??
            job.sea_fcl_details?.etd ??
            job.sea_lcl_details?.etd ??
            null,
          eta:
            job.eta ??
            job.sea_fcl_details?.eta ??
            job.sea_lcl_details?.eta ??
            null,
          origin_port: origin?.name ?? null,
          dest_port: destination?.name ?? null,
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
          primary_container_number: job.primary_container_number ?? null,
          location_terminal: job.location_terminal ?? null,
          rotation_number: job.rotation_number ?? null,
        };
        return {
          arrival_report_status: Array.isArray(profile?.arrival_report)
            ? profile!.arrival_report
            : [],
          customs_status: Array.isArray(profile?.customs_status)
            ? profile!.customs_status
            : [],
          detailed_data: { ...jobDetailed, ...staffDetailed },
        };
      })(),
      pre_manifest: {
        manifest_status: Array.isArray(profile?.pre_manifest)
          ? profile!.pre_manifest
          : [],
      },
      qty_gw_vol:
        profile?.qty_gw_vol &&
        typeof profile.qty_gw_vol === "object" &&
        !Array.isArray(profile.qty_gw_vol) &&
        Object.keys(profile.qty_gw_vol as object).length
          ? (profile.qty_gw_vol as Record<string, unknown>)
          : {
              quantity: job.pieces ?? null,
              gross_weight:
                job.gross_weight != null ? Number(job.gross_weight) : null,
              net_weight: null,
              volume:
                (job as { volume_cbm?: unknown }).volume_cbm != null
                  ? Number((job as { volume_cbm?: unknown }).volume_cbm)
                  : null,
              chargeable_weight:
                (job as { chargeable_weight?: unknown }).chargeable_weight !=
                null
                  ? Number(
                      (job as { chargeable_weight?: unknown })
                        .chargeable_weight,
                    )
                  : null,
              qty_unit: "PKG",
              weight_unit: "KG",
              volume_unit: "CBM",
              lines: [],
            },
      tracking_profile_updated_at: profile?.updated_at ?? null,
      summary,
      tracking_token: token,
      public_url: token
        ? publicTrackUrl(token, slug)
        : publicTrackUrl(job.job_number, slug),
    };
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
