import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobPartyReferenceType, JobStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { JobsService } from "../jobs/jobs.service";
import { CreateJobDto } from "../jobs/dto/job.dto";
import {
  DocumentationJobsQueryDto,
  DocumentationCreateJobDto,
} from "./dto/documentation-jobs.dto";
import { PatchJobDocFieldsDto } from "./dto/documentation-doc-fields.dto";
import { paginated } from "./dto/documentation-pagination.dto";
import {
  jobTypeFilterFromVisible,
  resolveVisibleJobTypes,
} from "../../common/utils/job-type-access.util";
import { writableJobTypeWizard } from "../../common/utils/writable-job-type-wizard.util";

@Injectable()
export class DocumentationJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
  ) {}

  /**
   * Create-job wizard metadata. `services` is filtered to job types the
   * staffer can write (ops matrix). Unrestricted when no ops matrix.
   */
  createWizardMetadata(permissions: string[] = []) {
    const { services, writable_job_types } = writableJobTypeWizard(permissions);

    return {
      success: true,
      data: {
        steps: [
          {
            step: 1,
            title: "Department & Client",
            fields: ["department_id", "billing_party_id", "branch_id", "company_id"],
          },
          {
            step: 2,
            title: "Job Info",
            fields: [
              "job_type",
              "salesperson_id",
              "employee_or_agent",
              "origin_port_id",
              "dest_port_id",
              "etd",
              "eta",
            ],
          },
          {
            step: 3,
            title: "Container / Consignment",
            fields: [
              "container_type_id",
              "container_count",
              "commodity",
              "pieces",
              "gross_weight",
              "volume_cbm",
            ],
          },
          {
            step: 4,
            title: "Costing",
            fields: ["initial_charges"],
          },
          { step: 5, title: "Summary", fields: ["review"] },
        ],
        services,
        writable_job_types,
        salesperson_filter: { query: "GET /users?is_salesperson=true" },
      },
    };
  }

  async listJobs(
    tenantId: string,
    query: DocumentationJobsQueryDto,
    _permissions: string[] = [],
    role?: string | null,
    userId?: string | null,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const visible = await resolveVisibleJobTypes(tx, tenantId, userId, role);
      const jobTypeFilter = jobTypeFilterFromVisible(visible);
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(jobTypeFilter ? { job_type: jobTypeFilter } : {}),
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(query.department_id ? { department_id: query.department_id } : {}),
        ...(query.status ? { status: query.status as JobStatus } : {}),
        ...(query.billing_party_id
          ? { billing_party_id: query.billing_party_id }
          : {}),
        ...(query.from_date || query.to_date
          ? {
              job_date: {
                ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
                ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
              },
            }
          : {}),
        ...(query.search
          ? {
              OR: [
                {
                  job_number: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
                {
                  commodity: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      };

      const [rows, total] = await Promise.all([
        tx.job.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            sea_fcl_details: {
              select: { vgm_cutoff: true, voyage_number: true },
            },
            sea_lcl_details: {
              select: { voyage_number: true },
            },
            party_references: {
              where: {
                reference_type: {
                  in: [
                    JobPartyReferenceType.SABER,
                    JobPartyReferenceType.RA_CODE,
                  ],
                },
              },
              select: {
                reference_type: true,
                reference_no: true,
              },
            },
          },
        }),
        tx.job.count({ where }),
      ]);

      const enriched = rows.map((job) => {
        const refs = job.party_references ?? [];
        const saber = refs.find(
          (r) => r.reference_type === JobPartyReferenceType.SABER,
        );
        const ra = refs.find(
          (r) => r.reference_type === JobPartyReferenceType.RA_CODE,
        );
        const fcl = job.sea_fcl_details;
        const lcl = job.sea_lcl_details;
        const { party_references, sea_fcl_details, sea_lcl_details, ...rest } =
          job;
        return {
          ...rest,
          portnet_ref_no: job.portnet_ref_no ?? null,
          overseas_agent_id: job.overseas_agent_id ?? null,
          voyage_number:
            job.voyage_number ??
            fcl?.voyage_number ??
            lcl?.voyage_number ??
            null,
          vgm_cutoff_date: fcl?.vgm_cutoff ?? null,
          saber_certificate_no: saber?.reference_no ?? null,
          ra_code: ra?.reference_no ?? null,
        };
      });

      return paginated(enriched, page, limit, total);
    });
  }

  async patchDocFields(
    tenantId: string,
    jobId: string,
    dto: PatchJobDocFieldsDto,
    actorId?: string,
  ) {
    const keys = Object.keys(dto).filter(
      (k) => (dto as Record<string, unknown>)[k] !== undefined,
    );
    if (keys.length === 0) {
      throw new BadRequestException("Provide at least one documentation field.");
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          sea_fcl_details: { select: { id: true } },
          sea_lcl_details: { select: { id: true } },
        },
      });
      if (!job) throw new NotFoundException("Job not found.");

      if (dto.overseas_agent_party_id) {
        const party = await tx.party.findFirst({
          where: {
            id: dto.overseas_agent_party_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
          select: { id: true },
        });
        if (!party) {
          throw new BadRequestException(
            "overseas_agent_party_id not found in tenant.",
          );
        }
      }

      if (dto.vgm_cutoff_date !== undefined && !job.sea_fcl_details) {
        throw new BadRequestException(
          "vgm_cutoff_date applies only to sea FCL jobs.",
        );
      }

      await tx.job.update({
        where: { id: jobId },
        data: {
          ...(dto.portnet_ref_no !== undefined
            ? {
                portnet_ref_no:
                  dto.portnet_ref_no === null || dto.portnet_ref_no === ""
                    ? null
                    : dto.portnet_ref_no.trim(),
              }
            : {}),
          ...(dto.overseas_agent_party_id !== undefined
            ? { overseas_agent_id: dto.overseas_agent_party_id }
            : {}),
          ...(dto.voyage_number !== undefined
            ? {
                voyage_number:
                  dto.voyage_number === null || dto.voyage_number === ""
                    ? null
                    : dto.voyage_number.trim(),
              }
            : {}),
          updated_by: actorId,
        },
      });

      if (dto.voyage_number !== undefined || dto.vgm_cutoff_date !== undefined) {
        const voyage =
          dto.voyage_number === undefined
            ? undefined
            : dto.voyage_number === null || dto.voyage_number === ""
              ? null
              : dto.voyage_number.trim();
        const vgm =
          dto.vgm_cutoff_date === undefined
            ? undefined
            : dto.vgm_cutoff_date === null || dto.vgm_cutoff_date === ""
              ? null
              : new Date(dto.vgm_cutoff_date);

        if (job.sea_fcl_details) {
          await tx.seaFclJobDetail.update({
            where: { id: job.sea_fcl_details.id },
            data: {
              ...(voyage !== undefined ? { voyage_number: voyage } : {}),
              ...(vgm !== undefined ? { vgm_cutoff: vgm } : {}),
            },
          });
        }
        if (job.sea_lcl_details && voyage !== undefined) {
          await tx.seaLclJobDetail.update({
            where: { id: job.sea_lcl_details.id },
            data: { voyage_number: voyage },
          });
        }
      }

      await this.upsertPartyRef(
        tx,
        tenantId,
        jobId,
        JobPartyReferenceType.SABER,
        dto.saber_certificate_no,
        actorId,
      );
      await this.upsertPartyRef(
        tx,
        tenantId,
        jobId,
        JobPartyReferenceType.RA_CODE,
        dto.ra_code,
        actorId,
      );

      const refreshed = await tx.job.findFirst({
        where: { id: jobId },
        include: {
          sea_fcl_details: {
            select: { vgm_cutoff: true, voyage_number: true },
          },
          sea_lcl_details: {
            select: { voyage_number: true },
          },
          party_references: {
            where: {
              reference_type: {
                in: [
                  JobPartyReferenceType.SABER,
                  JobPartyReferenceType.RA_CODE,
                ],
              },
            },
            select: { reference_type: true, reference_no: true },
          },
        },
      });

      const fcl = refreshed?.sea_fcl_details;
      const lcl = refreshed?.sea_lcl_details;
      const saber = refreshed?.party_references.find(
        (r) => r.reference_type === JobPartyReferenceType.SABER,
      );
      const ra = refreshed?.party_references.find(
        (r) => r.reference_type === JobPartyReferenceType.RA_CODE,
      );

      return {
        success: true,
        data: {
          job_id: jobId,
          portnet_ref_no: refreshed?.portnet_ref_no ?? null,
          overseas_agent_party_id: refreshed?.overseas_agent_id ?? null,
          voyage_number:
            refreshed?.voyage_number ??
            fcl?.voyage_number ??
            lcl?.voyage_number ??
            null,
          vgm_cutoff_date: fcl?.vgm_cutoff ?? null,
          saber_certificate_no: saber?.reference_no ?? null,
          ra_code: ra?.reference_no ?? null,
        },
      };
    });
  }

  private async upsertPartyRef(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    referenceType: JobPartyReferenceType,
    value: string | null | undefined,
    actorId?: string,
  ) {
    if (value === undefined) return;
    const existing = await tx.jobPartyReference.findFirst({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        reference_type: referenceType,
      },
    });
    if (value === null || value.trim() === "") {
      if (existing) {
        await tx.jobPartyReference.delete({ where: { id: existing.id } });
      }
      return;
    }
    const reference_no = value.trim();
    if (existing) {
      await tx.jobPartyReference.update({
        where: { id: existing.id },
        data: { reference_no, updated_by: actorId },
      });
      return;
    }
    await tx.jobPartyReference.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        reference_type: referenceType,
        reference_no,
        party_role: "CLIENT",
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  async createJob(
    tenantId: string,
    dto: DocumentationCreateJobDto,
    actorId?: string,
    permissions?: string[],
  ) {
    if (dto.salesperson_id) {
      const sp = await this.prisma.user.findFirst({
        where: {
          id: dto.salesperson_id,
          tenant_id: tenantId,
          is_salesperson: true,
          deleted_at: null,
        },
      });
      if (!sp) {
        throw new BadRequestException(
          "Salesperson must be an active user mapped with is_salesperson.",
        );
      }
    }

    const { initial_charges, ...jobFields } = dto;
    const job = await this.jobs.create(
      tenantId,
      jobFields as CreateJobDto,
      actorId,
      permissions,
    );

    if (initial_charges?.length) {
      for (const charge of initial_charges) {
        await this.jobs.addCharge(tenantId, job.id, charge, actorId);
      }
    }

    return { success: true, data: job };
  }
}
