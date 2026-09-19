import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { loadReportBranding } from "../helpers/report-branding.helper";
import { ReportDataset } from "../types/report.types";

type Params = Record<string, unknown>;
type Ctx = { job_id?: string };

const OTHER_KEYS = new Set([
  "other.booking_confirmation",
  "other.pre_alert",
]);

@Injectable()
export class OtherDataPackService {
  constructor(private readonly prisma: PrismaService) {}

  supports(rendererKey: string): boolean {
    return OTHER_KEYS.has(rendererKey);
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
          job_type: true,
          status: true,
          shipper_id: true,
          consignee_id: true,
          etd: true,
          eta: true,
          origin_port_id: true,
          dest_port_id: true,
          sea_fcl_details: {
            select: {
              voyage_number: true,
              vessel_id: true,
              hbl_number: true,
              mbl_number: true,
            },
          },
          air_details: {
            select: {
              flight_number: true,
              hawb_number: true,
              mawb_number: true,
            },
          },
        },
      }),
    );
    if (!job) throw new BadRequestException("job_id not found in tenant");

    const partyIds = [job.shipper_id, job.consignee_id].filter(
      Boolean,
    ) as string[];
    const parties = partyIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.party.findMany({
            where: { id: { in: partyIds }, tenant_id: tenantId },
            select: { id: true, name: true },
          }),
        )
      : [];
    const partyMap = new Map(parties.map((p) => [p.id, p.name]));

    const payload = {
      job_number: job.job_number,
      job_type: job.job_type,
      status: job.status,
      shipper: job.shipper_id ? partyMap.get(job.shipper_id) : "",
      consignee: job.consignee_id ? partyMap.get(job.consignee_id) : "",
      etd: job.etd?.toISOString().slice(0, 10) ?? "",
      eta: job.eta?.toISOString().slice(0, 10) ?? "",
      vessel_voyage: [
        job.sea_fcl_details?.voyage_number,
        job.air_details?.flight_number,
      ]
        .filter(Boolean)
        .join(" / "),
      bl_awb:
        job.sea_fcl_details?.hbl_number ||
        job.air_details?.hawb_number ||
        job.sea_fcl_details?.mbl_number ||
        job.air_details?.mawb_number ||
        "",
      notes: String(parameters.notes ?? ""),
    };

    if (rendererKey === "other.booking_confirmation") {
      return {
        kind: "document",
        title: "Booking Confirmation",
        template_key: "other.booking_confirmation",
        payload,
        branding,
        generated_at,
      };
    }

    return {
      kind: "document",
      title: "Pre-Alert",
      template_key: "other.pre_alert",
      payload,
      branding,
      generated_at,
    };
  }
}
