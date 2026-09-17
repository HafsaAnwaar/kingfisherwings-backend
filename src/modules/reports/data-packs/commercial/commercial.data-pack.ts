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
] as const;

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
        rendererKey === "commercial.invoice_tax_india_2"
          ? "INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA"
          : rendererKey === "commercial.invoice_summary_india"
            ? "INVOICE_REPORT_FORMAT_SUMMARY_INDIA"
            : "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
    });

    const titles: Record<string, string> = {
      "commercial.invoice_tax_india_1": "Tax Invoice India — Format 1",
      "commercial.invoice_tax_india_2": "Tax Invoice India — Format 2",
      "commercial.invoice_summary_india": "Tax Invoice Summary — India",
    };

    return {
      kind: "document",
      title: titles[rendererKey] ?? "Commercial Invoice",
      template_key: rendererKey,
      payload: data as unknown as Record<string, unknown>,
      branding,
      generated_at,
    };
  }
}
