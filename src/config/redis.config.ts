// src/config/redis.config.ts
import { registerAs } from "@nestjs/config";

export default registerAs("redis", () => ({
  enabled: process.env.REDIS_ENABLED !== "false",
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB ?? "0", 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX ?? "fresa:",
  ttl: {
    default: parseInt(process.env.REDIS_TTL_DEFAULT ?? "900", 10),
    session: parseInt(process.env.REDIS_TTL_SESSION ?? "86400", 10),
    permissions: parseInt(process.env.REDIS_TTL_PERMISSIONS ?? "300", 10),
    exchangeRates: parseInt(process.env.REDIS_TTL_EXCHANGE_RATES ?? "3600", 10),
    masters: parseInt(process.env.REDIS_TTL_MASTERS ?? "86400", 10),
  },
}));
