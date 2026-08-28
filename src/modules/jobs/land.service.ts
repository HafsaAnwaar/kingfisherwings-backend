import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JobType, LandVehicleType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AssignLandTruckerDto,
  CreateLandPodDto,
  RecordLandBorderCrossingDto,
  RecordLandPickupDto,
  UpdateLandJobDetailDto,
} from './dto/land-job-detail.dto';

@Injectable()
export class LandService {
  constructor(private readonly prisma: PrismaService) {}

  async updateDetails(tenantId: string, jobId: string, dto: UpdateLandJobDetailDto, actorId?: string) {
    if (dto.trucker_id) {
      await this.assertTrucker(tenantId, dto.trucker_id);
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getLandDetailOrThrow(tx, tenantId, jobId);
      const { etd, eta, vehicle_type, ...rest } = dto;

      return tx.landJobDetail.update({
        where: { job_id: jobId },
        data: {
          ...rest,
          ...(vehicle_type !== undefined ? { vehicle_type: vehicle_type as LandVehicleType } : {}),
          ...(etd ? { etd: new Date(etd) } : {}),
          ...(eta ? { eta: new Date(eta) } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async assignTrucker(tenantId: string, jobId: string, dto: AssignLandTruckerDto, actorId?: string) {
    await this.assertTrucker(tenantId, dto.trucker_id);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getLandDetailOrThrow(tx, tenantId, jobId);

      const updated = await tx.landJobDetail.update({
        where: { job_id: jobId },
        data: {
          trucker_id: dto.trucker_id,
          ...(dto.vehicle_type !== undefined ? { vehicle_type: dto.vehicle_type as LandVehicleType } : {}),
          vehicle_number: dto.vehicle_number,
          driver_name: dto.driver_name,
          driver_license: dto.driver_license,
          updated_by: actorId,
        },
      });

      await this.markMilestoneIfPresent(tx, tenantId, jobId, 'PICKUP_SCHEDULED', new Date(), actorId);
      return updated;
    });
  }

  async recordPickup(tenantId: string, jobId: string, dto: RecordLandPickupDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getLandDetailOrThrow(tx, tenantId, jobId);
      const at = dto.picked_up_at ? new Date(dto.picked_up_at) : new Date();
      await this.markMilestoneIfPresent(tx, tenantId, jobId, 'CARGO_PICKED_UP', at, actorId);
      await this.markMilestoneIfPresent(tx, tenantId, jobId, 'IN_TRANSIT', at, actorId);
      return { job_id: jobId, milestone: 'CARGO_PICKED_UP', marked_at: at.toISOString() };
    });
  }

  async recordBorderCrossing(
    tenantId: string,
    jobId: string,
    dto: RecordLandBorderCrossingDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getLandDetailOrThrow(tx, tenantId, jobId);
      const at = dto.crossed_at ? new Date(dto.crossed_at) : new Date();
      const milestone = dto.milestone ?? 'AT_BORDER';

      if (dto.border_declaration_number) {
        await tx.landJobDetail.update({
          where: { job_id: jobId },
          data: { border_declaration_number: dto.border_declaration_number, updated_by: actorId },
        });
      }

      await this.markMilestoneIfPresent(tx, tenantId, jobId, milestone, at, actorId);
      if (milestone === 'CUSTOMS_CLEARED_BORDER') {
        await this.markMilestoneIfPresent(tx, tenantId, jobId, 'AT_BORDER', at, actorId);
      }

      return {
        job_id: jobId,
        milestone,
        marked_at: at.toISOString(),
        cross_border_docs_required: detail.cross_border_docs_required,
      };
    });
  }

  async upsertCrossBorder(tenantId: string, jobId: string, dto: UpdateLandJobDetailDto, actorId?: string) {
    return this.updateDetails(tenantId, jobId, { ...dto, cross_border_docs_required: true }, actorId);
  }

  async createPod(tenantId: string, jobId: string, dto: CreateLandPodDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getLandDetailOrThrow(tx, tenantId, jobId);
      const deliveryDate = new Date(dto.actual_delivery_date);

      const pod = await tx.proofOfDelivery.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          actual_delivery_date: deliveryDate,
          delivered_by: dto.delivered_by,
          received_by: dto.received_by,
          signature_image_path: dto.signature_image_path,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await this.markMilestoneIfPresent(tx, tenantId, jobId, 'DELIVERED', deliveryDate, actorId);
      await this.markMilestoneIfPresent(tx, tenantId, jobId, 'POD_RECEIVED', deliveryDate, actorId);
      return pod;
    });
  }

  private async assertTrucker(tenantId: string, truckerId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.trucker.findFirst({ where: { id: truckerId, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!exists) throw new NotFoundException('Trucker not found.');
  }

  private async getLandDetailOrThrow(tx: Prisma.TransactionClient, tenantId: string, jobId: string) {
    const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });
    if (!job) throw new NotFoundException('Job not found.');
    if (job.job_type !== ('LAND' as JobType)) {
      throw new BadRequestException('This endpoint requires a LAND job.');
    }
    const detail = await tx.landJobDetail.findFirst({
      where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
    });
    if (!detail) throw new NotFoundException('Land job details not found for this job.');
    return detail;
  }

  private async markMilestoneIfPresent(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    milestoneName: string,
    actualDate: Date,
    actorId?: string,
  ) {
    const milestone = await tx.jobMilestone.findFirst({
      where: { tenant_id: tenantId, job_id: jobId, milestone: milestoneName, deleted_at: null },
    });
    if (!milestone || milestone.actual_date) return;
    await tx.jobMilestone.update({
      where: { id: milestone.id },
      data: { actual_date: actualDate, completed_by: actorId, updated_by: actorId },
    });
  }
}
