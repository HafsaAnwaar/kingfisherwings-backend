#!/usr/bin/env node
/**
 * Backfill world sea ports + airports for all (or one) tenants.
 *
 * Usage:
 *   node scripts/seed-world-ports-all-tenants.cjs
 *   TENANT_ID=<uuid> node scripts/seed-world-ports-all-tenants.cjs
 *
 * Requires DATABASE_URL. Uses Prisma client directly.
 */
const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("fs");
const { join } = require("path");

const BATCH = 500;
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

async function seedSea(tenantId, seeds) {
  let inserted = 0;
  for (let i = 0; i < seeds.length; i += BATCH) {
    const chunk = seeds.slice(i, i + BATCH);
    const result = await withTenant(tenantId, (tx) =>
      tx.port.createMany({
        data: chunk.map((p) => ({
          tenant_id: tenantId,
          un_locode: p.un_locode,
          name: p.name,
          city: p.city ?? null,
          country_code: p.country_code,
          mode: "SEA",
          is_active: true,
        })),
        skipDuplicates: true,
      }),
    );
    inserted += result.count;
  }
  return inserted;
}

async function seedAir(tenantId, seeds) {
  let inserted = 0;
  for (let i = 0; i < seeds.length; i += BATCH) {
    const chunk = seeds.slice(i, i + BATCH);
    const result = await withTenant(tenantId, (tx) =>
      tx.airport.createMany({
        data: chunk.map((a) => ({
          tenant_id: tenantId,
          iata_code: a.iata_code,
          icao_code: a.icao_code ?? null,
          name: a.name,
          city: a.city ?? null,
          country_code: a.country_code,
          is_active: true,
        })),
        skipDuplicates: true,
      }),
    );
    inserted += result.count;
  }
  return inserted;
}

async function main() {
  const sea = loadJson("default-sea-ports.json");
  const air = loadJson("default-airports.json");
  console.log(`Catalog: ${sea.length} sea ports, ${air.length} airports`);

  const filterId = process.env.TENANT_ID;
  const tenants = await prisma.tenant.findMany({
    where: {
      deleted_at: null,
      ...(filterId ? { id: filterId } : {}),
    },
    select: { id: true, code: true, name: true },
    orderBy: { created_at: "asc" },
  });

  if (!tenants.length) {
    console.log("No tenants found.");
    return;
  }

  for (const t of tenants) {
    process.stdout.write(`[${t.code}] ${t.name} ... `);
    const seaIns = await seedSea(t.id, sea);
    const airIns = await seedAir(t.id, air);
    console.log(`sea +${seaIns}, air +${airIns}`);
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
