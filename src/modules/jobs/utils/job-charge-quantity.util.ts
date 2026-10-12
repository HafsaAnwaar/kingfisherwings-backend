import { Prisma } from "@prisma/client";

const CONT_TYPE_TOKEN = "BLP_CONT_TYPE_CODE";

/**
 * When charge unit matches a container type calculation_method, quantity = count of that type on the job.
 */
export async function resolveAutoChargeQuantity(
  tx: Prisma.TransactionClient,
  tenantId: string,
  jobId: string,
  chargeUnit: string | null | undefined,
  explicitQuantity?: number,
): Promise<number> {
  if (explicitQuantity !== undefined && explicitQuantity !== null) {
    return explicitQuantity;
  }
  if (!chargeUnit?.trim()) return 1;

  const unitNorm = chargeUnit.trim().toUpperCase();
  const types = await tx.containerType.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      is_active: true,
      calculation_method: { not: null },
    },
  });
  const match = types.find(
    (t) =>
      t.calculation_method?.toUpperCase() === unitNorm ||
      t.code.toUpperCase() === unitNorm ||
      t.calculation_method?.includes(CONT_TYPE_TOKEN),
  );
  if (!match) return 1;

  const job = await tx.job.findFirst({
    where: { id: jobId, tenant_id: tenantId },
    select: { container_type_id: true, container_count: true },
  });
  if (
    job?.container_type_id === match.id &&
    job.container_count &&
    job.container_count > 0
  ) {
    return job.container_count;
  }

  const detail = await tx.seaFclJobDetail.findFirst({
    where: { job_id: jobId, tenant_id: tenantId },
    include: {
      containers: {
        where: { deleted_at: null, container_type_id: match.id },
      },
    },
  });
  if (detail?.containers?.length) {
    return detail.containers.length;
  }

  return 1;
}
