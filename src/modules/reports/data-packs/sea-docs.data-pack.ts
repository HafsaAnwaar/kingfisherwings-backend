import { BadRequestException, Injectable } from "@nestjs/common";
import {
  DocumentType,
  JobStatus,
  JobType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { REPORT_ROW_LIMIT } from "../constants/reports.constants";
import { ReportDataset, ReportListRow } from "../types/report.types";

type Params = Record<string, unknown>;

const SEA_TYPES: JobType[] = [
  JobType.SEA_FCL_EXPORT,
  JobType.SEA_FCL_IMPORT,
  JobType.SEA_LCL_EXPORT,
  JobType.SEA_LCL_IMPORT,
  JobType.NVOCC_EXPORT,
  JobType.NVOCC_IMPORT,
];

const SEA_EXPORT: JobType[] = [
  JobType.SEA_FCL_EXPORT,
  JobType.SEA_LCL_EXPORT,
  JobType.NVOCC_EXPORT,
];

const JOB_COLUMNS = [
  { key: "job_number", label: "Job #" },
  { key: "job_type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "branch", label: "Branch" },
  { key: "etd", label: "ETD" },
  { key: "eta", label: "ETA" },
  { key: "hbl", label: "HBL" },
  { key: "vessel", label: "Vessel/Voyage" },
];

type JobRow = {
  job_number: string;
  job_type: string;
  status: string;
  etd: Date | null;
  eta: Date | null;
  branch_id: string | null;
  salesperson_id: string | null;
  sea_fcl_details?: {
    hbl_number: string | null;
    voyage_number: string | null;
    sailed_at: Date | null;
  } | null;
};

@Injectable()
export class SeaDocsDataPackService {
  constructor(private readonly prisma: PrismaService) {}

  supports(rendererKey: string): boolean {
    return rendererKey.startsWith("sea.");
  }

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Params,
    context?: { job_id?: string },
  ): Promise<ReportDataset> {
    const branding = await this.loadBranding(tenantId);
    const generated_at = new Date().toISOString();
    const titleMap: Record<string, string> = {
      "sea.arrival_notice_list": "Arrival Notice SEA List",
      "sea.cargo_manifest_list": "Cargo Manifest List",
      "sea.stuffing_report_list": "Stuffing Report List",
      "sea.sailing_confirmation_list": "Sailing Confirmation List",
      "sea.booking_confirmation_list": "Booking Confirmation List",
      "sea.container_load_list": "Container Load List",
      "sea.pre_alert_list": "Pre-Alert SEA List",
      "sea.hbl_draft_list": "HBL Draft List",
    };
    const title = titleMap[rendererKey];
    if (!title) {
      throw new BadRequestException(`Unsupported sea renderer: ${rendererKey}`);
    }

    if (rendererKey === "sea.container_load_list") {
      return {
        title,
        columns: [
          { key: "job_number", label: "Job #" },
          { key: "container_number", label: "Container" },
          { key: "seal_number", label: "Seal" },
          { key: "status", label: "Status" },
          { key: "gross_weight", label: "Gross wt" },
        ],
        rows: await this.containerLoadList(tenantId, parameters, context),
        branding,
        generated_at,
      };
    }

    return {
      title,
      columns: JOB_COLUMNS,
      rows: await this.seaJobs(tenantId, rendererKey, parameters, context),
      branding,
      generated_at,
    };
  }

  private async loadBranding(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        display_name: true,
        name: true,
        logo_url: true,
        address: true,
        vat_number: true,
        cr_number: true,
      },
    });
    return {
      company_name: tenant?.display_name || tenant?.name || "FreightSaas",
      logo_url: tenant?.logo_url ?? null,
      address: tenant?.address ?? null,
      vat_number: tenant?.vat_number ?? null,
      cr_number: tenant?.cr_number ?? null,
    };
  }

  private dateRange(params: Params) {
    const from = params.date_from ? new Date(String(params.date_from)) : undefined;
    const to = params.date_to ? new Date(String(params.date_to)) : undefined;
    return { from, to };
  }

  private async enrich(
    tenantId: string,
    jobs: JobRow[],
  ): Promise<ReportListRow[]> {
    const branchIds = [
      ...new Set(jobs.map((j) => j.branch_id).filter(Boolean) as string[]),
    ];
    const branches = branchIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.branch.findMany({
            where: { tenant_id: tenantId, id: { in: branchIds } },
            select: { id: true, name: true },
          }),
        )
      : [];
    const branchMap = new Map(branches.map((b) => [b.id, b.name]));

    return jobs.map((j) => ({
      job_number: j.job_number,
      job_type: j.job_type,
      status: j.status,
      branch: j.branch_id ? (branchMap.get(j.branch_id) ?? "") : "",
      etd: j.etd ? j.etd.toISOString().slice(0, 10) : "",
      eta: j.eta ? j.eta.toISOString().slice(0, 10) : "",
      hbl: j.sea_fcl_details?.hbl_number ?? "",
      vessel: j.sea_fcl_details?.voyage_number ?? "",
    }));
  }

  private async seaJobs(
    tenantId: string,
    rendererKey: string,
    params: Params,
    context?: { job_id?: string },
  ) {
    const { from, to } = this.dateRange(params);
    const jobId =
      (context?.job_id as string | undefined) ||
      (params.job_id ? String(params.job_id) : undefined);

    const where: Prisma.JobWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      job_type: { in: SEA_TYPES },
      ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
      ...(jobId ? { id: jobId } : {}),
    };

    switch (rendererKey) {
      case "sea.arrival_notice_list":
        where.eta = {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        };
        where.status = {
          notIn: [JobStatus.CANCELLED, JobStatus.COMPLETED],
        };
        break;
      case "sea.cargo_manifest_list":
        where.created_at = {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        };
        break;
      case "sea.stuffing_report_list":
        where.stuffing_records = { some: {} };
        if (from || to) {
          where.stuffing_records = {
            some: {
              stuffing_date: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            },
          };
        }
        break;
      case "sea.sailing_confirmation_list":
        where.job_type = { in: SEA_EXPORT };
        where.OR = [
          { sea_fcl_details: { is: { sailed_at: { not: null } } } },
          {
            etd: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          },
        ];
        break;
      case "sea.booking_confirmation_list":
        where.status = {
          in: [JobStatus.BOOKING_CONFIRMED, JobStatus.IN_PROGRESS],
        };
        if (from || to) {
          where.created_at = {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          };
        }
        break;
      case "sea.pre_alert_list":
        where.OR = [
          { pre_alert_scheduled_at: { not: null } },
          { pre_alert_sent_at: { not: null } },
        ];
        break;
      case "sea.hbl_draft_list":
        where.status = {
          notIn: [JobStatus.DELIVERED, JobStatus.COMPLETED, JobStatus.CANCELLED],
        };
        where.documents = {
          none: {
            document_type: {
              in: [DocumentType.HBL, DocumentType.HBL_EXPRESS_RELEASE],
            },
            is_finalized: true,
            deleted_at: null,
          },
        };
        if (from || to) {
          where.created_at = {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          };
        }
        break;
      default:
        break;
    }

    const jobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where,
        take: REPORT_ROW_LIMIT,
        orderBy: { created_at: "desc" },
        select: {
          job_number: true,
          job_type: true,
          status: true,
          etd: true,
          eta: true,
          branch_id: true,
          salesperson_id: true,
          sea_fcl_details: {
            select: {
              hbl_number: true,
              voyage_number: true,
              sailed_at: true,
            },
          },
        },
      }),
    );
    return this.enrich(tenantId, jobs);
  }

  private async containerLoadList(
    tenantId: string,
    params: Params,
    context?: { job_id?: string },
  ): Promise<ReportListRow[]> {
    const jobId =
      (context?.job_id as string | undefined) ||
      (params.job_id ? String(params.job_id) : undefined);
    const { from, to } = this.dateRange(params);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const jobs = await tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: SEA_TYPES },
          ...(jobId ? { id: jobId } : {}),
          ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
          ...(from || to
            ? {
                created_at: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              }
            : {}),
        },
        take: 200,
        select: {
          job_number: true,
          sea_fcl_details: {
            select: {
              containers: {
                select: {
                  container_number: true,
                  seal_number: true,
                  status: true,
                  gross_weight: true,
                },
              },
            },
          },
        },
      });

      const rows: ReportListRow[] = [];
      for (const j of jobs) {
        for (const c of j.sea_fcl_details?.containers ?? []) {
          rows.push({
            job_number: j.job_number,
            container_number: c.container_number ?? "",
            seal_number: c.seal_number ?? "",
            status: c.status,
            gross_weight: c.gross_weight?.toString() ?? "",
          });
          if (rows.length >= REPORT_ROW_LIMIT) return rows;
        }
      }
      return rows;
    });
  }
}
