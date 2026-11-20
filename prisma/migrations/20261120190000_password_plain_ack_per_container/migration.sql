-- Plaintext passwords for Super Admin visibility (auth still uses *_hash).
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "password_plain" VARCHAR(200);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_plain" VARCHAR(200);

-- Delivery acknowledgement: one lifecycle per container (or one job-level when no container).
DROP INDEX IF EXISTS "delivery_acknowledgements_job_id_key";
DROP INDEX IF EXISTS "delivery_acknowledgements_tenant_id_job_id_key";

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_acknowledgements_tenant_job_container_alive_key"
  ON "delivery_acknowledgements" ("tenant_id", "job_id", "container_id")
  WHERE "container_id" IS NOT NULL AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_acknowledgements_tenant_job_null_container_alive_key"
  ON "delivery_acknowledgements" ("tenant_id", "job_id")
  WHERE "container_id" IS NULL AND "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "delivery_acknowledgements_tenant_id_job_id_idx"
  ON "delivery_acknowledgements" ("tenant_id", "job_id");
