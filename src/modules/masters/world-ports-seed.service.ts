import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { readFileSync } from "fs";
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

const BATCH = 500;

@Injectable()
export class WorldPortsSeedService {
  private readonly logger = new Logger(WorldPortsSeedService.name);
  private seaCache: SeaPortSeed[] | null = null;
  private airCache: AirportSeed[] | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private loadSeaPorts(): SeaPortSeed[] {
    if (this.seaCache) return this.seaCache;
    const path = join(
      process.cwd(),
      "prisma",
      "seed",
      "data",
      "default-sea-ports.json",
    );
    this.seaCache = JSON.parse(readFileSync(path, "utf8")) as SeaPortSeed[];
    return this.seaCache;
  }

  private loadAirports(): AirportSeed[] {
    if (this.airCache) return this.airCache;
    const path = join(
      process.cwd(),
      "prisma",
      "seed",
      "data",
      "default-airports.json",
    );
    this.airCache = JSON.parse(readFileSync(path, "utf8")) as AirportSeed[];
    return this.airCache;
  }

  /**
   * Inserts world sea ports for a tenant. Uses skipDuplicates on un_locode.
   * Safe to re-run — only missing codes are added.
   */
  async seedSeaPorts(tenantId: string, actorId?: string) {
    const seeds = this.loadSeaPorts();
    let inserted = 0;

    await this.prisma.runWithTenant(tenantId, async (tx: Prisma.TransactionClient) => {
      for (let i = 0; i < seeds.length; i += BATCH) {
        const chunk = seeds.slice(i, i + BATCH);
        const result = await tx.port.createMany({
          data: chunk.map((p) => ({
            tenant_id: tenantId,
            un_locode: p.un_locode,
            name: p.name,
            city: p.city,
            country_code: p.country_code,
            mode: "SEA" as const,
            is_active: true,
            created_by: actorId,
            updated_by: actorId,
          })),
          skipDuplicates: true,
        });
        inserted += result.count;
      }
    });

    return {
      success: true,
      type: "sea_ports",
      catalog_size: seeds.length,
      inserted,
    };
  }

  /**
   * Inserts world airports for a tenant. Uses skipDuplicates on iata_code.
   */
  async seedAirports(tenantId: string, actorId?: string) {
    const seeds = this.loadAirports();
    let inserted = 0;

    await this.prisma.runWithTenant(tenantId, async (tx: Prisma.TransactionClient) => {
      for (let i = 0; i < seeds.length; i += BATCH) {
        const chunk = seeds.slice(i, i + BATCH);
        const result = await tx.airport.createMany({
          data: chunk.map((a) => ({
            tenant_id: tenantId,
            iata_code: a.iata_code,
            icao_code: a.icao_code,
            name: a.name,
            city: a.city,
            country_code: a.country_code,
            is_active: true,
            created_by: actorId,
            updated_by: actorId,
          })),
          skipDuplicates: true,
        });
        inserted += result.count;
      }
    });

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

  async ensureSeaPorts(tenantId: string, actorId?: string) {
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.port.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (count < 100) {
      this.logger.log(
        `Tenant ${tenantId} has ${count} ports — seeding world sea catalog.`,
      );
      await this.seedSeaPorts(tenantId, actorId);
    }
  }

  async ensureAirports(tenantId: string, actorId?: string) {
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.airport.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (count < 50) {
      this.logger.log(
        `Tenant ${tenantId} has ${count} airports — seeding world airport catalog.`,
      );
      await this.seedAirports(tenantId, actorId);
    }
  }
}
