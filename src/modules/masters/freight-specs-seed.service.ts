import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ContainerSize, Prisma } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { PrismaService } from "../../prisma/prisma.service";

type ContainerTypeSeed = {
  code: string;
  name: string;
  size: ContainerSize;
  teu: number;
  category?: string | null;
  inside_length_m?: number | null;
  inside_width_m?: number | null;
  inside_height_m?: number | null;
  door_width_m?: number | null;
  door_height_m?: number | null;
  volume_cbm?: number | null;
  volume_cft?: number | null;
  tare_kg?: number | null;
  max_cargo_kg?: number | null;
  max_payload?: number | null;
};

type AirPalletTypeSeed = {
  code: string;
  name: string;
  iata_codes?: string[];
  base_length_m?: number | null;
  base_width_m?: number | null;
  height_m?: number | null;
  usable_volume_m3?: number | null;
  inside_length_m?: number | null;
  inside_width_m?: number | null;
  inside_height_m?: number | null;
  aircraft_types?: string[];
};

@Injectable()
export class FreightSpecsSeedService {
  private readonly logger = new Logger(FreightSpecsSeedService.name);
  private containerCache: ContainerTypeSeed[] | null = null;
  private airPalletCache: AirPalletTypeSeed[] | null = null;

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

  private loadContainerTypes(): ContainerTypeSeed[] {
    if (this.containerCache) return this.containerCache;
    const path = this.resolveSeedPath("default-container-types.json");
    this.containerCache = JSON.parse(
      readFileSync(path, "utf8"),
    ) as ContainerTypeSeed[];
    return this.containerCache;
  }

  private loadAirPalletTypes(): AirPalletTypeSeed[] {
    if (this.airPalletCache) return this.airPalletCache;
    const path = this.resolveSeedPath("default-air-pallet-types.json");
    this.airPalletCache = JSON.parse(
      readFileSync(path, "utf8"),
    ) as AirPalletTypeSeed[];
    return this.airPalletCache;
  }

  async seedContainerTypes(tenantId: string, actorId?: string) {
    const seeds = this.loadContainerTypes();
    let upserted = 0;

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const seed of seeds) {
        const existing = await tx.containerType.findFirst({
          where: {
            tenant_id: tenantId,
            code: seed.code,
            deleted_at: null,
          },
        });
        const data: Prisma.ContainerTypeUncheckedCreateInput = {
          tenant_id: tenantId,
          code: seed.code,
          name: seed.name,
          size: seed.size,
          teu: seed.teu,
          category: seed.category ?? null,
          inside_length_m: seed.inside_length_m ?? null,
          inside_width_m: seed.inside_width_m ?? null,
          inside_height_m: seed.inside_height_m ?? null,
          door_width_m: seed.door_width_m ?? null,
          door_height_m: seed.door_height_m ?? null,
          volume_cbm: seed.volume_cbm ?? null,
          volume_cft: seed.volume_cft ?? null,
          tare_kg: seed.tare_kg ?? null,
          max_cargo_kg: seed.max_cargo_kg ?? null,
          max_payload: seed.max_payload ?? null,
          is_active: true,
          created_by: actorId,
          updated_by: actorId,
        };
        if (existing) {
          await tx.containerType.update({
            where: { id: existing.id },
            data: {
              name: data.name,
              size: data.size,
              teu: data.teu,
              category: data.category,
              inside_length_m: data.inside_length_m,
              inside_width_m: data.inside_width_m,
              inside_height_m: data.inside_height_m,
              door_width_m: data.door_width_m,
              door_height_m: data.door_height_m,
              volume_cbm: data.volume_cbm,
              volume_cft: data.volume_cft,
              tare_kg: data.tare_kg,
              max_cargo_kg: data.max_cargo_kg,
              max_payload: data.max_payload,
              is_active: true,
              updated_by: actorId,
              deleted_at: null,
            },
          });
        } else {
          await tx.containerType.create({ data });
        }
        upserted += 1;
      }
    });

    return {
      success: true,
      type: "container_types",
      catalog_size: seeds.length,
      upserted,
    };
  }

  async seedAirPalletTypes(tenantId: string, actorId?: string) {
    const seeds = this.loadAirPalletTypes();
    let upserted = 0;

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const seed of seeds) {
        const existing = await tx.airPalletType.findFirst({
          where: {
            tenant_id: tenantId,
            code: seed.code,
            deleted_at: null,
          },
        });
        const data: Prisma.AirPalletTypeUncheckedCreateInput = {
          tenant_id: tenantId,
          code: seed.code,
          name: seed.name,
          iata_codes: seed.iata_codes ?? [],
          base_length_m: seed.base_length_m ?? null,
          base_width_m: seed.base_width_m ?? null,
          height_m: seed.height_m ?? null,
          usable_volume_m3: seed.usable_volume_m3 ?? null,
          inside_length_m: seed.inside_length_m ?? null,
          inside_width_m: seed.inside_width_m ?? null,
          inside_height_m: seed.inside_height_m ?? null,
          aircraft_types: seed.aircraft_types ?? [],
          is_active: true,
          created_by: actorId,
          updated_by: actorId,
        };
        if (existing) {
          await tx.airPalletType.update({
            where: { id: existing.id },
            data: {
              name: data.name,
              iata_codes: data.iata_codes,
              base_length_m: data.base_length_m,
              base_width_m: data.base_width_m,
              height_m: data.height_m,
              usable_volume_m3: data.usable_volume_m3,
              inside_length_m: data.inside_length_m,
              inside_width_m: data.inside_width_m,
              inside_height_m: data.inside_height_m,
              aircraft_types: data.aircraft_types,
              is_active: true,
              updated_by: actorId,
              deleted_at: null,
            },
          });
        } else {
          await tx.airPalletType.create({ data });
        }
        upserted += 1;
      }
    });

    return {
      success: true,
      type: "air_pallet_types",
      catalog_size: seeds.length,
      upserted,
    };
  }

  async seedAllForTenant(tenantId: string, actorId?: string) {
    const container = await this.seedContainerTypes(tenantId, actorId);
    const air = await this.seedAirPalletTypes(tenantId, actorId);
    this.logger.log(
      `Freight specs seeded for tenant ${tenantId}: containers=${container.upserted}, air_pallets=${air.upserted}`,
    );
    return { container, air };
  }
}
