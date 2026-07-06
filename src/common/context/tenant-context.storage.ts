import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextStore {
  tenantId: string | null;
}

/**
 * Carries the current request's tenant id across the whole async call
 * chain without needing to thread it through every function signature.
 * Set once per request by TenantContextInterceptor; read by
 * PrismaService's query extension to populate `app.tenant_id` for RLS.
 *
 * A SuperAdmin-authenticated request has no tenantId of its own, so the
 * store stays null for it by default — any tenant-scoped query made
 * directly under that context is correctly blocked by RLS. Code paths
 * where a SuperAdmin needs to operate on a *specific* tenant (creating
 * a tenant, creating a user in an arbitrary tenant) must explicitly
 * open a scoped context via `run()` for that tenant id.
 */
@Injectable()
export class TenantContextStorage {
  private readonly storage = new AsyncLocalStorage<TenantContextStore>();

  run<T>(tenantId: string | null, callback: () => T): T {
    return this.storage.run({ tenantId }, callback);
  }

  getTenantId(): string | null {
    return this.storage.getStore()?.tenantId ?? null;
  }
}
