import { BadRequestException } from '@nestjs/common';
import { JobType, Prisma } from '@prisma/client';
import {
  AIR_IMPORT_CREATE_MILESTONE,
  AIR_IMPORT_MILESTONES,
} from '../constants/air-import-milestones';
import { AIR_EXPORT_MILESTONES } from '../constants/air-export-milestones';
import { SEA_FCL_EXPORT_MILESTONES } from '../constants/sea-fcl-export-milestones';
import { SEA_FCL_IMPORT_MILESTONES } from '../constants/sea-fcl-import-milestones';
import {
  SEA_LCL_EXPORT_CREATE_MILESTONE,
  SEA_LCL_EXPORT_MILESTONES,
} from '../constants/sea-lcl-export-milestones';
import {
  SEA_LCL_IMPORT_CREATE_MILESTONE,
  SEA_LCL_IMPORT_MILESTONES,
} from '../constants/sea-lcl-import-milestones';
import { LAND_CREATE_MILESTONE, LAND_MILESTONES } from '../constants/land-milestones';
import { COURIER_CREATE_MILESTONE, COURIER_MILESTONES } from '../constants/courier-milestones';

/**
 * Seeds mode-specific detail rows and standard milestones after job create / quote convert.
 * Must run inside an existing tenant transaction.
 */
export async function seedJobTypeExtras(
  tx: Prisma.TransactionClient,
  tenantId: string,
  jobId: string,
  jobType: JobType,
  actorId?: string,
): Promise<void> {
  try {
    await seedJobTypeExtrasInner(tx, tenantId, jobId, jobType, actorId);
  } catch (error: unknown) {
    if (isMissingRelationError(error)) {
      throw new BadRequestException(
        `Cannot seed ${jobType} job details — required database migration has not been applied yet. Run prisma migrate deploy.`,
      );
    }
    throw error;
  }
}

function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: unknown }).code) : '';
  const message = error instanceof Error ? error.message : '';
  return code === 'P2021' || /does not exist/i.test(message);
}

async function seedJobTypeExtrasInner(
  tx: Prisma.TransactionClient,
  tenantId: string,
  jobId: string,
  jobType: JobType,
  actorId?: string,
): Promise<void> {
  if (jobType === 'AIR_EXPORT' || jobType === 'AIR_IMPORT') {
    await tx.airJobDetail.create({
      data: { tenant_id: tenantId, job_id: jobId, created_by: actorId, updated_by: actorId },
    });
  }

  if (jobType === 'SEA_FCL_EXPORT' || jobType === 'SEA_FCL_IMPORT') {
    await tx.seaFclJobDetail.create({
      data: { tenant_id: tenantId, job_id: jobId, created_by: actorId, updated_by: actorId },
    });
  }

  if (jobType === 'SEA_LCL_EXPORT' || jobType === 'SEA_LCL_IMPORT') {
    await tx.seaLclJobDetail.create({
      data: { tenant_id: tenantId, job_id: jobId, created_by: actorId, updated_by: actorId },
    });
  }

  if (jobType === 'LAND') {
    await tx.landJobDetail.create({
      data: { tenant_id: tenantId, job_id: jobId, created_by: actorId, updated_by: actorId },
    });
  }

  if (jobType === 'COURIER') {
    await tx.courierJobDetail.create({
      data: { tenant_id: tenantId, job_id: jobId, created_by: actorId, updated_by: actorId },
    });
  }

  const milestoneNames =
    jobType === 'AIR_EXPORT'
      ? AIR_EXPORT_MILESTONES
      : jobType === 'AIR_IMPORT'
        ? AIR_IMPORT_MILESTONES
        : jobType === 'SEA_FCL_EXPORT'
          ? SEA_FCL_EXPORT_MILESTONES
          : jobType === 'SEA_FCL_IMPORT'
            ? SEA_FCL_IMPORT_MILESTONES
            : jobType === 'SEA_LCL_EXPORT'
              ? SEA_LCL_EXPORT_MILESTONES
              : jobType === 'SEA_LCL_IMPORT'
                ? SEA_LCL_IMPORT_MILESTONES
                : jobType === 'LAND'
                  ? LAND_MILESTONES
                  : jobType === 'COURIER'
                    ? COURIER_MILESTONES
                    : null;

  if (milestoneNames?.length) {
    await tx.jobMilestone.createMany({
      data: milestoneNames.map((milestone) => ({
        tenant_id: tenantId,
        job_id: jobId,
        milestone,
        created_by: actorId,
        updated_by: actorId,
      })),
    });
  }

  if (jobType === 'AIR_IMPORT') {
    await tx.jobMilestone.updateMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: AIR_IMPORT_CREATE_MILESTONE,
        deleted_at: null,
        actual_date: null,
      },
      data: {
        actual_date: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === 'SEA_LCL_EXPORT' || jobType === 'SEA_LCL_IMPORT') {
    const createMilestone =
      jobType === 'SEA_LCL_EXPORT' ? SEA_LCL_EXPORT_CREATE_MILESTONE : SEA_LCL_IMPORT_CREATE_MILESTONE;
    await tx.jobMilestone.updateMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: createMilestone,
        deleted_at: null,
        actual_date: null,
      },
      data: {
        actual_date: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === 'LAND' || jobType === 'COURIER') {
    const createMilestone = jobType === 'LAND' ? LAND_CREATE_MILESTONE : COURIER_CREATE_MILESTONE;
    await tx.jobMilestone.updateMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: createMilestone,
        deleted_at: null,
        actual_date: null,
      },
      data: {
        actual_date: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }
}
