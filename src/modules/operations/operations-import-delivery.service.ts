import { Injectable, NotFoundException } from "@nestjs/common";
import { JobStatus, JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  ImportCargoDeliveryQueryDto,
  PatchImportCargoDeliveryDto,
} from "./dto/import-cargo-delivery.dto";
import { paginated } from "../documentation/dto/documentation-pagination.dto";

const IMPORT_TYPES: JobType[] = [
  "SEA_FCL_IMPORT",
  "SEA_LCL_IMPORT",
  "AIR_IMPORT",
  "NVOCC_IMPORT",
];

@Injectable()
export class OperationsImportDeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: ImportCargoDeliveryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const from = query.from_date ? new Date(query.from_date) : undefined;
    const to = query.to_date ? new Date(query.to_date) : undefined;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        job_type: { in: IMPORT_TYPES },
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(query.status ? { status: query.status as JobStatus } : {}),
        ...(from || to
          ? {
              OR: [
                {
                  job_date: {
                    ...(from ? { gte: from } : {}),
                    ...(to ? { lte: to } : {}),
                  },
                },
                {
                  eta: {
                    ...(from ? { gte: from } : {}),
                    ...(to ? { lte: to } : {}),
                  },
                },
              ],
            }
          : {}),
      };

      const [jobs, total] = await Promise.all([
        tx.job.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updated_at: "desc" },
          include: { import_delivery: true },
        }),
        tx.job.count({ where }),
      ]);

      return paginated(
        jobs.map((j) => ({
          job_id: j.id,
          job_number: j.job_number,
          status: j.status,
          eta: j.eta,
          job_date: j.job_date,
          delivery: j.import_delivery,
        })),
        page,
        limit,
        total,
      );
    });
  }

  async patchDelivery(
    tenantId: string,
    jobId: string,
    dto: PatchImportCargoDeliveryDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!job) throw new NotFoundException("Job not found.");

      const data = {
        do_status: dto.do_status,
        number_of_pallets: dto.number_of_pallets,
        cargo_delivered_date: dto.cargo_delivered_date
          ? new Date(dto.cargo_delivered_date)
          : undefined,
        truck_details: dto.truck_details,
        driver_name: dto.driver_name,
        remarks: dto.remarks,
        shipment_id: dto.shipment_id,
        updated_by: actorId,
      };

      const row = await tx.jobImportDeliveryDetail.upsert({
        where: { job_id: jobId },
        create: {
          tenant_id: tenantId,
          job_id: jobId,
          ...data,
        },
        update: data,
      });

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "IMPORT_CARGO_DELIVERY_UPDATE",
          entity: "JOB",
          entity_id: jobId,
          metadata: dto as Prisma.InputJsonValue,
        },
      });

      return { success: true, data: row };
    });
  }
}
