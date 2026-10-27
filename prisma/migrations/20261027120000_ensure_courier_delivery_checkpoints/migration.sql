-- Repair: week19 courier_delivery_checkpoints may be missing on DBs that
-- partially applied land/courier migrations. Fully idempotent.
CREATE TABLE IF NOT EXISTS "courier_delivery_checkpoints" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "checkpoint" VARCHAR(100) NOT NULL,
    "scanned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barcode_scanned" VARCHAR(80),
    "location" VARCHAR(200),
    "notes" TEXT,
    "scanned_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "courier_delivery_checkpoints_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "courier_delivery_checkpoints_tenant_id_idx"
  ON "courier_delivery_checkpoints"("tenant_id");
CREATE INDEX IF NOT EXISTS "courier_delivery_checkpoints_tenant_id_job_id_idx"
  ON "courier_delivery_checkpoints"("tenant_id", "job_id");

DO $$ BEGIN
  ALTER TABLE "courier_delivery_checkpoints"
    ADD CONSTRAINT "courier_delivery_checkpoints_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- enable_rls_for_table CREATE POLICYs without IF NOT EXISTS; swallow duplicate_object.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'enable_rls_for_table') THEN
    PERFORM enable_rls_for_table('courier_delivery_checkpoints');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
