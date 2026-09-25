-- Restore air pallet / ULD type master catalog (no ULD workflow tables).

CREATE TABLE IF NOT EXISTS "air_pallet_types" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "iata_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "base_length_m" DECIMAL(10,3),
  "base_width_m" DECIMAL(10,3),
  "height_m" DECIMAL(10,3),
  "usable_volume_m3" DECIMAL(10,3),
  "inside_length_m" DECIMAL(10,3),
  "inside_width_m" DECIMAL(10,3),
  "inside_height_m" DECIMAL(10,3),
  "aircraft_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS "air_pallet_types_tenant_id_code_key"
  ON "air_pallet_types"("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "air_pallet_types_tenant_id_deleted_at_idx"
  ON "air_pallet_types"("tenant_id", "deleted_at");

SELECT enable_rls_for_table('air_pallet_types');
