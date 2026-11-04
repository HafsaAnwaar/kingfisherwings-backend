import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertAirWaybillDto } from "./dto/air-waybill.dto";

const AIR_TYPES: JobType[] = [JobType.AIR_EXPORT, JobType.AIR_IMPORT];

@Injectable()
export class AirWaybillService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, jobId: string) {
    await this.requireAirJob(tenantId, jobId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.airWaybill.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data: rows };
  }

  async create(
    tenantId: string,
    jobId: string,
    dto: UpsertAirWaybillDto,
    actorId?: string,
  ) {
    await this.requireAirJob(tenantId, jobId);
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const created = await tx.airWaybill.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          awb_type: dto.awb_type,
          awb_number: dto.awb_number,
          flight_number: dto.flight_number,
          flight_status: dto.flight_status,
          shipper_id: dto.shipper_id,
          consignee_id: dto.consignee_id,
          pieces: dto.pieces,
          gross_weight: dto.gross_weight,
          dimensions: dto.dimensions,
          is_draft: dto.is_draft ?? true,
          is_original: dto.is_original ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await this.syncAirDetail(tx, tenantId, jobId, dto, actorId);
      return created;
    });
    return { success: true, data: row };
  }

  async update(
    tenantId: string,
    jobId: string,
    awbId: string,
    dto: Partial<UpsertAirWaybillDto>,
    actorId?: string,
  ) {
    await this.requireAirJob(tenantId, jobId);
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.airWaybill.findFirst({
        where: {
          id: awbId,
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Air waybill not found.");
      const updated = await tx.airWaybill.update({
        where: { id: existing.id },
        data: {
          ...(dto.awb_type !== undefined ? { awb_type: dto.awb_type } : {}),
          ...(dto.awb_number !== undefined ? { awb_number: dto.awb_number } : {}),
          ...(dto.flight_number !== undefined
            ? { flight_number: dto.flight_number }
            : {}),
          ...(dto.flight_status !== undefined
            ? { flight_status: dto.flight_status }
            : {}),
          ...(dto.shipper_id !== undefined ? { shipper_id: dto.shipper_id } : {}),
          ...(dto.consignee_id !== undefined
            ? { consignee_id: dto.consignee_id }
            : {}),
          ...(dto.pieces !== undefined ? { pieces: dto.pieces } : {}),
          ...(dto.gross_weight !== undefined
            ? { gross_weight: dto.gross_weight }
            : {}),
          ...(dto.dimensions !== undefined ? { dimensions: dto.dimensions } : {}),
          ...(dto.is_draft !== undefined ? { is_draft: dto.is_draft } : {}),
          ...(dto.is_original !== undefined
            ? { is_original: dto.is_original }
            : {}),
          updated_by: actorId,
        },
      });
      await this.syncAirDetail(tx, tenantId, jobId, dto, actorId);
      return updated;
    });
    return { success: true, data: row };
  }

  async remove(
    tenantId: string,
    jobId: string,
    awbId: string,
    actorId?: string,
  ) {
    await this.requireAirJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.airWaybill.findFirst({
        where: {
          id: awbId,
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Air waybill not found.");
      await tx.airWaybill.update({
        where: { id: existing.id },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  private async requireAirJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_type: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    if (!AIR_TYPES.includes(job.job_type)) {
      throw new BadRequestException(
        "Air waybills are only available on Air Export and Air Import jobs.",
      );
    }
    return job;
  }

  private async syncAirDetail(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    dto: Partial<UpsertAirWaybillDto>,
    actorId?: string,
  ) {
    const data: Prisma.AirJobDetailUpdateManyMutationInput = {
      updated_by: actorId,
    };
    if (dto.awb_type === "MAWB" && dto.awb_number !== undefined) {
      data.mawb_number = dto.awb_number;
    }
    if (dto.awb_type === "HAWB" && dto.awb_number !== undefined) {
      data.hawb_number = dto.awb_number;
    }
    if (dto.flight_number !== undefined) data.flight_number = dto.flight_number;
    if (dto.flight_status !== undefined) data.flight_status = dto.flight_status;
    if (Object.keys(data).length <= 1) return;
    await tx.airJobDetail.updateMany({
      where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
      data,
    });
  }
}
