import type { TrackTimelinePayload } from "./track-timeline.service";

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtWhen(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const iso = typeof d === "string" ? d : d.toISOString();
  return iso.replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

/** HTML for Track & Trace PDF export (public + private). */
export function buildTrackTraceHtml(
  payload: TrackTimelinePayload,
  opts?: {
    tenant_name?: string | null;
    query?: string | null;
  },
): string {
  const title = opts?.tenant_name
    ? `${opts.tenant_name} — Track & Trace`
    : "Track & Trace";
  const legs = payload.progress_legs ?? [];
  const hist = payload.history ?? [];

  const legRows = legs
    .map(
      (l) =>
        `<tr><td>${esc(l.code)}</td><td>${esc(l.name)}</td><td>${esc(l.country ?? "")}</td><td>${l.current ? "● current" : ""}</td></tr>`,
    )
    .join("");

  const histRows = hist
    .map((e) => {
      const when = e.completed_at ?? e.occurred_at ?? e.actual_at;
      return `<tr>
        <td>${esc(fmtWhen(when))}</td>
        <td>${esc(e.move ?? e.label)}</td>
        <td>${esc(e.location ?? e.terminal ?? "")}</td>
        <td>${esc([e.vessel_name, e.voyage_number].filter(Boolean).join(" / "))}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${esc(title)}</title>
  <style>
    body { font-family: "Segoe UI", Arial, sans-serif; color: #0f172a; font-size: 12px; margin: 24px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .muted { color: #64748b; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 18px; }
    .k { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
    .v { font-weight: 600; margin-top: 2px; }
    .status { font-size: 16px; font-weight: 700; color: #0b5fff; margin: 12px 0 18px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { font-size: 10px; text-transform: uppercase; color: #64748b; }
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <div class="muted">${esc(opts?.query ? `Reference: ${opts.query}` : payload.job_number)}</div>
  <div class="status">${esc(payload.current_status)}</div>
  <div class="grid">
    <div><div class="k">Job</div><div class="v">${esc(payload.job_number)}</div></div>
    <div><div class="k">Container</div><div class="v">${esc(payload.container_number ?? "—")}${payload.iso_size ? ` · ${esc(payload.iso_size)}` : ""}${payload.container_type ? ` · ${esc(payload.container_type)}` : ""}</div></div>
    <div><div class="k">Origin</div><div class="v">${esc(payload.origin?.name ?? "—")}</div></div>
    <div><div class="k">Destination</div><div class="v">${esc(payload.destination?.name ?? "—")}</div></div>
    <div><div class="k">Vessel / Voyage</div><div class="v">${esc([payload.vessel_name, payload.voyage_number].filter(Boolean).join(" / ") || "—")}</div></div>
    <div><div class="k">ETA</div><div class="v">${esc(fmtWhen(payload.eta))}</div></div>
  </div>
  <h2 style="font-size:13px;">Route</h2>
  <table>
    <thead><tr><th>Leg</th><th>Port</th><th>Country</th><th></th></tr></thead>
    <tbody>${legRows || `<tr><td colspan="4">No route legs</td></tr>`}</tbody>
  </table>
  <h2 style="font-size:13px;">History</h2>
  <table>
    <thead><tr><th>When</th><th>Move</th><th>Location</th><th>Vessel / Voyage</th></tr></thead>
    <tbody>${histRows || `<tr><td colspan="4">No events</td></tr>`}</tbody>
  </table>
</body>
</html>`;
}
