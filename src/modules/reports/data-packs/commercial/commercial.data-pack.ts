import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { loadReportBranding } from "../../helpers/report-branding.helper";
import { ReportDataset } from "../../types/report.types";
import { InvoiceFormatPayloadService } from "./invoice-format-payload.service";

type Params = Record<string, unknown>;
type Ctx = { invoice_id?: string };

const COMMERCIAL_KEYS = [
  "commercial.invoice_tax_india_1",
  "commercial.invoice_tax_india_2",
  "commercial.invoice_summary_india",
  "commercial.invoice_standard",
  "commercial.invoice_simple_india",
  "commercial.invoice_arabic",
  "commercial.invoice_usa",
  "commercial.invoice_warehouse",
] as const;

const TEMPLATE_CODES: Record<string, string> = {
  "commercial.invoice_tax_india_1":
    "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
  "commercial.invoice_tax_india_2":
    "INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA",
  "commercial.invoice_summary_india": "INVOICE_REPORT_FORMAT_SUMMARY_INDIA",
  "commercial.invoice_standard":
    "INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE",
  "commercial.invoice_simple_india":
    "INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA",
  "commercial.invoice_arabic":
    "INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC",
  "commercial.invoice_usa":
    "INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA",
  "commercial.invoice_warehouse":
    "INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE",
};

const TITLES: Record<string, string> = {
  "commercial.invoice_tax_india_1": "Tax Invoice India — Format 1",
  "commercial.invoice_tax_india_2": "Tax Invoice India — Format 2",
  "commercial.invoice_summary_india": "Tax Invoice Summary — India",
  "commercial.invoice_standard": "Standard Invoice",
  "commercial.invoice_simple_india": "Simple Invoice — India",
  "commercial.invoice_arabic": "Standard Invoice — Arabic",
  "commercial.invoice_usa": "Standard Invoice — USA",
  "commercial.invoice_warehouse": "Warehouse Invoice",
};

@Injectable()
export class CommercialDataPackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payload: InvoiceFormatPayloadService,
  ) {}

  supports(rendererKey: string): boolean {
    return rendererKey.startsWith("commercial.");
  }

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Params,
    context?: Ctx,
  ): Promise<ReportDataset> {
    if (!(COMMERCIAL_KEYS as readonly string[]).includes(rendererKey)) {
      throw new BadRequestException(
        `Unsupported commercial renderer: ${rendererKey}`,
      );
    }
    const invoiceId = String(
      parameters.invoice_id ?? context?.invoice_id ?? "",
    ).trim();
    if (!invoiceId) {
      throw new BadRequestException(
        "invoice_id is required (parameters.invoice_id or context.invoice_id)",
      );
    }

    const branding = await loadReportBranding(this.prisma, tenantId);
    const generated_at = new Date().toISOString();
    const data = await this.payload.build(tenantId, invoiceId, {
      format_key: rendererKey,
      template_code:
        TEMPLATE_CODES[rendererKey] ??
        "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
    });

    return {
      kind: "document",
      title: TITLES[rendererKey] ?? "Commercial Invoice",
      template_key: rendererKey,
      payload: data as unknown as Record<string, unknown>,
      branding,
      generated_at,
    };
  }
}
