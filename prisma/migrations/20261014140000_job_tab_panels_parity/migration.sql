-- Job detail thin tabs: routing legs, exchange rates, customs/SB-BOE refs

CREATE TABLE IF NOT EXISTS "job_routing_legs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "leg_sequence" INTEGER NOT NULL DEFAULT 1,
  "transport_mode" VARCHAR(20),
  "port_id" UUID,
  "origin_port_id" UUID,
  "dest_port_id" UUID,
  "etd" DATE,
  "eta" DATE,
  "carrier_id" UUID,
  "vessel_name" VARCHAR(200),
  "voyage_number" VARCHAR(50),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_routing_legs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_routing_legs_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "job_routing_legs_tenant_id_job_id_idx"
  ON "job_routing_legs"("tenant_id", "job_id");

CREATE TABLE IF NOT EXISTS "job_exchange_rates" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "currency_code" CHAR(3) NOT NULL,
  "exchange_rate" DECIMAL(20,8) NOT NULL,
  "effective_date" DATE,
  "source" VARCHAR(80),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_exchange_rates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_exchange_rates_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "job_exchange_rates_tenant_id_job_id_idx"
  ON "job_exchange_rates"("tenant_id", "job_id");
CREATE INDEX IF NOT EXISTS "job_exchange_rates_tenant_id_job_id_currency_code_idx"
  ON "job_exchange_rates"("tenant_id", "job_id", "currency_code");

CREATE TABLE IF NOT EXISTS "job_customs_refs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "sb_number" VARCHAR(50),
  "boe_number" VARCHAR(50),
  "customs_house" VARCHAR(100),
  "customs_status" VARCHAR(40),
  "filed_at" DATE,
  "cleared_at" DATE,
  "remarks" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_customs_refs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_customs_refs_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "job_customs_refs_tenant_id_job_id_idx"
  ON "job_customs_refs"("tenant_id", "job_id");

-- Seed one routing leg from existing job ports when none exist
INSERT INTO "job_routing_legs" (
  "tenant_id", "job_id", "leg_sequence", "origin_port_id", "dest_port_id", "etd", "eta"
)
SELECT j."tenant_id", j."id", 1, j."origin_port_id", j."dest_port_id", j."etd", j."eta"
FROM "jobs" j
WHERE j."deleted_at" IS NULL
  AND (j."origin_port_id" IS NOT NULL OR j."dest_port_id" IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM "job_routing_legs" r
    WHERE r."job_id" = j."id" AND r."deleted_at" IS NULL
  );
