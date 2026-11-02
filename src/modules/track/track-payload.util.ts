import type { TrackHistoryEvent } from "./tracking-ref.util";

export type TrackRouteLegCode = "POL" | "PTS" | "POD";

export type TrackRouteLeg = {
  code: TrackRouteLegCode;
  name: string;
  country?: string | null;
  un_locode?: string | null;
  current?: boolean;
};

export type TrackContainerView = {
  container_number: string | null;
  status: string;
  status_label: string;
  seal_number: string | null;
  kind: string | null;
  container_type: string | null;
  iso_size: string | null;
  gate_in_at: Date | null;
  returned_at: Date | null;
};

/** Human move text for container / job status (reference UI style). */
export function containerMoveLabel(
  status: string | null | undefined,
  opts?: { empty?: boolean; atDepot?: boolean },
): string {
  const s = (status ?? "").toUpperCase();
  let move: string;
  switch (s) {
    case "EMPTY":
      move = "EMPTY";
      break;
    case "PICKED":
      move = "PICKED UP";
      break;
    case "STUFFED":
      move = "STUFFED";
      break;
    case "GATED_IN":
      move = "GATE IN";
      break;
    case "LOADED":
      move = "LOADED ON VESSEL";
      break;
    case "IN_TRANSIT":
      move = "IN TRANSIT";
      break;
    case "DISCHARGED":
      move = "DISCHARGED";
      break;
    case "RETURNED":
      move = "RETURNED EMPTY";
      break;
    case "ON_HOLD":
      move = "ON HOLD";
      break;
    case "DELIVERED":
      move = "DELIVERED";
      break;
    case "COMPLETED":
      move = "COMPLETED";
      break;
    default:
      move = s
        ? s.replace(/_/g, " ")
        : "UNKNOWN";
  }
  if (opts?.empty && (s === "GATED_IN" || s === "EMPTY")) {
    move = s === "GATED_IN" ? "GATE IN EMPTY" : "EMPTY";
  }
  if (opts?.atDepot && (s === "GATED_IN" || s === "EMPTY" || s === "RETURNED")) {
    move = `${move} AT DEPOT`;
  }
  return move;
}

export function isoSizeFromContainerSize(
  size: string | null | undefined,
): string | null {
  if (!size) return null;
  return size.replace(/^SIZE_/, "").replace(/_/g, " ");
}

export function pickFocusContainer<
  T extends {
    container_number: string | null;
    container_kind?: string | null;
    kind?: string | null;
  },
>(
  containers: T[],
  opts?: {
    focusNumber?: string | null;
    primaryNumber?: string | null;
  },
): T | null {
  if (!containers.length) return null;
  const focus = opts?.focusNumber?.trim().toLowerCase();
  if (focus) {
    const hit = containers.find(
      (c) => c.container_number?.toLowerCase() === focus,
    );
    if (hit) return hit;
  }
  const primary = opts?.primaryNumber?.trim().toLowerCase();
  if (primary) {
    const hit = containers.find(
      (c) => c.container_number?.toLowerCase() === primary,
    );
    if (hit) return hit;
  }
  const actual = containers.find((c) => {
    const k = (c.container_kind ?? c.kind ?? "").toUpperCase();
    return k === "ACTUAL" && c.container_number;
  });
  if (actual) return actual;
  return (
    containers.find((c) => Boolean(c.container_number)) ?? containers[0] ?? null
  );
}

export function buildRouteLegs(input: {
  origin?: {
    name: string;
    code?: string | null;
    country_code?: string | null;
  } | null;
  destination?: {
    name: string;
    code?: string | null;
    country_code?: string | null;
  } | null;
  place_of_receipt?: string | null;
  place_of_delivery?: string | null;
  transhipment_port?: string | null;
  container_status?: string | null;
  job_status?: string | null;
}): TrackRouteLeg[] {
  const legs: TrackRouteLeg[] = [];
  const polName =
    input.origin?.name?.trim() ||
    input.place_of_receipt?.trim() ||
    null;
  if (polName) {
    legs.push({
      code: "POL",
      name: polName,
      country: input.origin?.country_code ?? null,
      un_locode: input.origin?.code ?? null,
    });
  }
  const pts = input.transhipment_port?.trim();
  if (pts) {
    legs.push({ code: "PTS", name: pts });
  }
  const podName =
    input.destination?.name?.trim() ||
    input.place_of_delivery?.trim() ||
    null;
  if (podName) {
    legs.push({
      code: "POD",
      name: podName,
      country: input.destination?.country_code ?? null,
      un_locode: input.destination?.code ?? null,
    });
  }

  const cs = (input.container_status ?? "").toUpperCase();
  const js = (input.job_status ?? "").toUpperCase();
  let currentCode: TrackRouteLegCode = "POL";
  if (
    ["DISCHARGED", "RETURNED"].includes(cs) ||
    ["DELIVERED", "COMPLETED"].includes(js)
  ) {
    currentCode = "POD";
  } else if (cs === "IN_TRANSIT" || js === "IN_PROGRESS") {
    currentCode = pts ? "PTS" : "POD";
  } else if (["LOADED"].includes(cs)) {
    currentCode = pts ? "PTS" : "POL";
  }

  return legs.map((leg) => ({
    ...leg,
    current: leg.code === currentCode,
  }));
}

export function enrichHistoryEvents(
  events: TrackHistoryEvent[],
  ctx: {
    vessel_name?: string | null;
    voyage_number?: string | null;
    origin_name?: string | null;
    dest_name?: string | null;
    location_terminal?: string | null;
  },
): TrackHistoryEvent[] {
  return events.map((e) => {
    const when = e.actual_at ?? null;
    let location = e.location ?? null;
    let terminal = e.terminal ?? location;
    if (!location && e.type === "CONTAINER") {
      const code = (e.code ?? "").toUpperCase();
      if (["GATE_IN", "GATED_IN", "EMPTY", "PICKED", "STUFFED", "LOADED"].includes(code)) {
        location = ctx.location_terminal ?? ctx.origin_name ?? null;
        terminal = ctx.location_terminal ?? location;
      } else if (["DISCHARGED", "RETURNED", "RETURNED_EMPTY"].includes(code)) {
        location = ctx.location_terminal ?? ctx.dest_name ?? null;
        terminal = ctx.location_terminal ?? location;
      }
    }
    if (!terminal && ctx.location_terminal) {
      terminal = ctx.location_terminal;
    }
    if (!location && ctx.location_terminal) {
      location = ctx.location_terminal;
    }
    return {
      ...e,
      move: e.move ?? e.label,
      completed_at: e.completed_at ?? when,
      occurred_at: e.occurred_at ?? when,
      location,
      terminal: terminal ?? null,
      vessel_name: e.vessel_name ?? ctx.vessel_name ?? null,
      voyage_number: e.voyage_number ?? ctx.voyage_number ?? null,
    };
  });
}

export function resolveCurrentStatus(input: {
  hold?: boolean;
  job_status?: string | null;
  container_status?: string | null;
  last_event?: TrackHistoryEvent | null;
}): string {
  if (input.hold || input.job_status === "ON_HOLD") {
    return "ON HOLD";
  }
  if (input.last_event?.move || input.last_event?.label) {
    const raw = (input.last_event.move ?? input.last_event.label ?? "").trim();
    if (raw) return raw.toUpperCase();
  }
  if (input.container_status) {
    return containerMoveLabel(input.container_status, {
      empty: input.container_status === "EMPTY" || input.container_status === "GATED_IN",
      atDepot:
        input.container_status === "GATED_IN" ||
        input.container_status === "EMPTY" ||
        input.container_status === "RETURNED",
    });
  }
  return containerMoveLabel(input.job_status);
}
