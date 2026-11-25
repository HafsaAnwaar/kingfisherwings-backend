import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobStatus, JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { paginated } from "./dto/documentation-pagination.dto";
import {
  ClosedJobsQueryDto,
  UpdateDeliveryOrderDto,
  UpdateShipmentBlStatusDto,
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
        status: { in: [JobStatus.COMPLETED, JobStatus.CLOSED] },
        job_type: query.job_type
          ? query.job_type
          : { in: EXPORT_JOB_TYPES },
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(query.search
          ? { job_number: { contains: query.search, mode: "insensitive" } }
          : {}),
        ...(query.from_date || query.to_date
          ? {
              updated_at: {
                ...(query.from_date
                  ? { gte: new Date(query.from_date) }
                  : {}),
                ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
              },
            }
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
      if (
        job.status !== JobStatus.COMPLETED &&
        job.status !== JobStatus.CLOSED
      ) {
        throw new BadRequestException(
          "Delivery order updates are allowed only on completed or closed jobs.",
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

  /**
   * Update shipment status and/or BL status on a closed/completed job
   * without reopening. Audited closed-job override.
   */
  async updateShipmentBlStatus(
    tenantId: string,
    jobId: string,
    dto: UpdateShipmentBlStatusDto,
    actorId?: string,
  ) {
    if (dto.shipment_status == null && dto.bl_status == null) {
      throw new BadRequestException(
        "Provide shipment_status and/or bl_status.",
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          shipments: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" },
            take: 20,
          },
        },
      });
      if (!job) throw new NotFoundException("Job not found.");
      if (
        job.status !== JobStatus.COMPLETED &&
        job.status !== JobStatus.CLOSED
      ) {
        throw new BadRequestException(
          "Shipment/BL status updates via this endpoint are allowed only on completed or closed jobs.",
        );
      }
      if (job.shipments.length === 0) {
        throw new BadRequestException("Job has no linked shipments.");
      }

      const before = job.shipments.map((s) => ({
        shipment_id: s.id,
        status: s.status,
        bl_status: s.bl_status,
      }));

      const updated = [];
      for (const shipment of job.shipments) {
        const row = await tx.shipment.update({
          where: { id: shipment.id },
          data: {
            ...(dto.shipment_status != null
              ? { status: dto.shipment_status }
              : {}),
            ...(dto.bl_status != null ? { bl_status: dto.bl_status } : {}),
            updated_by: actorId,
          },
        });
        updated.push({
          shipment_id: row.id,
          status: row.status,
          bl_status: row.bl_status,
        });
      }

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "CLOSED_JOB_SHIPMENT_BL_STATUS",
          entity: "JOB",
          entity_id: jobId,
          old_values: { shipments: before },
          new_values: { shipments: updated },
          metadata: {
            closed_job_override: true,
            shipment_status: dto.shipment_status ?? null,
            bl_status: dto.bl_status ?? null,
            at: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        job_id: jobId,
        job_status: job.status,
        shipments: updated,
      };
    });
  }
}
