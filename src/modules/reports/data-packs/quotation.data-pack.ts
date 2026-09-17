import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { loadReportBranding } from "../helpers/report-branding.helper";
import { ReportDataset } from "../types/report.types";

type Params = Record<string, unknown>;
type Ctx = { quotation_id?: string };

@Injectable()
export class QuotationDataPackService {
  constructor(private readonly prisma: PrismaService) {}

  supports(rendererKey: string): boolean {
    return rendererKey.startsWith("quotation.");
  }

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Params,
    context?: Ctx,
  ): Promise<ReportDataset> {
    if (rendererKey !== "quotation.standard") {
      throw new BadRequestException(
        `Unsupported quotation renderer: ${rendererKey}`,
      );
    }
    const quotationId = String(
      parameters.quotation_id ?? context?.quotation_id ?? "",
    ).trim();
    if (!quotationId) {
      throw new BadRequestException(
        "quotation_id is required (parameters.quotation_id or context.quotation_id)",
      );
    }

    const branding = await loadReportBranding(this.prisma, tenantId);
    const generated_at = new Date().toISOString();

    const quote = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: {
            orderBy: { sort_order: "asc" },
            take: 100,
          },
        },
      }),
    );
    if (!quote) {
      throw new BadRequestException("quotation_id not found in tenant");
    }

    const customer = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: quote.customer_id, tenant_id: tenantId },
        select: { name: true },
      }),
    );

    const revenueLines = quote.lines.filter((l) => !l.is_cost);

    return {
      kind: "document",
      title: "Quotation (catalog)",
      template_key: "quotation.standard",
      payload: {
        quote_number: quote.quotation_number,
        quote_date: quote.created_at.toISOString().slice(0, 10),
        status: quote.status,
        party_name: customer?.name ?? "",
        origin: "",
        dest: "",
        mode: quote.job_type,
        currency: quote.currency_code,
        total: String(quote.revenue_total ?? 0),
        lines: revenueLines.map((l) => ({
          description: l.description,
          amount: String(l.amount ?? 0),
        })),
      },
      branding,
      generated_at,
    };
  }
}
