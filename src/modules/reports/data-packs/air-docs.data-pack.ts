import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { loadReportBranding } from "../helpers/report-branding.helper";
import { ReportDataset } from "../types/report.types";

type Params = Record<string, unknown>;
type Ctx = { job_id?: string; quotation_id?: string };

@Injectable()
export class AirDocsDataPackService {
  constructor(private readonly prisma: PrismaService) {}

  supports(rendererKey: string): boolean {
    return rendererKey.startsWith("air.");
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
          eta: true,
          air_details: {
            select: {
              hawb_number: true,
              mawb_number: true,
              flight_number: true,
              origin_airport_id: true,
              dest_airport_id: true,
            },
          },
        },
      }),
    );
    if (!job) throw new BadRequestException("job_id not found in tenant");
    if (!job.air_details) {
      throw new BadRequestException("Job has no air details");
    }

    const partyIds = [job.shipper_id, job.consignee_id].filter(
      Boolean,
    ) as string[];
    const airportIds = [
      job.air_details.origin_airport_id,
      job.air_details.dest_airport_id,
    ].filter(Boolean) as string[];

    const [parties, airports] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          partyIds.length
            ? tx.party.findMany({
                where: { id: { in: partyIds }, tenant_id: tenantId },
                select: { id: true, name: true },
              })
            : [],
          airportIds.length
            ? tx.airport.findMany({
                where: { id: { in: airportIds }, tenant_id: tenantId },
                select: { id: true, iata_code: true },
              })
            : [],
        ]),
    );
    const partyMap = new Map(parties.map((p) => [p.id, p.name]));
    const airMap = new Map(airports.map((a) => [a.id, a.iata_code]));

    const payload = {
      job_number: job.job_number,
      hawb_number: job.air_details.hawb_number ?? "",
      mawb_number: job.air_details.mawb_number ?? "",
      flight: job.air_details.flight_number ?? "",
      shipper: job.shipper_id ? partyMap.get(job.shipper_id) : "",
      consignee: job.consignee_id ? partyMap.get(job.consignee_id) : "",
      origin: job.air_details.origin_airport_id
        ? airMap.get(job.air_details.origin_airport_id)
        : "",
      dest: job.air_details.dest_airport_id
        ? airMap.get(job.air_details.dest_airport_id)
        : "",
      eta: job.eta?.toISOString().slice(0, 10) ?? "",
    };

    const titles: Record<string, string> = {
      "air.hawb_draft": "HAWB Draft",
      "air.hawb_final": "HAWB Final",
      "air.mawb": "MAWB",
      "air.arrival_notice": "Air Arrival Notice",
      "air.delivery_order": "Air Delivery Order",
    };
    if (!titles[rendererKey]) {
      throw new BadRequestException(`Unsupported air renderer: ${rendererKey}`);
    }

    return {
      kind: "document",
      title: titles[rendererKey],
      template_key:
        rendererKey === "air.hawb_final"
          ? "air.hawb_final"
          : rendererKey === "air.mawb"
            ? "air.mawb"
            : rendererKey === "air.arrival_notice"
              ? "air.arrival_notice"
              : rendererKey === "air.delivery_order"
                ? "air.delivery_order"
                : "air.hawb_draft",
      payload,
      branding,
      generated_at,
    };
  }
}
