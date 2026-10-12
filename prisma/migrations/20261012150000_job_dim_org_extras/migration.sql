-- Tenant volumetric divisor + org party snapshot + dimension→cargo sync link

ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "volumetric_divisor_cm" INTEGER NOT NULL DEFAULT 6000;

ALTER TABLE "job_organizations"
  ADD COLUMN IF NOT EXISTS "party_snapshot" JSONB;

ALTER TABLE "job_dimension_lines"
  ADD COLUMN IF NOT EXISTS "synced_cargo_id" UUID;

ALTER TABLE "job_dimension_lines"
  ADD CONSTRAINT "job_dimension_lines_synced_cargo_id_fkey"
  FOREIGN KEY ("synced_cargo_id") REFERENCES "job_cargo"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "job_dimension_lines_tenant_id_synced_cargo_id_idx"
  ON "job_dimension_lines"("tenant_id", "synced_cargo_id");
