/**
 * Shared A4 HTML builder for WMS GRN / GDO (GDN) printable PDFs.
 */

export type WmsPdfLine = {
  itemCode: string;
  itemName: string;
  quantity: string | number;
  uom: string;
  batch?: string | null;
};

export type WmsDocumentPdfInput = {
  title: string;
  docNumber: string;
  status: string;
  directionLabel: string;
  stockNote: string;
  warehouseCode: string;
  warehouseName: string;
  partyName?: string | null;
  jobRef?: string | null;
  asnNumber?: string | null;
  primaryDateLabel: string;
  primaryDate?: string | null;
  createdAt?: string | null;
  postedAt?: string | null;
  remarks?: string | null;
  lines: WmsPdfLine[];
  companyName: string;
  logoUrl?: string | null;
  generatedAt: string;
  documentId: string;
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;
}

export function buildWmsDocumentPdfHtml(input: WmsDocumentPdfInput): string {
  const cancelled = input.status.toUpperCase() === "CANCELLED";
  const watermark = cancelled
    ? `<div class="watermark">CANCELLED</div>`
    : "";

  const logo = input.logoUrl
    ? `<img class="logo" src="${esc(input.logoUrl)}" alt="Logo" />`
    : "";

  const linesHtml = input.lines
    .map(
      (line, i) => `<tr>
        <td>${i + 1}</td>
        <td>${esc(line.itemCode)}</td>
        <td>${esc(line.itemName)}</td>
        <td class="num">${esc(line.quantity)}</td>
        <td>${esc(line.uom || "—")}</td>
        <td>${esc(line.batch || "—")}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(input.title)} ${esc(input.docNumber)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; position: relative; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0b3d5c; padding-bottom: 10px; margin-bottom: 14px; }
    .company { font-size: 16px; font-weight: bold; color: #0b3d5c; }
    .logo { max-height: 48px; max-width: 140px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .meta { color: #444; margin-bottom: 12px; }
    table.meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    table.meta-table th { text-align: left; width: 160px; padding: 3px 6px; color: #555; font-weight: 600; vertical-align: top; }
    table.meta-table td { padding: 3px 6px; }
    table.lines { width: 100%; border-collapse: collapse; margin-top: 8px; }
    table.lines th, table.lines td { border: 1px solid #ccc; padding: 6px; }
    table.lines th { background: #f0f4f8; text-align: left; }
    td.num { text-align: right; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; background: #e8eef3; font-weight: 600; }
    .footer { margin-top: 24px; border-top: 1px solid #ddd; padding-top: 8px; font-size: 9px; color: #666; }
    .watermark {
      position: fixed; top: 40%; left: 10%; width: 80%; text-align: center;
      font-size: 72px; color: rgba(180, 0, 0, 0.18); transform: rotate(-30deg);
      font-weight: 700; letter-spacing: 8px; z-index: 0; pointer-events: none;
    }
    .content { position: relative; z-index: 1; }
  </style>
</head>
<body>
  ${watermark}
  <div class="content">
    <div class="header">
      <div>
        <div class="company">${esc(input.companyName)}</div>
        <div class="meta">${esc(input.directionLabel)}</div>
      </div>
      ${logo}
    </div>
    <h1>${esc(input.title)}</h1>
    <div class="meta">
      <strong>${esc(input.docNumber)}</strong>
      &nbsp;·&nbsp; Status: <span class="badge">${esc(input.status)}</span>
    </div>
    <table class="meta-table">
      ${row("Warehouse", `${input.warehouseCode} — ${input.warehouseName}`)}
      ${row("Party", input.partyName)}
      ${row("Job", input.jobRef)}
      ${row("ASN", input.asnNumber)}
      ${row(input.primaryDateLabel, input.primaryDate)}
      ${row("Created", input.createdAt)}
      ${row("Posted", input.postedAt)}
      ${row("Stock note", input.stockNote)}
      ${row("Remarks", input.remarks)}
    </table>
    <table class="lines">
      <thead>
        <tr>
          <th>#</th>
          <th>Item code</th>
          <th>Item name</th>
          <th>Qty</th>
          <th>UOM</th>
          <th>Lot / batch</th>
        </tr>
      </thead>
      <tbody>
        ${linesHtml || `<tr><td colspan="6">No lines</td></tr>`}
      </tbody>
    </table>
    <div class="footer">
      Generated ${esc(input.generatedAt)} · Document ID ${esc(input.documentId)}
    </div>
  </div>
</body>
</html>`;
}

export function formatPdfDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ") + " UTC";
}
