import { Prisma } from '@prisma/client';

/**
 * Portal Party sees a job when shipper, consignee, or billing (bill-to) party.
 */
export function portalJobOwnershipWhere(partyId: string): Prisma.JobWhereInput {
  return {
    OR: [
      { shipper_id: partyId },
      { consignee_id: partyId },
      { billing_party_id: partyId },
    ],
  };
}

/** Collect unique party IDs that should receive portal notifications for a job. */
export function portalPartyIdsFromJob(job: {
  shipper_id?: string | null;
  consignee_id?: string | null;
  billing_party_id?: string | null;
}): string[] {
  return [...new Set([job.shipper_id, job.consignee_id, job.billing_party_id].filter(Boolean) as string[])];
}
