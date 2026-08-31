import { Prisma } from '@prisma/client';

/** Mark a job milestone complete when the row exists and is not yet done. */
export async function markJobMilestoneIfPresent(
  tx: Prisma.TransactionClient,
  tenantId: string,
  jobId: string,
  milestoneName: string,
  actualDate: Date,
  actorId?: string,
): Promise<boolean> {
  const milestone = await tx.jobMilestone.findFirst({
    where: {
      tenant_id: tenantId,
      job_id: jobId,
      milestone: milestoneName,
      deleted_at: null,
      actual_date: null,
    },
  });

  if (!milestone) {
    return false;
  }

  await tx.jobMilestone.update({
    where: { id: milestone.id },
    data: {
      actual_date: actualDate,
      completed_by: actorId,
      updated_by: actorId,
    },
  });

  return true;
}
