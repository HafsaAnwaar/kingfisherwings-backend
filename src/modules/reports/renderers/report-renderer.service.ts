import { Injectable } from "@nestjs/common";
import * as Handlebars from "handlebars";
import { stringify } from "csv-stringify/sync";
import { ReportFormat } from "@prisma/client";
import { PdfService } from "../../../shared/pdf/pdf.service";
import { ReportDataset } from "../types/report.types";

const LIST_PDF_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .meta { color: #555; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
    th { background: #f3f3f3; }
    .brand { margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="brand">
    <h1>{{branding.company_name}}</h1>
    {{#if branding.vat_number}}<div>VAT: {{branding.vat_number}}</div>{{/if}}
    {{#if branding.address}}<div>{{branding.address}}</div>{{/if}}
  </div>
  <h1>{{title}}</h1>
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
    if (format === ReportFormat.PDF) {
      const html = Handlebars.compile(LIST_PDF_TEMPLATE)({
        title: dataset.title,
        branding: dataset.branding,
        generated_at: dataset.generated_at,
        rowCount: dataset.rows.length,
        headers: dataset.columns.map((c) => c.label),
        tableRows: dataset.rows.map((row) =>
          dataset.columns.map((c) => String(row[c.key] ?? "")),
        ),
      });
      const buffer = await this.pdf.renderHtmlToPdf(html);
      return { buffer, mimeType: "application/pdf", extension: "pdf" };
    }

    if (format === ReportFormat.CSV) {
      const records = dataset.rows.map((row) => {
        const out: Record<string, string> = {};
        for (const col of dataset.columns) {
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

    // XLSX
    const ExcelJS = require("exceljs") as typeof import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(dataset.title.slice(0, 31) || "Report");
    sheet.addRow(dataset.columns.map((c) => c.label));
    for (const row of dataset.rows) {
      sheet.addRow(dataset.columns.map((c) => row[c.key] ?? ""));
    }
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return {
      buffer,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx",
    };
  }
}
