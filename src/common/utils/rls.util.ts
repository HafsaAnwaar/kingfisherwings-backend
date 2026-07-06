import { Prisma } from '@prisma/client';

/**
 * Sets the `app.tenant_id` session variable for the current transaction
 * (see set_tenant_context() / current_tenant_id() in
 * prisma/migrations/*_enable_row_level_security/migration.sql). Must be
 * the FIRST statement in any manually-opened $transaction() that
 * touches tenant-scoped tables, since Postgres RLS blocks every row
 * when this is unset.
 *
 * Works both inside a $transaction(async (tx) => {...}) callback
 * (`await tx.$executeRaw(setTenantContextQuery(tenantId))`) and as the
 * first element of array-form $transaction([...]) calls.
 */
export function setTenantContextQuery(tenantId: string) {
  return Prisma.sql`SELECT set_tenant_context(${tenantId}::uuid)`;
}
