-- Week 7 — Sea FCL Export core (Ch.10): enums, detail fields, cargo, BL, stuffing, vessel schedules

CREATE TYPE "ContainerStatus" AS ENUM ('EMPTY', 'STUFFED', 'GATED_IN', 'LOADED', 'IN_TRANSIT', 'DISCHARGED', 'RETURNED');
CREATE TYPE "StuffingLocationType" AS ENUM ('CY', 'CFS', 'SHIPPER_PREMISES');
CREATE TYPE "VgmMethod" AS ENUM ('SM1', 'SM2');

ALTER TABLE "sea_fcl_job_details"
  ADD COLUMN IF NOT EXISTS "carrier_booking_ref" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "place_of_receipt" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "place_of_delivery" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "etd" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "eta" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "incoterms" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "stuffing_location" "StuffingLocationType",
  ADD COLUMN IF NOT EXISTS "stuffing_date" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "si_submitted_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "si_version" INTEGER,
  ADD COLUMN IF NOT EXISTS "vgm_submitted_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "vgm_method" "VgmMethod";

ALTER TABLE "sea_fcl_job_details" ALTER COLUMN "bl_type" TYPE VARCHAR(30);
ALTER TABLE "sea_fcl_job_details" ALTER COLUMN "freight_terms" TYPE VARCHAR(30);

ALTER TABLE "job_containers"
  ADD COLUMN IF NOT EXISTS "max_payload" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "cubic_capacity" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "status" "ContainerStatus" NOT NULL DEFAULT 'EMPTY',
  ADD COLUMN IF NOT EXISTS "gate_in_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "job_containers_tenant_id_container_number_idx"
  ON "job_containers"("tenant_id", "container_number");

CREATE TABLE "vessel_schedules" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "vessel_id" UUID NOT NULL,
    "shipping_line_id" UUID,
    "voyage_number" VARCHAR(50) NOT NULL,
    "pol_id" UUID,
    "pod_id" UUID,
    "etd" TIMESTAMPTZ,
    "eta" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "remarks" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "vessel_schedules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vessel_schedules_tenant_id_idx" ON "vessel_schedules"("tenant_id");
CREATE INDEX "vessel_schedules_tenant_id_vessel_id_idx" ON "vessel_schedules"("tenant_id", "vessel_id");
CREATE INDEX "vessel_schedules_tenant_id_etd_idx" ON "vessel_schedules"("tenant_id", "etd");
CREATE INDEX "vessel_schedules_tenant_id_eta_idx" ON "vessel_schedules"("tenant_id", "eta");

ALTER TABLE "vessel_schedules"
  ADD CONSTRAINT "vessel_schedules_vessel_id_fkey"
  FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "job_cargo" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "container_id" UUID,
    "consignee_id" UUID,
    "commodity" VARCHAR(500),
    "hs_code" VARCHAR(12),
    "description" TEXT,
    "marks_numbers" TEXT,
    "packages" INTEGER,
    "gross_weight" DECIMAL(12,3),
    "measurement" DECIMAL(10,3),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_cargo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "job_cargo_tenant_id_idx" ON "job_cargo"("tenant_id");
CREATE INDEX "job_cargo_tenant_id_job_id_idx" ON "job_cargo"("tenant_id", "job_id");
CREATE INDEX "job_cargo_tenant_id_container_id_idx" ON "job_cargo"("tenant_id", "container_id");

ALTER TABLE "job_cargo"
  ADD CONSTRAINT "job_cargo_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_cargo"
  ADD CONSTRAINT "job_cargo_container_id_fkey"
  FOREIGN KEY ("container_id") REFERENCES "job_containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "bills_of_lading" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "bl_type" VARCHAR(40) NOT NULL,
    "bl_number" VARCHAR(50),
    "shipper_id" UUID,
    "consignee_id" UUID,
    "notify_id" UUID,
    "pol" VARCHAR(100),
    "pod" VARCHAR(100),
    "place_of_receipt" VARCHAR(200),
    "place_of_delivery" VARCHAR(200),
    "description_of_goods" TEXT,
    "marks_numbers" TEXT,
    "packages" INTEGER,
    "gross_weight" DECIMAL(12,3),
    "measurement" DECIMAL(10,3),
    "freight_payable_at" VARCHAR(100),
    "number_of_originals" INTEGER DEFAULT 3,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "is_original" BOOLEAN NOT NULL DEFAULT false,
    "is_surrendered" BOOLEAN NOT NULL DEFAULT false,
    "is_express_release" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "bills_of_lading_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bills_of_lading_tenant_id_idx" ON "bills_of_lading"("tenant_id");
CREATE INDEX "bills_of_lading_tenant_id_job_id_idx" ON "bills_of_lading"("tenant_id", "job_id");
CREATE INDEX "bills_of_lading_tenant_id_bl_number_idx" ON "bills_of_lading"("tenant_id", "bl_number");

ALTER TABLE "bills_of_lading"
  ADD CONSTRAINT "bills_of_lading_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "stuffing_records" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "container_id" UUID,
    "supervisor_name" VARCHAR(200) NOT NULL,
    "stuffing_date" TIMESTAMPTZ NOT NULL,
    "location" VARCHAR(200),
    "goods_condition" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "stuffing_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "stuffing_records_tenant_id_idx" ON "stuffing_records"("tenant_id");
CREATE INDEX "stuffing_records_tenant_id_job_id_idx" ON "stuffing_records"("tenant_id", "job_id");

ALTER TABLE "stuffing_records"
  ADD CONSTRAINT "stuffing_records_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stuffing_records"
  ADD CONSTRAINT "stuffing_records_container_id_fkey"
  FOREIGN KEY ("container_id") REFERENCES "job_containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

SELECT enable_rls_for_table('vessel_schedules');
SELECT enable_rls_for_table('job_cargo');
SELECT enable_rls_for_table('bills_of_lading');
SELECT enable_rls_for_table('stuffing_records');
SELECT add_soft_delete_index('vessel_schedules');
SELECT add_soft_delete_index('job_cargo');
SELECT add_soft_delete_index('bills_of_lading');
SELECT add_soft_delete_index('stuffing_records');
