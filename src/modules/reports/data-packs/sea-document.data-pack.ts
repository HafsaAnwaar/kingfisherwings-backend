import { BadRequestException, Injectable } from "@nestjs/common";
import { ReportContextLoaders } from "../helpers/report-context-loaders";
import { brandingLogoSrc } from "../helpers/report-branding.helper";
import { ReportDataset } from "../types/report.types";

type Params = Record<string, unknown>;
type Ctx = { job_id?: string };

const DOC_KEYS = new Set([
  "sea.hbl_draft",
  "sea.hbl_original",
  "sea.arrival_notice",
  "sea.delivery_order",
  "sea.cargo_manifest",
  "sea.stuffing_report",
  "sea.letter_shell",
]);

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
export class SeaDocumentDataPackService {
  constructor(private readonly loaders: ReportContextLoaders) {}

  supports(rendererKey: string): boolean {
    return DOC_KEYS.has(rendererKey);
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
    const { job, branding, bank } = ctx;
    const generated_at = new Date().toISOString();
    const logo = brandingLogoSrc(branding);

    const sea = job.sea_fcl_details ?? job.sea_lcl_details;
    const containers = (ctx.containers ?? [])
      .map((c) => c.container_number)
      .filter(Boolean)
      .join(", ");
    const containerRows = (ctx.containers ?? []).map((c) => ({
      container_no: c.container_number ?? "",
      seal: c.seal_number ?? "",
      type: (c as { container_type?: string | null }).container_type ?? "",
      gross_weight: c.gross_weight != null ? String(c.gross_weight) : "",
      cbm: c.cbm != null ? String(c.cbm) : "",
    }));

    const pol =
      ctx.origin_port?.un_locode ||
      ctx.origin_port?.name ||
      sea?.place_of_receipt ||
      "";
    const pod =
      ctx.dest_port?.un_locode ||
      ctx.dest_port?.name ||
      sea?.place_of_delivery ||
      "";

    const letterKind = String(
      parameters.letter_kind ?? parameters.template_code ?? "LETTER",
    )
      .replace(/_/g, " ")
      .toUpperCase();

    const payload = {
      job_number: job.job_number,
      hbl_number: ctx.hbl_number ?? "",
      mbl_number: ctx.mbl_number ?? "",
      doc_ref: ctx.hbl_number || job.job_number,
      shipper: partyBlock(ctx.shipper),
      consignee: partyBlock(ctx.consignee),
      notify: partyBlock(ctx.notify),
      shipper_name: ctx.shipper?.name ?? "",
      consignee_name: ctx.consignee?.name ?? "",
      pol,
      pod,
      place_of_receipt: sea?.place_of_receipt ?? pol,
      place_of_delivery: sea?.place_of_delivery ?? pod,
      vessel_voyage: [ctx.vessel_name, ctx.voyage_number]
        .filter(Boolean)
        .join(" / "),
      vessel_name: ctx.vessel_name ?? "",
      voyage_number: ctx.voyage_number ?? "",
      etd: job.etd?.toISOString().slice(0, 10) ?? "",
      eta: job.eta?.toISOString().slice(0, 10) ?? "",
      containers: containers || "—",
      container_rows: containerRows,
      commodity: job.commodity ?? "",
      pieces: job.pieces != null ? String(job.pieces) : "",
      gross_weight:
        job.gross_weight != null ? String(job.gross_weight) : "",
      volume_cbm: job.volume_cbm != null ? String(job.volume_cbm) : "",
      letter_kind: letterKind,
      letter_body: String(
        parameters.letter_body ??
          "Please find attached the referenced shipping document for your action.",
      ),
      company_logo: logo,
      company_name: branding.legal_name || branding.company_name,
      company_address: branding.address ?? "",
      company_phone: branding.phone ?? "",
      company_email: branding.email ?? "",
      company_vat: branding.vat_number ?? branding.gstin ?? "",
      company_web: branding.website ?? "",
      bank,
      is_draft: rendererKey === "sea.hbl_draft",
      is_original: rendererKey === "sea.hbl_original",
    };

    const titles: Record<string, string> = {
      "sea.hbl_draft": "HBL Draft",
      "sea.hbl_original": "HBL Original",
      "sea.arrival_notice": "Arrival Notice",
      "sea.delivery_order": "Delivery Order",
      "sea.cargo_manifest": "Cargo Manifest",
      "sea.stuffing_report": "Stuffing Report",
      "sea.letter_shell": letterKind,
    };

    return {
      kind: "document",
      title: titles[rendererKey] ?? "Sea Document",
      template_key: rendererKey,
      payload,
      branding,
      generated_at,
    };
  }
}
