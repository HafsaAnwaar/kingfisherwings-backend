import { Prisma } from '@prisma/client';

/**
 * v1 ownership: portal Party sees a job when it is shipper OR consignee.
 */
export function portalJobOwnershipWhere(partyId: string): Prisma.JobWhereInput {
  return {
    OR: [{ shipper_id: partyId }, { consignee_id: partyId }],
  };
}
