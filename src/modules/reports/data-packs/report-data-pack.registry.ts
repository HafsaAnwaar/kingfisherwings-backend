import { BadRequestException, Injectable } from "@nestjs/common";
import { OpsListDataPackService } from "./ops-list.data-pack";
import { SeaDocsDataPackService } from "./sea-docs.data-pack";
import { SeaDocumentDataPackService } from "./sea-document.data-pack";
import { CommercialDataPackService } from "./commercial/commercial.data-pack";
import { AirDocsDataPackService } from "./air-docs.data-pack";
import { QuotationDataPackService } from "./quotation.data-pack";
import { FinanceDataPackService } from "./finance.data-pack";
import { WmsDataPackService } from "./wms.data-pack";
import { ReportDataset } from "../types/report.types";

/** Implemented Puppeteer/Excel packs (Jasper equivalent). Not JRXML upload. */
export const IMPLEMENTED_RENDERER_KEYS = [
  "ops.jobs_list",
  "ops.list_generic",
  "ops.eta_followup",
  "ops.etd_followup",
  "ops.manifest_status",
  "ops.pending_draft_bl",
  "ops.pending_docs",
  "ops.customs_clearance_list",
  "ops.open_jobs_by_branch",
  "ops.salesperson_jobs_list",
  "ops.delivered_jobs_period",
  "sea.arrival_notice_list",
  "sea.cargo_manifest_list",
  "sea.stuffing_report_list",
  "sea.sailing_confirmation_list",
  "sea.booking_confirmation_list",
  "sea.container_load_list",
  "sea.pre_alert_list",
  "sea.hbl_draft_list",
  "sea.hbl_draft",
  "sea.hbl_original",
  "sea.arrival_notice",
  "sea.delivery_order",
  "air.hawb_draft",
  "air.hawb_final",
  "air.mawb",
  "air.arrival_notice",
  "air.delivery_order",
  "quotation.standard",
  "commercial.invoice_tax_india_1",
  "commercial.invoice_tax_india_2",
  "commercial.invoice_summary_india",
  "finance.aging",
  "finance.soa",
  "finance.trial_balance",
  "finance.voucher",
  "finance.outstanding_letter",
  "wms.asn",
  "wms.warehouse_note",
] as const;

export type ImplementedRendererKey = (typeof IMPLEMENTED_RENDERER_KEYS)[number];

export type RendererFamily =
  | "ops_list"
  | "sea_docs"
  | "air_docs"
  | "commercial"
  | "finance"
  | "wms"
  | "quotation"
  | "other";

function familyForKey(renderer_key: string): RendererFamily {
  if (renderer_key.startsWith("ops.")) return "ops_list";
  if (renderer_key.startsWith("sea.")) return "sea_docs";
  if (renderer_key.startsWith("air.")) return "air_docs";
  if (renderer_key.startsWith("commercial.")) return "commercial";
  if (renderer_key.startsWith("finance.")) return "finance";
  if (renderer_key.startsWith("wms.")) return "wms";
  if (renderer_key.startsWith("quotation.")) return "quotation";
  return "other";
}

@Injectable()
export class ReportDataPackRegistry {
  constructor(
    private readonly ops: OpsListDataPackService,
    private readonly sea: SeaDocsDataPackService,
    private readonly seaDocs: SeaDocumentDataPackService,
    private readonly commercial: CommercialDataPackService,
    private readonly air: AirDocsDataPackService,
    private readonly quotation: QuotationDataPackService,
    private readonly finance: FinanceDataPackService,
    private readonly wms: WmsDataPackService,
  ) {}

  listImplemented(): Array<{
    renderer_key: string;
    family: RendererFamily;
  }> {
    return IMPLEMENTED_RENDERER_KEYS.map((renderer_key) => ({
      renderer_key,
      family: familyForKey(renderer_key),
    }));
  }

  isImplemented(rendererKey: string): boolean {
    return (IMPLEMENTED_RENDERER_KEYS as readonly string[]).includes(
      rendererKey,
    );
  }

  assertImplemented(rendererKey: string): void {
    if (rendererKey.startsWith("pending.")) {
      throw new BadRequestException(
        `renderer_key cannot be pending.* (${rendererKey}). Choose an implemented pack from GET /reports/templates/renderers.`,
      );
    }
    if (!this.isImplemented(rendererKey)) {
      throw new BadRequestException(
        `Unknown renderer_key "${rendererKey}". Use GET /reports/templates/renderers for implemented packs.`,
      );
    }
  }

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Record<string, unknown>,
    context?: {
      job_id?: string;
      quotation_id?: string;
      invoice_id?: string;
      party_id?: string;
    },
  ): Promise<ReportDataset> {
    this.assertImplemented(rendererKey);
    if (this.seaDocs.supports(rendererKey)) {
      return this.seaDocs.load(tenantId, rendererKey, parameters, context);
    }
    if (this.commercial.supports(rendererKey)) {
      return this.commercial.load(tenantId, rendererKey, parameters, context);
    }
    if (this.air.supports(rendererKey)) {
      return this.air.load(tenantId, rendererKey, parameters, context);
    }
    if (this.quotation.supports(rendererKey)) {
      return this.quotation.load(tenantId, rendererKey, parameters, context);
    }
    if (this.finance.supports(rendererKey)) {
      return this.finance.load(tenantId, rendererKey, parameters, context);
    }
    if (this.wms.supports(rendererKey)) {
      return this.wms.load(tenantId, rendererKey, parameters);
    }
    if (this.sea.supports(rendererKey)) {
      return this.sea.load(tenantId, rendererKey, parameters, context);
    }
    if (rendererKey.startsWith("ops.")) {
      return this.ops.load(tenantId, rendererKey, parameters);
    }
    throw new BadRequestException(`Unsupported report renderer: ${rendererKey}`);
  }
}
