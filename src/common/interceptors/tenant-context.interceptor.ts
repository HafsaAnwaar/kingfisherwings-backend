import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { TenantContextStorage } from "../context/tenant-context.storage";

/**
 * Sets tenant id + optional locale onto ALS for the request.
 * Country is never mandatory — fields may be null until someone sets them.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextStorage) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const principal = request.user as
      | {
          tenantId?: string;
          countryCode?: string | null;
          preferredCountryCode?: string | null;
          baseCurrency?: string | null;
          timezone?: string | null;
        }
      | undefined;

    const tenantId = principal?.tenantId ?? null;

    return this.tenantContext.run(tenantId, () => next.handle(), {
      countryCode: principal?.countryCode ?? null,
      preferredCountryCode: principal?.preferredCountryCode ?? null,
      baseCurrency: principal?.baseCurrency ?? null,
      timezone: principal?.timezone ?? null,
    });
  }
}
