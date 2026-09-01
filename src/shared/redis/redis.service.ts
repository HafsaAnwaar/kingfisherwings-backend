import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { buildRedisClientOptions, isRedisEnabled } from "./redis-options.util";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null;
  private readonly keyPrefix: string;
  private readonly enabled: boolean;
  private unavailableLogged = false;

  constructor(private readonly config: ConfigService) {
    this.keyPrefix = this.config.get<string>("redis.keyPrefix") ?? "fresa:";
    this.enabled = isRedisEnabled(config);

    if (!this.enabled) {
      this.client = null;
      this.logger.log(
        "Redis disabled (REDIS_ENABLED=false) — rate limiting uses in-memory storage; background job queues are stubbed.",
      );
      return;
    }

    const host = this.config.get<string>("redis.host") ?? "localhost";
    const port = this.config.get<number>("redis.port") ?? 6379;

    this.client = new Redis(buildRedisClientOptions(config));

    this.client.on("error", (err) => {
      if (this.unavailableLogged) return;
      this.unavailableLogged = true;
      this.logger.warn(
        `Redis unavailable (${err.message}). Cache/throttle fall back gracefully. Start Redis on ${host}:${port}, or set REDIS_ENABLED=false for local dev.`,
      );
    });

    this.client.on("connect", () => {
      if (this.unavailableLogged) {
        this.logger.log("Redis connected");
      }
      this.unavailableLogged = false;
    });
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  async onModuleDestroy() {
    await this.client?.quit().catch(() => undefined);
  }

  prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(this.prefixKey(key));
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    try {
      const fullKey = this.prefixKey(key);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(fullKey, value, "EX", ttlSeconds);
      } else {
        await this.client.set(fullKey, value);
      }
    } catch (err) {
      if (!this.unavailableLogged) {
        this.unavailableLogged = true;
        this.logger.warn(
          `Redis set failed: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(this.prefixKey(key));
    } catch {
      // ignore — cache miss is safe
    }
  }

  async incr(
    key: string,
    ttlMs: number,
  ): Promise<{ totalHits: number; timeToExpire: number }> {
    if (!this.client) {
      return { totalHits: 1, timeToExpire: ttlMs };
    }
    try {
      const fullKey = this.prefixKey(key);
      const totalHits = await this.client.incr(fullKey);
      if (totalHits === 1) {
        await this.client.pexpire(fullKey, ttlMs);
      }
      const ttl = await this.client.pttl(fullKey);
      return { totalHits, timeToExpire: ttl > 0 ? ttl : ttlMs };
    } catch {
      return { totalHits: 1, timeToExpire: ttlMs };
    }
  }
}
