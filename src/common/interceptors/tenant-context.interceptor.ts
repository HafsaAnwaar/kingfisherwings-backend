import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextStorage } from '../context/tenant-context.storage';

/**
 * Registered globally (APP_INTERCEPTOR). Makes the current request's
 * tenant id available via TenantContextStorage for the lifetime of the
 * request — useful for logging/tracing and as a source of truth other
 * code can read.
 *
 * IMPORTANT: this alone does NOT enforce RLS. Actual enforcement
 * happens per-operation via PrismaService.runWithTenant(tenantId, ...),
 * which every tenant-scoped service method must call explicitly (see
 * that method's doc comment for why this is explicit rather than a
 * transparent Prisma Client Extension).
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextStorage) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const principal = request.user as { tenantId?: string } | undefined;
    const tenantId = principal?.tenantId ?? null;

    return this.tenantContext.run(tenantId, () => next.handle());
  }
}
