import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { PrismaService } from "../../prisma/prisma.service";

type SeaPortSeed = {
  un_locode: string;
  name: string;
  country_code: string;
  city?: string;
  mode?: "SEA";
};

type AirportSeed = {
  iata_code: string;
  name: string;
  country_code: string;
  city?: string;
  icao_code?: string;
};

/** Keep batches small so each tenant transaction stays under the 30s default. */
const BATCH = 250;
const BATCH_TX_TIMEOUT_MS = 120_000;

@Injectable()
export class WorldPortsSeedService {
  private readonly logger = new Logger(WorldPortsSeedService.name);
  private seaCache: SeaPortSeed[] | null = null;
  private airCache: AirportSeed[] | null = null;
  /** Prevent concurrent full-catalog seeds for the same tenant (list stampede). */
  private readonly seaSeedInFlight = new Map<string, Promise<unknown>>();
  private readonly airSeedInFlight = new Map<string, Promise<unknown>>();

  constructor(private readonly prisma: PrismaService) {}

  private resolveSeedPath(fileName: string): string {
    const candidates = [
      join(process.cwd(), "prisma", "seed", "data", fileName),
      join(__dirname, "..", "..", "..", "prisma", "seed", "data", fileName),
      join(__dirname, "..", "..", "prisma", "seed", "data", fileName),
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) return candidate;
    }
    throw new InternalServerErrorException(
      `Seed file missing: ${fileName}. Looked in: ${candidates.join(" | ")}`,
    );
  }

  private loadSeaPorts(): SeaPortSeed[] {
    if (this.seaCache) return this.seaCache;
    const path = this.resolveSeedPath("default-sea-ports.json");
    this.seaCache = JSON.parse(readFileSync(path, "utf8")) as SeaPortSeed[];
    return this.seaCache;
  }

  private loadAirports(): AirportSeed[] {
    if (this.airCache) return this.airCache;
    const path = this.resolveSeedPath("default-airports.json");
    this.airCache = JSON.parse(readFileSync(path, "utf8")) as AirportSeed[];
    return this.airCache;
  }

  /**
   * Inserts world sea ports for a tenant in per-batch transactions.
   * A single transaction for ~17k rows exceeds the default 30s timeout on Render.
   */
  async seedSeaPorts(tenantId: string, actorId?: string) {
    const seeds = this.loadSeaPorts();
    let inserted = 0;

    for (let i = 0; i < seeds.length; i += BATCH) {
      const chunk = seeds.slice(i, i + BATCH);
      const result = await this.prisma.runWithTenant(
        tenantId,
        async (tx: Prisma.TransactionClient) => {
          return tx.port.createMany({
            data: chunk.map((p) => ({
              tenant_id: tenantId,
              un_locode: p.un_locode.trim().toUpperCase(),
              name: p.name.trim(),
              city: p.city?.trim() || null,
              country_code: p.country_code.trim().toUpperCase(),
              mode: "SEA" as const,
              is_active: true,
              created_by: actorId,
              updated_by: actorId,
            })),
            skipDuplicates: true,
          });
        },
        { maxWait: 30_000, timeout: BATCH_TX_TIMEOUT_MS },
      );
      inserted += result.count;
    }

    return {
      success: true,
      type: "sea_ports",
      catalog_size: seeds.length,
      inserted,
    };
  }

  /**
   * Inserts world airports for a tenant in per-batch transactions.
   */
  async seedAirports(tenantId: string, actorId?: string) {
    const seeds = this.loadAirports();
    let inserted = 0;

    for (let i = 0; i < seeds.length; i += BATCH) {
      const chunk = seeds.slice(i, i + BATCH);
      const result = await this.prisma.runWithTenant(
        tenantId,
        async (tx: Prisma.TransactionClient) => {
          return tx.airport.createMany({
            data: chunk.map((a) => ({
              tenant_id: tenantId,
              iata_code: a.iata_code.trim().toUpperCase(),
              icao_code: a.icao_code?.trim().toUpperCase() || null,
              name: a.name.trim(),
              city: a.city?.trim() || null,
              country_code: a.country_code.trim().toUpperCase(),
              is_active: true,
              created_by: actorId,
              updated_by: actorId,
            })),
            skipDuplicates: true,
          });
        },
        { maxWait: 30_000, timeout: BATCH_TX_TIMEOUT_MS },
      );
      inserted += result.count;
    }

    return {
      success: true,
      type: "airports",
      catalog_size: seeds.length,
      inserted,
    };
  }

  async seedAllForTenant(tenantId: string, actorId?: string) {
    this.logger.log(`Seeding world ports/airports for tenant ${tenantId}`);
    const sea = await this.seedSeaPorts(tenantId, actorId);
    const air = await this.seedAirports(tenantId, actorId);
    this.logger.log(
      `Tenant ${tenantId}: sea +${sea.inserted}/${sea.catalog_size}, air +${air.inserted}/${air.catalog_size}`,
    );
    return { success: true, sea, air };
  }

  /**
   * Non-blocking: list must not wait on a full ~17k catalog seed (HTTP/gateway timeouts).
   * Explicit POST /masters/ports/seed-defaults still awaits completion.
   */
  async ensureSeaPorts(tenantId: string, actorId?: string) {
    try {
      const count = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.port.count({
          where: { tenant_id: tenantId, deleted_at: null },
        }),
      );
      if (count >= 100) return;

      if (this.seaSeedInFlight.has(tenantId)) return;

      this.logger.log(
        `Tenant ${tenantId} has ${count} ports — starting background world sea catalog seed.`,
      );
      const task = this.seedSeaPorts(tenantId, actorId)
        .then((result) => {
          this.logger.log(
            `Background sea seed done for ${tenantId}: +${result.inserted}/${result.catalog_size}`,
          );
          return result;
        })
        .catch((err) => {
          this.logger.error(
            `Background sea seed failed for ${tenantId}: ${String(err)}`,
          );
        })
        .finally(() => this.seaSeedInFlight.delete(tenantId));

      this.seaSeedInFlight.set(tenantId, task);
    } catch (err) {
      this.logger.warn(
        `ensureSeaPorts skipped for ${tenantId}: ${String(err)}`,
      );
    }
  }

  async ensureAirports(tenantId: string, actorId?: string) {
    try {
      const count = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.airport.count({
          where: { tenant_id: tenantId, deleted_at: null },
        }),
      );
      if (count >= 50) return;

      if (this.airSeedInFlight.has(tenantId)) return;

      this.logger.log(
        `Tenant ${tenantId} has ${count} airports — starting background world airport catalog seed.`,
      );
      const task = this.seedAirports(tenantId, actorId)
        .then((result) => {
          this.logger.log(
            `Background airport seed done for ${tenantId}: +${result.inserted}/${result.catalog_size}`,
          );
          return result;
        })
        .catch((err) => {
          this.logger.error(
            `Background airport seed failed for ${tenantId}: ${String(err)}`,
          );
        })
        .finally(() => this.airSeedInFlight.delete(tenantId));

      this.airSeedInFlight.set(tenantId, task);
    } catch (err) {
      this.logger.warn(
        `ensureAirports skipped for ${tenantId}: ${String(err)}`,
      );
    }
  }
}
