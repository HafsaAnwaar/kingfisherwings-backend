import {
  Injectable,
  Logger,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable, of, tap } from "rxjs";
import { RedisService } from "../redis/redis.service";

const CACHEABLE_PREFIXES = [
  "/masters/ports",
  "/masters/airports",
  "/masters/charge-codes",
  "/masters/branches",
  "/masters/currencies",
  "/masters/countries",
  "/masters/exchange-rates",
  "/masters/departments",
  "/masters/container-types",
  "/masters/shipping-lines",
  "/masters/airlines",
  "/masters/vessels",
  "/masters/tax-rates",
  "/masters/hs-codes",
];

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function resolveCachePrefix(path: string): string | null {
  const matches = CACHEABLE_PREFIXES.filter(
    (p) => path === p || path.startsWith(`${p}/`),
  );
  if (!matches.length) return null;
  // Longest prefix wins (e.g. vessels vs vessels/…)
  return matches.sort((a, b) => b.length - a.length)[0]!;
}

function isEmptyListBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  if (Array.isArray(record.data) && record.data.length === 0) return true;
  const meta = record.meta as { total?: number } | undefined;
  if (meta && typeof meta.total === "number" && meta.total === 0) return true;
  return false;
}

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<{
      method?: string;
      originalUrl?: string;
      url?: string;
      user?: { tenantId?: string };
    }>();

    if (!this.redis.isEnabled) {
      return next.handle();
    }

    const method = (req.method ?? "GET").toUpperCase();
    const rawUrl = req.originalUrl ?? req.url ?? "";
    const path = rawUrl.split("?")[0] ?? "";
    const prefix = resolveCachePrefix(path);
    if (!prefix) {
      return next.handle();
    }

    const tenantId = req.user?.tenantId ?? "global";

    // After create/update/delete, drop cached GETs for this master collection.
    if (MUTATING_METHODS.has(method)) {
      return next.handle().pipe(
        tap({
          next: async () => {
            const pattern = `http-cache:${tenantId}:${prefix}*`;
            const removed = await this.redis.delByPattern(pattern);
            if (removed > 0) {
              this.logger.debug(
                `HTTP cache invalidated ${removed} key(s) for ${pattern}`,
              );
            }
          },
        }),
      );
    }

    if (method !== "GET") {
      return next.handle();
    }

    const ttl = this.config.get<number>("redis.ttl.masters") ?? 86400;
    // Include query string so page/search variants do not collide.
    const cacheKey = `http-cache:${tenantId}:${rawUrl}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as unknown;
        // Drop stale empty lists so a later create is visible immediately.
        if (isEmptyListBody(parsed)) {
          await this.redis.del(cacheKey);
        } else {
          this.logger.debug(`HTTP cache HIT ${cacheKey}`);
          return of(parsed);
        }
      } catch {
        await this.redis.del(cacheKey);
      }
    }

    this.logger.debug(`HTTP cache MISS ${cacheKey}`);

    return next.handle().pipe(
      tap(async (body) => {
        if (body === undefined || body === null) return;
        // Never cache empty lists — otherwise create→list stays empty for TTL.
        if (isEmptyListBody(body)) {
          this.logger.debug(`HTTP cache SKIP empty list ${cacheKey}`);
          return;
        }
        await this.redis.set(cacheKey, JSON.stringify(body), ttl);
      }),
    );
  }
}
