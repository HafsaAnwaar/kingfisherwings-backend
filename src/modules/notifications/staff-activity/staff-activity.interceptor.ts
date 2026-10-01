import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { isSuperAdminPrincipal } from "../../../common/utils/principal.util";
import {
  IGNORED_ROUTES,
  MUTATING_METHODS,
  describeActivity,
  pickReference,
  unwrapBody,
} from "./staff-activity.rules";
import { StaffActivityService } from "./staff-activity.service";

interface StaffRequest {
  method: string;
  route?: { path?: string };
  path: string;
  params?: Record<string, string>;
  user?: { id?: string; tenantId?: string; principal?: string };
}

/**
 * Captures each successful staff mutation exactly once, at the HTTP
 * boundary — so a service calling other services, or a repository write,
 * can never produce a second email for the same action. Tenant and actor
 * come only from the authenticated JWT principal (request.user).
 * Super Admin, portal and vendor-portal requests are not staff activity.
 */
@Injectable()
export class StaffActivityInterceptor implements NestInterceptor {
  constructor(private readonly activity: StaffActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http" || !this.activity.enabled()) {
      return next.handle();
    }
    const req = context.switchToHttp().getRequest<StaffRequest>();
    const user = req.user;
    const route = req.route?.path ?? req.path;
    if (
      !MUTATING_METHODS.has(req.method) ||
      !user?.id ||
      !user.tenantId ||
      isSuperAdminPrincipal(user) ||
      IGNORED_ROUTES.some((re) => re.test(route))
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response) => {
        try {
          const body = unwrapBody(response);
          const { action, entity, linkPath } = describeActivity(
            route,
            req.method,
            req.params ?? {},
            body,
          );
          const amount =
            body && (body.total_amount ?? body.amount) != null
              ? `${String(body.currency_code ?? "")} ${Number(body.total_amount ?? body.amount).toFixed(2)}`.trim()
              : null;
          const paramId = Object.values(req.params ?? {}).find((v) =>
            /^[0-9a-f-]{36}$/i.test(v),
          );
          void this.activity.record({
            tenantId: user.tenantId!,
            actorUserId: user.id!,
            action,
            entity,
            entityId:
              (typeof body?.id === "string" ? body.id : null) ??
              paramId ??
              null,
            reference: pickReference(body),
            status: typeof body?.status === "string" ? body.status : null,
            amount,
            method: req.method,
            route,
            linkPath,
            occurredAt: new Date().toISOString(),
          });
        } catch {
          // Activity capture must never affect the response.
        }
      }),
    );
  }
}
