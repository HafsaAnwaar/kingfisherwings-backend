import { ConfigService } from "@nestjs/config";
import type { RedisOptions } from "ioredis";

const MAX_RECONNECT_ATTEMPTS = 5;

function retryStrategy(times: number): number | null {
  if (times > MAX_RECONNECT_ATTEMPTS) return null;
  return Math.min(times * 500, 3000);
}

export function isRedisEnabled(config: ConfigService): boolean {
  return config.get<boolean>("redis.enabled") !== false;
}

/** Use only after load-env.ts has run (app bootstrap). */
export function isRedisEnabledEnv(): boolean {
  return process.env.REDIS_ENABLED !== "false";
}

export function buildRedisClientOptions(config: ConfigService): RedisOptions {
  return {
    host: config.get<string>("redis.host") ?? "localhost",
    port: config.get<number>("redis.port") ?? 6379,
    password: config.get<string>("redis.password") || undefined,
    db: config.get<number>("redis.db") ?? 0,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    retryStrategy,
  };
}

/** Bull requires maxRetriesPerRequest: null and allows offline queue. */
export function buildBullRedisOptions(config: ConfigService): RedisOptions {
  return {
    host: config.get<string>("redis.host") ?? "localhost",
    port: config.get<number>("redis.port") ?? 6379,
    password: config.get<string>("redis.password") || undefined,
    db: config.get<number>("redis.db") ?? 0,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy,
  };
}
