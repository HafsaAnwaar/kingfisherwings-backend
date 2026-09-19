import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { loadReportBranding } from "../helpers/report-branding.helper";
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

@Injectable()
export class SeaDocumentDataPackService {
  constructor(private readonly prisma: PrismaService) {}

  supports(rendererKey: string): boolean {
    return DOC_KEYS.has(rendererKey);
  }

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Params,
    context?: Ctx,
  ): Promise<ReportDataset> {
    const jobId = String(parameters.job_id ?? context?.job_id ?? "").trim();
    if (!jobId) {
      throw new BadRequestException(
        "job_id is required (parameters.job_id or context.job_id)",
      );
    }

    const branding = await loadReportBranding(this.prisma, tenantId);
    const generated_at = new Date().toISOString();

    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: {
          job_number: true,
          shipper_id: true,
          consignee_id: true,
          commodity: true,
          etd: true,
          eta: true,
          origin_port_id: true,
          dest_port_id: true,
          sea_fcl_details: {
            select: {
              hbl_number: true,
              mbl_number: true,
              voyage_number: true,
              vessel_id: true,
              port_of_loading_id: true,
              port_of_discharge_id: true,
              place_of_receipt: true,
              place_of_delivery: true,
              containers: {
                where: { deleted_at: null },
                select: {
                  container_number: true,
                  seal_number: true,
                  gross_weight: true,
                  cbm: true,
                },
              },
            },
          },
          sea_lcl_details: {
            select: {
              hbl_number: true,
              mbl_number: true,
              voyage_number: true,
              vessel_id: true,
              port_of_loading_id: true,
              port_of_discharge_id: true,
              place_of_receipt: true,
              place_of_delivery: true,
            },
          },
          nvocc_details: {
            select: { hbl_number: true, mbl_number: true },
          },
        },
      }),
    );
    if (!job) {
      throw new BadRequestException("job_id not found in tenant");
    }

    const partyIds = [job.shipper_id, job.consignee_id].filter(
      Boolean,
    ) as string[];
    const sea = job.sea_fcl_details ?? job.sea_lcl_details;
    const portIds = [
      job.origin_port_id,
      job.dest_port_id,
      sea?.port_of_loading_id,
      sea?.port_of_discharge_id,
    ].filter(Boolean) as string[];
    const vesselId = sea?.vessel_id;

    const [parties, ports, vessel] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          partyIds.length
            ? tx.party.findMany({
                where: { id: { in: partyIds }, tenant_id: tenantId },
                select: { id: true, name: true },
              })
            : [],
          portIds.length
            ? tx.port.findMany({
                where: { id: { in: portIds }, tenant_id: tenantId },
                select: { id: true, un_locode: true },
              })
            : [],
          vesselId
            ? tx.vessel.findFirst({
                where: { id: vesselId, tenant_id: tenantId },
                select: { name: true },
              })
            : null,
        ]),
    );
    const partyMap = new Map(parties.map((p) => [p.id, p.name]));
    const portMap = new Map(ports.map((p) => [p.id, p.un_locode]));

    const hbl =
      sea?.hbl_number || job.nvocc_details?.hbl_number || "";
    const mbl =
      sea?.mbl_number || job.nvocc_details?.mbl_number || "";
    const containers = (job.sea_fcl_details?.containers ?? [])
      .map((c) => c.container_number)
      .filter(Boolean)
      .join(", ");
    const containerRows = (job.sea_fcl_details?.containers ?? []).map((c) => ({
      container_no: c.container_number ?? "",
      seal: c.seal_number ?? "",
      gross_weight: c.gross_weight != null ? String(c.gross_weight) : "",
      cbm: c.cbm != null ? String(c.cbm) : "",
    }));

    const pol =
      (sea?.port_of_loading_id
        ? portMap.get(sea.port_of_loading_id)
        : undefined) ||
      (job.origin_port_id ? portMap.get(job.origin_port_id) : "") ||
      "";
    const pod =
      (sea?.port_of_discharge_id
        ? portMap.get(sea.port_of_discharge_id)
        : undefined) ||
      (job.dest_port_id ? portMap.get(job.dest_port_id) : "") ||
      "";

    const letterKind = String(parameters.letter_kind ?? parameters.template_code ?? "LETTER")
      .replace(/_/g, " ")
      .toUpperCase();

    const payload = {
      job_number: job.job_number,
      hbl_number: hbl,
      mbl_number: mbl,
      doc_ref: hbl || job.job_number,
      shipper: job.shipper_id ? partyMap.get(job.shipper_id) : "",
      consignee: job.consignee_id ? partyMap.get(job.consignee_id) : "",
      pol,
      pod,
      place_of_receipt: sea?.place_of_receipt ?? pol,
      place_of_delivery: sea?.place_of_delivery ?? pod,
      vessel_voyage: [vessel?.name, sea?.voyage_number]
        .filter(Boolean)
        .join(" / "),
      etd: job.etd?.toISOString().slice(0, 10) ?? "",
      eta: job.eta?.toISOString().slice(0, 10) ?? "",
      containers: containers || "—",
      container_rows: containerRows,
      commodity: job.commodity ?? "",
      letter_kind: letterKind,
      letter_body: String(
        parameters.letter_body ??
          "Please find attached the referenced shipping document for your action.",
      ),
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
