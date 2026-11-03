import { BadRequestException, Injectable } from "@nestjs/common";
import { ReportContextLoaders } from "../helpers/report-context-loaders";
import { brandingLogoSrc } from "../helpers/report-branding.helper";
import { ReportDataset } from "../types/report.types";

type Params = Record<string, unknown>;
type Ctx = { job_id?: string };

function partyBlock(
  p: {
    name?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null,
): string {
  if (!p) return "";
  return [p.name, p.address, p.city, p.phone, p.email].filter(Boolean).join("\n");
}

@Injectable()
export class AirDocsDataPackService {
  constructor(private readonly loaders: ReportContextLoaders) {}

  supports(rendererKey: string): boolean {
    return rendererKey.startsWith("air.");
  }

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Params,
    context?: Ctx,
  ): Promise<ReportDataset> {
    const ctx = await this.loaders.loadJobDocumentContext(
      tenantId,
      parameters,
      context as Params,
    );
    const { job, branding } = ctx;
    if (!job.air_details) {
      throw new BadRequestException("Job has no air details");
    }
    const generated_at = new Date().toISOString();
    const logo = brandingLogoSrc(branding);
    const air = job.air_details;

    const payload = {
      job_number: job.job_number,
      hawb_number: ctx.hawb_number ?? air.hawb_number ?? "",
      mawb_number: ctx.mawb_number ?? air.mawb_number ?? "",
      flight: ctx.flight_number ?? air.flight_number ?? "",
      shipper: partyBlock(ctx.shipper),
      consignee: partyBlock(ctx.consignee),
      shipper_name: ctx.shipper?.name ?? "",
      consignee_name: ctx.consignee?.name ?? "",
      origin:
        ctx.origin_airport?.iata_code || ctx.origin_airport?.name || "",
      dest: ctx.dest_airport?.iata_code || ctx.dest_airport?.name || "",
      eta: job.eta?.toISOString().slice(0, 10) ?? "",
      etd: job.etd?.toISOString().slice(0, 10) ?? "",
      commodity: job.commodity ?? "",
      pieces: job.pieces != null ? String(job.pieces) : "",
      gross_weight:
        job.gross_weight != null ? String(job.gross_weight) : "",
      chargeable_weight:
        job.chargeable_weight != null ? String(job.chargeable_weight) : "",
      company_logo: logo,
      company_name: branding.legal_name || branding.company_name,
      company_address: branding.address ?? "",
      company_phone: branding.phone ?? "",
      company_email: branding.email ?? "",
      company_vat: branding.vat_number ?? branding.gstin ?? "",
      is_draft: rendererKey === "air.hawb_draft",
    };

    const titles: Record<string, string> = {
      "air.hawb_draft": "HAWB Draft",
      "air.hawb_final": "HAWB Final",
      "air.mawb": "MAWB",
      "air.mawb_draft": "MAWB Draft",
      "air.arrival_notice": "Air Arrival Notice",
      "air.delivery_order": "Air Delivery Order",
    };
    if (!titles[rendererKey]) {
      throw new BadRequestException(`Unsupported air renderer: ${rendererKey}`);
    }

    return {
      kind: "document",
      title: titles[rendererKey],
      template_key: rendererKey === "air.mawb_draft" ? "air.mawb" : rendererKey,
      payload,
      branding,
      generated_at,
    };
  }
}
