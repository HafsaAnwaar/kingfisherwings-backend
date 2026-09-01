import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobStatus, JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  DocumentationPaginationDto,
  paginated,
} from "./dto/documentation-pagination.dto";
import {
  ClosedJobsQueryDto,
  UpdateDeliveryOrderDto,
} from "./dto/documentation-do.dto";

const EXPORT_JOB_TYPES: JobType[] = [
  "SEA_FCL_EXPORT",
  "SEA_LCL_EXPORT",
  "AIR_EXPORT",
  "NVOCC_EXPORT",
];

@Injectable()
export class DocumentationDeliveryOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async listClosedJobs(tenantId: string, query: ClosedJobsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        status: JobStatus.COMPLETED,
        job_type: { in: EXPORT_JOB_TYPES },
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(query.search
          ? { job_number: { contains: query.search, mode: "insensitive" } }
          : {}),
      };

      const [jobs, total] = await Promise.all([
        tx.job.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updated_at: "desc" },
        }),
        tx.job.count({ where }),
      ]);

      const dos = await tx.documentationDeliveryOrder.findMany({
        where: {
          tenant_id: tenantId,
          job_id: { in: jobs.map((j) => j.id) },
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      });
      const latestDo = new Map<string, (typeof dos)[0]>();
      for (const row of dos) {
        if (!latestDo.has(row.job_id)) latestDo.set(row.job_id, row);
      }

      return paginated(
        jobs.map((job) => ({
          job,
          delivery_order: latestDo.get(job.id) ?? null,
        })),
        page,
        limit,
        total,
      );
    });
  }

  async updateDeliveryOrder(
    tenantId: string,
    jobId: string,
    dto: UpdateDeliveryOrderDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!job) throw new NotFoundException("Job not found.");
      if (job.status !== JobStatus.COMPLETED) {
        throw new BadRequestException(
          "Delivery order updates are allowed only on completed jobs.",
        );
      }
      if (!EXPORT_JOB_TYPES.includes(job.job_type)) {
        throw new BadRequestException(
          "Delivery order updates apply to export jobs only.",
        );
      }

      return tx.documentationDeliveryOrder.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          do_number: dto.do_number,
          do_date: dto.do_date ? new Date(dto.do_date) : undefined,
          do_status: dto.do_status ?? "ISSUED",
          closed_job_only: true,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }
}
