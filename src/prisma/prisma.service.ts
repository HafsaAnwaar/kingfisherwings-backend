import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { setTenantContextQuery } from "../common/utils/rls.util";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(private readonly config: ConfigService) {
    const connectionString = config.get<string>("DATABASE_URL");
    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured.");
    }

    const isNeon = /neon\.tech/i.test(connectionString);
    const pool = new Pool({
      connectionString: toNodePgConnectionString(connectionString),
      // Neon pooler + scale-to-zero: fewer sockets, longer connect wait for compute wake.
      max: parseInt(
        config.get<string>("DATABASE_POOL_MAX") ?? (isNeon ? "10" : "20"),
        10,
      ),
      connectionTimeoutMillis: parseInt(
        config.get<string>("DATABASE_CONNECT_TIMEOUT_MS") ??
          (isNeon ? "30000" : "10000"),
        10,
      ),
      idleTimeoutMillis: parseInt(
        config.get<string>("DATABASE_IDLE_TIMEOUT_MS") ?? "20000",
        10,
      ),
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  /** Neon (and other hosted Postgres) can reject the first TCP attempt while compute wakes. */
  private async connectWithRetry(attempts = 3): Promise<void> {
    let lastError: unknown;
    for (let i = 1; i <= attempts; i++) {
      try {
        await this.$connect();
        return;
      } catch (error: unknown) {
        lastError = error;
        if (!isTransientDbError(error) || i === attempts) {
          throw error;
        }
        const delayMs = 2000 * i;
        this.logger.warn(
          `Database connect attempt ${i}/${attempts} failed (${errorMessage(error)}). Retrying in ${delayMs}ms.`,
        );
        await sleep(delayMs);
      }
    }
    throw lastError;
  }

  async listActiveTenants() {
    return this.withTransientRetry(() =>
      this.tenant.findMany({
        where: {
          status: { in: ["ACTIVE", "TRIAL"] },
          is_active: true,
          deleted_at: null,
        },
        select: { id: true, name: true },
      }),
    );
  }

  async withTransientRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
    let lastError: unknown;
    for (let i = 1; i <= attempts; i++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;
        if (!isTransientDbError(error) || i === attempts) {
          throw error;
        }
        const delayMs = 2000 * i;
        this.logger.warn(
          `Transient database error (attempt ${i}/${attempts}): ${errorMessage(error)}. Retrying in ${delayMs}ms.`,
        );
        await sleep(delayMs);
      }
    }
    throw lastError;
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }

  /**
   * Runs `callback` inside a single Postgres transaction with
   * `app.tenant_id` set for its entire duration, so every tenant-scoped
   * table's RLS policy (see prisma/migrations/*_enable_row_level_security)
   * evaluates against the right tenant.
   */
  async runWithTenant<T>(
    tenantId: string,
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number },
  ): Promise<T> {
    if (!tenantId?.trim()) {
      throw new BadRequestException(
        "Tenant context is required for this operation.",
      );
    }

    return this.$transaction(
      async (tx) => {
        await tx.$executeRaw(setTenantContextQuery(tenantId));
        return callback(tx);
      },
      {
        maxWait: options?.maxWait ?? 15_000,
        timeout: options?.timeout ?? 30_000,
      },
    );
  }
}

function toNodePgConnectionString(url: string): string {
  const [base, query = ""] = url.split("?");
  const params = query
    .split("&")
    .filter(Boolean)
    // node-pg is not libpq; Neon’s channel_binding=require triggers SSL warnings and failed handshakes.
    .filter((part) => !part.toLowerCase().startsWith("channel_binding="));
  const keys = new Set(params.map((part) => part.split("=")[0]?.toLowerCase()));
  if (!keys.has("connect_timeout")) {
    params.push("connect_timeout=30");
  }
  if (!keys.has("sslmode")) {
    params.push("sslmode=require");
  }
  return params.length ? `${base}?${params.join("&")}` : base;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

/** Neon cold start, dropped pooler sockets, brief network blips. */
export function isTransientDbError(error: unknown): boolean {
  const message = errorMessage(error);
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  return (
    code === "P1001" ||
    code === "P1017" ||
    code === "P2024" ||
    /can't reach database server/i.test(message) ||
    /connection terminated/i.test(message) ||
    /connection refused/i.test(message) ||
    /timeout expired/i.test(message) ||
    /ECONNRESET/i.test(message) ||
    /ETIMEDOUT/i.test(message) ||
    /ECONNREFUSED/i.test(message) ||
    /server closed the connection/i.test(message)
  );
}
