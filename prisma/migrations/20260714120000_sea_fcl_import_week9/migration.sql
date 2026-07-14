-- Week 9 — Sea FCL Import (Ch.11): import fields, free days, deposits, POD, damage

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PRE_CAN';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CAN';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'EXCHANGE_LETTER';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'UNDERTAKE_LETTER';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'TRANSPORT_REQUEST';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SHIPPING_ADVICE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PROOF_OF_DELIVERY';

CREATE TYPE "CustomsClearanceStatus" AS ENUM ('PENDING', 'FILED', 'QUERY', 'CLEARED', 'RELEASED');
CREATE TYPE "DepositType" AS ENUM ('CUSTOMS', 'PORT');

ALTER TABLE "sea_fcl_job_details"
  ADD COLUMN IF NOT EXISTS "mbl_number_from_line" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "hbl_number_from_agent" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "actual_eta" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "customs_entry_number" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "customs_examination_details" TEXT,
  ADD COLUMN IF NOT EXISTS "customs_duty_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "customs_tax_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "customs_clearance_date" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "customs_status" "CustomsClearanceStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "customs_broker_id" UUID,
  ADD COLUMN IF NOT EXISTS "linked_export_job_id" UUID,
  ADD COLUMN IF NOT EXISTS "cfs_storage_rate_per_day" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "cfs_storage_start_date" DATE;

ALTER TABLE "job_containers"
  ADD COLUMN IF NOT EXISTS "returned_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "return_condition" TEXT;

CREATE TABLE "container_free_days" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "container_id" UUID NOT NULL,
    "free_days_allowed" INTEGER NOT NULL DEFAULT 7,
    "last_free_day_date" DATE,
    "demurrage_start_date" DATE,
    "detention_start_date" DATE,
    "demurrage_rate_per_day" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "detention_rate_per_day" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "demurrage_accrued" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "detention_accrued" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "last_calculated_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "container_free_days_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "container_free_days_container_id_key" ON "container_free_days"("container_id");
CREATE INDEX "container_free_days_tenant_id_idx" ON "container_free_days"("tenant_id");
CREATE INDEX "container_free_days_tenant_id_job_id_idx" ON "container_free_days"("tenant_id", "job_id");

ALTER TABLE "container_free_days"
  ADD CONSTRAINT "container_free_days_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "container_free_days"
  ADD CONSTRAINT "container_free_days_container_id_fkey"
  FOREIGN KEY ("container_id") REFERENCES "job_containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "job_deposits" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "deposit_type" "DepositType" NOT NULL,
    "deposit_amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'AED',
    "deposit_receipt_number" VARCHAR(100),
    "deposit_expiry_date" DATE,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "job_deposits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "job_deposits_tenant_id_idx" ON "job_deposits"("tenant_id");
CREATE INDEX "job_deposits_tenant_id_job_id_idx" ON "job_deposits"("tenant_id", "job_id");
CREATE INDEX "job_deposits_tenant_id_deposit_expiry_date_idx" ON "job_deposits"("tenant_id", "deposit_expiry_date");

ALTER TABLE "job_deposits"
  ADD CONSTRAINT "job_deposits_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "part_deliveries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "container_id" UUID,
    "consignee_id" UUID,
    "delivery_date" TIMESTAMPTZ NOT NULL,
    "packages_delivered" INTEGER NOT NULL,
    "quantity_remaining" INTEGER,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "part_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "part_deliveries_tenant_id_idx" ON "part_deliveries"("tenant_id");
CREATE INDEX "part_deliveries_tenant_id_job_id_idx" ON "part_deliveries"("tenant_id", "job_id");

ALTER TABLE "part_deliveries"
  ADD CONSTRAINT "part_deliveries_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "proofs_of_delivery" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "container_id" UUID,
    "actual_delivery_date" TIMESTAMPTZ NOT NULL,
    "delivered_by" VARCHAR(200),
    "received_by" VARCHAR(200),
    "signature_image_path" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "proofs_of_delivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "proofs_of_delivery_tenant_id_idx" ON "proofs_of_delivery"("tenant_id");
CREATE INDEX "proofs_of_delivery_tenant_id_job_id_idx" ON "proofs_of_delivery"("tenant_id", "job_id");

ALTER TABLE "proofs_of_delivery"
  ADD CONSTRAINT "proofs_of_delivery_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "damage_reports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "container_id" UUID,
    "damage_description" TEXT NOT NULL,
    "photo_urls" TEXT[],
    "survey_report_number" VARCHAR(100),
    "reported_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "damage_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "damage_reports_tenant_id_idx" ON "damage_reports"("tenant_id");
CREATE INDEX "damage_reports_tenant_id_job_id_idx" ON "damage_reports"("tenant_id", "job_id");

ALTER TABLE "damage_reports"
  ADD CONSTRAINT "damage_reports_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "damage_reports"
  ADD CONSTRAINT "damage_reports_container_id_fkey"
  FOREIGN KEY ("container_id") REFERENCES "job_containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

SELECT enable_rls_for_table('container_free_days');
SELECT enable_rls_for_table('job_deposits');
SELECT enable_rls_for_table('part_deliveries');
SELECT enable_rls_for_table('proofs_of_delivery');
SELECT enable_rls_for_table('damage_reports');
SELECT add_soft_delete_index('container_free_days');
SELECT add_soft_delete_index('job_deposits');
SELECT add_soft_delete_index('part_deliveries');
SELECT add_soft_delete_index('proofs_of_delivery');
SELECT add_soft_delete_index('damage_reports');
