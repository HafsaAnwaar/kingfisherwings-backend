import { BadRequestException, Injectable } from "@nestjs/common";
import { OpsListDataPackService } from "./ops-list.data-pack";
import { SeaDocsDataPackService } from "./sea-docs.data-pack";
import { ReportDataset } from "../types/report.types";

@Injectable()
export class ReportDataPackRegistry {
  constructor(
    private readonly ops: OpsListDataPackService,
    private readonly sea: SeaDocsDataPackService,
  ) {}

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
    if (rendererKey.startsWith("pending.")) {
      throw new BadRequestException(
        `Template renderer is not implemented (${rendererKey}). Activate only after a data pack exists.`,
      );
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
