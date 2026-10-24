import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

type ThrottleRequest = {
  ip?: string;
  ips?: string[];
  body?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
  user?: { id?: string; email?: string; tenantId?: string };
  portalUser?: { id?: string; email?: string; tenantId?: string };
  vendorUser?: { id?: string; email?: string; tenantId?: string };
};

/**
 * Skips rate limiting when X-Throttle-Bypass matches CRON_SECRET (live test suites / CI).
 *
 * Auth-sensitive routes are tracked per user (tenant_slug + email) when the
 * body carries credentials; otherwise IP / authenticated principal id.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<{ headers?: Record<string, string> }>();
    const secret = process.env.CRON_SECRET;
    const bypass = req.headers?.["x-throttle-bypass"];
    if (secret && bypass && bypass === secret) {
      return true;
    }
    return super.shouldSkip(context);
  }

  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const r = req as ThrottleRequest;
    const body = r.body ?? {};
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const tenantSlug = String(body.tenant_slug ?? body.tenantSlug ?? "")
      .trim()
      .toLowerCase();
    const token = String(body.token ?? "").trim();

    const ip =
      (Array.isArray(r.ips) && r.ips.length ? r.ips[0] : r.ip) ||
      String(r.headers?.["x-forwarded-for"] ?? "")
        .split(",")[0]
        ?.trim() ||
      "unknown";

    // Public login / forgot-password: one bucket per portal user identity
    if (email) {
      return `user:${tenantSlug || "-"}:${email}`;
    }

    // Tenant-password login (no email) — limit per tenant slug
    if (tenantSlug) {
      return `tenant:${tenantSlug}`;
    }

    // Token-based reset / accept-invite
    if (token) {
      return `token:${token.slice(0, 24)}`;
    }

    // Authenticated change-password (principal already on request when guard order allows)
    const principal =
      r.user ?? r.portalUser ?? r.vendorUser ?? undefined;
    if (principal?.id) {
      return `principal:${principal.tenantId ?? "-"}:${principal.id}`;
    }
    if (principal?.email) {
      return `user:${principal.tenantId ?? "-"}:${String(principal.email).toLowerCase()}`;
    }

    return `ip:${ip}`;
  }
}
