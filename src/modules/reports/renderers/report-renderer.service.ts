import { Injectable } from "@nestjs/common";
import * as Handlebars from "handlebars";
import { stringify } from "csv-stringify/sync";
import { ReportFormat } from "@prisma/client";
import { PdfService } from "../../../shared/pdf/pdf.service";
import { ReportDataset } from "../types/report.types";
import { DOCUMENT_HTML_TEMPLATES } from "./document-templates";

/** Fresa MY REPORTS list shell — dark blue header band, black grid (not KF purple). */
const LIST_PDF_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #000; margin: 12px; }
    h1 { font-size: 16px; margin: 0 0 2px; }
    .banner { background: #1F4E79; color: #fff; padding: 8px 10px; margin-bottom: 10px; }
    .banner h1 { color: #fff; font-size: 15px; margin: 0; letter-spacing: 0.5px; }
    .meta { color: #333; margin-bottom: 8px; font-size: 9px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 3px 5px; text-align: left; }
    th { background: #1F4E79; color: #fff; font-weight: 700; font-size: 9px; }
    tr:nth-child(even) td { background: #DCE6F1; }
    .brand { margin-bottom: 8px; font-size: 9px; }
  </style>
</head>
<body>
  <div class="brand">
    <strong>{{branding.company_name}}</strong>
    {{#if branding.vat_number}} · VAT/GSTIN: {{branding.vat_number}}{{/if}}
    {{#if branding.address}} · {{branding.address}}{{/if}}
  </div>
  <div class="banner"><h1>{{title}}</h1></div>
  <div class="meta">Generated: {{generated_at}} · Rows: {{rowCount}}</div>
  <table>
    <thead>
      <tr>
        {{#each headers}}<th>{{this}}</th>{{/each}}
      </tr>
    </thead>
    <tbody>
      {{#each tableRows}}
      <tr>
        {{#each this}}<td>{{this}}</td>{{/each}}
      </tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>
`;

@Injectable()
export class ReportRendererService {
  constructor(private readonly pdf: PdfService) {}

  async render(
    format: ReportFormat,
    dataset: ReportDataset,
  ): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
    if (dataset.kind === "document") {
      if (format !== ReportFormat.PDF) {
        // Document shells are PDF-first; export a one-row summary for CSV/XLSX
        const flat = this.flattenPayload(dataset.payload);
        if (format === ReportFormat.CSV) {
          const csv = stringify([flat], { header: true });
          return {
            buffer: Buffer.from(csv, "utf8"),
            mimeType: "text/csv",
            extension: "csv",
          };
        }
        const ExcelJS = require("exceljs") as typeof import("exceljs");
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(
          dataset.title.slice(0, 31) || "Report",
        );
        sheet.addRow(Object.keys(flat));
        sheet.addRow(Object.values(flat));
        return {
          buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          extension: "xlsx",
        };
      }
      const source =
        DOCUMENT_HTML_TEMPLATES[dataset.template_key] ??
        DOCUMENT_HTML_TEMPLATES["document.generic"];
      const html = Handlebars.compile(source)({
        title: dataset.title,
        branding: dataset.branding,
        generated_at: dataset.generated_at,
        ...dataset.payload,
      });
      const buffer = await this.pdf.renderHtmlToPdf(html);
      return { buffer, mimeType: "application/pdf", extension: "pdf" };
    }

    // List datasets (default / legacy without kind)
    const list = dataset;
    if (format === ReportFormat.PDF) {
      const html = Handlebars.compile(LIST_PDF_TEMPLATE)({
        title: list.title,
        branding: list.branding,
        generated_at: list.generated_at,
        rowCount: list.rows.length,
        headers: list.columns.map((c) => c.label),
        tableRows: list.rows.map((row) =>
          list.columns.map((c) => String(row[c.key] ?? "")),
        ),
      });
      const buffer = await this.pdf.renderHtmlToPdf(html);
      return { buffer, mimeType: "application/pdf", extension: "pdf" };
    }

    if (format === ReportFormat.CSV) {
      const records = list.rows.map((row) => {
        const out: Record<string, string> = {};
        for (const col of list.columns) {
          out[col.label] = String(row[col.key] ?? "");
        }
        return out;
      });
      const csv = stringify(records, { header: true });
      return {
        buffer: Buffer.from(csv, "utf8"),
        mimeType: "text/csv",
        extension: "csv",
      };
    }

    const ExcelJS = require("exceljs") as typeof import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(list.title.slice(0, 31) || "Report");
    // Fresa MY REPORTS header band
    const titleRow = sheet.addRow([list.title]);
    titleRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    titleRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E79" },
    };
    sheet.mergeCells(1, 1, 1, Math.max(list.columns.length, 1));
    const header = sheet.addRow(list.columns.map((c) => c.label));
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E79" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    let r = 0;
    for (const row of list.rows) {
      const excelRow = sheet.addRow(list.columns.map((c) => row[c.key] ?? ""));
      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (r % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCE6F1" },
          };
        }
      });
      r++;
    }
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return {
      buffer,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx",
    };
  }

  private flattenPayload(
    payload: Record<string, unknown>,
  ): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (v == null) out[k] = "";
      else if (typeof v === "object") out[k] = JSON.stringify(v);
      else out[k] = String(v);
    }
    return out;
  }
}
