import { BadRequestException, Injectable } from "@nestjs/common";
import {
  DocumentType,
  JobStatus,
  JobType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { REPORT_ROW_LIMIT } from "../constants/reports.constants";
import { loadReportBranding } from "../helpers/report-branding.helper";
import { ReportDataset, ReportListRow } from "../types/report.types";

type Params = Record<string, unknown>;

const TERMINAL: JobStatus[] = [
  JobStatus.DELIVERED,
  JobStatus.COMPLETED,
  JobStatus.CANCELLED,
];

const SEA_TYPES: JobType[] = [
  JobType.SEA_FCL_EXPORT,
  JobType.SEA_FCL_IMPORT,
  JobType.SEA_LCL_EXPORT,
  JobType.SEA_LCL_IMPORT,
  JobType.NVOCC_EXPORT,
  JobType.NVOCC_IMPORT,
];

const JOB_COLUMNS = [
  { key: "job_number", label: "Job #" },
  { key: "job_type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "branch", label: "Branch" },
  { key: "etd", label: "ETD" },
  { key: "eta", label: "ETA" },
  { key: "salesperson", label: "Salesperson" },
];

type JobRow = {
  job_number: string;
  job_type: string;
  status: string;
  etd: Date | null;
  eta: Date | null;
  branch_id: string | null;
  salesperson_id: string | null;
};

@Injectable()
export class OpsListDataPackService {
  constructor(private readonly prisma: PrismaService) {}

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Params,
  ): Promise<ReportDataset> {
    const branding = await this.loadBranding(tenantId);
    const generated_at = new Date().toISOString();

    switch (rendererKey) {
      case "ops.jobs_list":
        return {
          title: "Jobs List",
          columns: JOB_COLUMNS,
          rows: await this.jobsList(tenantId, parameters),
          branding,
          generated_at,
        };
      case "ops.list_generic":
        return {
          title: String(parameters.title ?? parameters.template_code ?? "Operations List"),
          columns: JOB_COLUMNS,
          rows: await this.jobsListOptionalDates(tenantId, parameters),
          branding,
          generated_at,
        };
      case "ops.eta_followup":
        return {
          title: "ETA Follow-up",
          columns: JOB_COLUMNS,
          rows: await this.dateFollowup(tenantId, "eta", parameters),
          branding,
          generated_at,
        };
      case "ops.etd_followup":
        return {
          title: "ETD Follow-up",
          columns: JOB_COLUMNS,
          rows: await this.dateFollowup(tenantId, "etd", parameters),
          branding,
          generated_at,
        };
      case "ops.manifest_status":
        return {
          title: "Manifest Status",
          columns: [
            { key: "edi_type", label: "EDI Type" },
            { key: "status", label: "Status" },
            { key: "reference", label: "Reference" },
            { key: "created_at", label: "Created" },
          ],
          rows: await this.manifestStatus(tenantId, parameters),
          branding,
          generated_at,
        };
      case "ops.pending_draft_bl":
        return {
          title: "Pending Draft BL",
          columns: JOB_COLUMNS,
          rows: await this.pendingDraftBl(tenantId, parameters),
          branding,
          generated_at,
        };
      case "ops.pending_docs":
        return {
          title: "Pending Documents",
          columns: JOB_COLUMNS,
          rows: await this.byStatus(tenantId, JobStatus.DOCS_PENDING, parameters),
          branding,
          generated_at,
        };
      case "ops.customs_clearance_list":
        return {
          title: "Customs Clearance List",
          columns: JOB_COLUMNS,
          rows: await this.byStatus(
            tenantId,
            JobStatus.CUSTOMS_CLEARANCE,
            parameters,
          ),
          branding,
          generated_at,
        };
      case "ops.open_jobs_by_branch":
        return {
          title: "Open Jobs by Branch",
          columns: JOB_COLUMNS,
          rows: await this.openJobs(tenantId, parameters),
          branding,
          generated_at,
        };
      case "ops.salesperson_jobs_list":
        return {
          title: "Salesperson Jobs List",
          columns: JOB_COLUMNS,
          rows: await this.salespersonJobs(tenantId, parameters),
          branding,
          generated_at,
        };
      case "ops.delivered_jobs_period":
        return {
          title: "Delivered Jobs (Period)",
          columns: JOB_COLUMNS,
          rows: await this.deliveredJobs(tenantId, parameters),
          branding,
          generated_at,
        };
      default:
        throw new BadRequestException(
          `Unsupported report renderer: ${rendererKey}`,
        );
    }
  }

  private async loadBranding(tenantId: string) {
    return loadReportBranding(this.prisma, tenantId);
  }

  private async jobsListOptionalDates(tenantId: string, params: Params) {
    const from = params.date_from ? new Date(String(params.date_from)) : undefined;
    const to = params.date_to ? new Date(String(params.date_to)) : undefined;
    const jobs = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(from || to
          ? {
              created_at: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
        ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
        ...(params.status ? { status: params.status as JobStatus } : {}),
        ...(params.job_type ? { job_type: params.job_type as JobType } : {}),
      };
      return tx.job.findMany({
        where,
        take: REPORT_ROW_LIMIT,
        orderBy: { created_at: "desc" },
        select: this.jobSelect,
      });
    });
    return this.enrichJobs(tenantId, jobs);
  }

  private requireDates(params: Params, required: boolean) {
    const from = params.date_from ? String(params.date_from) : null;
    const to = params.date_to ? String(params.date_to) : null;
    if (required && (!from || !to)) {
      throw new BadRequestException("date_from and date_to are required");
    }
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };
  }

  private async enrichJobs(
    tenantId: string,
    jobs: JobRow[],
  ): Promise<ReportListRow[]> {
    const branchIds = [
      ...new Set(jobs.map((j) => j.branch_id).filter(Boolean) as string[]),
    ];
    const salesIds = [
      ...new Set(jobs.map((j) => j.salesperson_id).filter(Boolean) as string[]),
    ];

    const [branches, users] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          branchIds.length
            ? tx.branch.findMany({
                where: { tenant_id: tenantId, id: { in: branchIds } },
                select: { id: true, name: true },
              })
            : Promise.resolve([]),
          salesIds.length
            ? tx.user.findMany({
                where: { tenant_id: tenantId, id: { in: salesIds } },
                select: { id: true, first_name: true, last_name: true },
              })
            : Promise.resolve([]),
        ]),
    );

    const branchMap = new Map(branches.map((b) => [b.id, b.name]));
    const salesMap = new Map(
      users.map((u) => [u.id, `${u.first_name} ${u.last_name}`.trim()]),
    );

    return jobs.map((j) => ({
      job_number: j.job_number,
      job_type: j.job_type,
      status: j.status,
      branch: j.branch_id ? (branchMap.get(j.branch_id) ?? "") : "",
      etd: j.etd ? j.etd.toISOString().slice(0, 10) : "",
      eta: j.eta ? j.eta.toISOString().slice(0, 10) : "",
      salesperson: j.salesperson_id
        ? (salesMap.get(j.salesperson_id) ?? "")
        : "",
    }));
  }

  private jobSelect = {
    job_number: true,
    job_type: true,
    status: true,
    etd: true,
    eta: true,
    branch_id: true,
    salesperson_id: true,
  } as const;

  private async jobsList(tenantId: string, params: Params) {
    const { from, to } = this.requireDates(params, true);
    const jobs = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        created_at: { gte: from, lte: to },
        ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
        ...(params.status ? { status: params.status as JobStatus } : {}),
        ...(params.job_type ? { job_type: params.job_type as JobType } : {}),
      };
      return tx.job.findMany({
        where,
        take: REPORT_ROW_LIMIT,
        orderBy: { created_at: "desc" },
        select: this.jobSelect,
      });
    });
    return this.enrichJobs(tenantId, jobs);
  }

  private async dateFollowup(
    tenantId: string,
    field: "eta" | "etd",
    params: Params,
  ) {
    const { from, to } = this.requireDates(params, true);
    const jobs = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        status: { notIn: [JobStatus.COMPLETED, JobStatus.CANCELLED] },
        [field]: { gte: from, lte: to },
        ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
      };
      return tx.job.findMany({
        where,
        take: REPORT_ROW_LIMIT,
        orderBy: { [field]: "asc" },
        select: this.jobSelect,
      });
    });
    return this.enrichJobs(tenantId, jobs);
  }

  private async manifestStatus(tenantId: string, params: Params) {
    const { from, to } = this.requireDates(params, false);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.DocumentationEdiSubmissionWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        edi_type: { in: ["BAYAN_MASTER", "BAYAN_HOUSE", "CGM"] },
        ...(from || to
          ? {
              created_at: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      };
      const rows = await tx.documentationEdiSubmission.findMany({
        where,
        take: REPORT_ROW_LIMIT,
        orderBy: { created_at: "desc" },
      });
      return rows.map((r) => ({
        edi_type: r.edi_type,
        status: r.status,
        reference: r.external_ref ?? r.reference_id,
        created_at: r.created_at.toISOString().slice(0, 19),
      }));
    });
  }

  private async pendingDraftBl(tenantId: string, params: Params) {
    const { from, to } = this.requireDates(params, false);
    const jobs = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        job_type: { in: SEA_TYPES },
        status: { notIn: TERMINAL },
        ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
        ...(from || to
          ? {
              created_at: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
        documents: {
          none: {
            document_type: {
              in: [DocumentType.HBL, DocumentType.HBL_EXPRESS_RELEASE],
            },
            is_finalized: true,
            deleted_at: null,
          },
        },
      };
      return tx.job.findMany({
        where,
        take: REPORT_ROW_LIMIT,
        orderBy: { created_at: "desc" },
        select: this.jobSelect,
      });
    });
    return this.enrichJobs(tenantId, jobs);
  }

  private async byStatus(
    tenantId: string,
    status: JobStatus,
    params: Params,
  ) {
    const jobs = await this.prisma.runWithTenant(tenantId, async (tx) =>
      tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status,
          ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
        },
        take: REPORT_ROW_LIMIT,
        orderBy: { updated_at: "desc" },
        select: this.jobSelect,
      }),
    );
    return this.enrichJobs(tenantId, jobs);
  }

  private async openJobs(tenantId: string, params: Params) {
    const jobs = await this.prisma.runWithTenant(tenantId, async (tx) =>
      tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: { notIn: TERMINAL },
          ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
        },
        take: REPORT_ROW_LIMIT,
        orderBy: [{ branch_id: "asc" }, { created_at: "desc" }],
        select: this.jobSelect,
      }),
    );
    return this.enrichJobs(tenantId, jobs);
  }

  private async salespersonJobs(tenantId: string, params: Params) {
    const { from, to } = this.requireDates(params, false);
    const jobs = await this.prisma.runWithTenant(tenantId, async (tx) =>
      tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...(params.salesperson_id
            ? { salesperson_id: String(params.salesperson_id) }
            : {}),
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
        take: REPORT_ROW_LIMIT,
        orderBy: { created_at: "desc" },
        select: this.jobSelect,
      }),
    );
    return this.enrichJobs(tenantId, jobs);
  }

  private async deliveredJobs(tenantId: string, params: Params) {
    const { from, to } = this.requireDates(params, true);
    const jobs = await this.prisma.runWithTenant(tenantId, async (tx) =>
      tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: { in: [JobStatus.DELIVERED, JobStatus.COMPLETED] },
          updated_at: { gte: from, lte: to },
          ...(params.branch_id ? { branch_id: String(params.branch_id) } : {}),
        },
        take: REPORT_ROW_LIMIT,
        orderBy: { updated_at: "desc" },
        select: this.jobSelect,
      }),
    );
    return this.enrichJobs(tenantId, jobs);
  }
}
