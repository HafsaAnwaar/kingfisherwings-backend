#!/usr/bin/env node
/**
 * Upsert container + air pallet type specs for all (or one) tenants.
 *
 * Usage:
 *   node scripts/seed-freight-specs-all-tenants.cjs
 *   TENANT_ID=<uuid> node scripts/seed-freight-specs-all-tenants.cjs
 *
 * Requires DATABASE_URL.
 */
const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("fs");
const { join } = require("path");

const prisma = new PrismaClient();

function loadJson(name) {
  return JSON.parse(
    readFileSync(join(__dirname, "..", "prisma", "seed", "data", name), "utf8"),
  );
}

async function withTenant(tenantId, fn) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SELECT set_tenant_context($1::uuid)`,
      tenantId,
    );
    return fn(tx);
  });
}

async function seedContainers(tenantId, seeds) {
  let upserted = 0;
  await withTenant(tenantId, async (tx) => {
    for (const seed of seeds) {
      const existing = await tx.containerType.findFirst({
        where: { tenant_id: tenantId, code: seed.code, deleted_at: null },
      });
      const payload = {
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
      };
      if (existing) {
        await tx.containerType.update({
          where: { id: existing.id },
          data: payload,
        });
      } else {
        await tx.containerType.create({
          data: { tenant_id: tenantId, code: seed.code, ...payload },
        });
      }
      upserted += 1;
    }
  });
  return upserted;
}

async function seedAirPallets(tenantId, seeds) {
  let upserted = 0;
  await withTenant(tenantId, async (tx) => {
    for (const seed of seeds) {
      const existing = await tx.airPalletType.findFirst({
        where: { tenant_id: tenantId, code: seed.code, deleted_at: null },
      });
      const payload = {
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
      };
      if (existing) {
        await tx.airPalletType.update({
          where: { id: existing.id },
          data: { ...payload, deleted_at: null },
        });
      } else {
        await tx.airPalletType.create({
          data: { tenant_id: tenantId, code: seed.code, ...payload },
        });
      }
      upserted += 1;
    }
  });
  return upserted;
}

async function main() {
  const containers = loadJson("default-container-types.json");
  const airPallets = loadJson("default-air-pallet-types.json");
  const only = process.env.TENANT_ID;

  const tenants = only
    ? await prisma.tenant.findMany({ where: { id: only } })
    : await prisma.tenant.findMany({ where: { deleted_at: null } });

  for (const t of tenants) {
    const c = await seedContainers(t.id, containers);
    const a = await seedAirPallets(t.id, airPallets);
    console.log(`tenant ${t.id}: containers=${c}, air_pallets=${a}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
