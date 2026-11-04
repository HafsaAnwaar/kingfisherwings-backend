-- Custom container statuses, air MAWB fields, and air waybill records.

ALTER TABLE "jobs"
  ADD COLUMN IF NOT EXISTS "primary_container_status_code" VARCHAR(40);

ALTER TABLE "job_containers"
  ADD COLUMN IF NOT EXISTS "status_code" VARCHAR(40);

ALTER TABLE "air_job_details"
  ADD COLUMN IF NOT EXISTS "flight_status" VARCHAR(40);

ALTER TABLE "air_booking_forms"
  ADD COLUMN IF NOT EXISTS "flight_status" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "mawb_number" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "hawb_number" VARCHAR(50);

CREATE TABLE IF NOT EXISTS "container_status_catalog" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "label" VARCHAR(120) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "maps_to_system_status" VARCHAR(40) NOT NULL,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "is_custom" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "container_status_catalog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "container_status_catalog_tenant_id_code_key"
  ON "container_status_catalog"("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "container_status_catalog_tenant_id_is_active_idx"
  ON "container_status_catalog"("tenant_id", "is_active");

CREATE TABLE IF NOT EXISTS "air_waybills" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "awb_type" VARCHAR(10) NOT NULL,
  "awb_number" VARCHAR(50),
  "flight_number" VARCHAR(20),
  "flight_status" VARCHAR(40),
  "shipper_id" UUID,
  "consignee_id" UUID,
  "pieces" INTEGER,
  "gross_weight" DECIMAL(12, 3),
  "dimensions" TEXT,
  "is_draft" BOOLEAN NOT NULL DEFAULT true,
  "is_original" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "air_waybills_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "air_waybills_tenant_id_idx" ON "air_waybills"("tenant_id");
CREATE INDEX IF NOT EXISTS "air_waybills_tenant_id_job_id_idx" ON "air_waybills"("tenant_id", "job_id");
CREATE INDEX IF NOT EXISTS "air_waybills_tenant_id_awb_number_idx" ON "air_waybills"("tenant_id", "awb_number");

DO $$ BEGIN
  ALTER TABLE "air_waybills"
    ADD CONSTRAINT "air_waybills_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  PERFORM enable_rls_for_table('container_status_catalog');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  PERFORM enable_rls_for_table('air_waybills');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
