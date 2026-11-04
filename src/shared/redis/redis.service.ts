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
  private connecting: Promise<void> | null = null;

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

  /**
   * lazyConnect + enableOfflineQueue:false rejects commands until status is
   * "ready". Wait for that handshake instead of failing the first write.
   */
  private async ensureReady(): Promise<boolean> {
    const client = this.client;
    if (!client) return false;
    if (client.status === "ready") return true;
    if (client.status === "end") return false;

    if (!this.connecting) {
      this.connecting = new Promise<void>((resolve, reject) => {
        const onReady = () => {
          cleanup();
          resolve();
        };
        const onEnd = () => {
          cleanup();
          reject(new Error("Redis connection closed"));
        };
        const cleanup = () => {
          client.off("ready", onReady);
          client.off("end", onEnd);
        };
        client.once("ready", onReady);
        client.once("end", onEnd);
        if (client.status === "wait") {
          client.connect().catch((err) => {
            const message = err instanceof Error ? err.message : String(err);
            if (/already connecting|already connected/i.test(message)) return;
            cleanup();
            reject(err instanceof Error ? err : new Error(message));
          });
        }
      }).finally(() => {
        this.connecting = null;
      });
    }

    try {
      await this.connecting;
      return true;
    } catch (err) {
      this.logUnavailable(err);
      return false;
    }
  }

  private logUnavailable(err: unknown) {
    if (this.unavailableLogged) return;
    this.unavailableLogged = true;
    const host = this.config.get<string>("redis.host") ?? "localhost";
    const port = this.config.get<number>("redis.port") ?? 6379;
    const message = err instanceof Error ? err.message : String(err);
    this.logger.warn(
      `Redis unavailable (${message}). Cache/throttle fall back gracefully. Start Redis on ${host}:${port}, or set REDIS_ENABLED=false for local dev.`,
    );
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    if (!(await this.ensureReady())) return null;
    try {
      return await this.client.get(this.prefixKey(key));
    } catch (err) {
      this.logUnavailable(err);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    if (!(await this.ensureReady())) return;
    try {
      const fullKey = this.prefixKey(key);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(fullKey, value, "EX", ttlSeconds);
      } else {
        await this.client.set(fullKey, value);
      }
    } catch (err) {
      this.logUnavailable(err);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    if (!(await this.ensureReady())) return;
    try {
      await this.client.del(this.prefixKey(key));
    } catch (err) {
      this.logUnavailable(err);
    }
  }

  /** Delete all keys matching a pattern (SCAN). Pattern is unprefixed; keyPrefix is applied. */
  async delByPattern(pattern: string): Promise<number> {
    if (!this.client) return 0;
    if (!(await this.ensureReady())) return 0;
    try {
      const fullPattern = this.prefixKey(pattern);
      let cursor = "0";
      let removed = 0;
      do {
        const [next, keys] = await this.client.scan(
          cursor,
          "MATCH",
          fullPattern,
          "COUNT",
          100,
        );
        cursor = next;
        if (keys.length > 0) {
          removed += await this.client.del(...keys);
        }
      } while (cursor !== "0");
      return removed;
    } catch (err) {
      this.logUnavailable(err);
      return 0;
    }
  }

  async incr(
    key: string,
    ttlMs: number,
  ): Promise<{ totalHits: number; timeToExpire: number }> {
    if (!this.client || !(await this.ensureReady())) {
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
    } catch (err) {
      this.logUnavailable(err);
      return { totalHits: 1, timeToExpire: ttlMs };
    }
  }
}
