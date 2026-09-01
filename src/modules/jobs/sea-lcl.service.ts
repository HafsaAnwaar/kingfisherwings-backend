import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AttachLclHouseDto } from "./dto/sea-lcl.dto";

const LCL_TYPES: JobType[] = ["SEA_LCL_EXPORT", "SEA_LCL_IMPORT"];

@Injectable()
export class SeaLclService {
  constructor(private readonly prisma: PrismaService) {}

  async getConsolidation(tenantId: string, masterJobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const master = await this.getLclMasterOrThrow(tx, tenantId, masterJobId);
      const houses = await tx.job.findMany({
        where: {
          tenant_id: tenantId,
          parent_job_id: masterJobId,
          deleted_at: null,
        },
        include: {
          cargo_lines: { where: { deleted_at: null } },
          sea_lcl_details: true,
        },
        orderBy: { created_at: "asc" },
      });

      const totals = houses.reduce(
        (acc, h) => {
          acc.house_count += 1;
          acc.gross_weight += Number(h.gross_weight ?? 0);
          acc.chargeable_weight += Number(h.chargeable_weight ?? 0);
          acc.volume_cbm += Number(h.volume_cbm ?? 0);
          acc.pieces += Number(h.pieces ?? 0);
          acc.cargo_lines += h.cargo_lines.length;
          return acc;
        },
        {
          house_count: 0,
          gross_weight: 0,
          chargeable_weight: 0,
          volume_cbm: 0,
          pieces: 0,
          cargo_lines: 0,
        },
      );

      return {
        master_job_id: master.id,
        master_job_number: master.job_number,
        job_type: master.job_type,
        consolidation_number:
          master.sea_lcl_details?.consolidation_number ?? null,
        cfs_warehouse_id: master.sea_lcl_details?.cfs_warehouse_id ?? null,
        totals: {
          ...totals,
          gross_weight: Math.round(totals.gross_weight * 1000) / 1000,
          chargeable_weight: Math.round(totals.chargeable_weight * 1000) / 1000,
          volume_cbm: Math.round(totals.volume_cbm * 1000) / 1000,
        },
        house_jobs: houses.map((h) => ({
          id: h.id,
          job_number: h.job_number,
          status: h.status,
          shipper_id: h.shipper_id,
          consignee_id: h.consignee_id,
          gross_weight: h.gross_weight,
          chargeable_weight: h.chargeable_weight,
          volume_cbm: h.volume_cbm,
          pieces: h.pieces,
          hbl_number: h.sea_lcl_details?.hbl_number ?? null,
          cargo_line_count: h.cargo_lines.length,
        })),
      };
    });
  }

  async attachHouse(
    tenantId: string,
    masterJobId: string,
    dto: AttachLclHouseDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const master = await this.getLclMasterOrThrow(tx, tenantId, masterJobId);

      if (dto.house_job_id === masterJobId) {
        throw new BadRequestException("A job cannot be attached to itself.");
      }

      const house = await tx.job.findFirst({
        where: { id: dto.house_job_id, tenant_id: tenantId, deleted_at: null },
      });

      if (!house) {
        throw new NotFoundException("House job not found.");
      }

      if (house.job_type !== master.job_type) {
        throw new BadRequestException(
          "House job must be the same job_type as the master.",
        );
      }

      if (house.parent_job_id && house.parent_job_id !== masterJobId) {
        throw new BadRequestException(
          "House job is already attached to another master.",
        );
      }

      if (house.parent_job_id === masterJobId) {
        return house;
      }

      if (house.parent_job_id) {
        throw new BadRequestException("House job already has a parent master.");
      }

      const nestedHouses = await tx.job.count({
        where: {
          tenant_id: tenantId,
          parent_job_id: dto.house_job_id,
          deleted_at: null,
        },
      });

      if (nestedHouses > 0) {
        throw new BadRequestException(
          "Cannot attach a master job as a house — only standalone house jobs are allowed.",
        );
      }

      return tx.job.update({
        where: { id: dto.house_job_id },
        data: { parent_job_id: masterJobId, updated_by: actorId },
      });
    });
  }

  async detachHouse(
    tenantId: string,
    masterJobId: string,
    houseJobId: string,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getLclMasterOrThrow(tx, tenantId, masterJobId);

      const house = await tx.job.findFirst({
        where: {
          id: houseJobId,
          tenant_id: tenantId,
          parent_job_id: masterJobId,
          deleted_at: null,
        },
      });

      if (!house) {
        throw new NotFoundException("House job not found under this master.");
      }

      return tx.job.update({
        where: { id: houseJobId },
        data: { parent_job_id: null, updated_by: actorId },
      });
    });
  }

  async markCargoReceivedAtCfs(
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!job) throw new NotFoundException("Job not found.");
      if (job.job_type !== "SEA_LCL_EXPORT") {
        throw new BadRequestException(
          "CFS cargo receipt is only for SEA_LCL_EXPORT jobs.",
        );
      }

      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        "CARGO_RECEIVED_AT_CFS",
        new Date(),
        actorId,
      );
      return {
        job_id: jobId,
        milestone: "CARGO_RECEIVED_AT_CFS",
        marked_at: new Date().toISOString(),
      };
    });
  }

  async markConsolidationStarted(
    tenantId: string,
    masterJobId: string,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getLclMasterOrThrow(tx, tenantId, masterJobId);
      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        masterJobId,
        "CONSOLIDATION_STARTED",
        new Date(),
        actorId,
      );
      return {
        job_id: masterJobId,
        milestone: "CONSOLIDATION_STARTED",
        marked_at: new Date().toISOString(),
      };
    });
  }

  async markCfsStuffingCompleted(
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertLclJob(tx, tenantId, jobId, "SEA_LCL_EXPORT");
      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        "CFS_STUFFING_COMPLETED",
        new Date(),
        actorId,
      );
      return {
        job_id: jobId,
        milestone: "CFS_STUFFING_COMPLETED",
        marked_at: new Date().toISOString(),
      };
    });
  }

  async markCfsDevanningCompleted(
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertLclJob(tx, tenantId, jobId, "SEA_LCL_IMPORT");
      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        "CFS_DEVANNING_COMPLETED",
        new Date(),
        actorId,
      );
      return {
        job_id: jobId,
        milestone: "CFS_DEVANNING_COMPLETED",
        marked_at: new Date().toISOString(),
      };
    });
  }

  private async getLclMasterOrThrow(
    tx: Prisma.TransactionClient,
    tenantId: string,
    masterJobId: string,
  ) {
    const master = await tx.job.findFirst({
      where: { id: masterJobId, tenant_id: tenantId, deleted_at: null },
      include: { sea_lcl_details: true },
    });

    if (!master) {
      throw new NotFoundException("Master job not found.");
    }

    if (!LCL_TYPES.includes(master.job_type)) {
      throw new BadRequestException("This endpoint requires a Sea LCL job.");
    }

    if (master.parent_job_id) {
      throw new BadRequestException(
        "Consolidation summary is only available on master (parent) LCL jobs.",
      );
    }

    return master;
  }

  private async assertLclJob(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    expected?: JobType,
  ) {
    const job = await tx.job.findFirst({
      where: { id: jobId, tenant_id: tenantId, deleted_at: null },
    });
    if (!job) throw new NotFoundException("Job not found.");
    if (!LCL_TYPES.includes(job.job_type)) {
      throw new BadRequestException("This endpoint requires a Sea LCL job.");
    }
    if (expected && job.job_type !== expected) {
      throw new BadRequestException(
        `This endpoint requires a ${expected} job.`,
      );
    }
    return job;
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
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: milestoneName,
        deleted_at: null,
      },
    });
    if (!milestone || milestone.actual_date) return;
    await tx.jobMilestone.update({
      where: { id: milestone.id },
      data: {
        actual_date: actualDate,
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }
}
