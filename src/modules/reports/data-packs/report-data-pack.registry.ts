import { BadRequestException, Injectable } from "@nestjs/common";
import { OpsListDataPackService } from "./ops-list.data-pack";
import { SeaDocsDataPackService } from "./sea-docs.data-pack";
import { ReportDataset } from "../types/report.types";

/** Implemented Puppeteer/Excel packs (Jasper equivalent). Not JRXML upload. */
export const IMPLEMENTED_RENDERER_KEYS = [
  "ops.jobs_list",
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
] as const;

export type ImplementedRendererKey = (typeof IMPLEMENTED_RENDERER_KEYS)[number];

@Injectable()
export class ReportDataPackRegistry {
  constructor(
    private readonly ops: OpsListDataPackService,
    private readonly sea: SeaDocsDataPackService,
  ) {}

  listImplemented(): Array<{
    renderer_key: string;
    family: "ops_list" | "sea_docs";
  }> {
    return IMPLEMENTED_RENDERER_KEYS.map((renderer_key) => ({
      renderer_key,
      family: renderer_key.startsWith("sea.") ? "sea_docs" : "ops_list",
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
    if (this.sea.supports(rendererKey)) {
      return this.sea.load(tenantId, rendererKey, parameters, context);
    }
    if (rendererKey.startsWith("ops.")) {
      return this.ops.load(tenantId, rendererKey, parameters);
    }
    throw new BadRequestException(`Unsupported report renderer: ${rendererKey}`);
  }
}
