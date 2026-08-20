import { JobType, Prisma } from '@prisma/client';
import {
  AIR_IMPORT_CREATE_MILESTONE,
  AIR_IMPORT_MILESTONES,
} from '../constants/air-import-milestones';
import { AIR_EXPORT_MILESTONES } from '../constants/air-export-milestones';
import { SEA_FCL_EXPORT_MILESTONES } from '../constants/sea-fcl-export-milestones';
import { SEA_FCL_IMPORT_MILESTONES } from '../constants/sea-fcl-import-milestones';

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

  const milestoneNames =
    jobType === 'AIR_EXPORT'
      ? AIR_EXPORT_MILESTONES
      : jobType === 'AIR_IMPORT'
        ? AIR_IMPORT_MILESTONES
        : jobType === 'SEA_FCL_EXPORT'
          ? SEA_FCL_EXPORT_MILESTONES
          : jobType === 'SEA_FCL_IMPORT'
            ? SEA_FCL_IMPORT_MILESTONES
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
}
