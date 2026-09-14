import { Prisma } from "@prisma/client";

/** Resolve optional party / job / company display fields for WMS PDFs. */
export async function resolveWmsPdfContext(
  tx: Prisma.TransactionClient,
  tenantId: string,
  opts: { partyId?: string | null; jobId?: string | null },
): Promise<{
  partyName: string | null;
  jobRef: string | null;
  companyName: string;
  logoUrl: string | null;
}> {
  const [party, job, tenant, company] = await Promise.all([
    opts.partyId
      ? tx.party.findFirst({
          where: { id: opts.partyId, tenant_id: tenantId, deleted_at: null },
          select: { name: true, code: true },
        })
      : Promise.resolve(null),
    opts.jobId
      ? tx.job.findFirst({
          where: { id: opts.jobId, tenant_id: tenantId, deleted_at: null },
          select: { job_number: true },
        })
      : Promise.resolve(null),
    tx.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { name: true, display_name: true, logo_url: true },
    }),
    tx.company.findFirst({
      where: { tenant_id: tenantId, deleted_at: null, is_active: true },
      orderBy: { created_at: "asc" },
      select: { name: true },
    }),
  ]);

  return {
    partyName: party ? `${party.code} — ${party.name}` : null,
    jobRef: job?.job_number ?? null,
    companyName:
      company?.name ||
      tenant?.display_name ||
      tenant?.name ||
      "Warehouse",
    logoUrl: tenant?.logo_url || null,
  };
}
