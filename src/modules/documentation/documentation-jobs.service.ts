import { BadRequestException, Injectable } from "@nestjs/common";
import { JobStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { JobsService } from "../jobs/jobs.service";
import { CreateJobDto } from "../jobs/dto/job.dto";
import {
  DocumentationJobsQueryDto,
  DocumentationCreateJobDto,
} from "./dto/documentation-jobs.dto";
import { paginated } from "./dto/documentation-pagination.dto";
import { allOperationsServices } from "../../common/constants/module-permission-tree";

@Injectable()
export class DocumentationJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
  ) {}

  createWizardMetadata() {
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
        services: allOperationsServices(),
        salesperson_filter: { query: "GET /users?is_salesperson=true" },
      },
    };
  }

  async listJobs(tenantId: string, query: DocumentationJobsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
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
        }),
        tx.job.count({ where }),
      ]);

      return paginated(rows, page, limit, total);
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
