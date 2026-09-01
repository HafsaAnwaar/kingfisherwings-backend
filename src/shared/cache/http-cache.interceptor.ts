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

    if (req.method !== "GET" || !this.redis.isEnabled) {
      return next.handle();
    }

    const path = (req.originalUrl ?? req.url ?? "").split("?")[0];
    if (!CACHEABLE_PREFIXES.some((p) => path.startsWith(p))) {
      return next.handle();
    }

    const tenantId = req.user?.tenantId ?? "global";
    const ttl = this.config.get<number>("redis.ttl.masters") ?? 86400;
    const cacheKey = `http-cache:${tenantId}:${path}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        this.logger.debug(`HTTP cache HIT ${cacheKey}`);
        return of(JSON.parse(cached));
      } catch {
        await this.redis.del(cacheKey);
      }
    }

    this.logger.debug(`HTTP cache MISS ${cacheKey}`);

    return next.handle().pipe(
      tap(async (body) => {
        if (body !== undefined && body !== null) {
          await this.redis.set(cacheKey, JSON.stringify(body), ttl);
        }
      }),
    );
  }
}
