-- Fresa job parity: status catalog, GPUM, party refs, costing attachments, import delivery, job_date

ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'OPEN';

CREATE TYPE "JobStatusCategory" AS ENUM ('LIFECYCLE', 'OPERATIONAL');
CREATE TYPE "JobDateSource" AS ENUM ('ETD_ATD', 'ETA_ATA', 'SYSTEM_DATE');
CREATE TYPE "JobPartyRole" AS ENUM ('CLIENT', 'SHIPPER', 'CONSIGNEE', 'BILLING_PARTY', 'AGENT');
CREATE TYPE "JobPartyReferenceType" AS ENUM ('PO_NUMBER', 'CUSTOMER_REF', 'OTHER');

ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "job_date_source" "JobDateSource" NOT NULL DEFAULT 'SYSTEM_DATE';

ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "job_date" DATE;

ALTER TABLE "container_types" ADD COLUMN IF NOT EXISTS "calculation_method" VARCHAR(80);
ALTER TABLE "rate_bases" ADD COLUMN IF NOT EXISTS "calculation_method" VARCHAR(80);
ALTER TABLE "storage_slabs" ADD COLUMN IF NOT EXISTS "charge_description" VARCHAR(300);

CREATE TABLE "job_status_catalog" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "label" VARCHAR(120) NOT NULL,
  "category" "JobStatusCategory" NOT NULL DEFAULT 'OPERATIONAL',
  "is_terminal" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "job_status_catalog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "job_status_catalog_tenant_id_code_key" ON "job_status_catalog"("tenant_id", "code");
CREATE INDEX "job_status_catalog_tenant_id_is_active_idx" ON "job_status_catalog"("tenant_id", "is_active");

CREATE TABLE "job_party_references" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "party_role" "JobPartyRole" NOT NULL DEFAULT 'CLIENT',
  "party_id" UUID,
  "reference_type" "JobPartyReferenceType" NOT NULL,
  "reference_no" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  CONSTRAINT "job_party_references_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_party_references_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "job_party_references_tenant_id_job_id_idx" ON "job_party_references"("tenant_id", "job_id");
CREATE INDEX "job_party_references_tenant_id_job_id_party_role_idx" ON "job_party_references"("tenant_id", "job_id", "party_role");

CREATE TABLE "job_gpum_allocations" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "gp_percent" DECIMAL(7,4) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  CONSTRAINT "job_gpum_allocations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_gpum_allocations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "job_gpum_allocations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "job_gpum_allocations_tenant_id_job_id_user_id_key" ON "job_gpum_allocations"("tenant_id", "job_id", "user_id");
CREATE INDEX "job_gpum_allocations_tenant_id_job_id_idx" ON "job_gpum_allocations"("tenant_id", "job_id");

CREATE TABLE "job_charge_attachments" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "job_charge_id" UUID NOT NULL,
  "file_name" VARCHAR(300) NOT NULL,
  "file_url" TEXT NOT NULL,
  "s3_key" TEXT,
  "file_size" INTEGER,
  "mime_type" VARCHAR(100),
  "uploaded_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_charge_attachments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_charge_attachments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "job_charge_attachments_job_charge_id_fkey" FOREIGN KEY ("job_charge_id") REFERENCES "job_charges"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "job_charge_attachments_tenant_id_job_charge_id_idx" ON "job_charge_attachments"("tenant_id", "job_charge_id");
CREATE INDEX "job_charge_attachments_tenant_id_job_id_idx" ON "job_charge_attachments"("tenant_id", "job_id");

CREATE TABLE "job_import_delivery_details" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "shipment_id" UUID,
  "do_status" VARCHAR(40),
  "number_of_pallets" INTEGER,
  "cargo_delivered_date" DATE,
  "truck_details" VARCHAR(500),
  "driver_name" VARCHAR(200),
  "remarks" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" UUID,
  CONSTRAINT "job_import_delivery_details_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_import_delivery_details_job_id_key" UNIQUE ("job_id"),
  CONSTRAINT "job_import_delivery_details_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "job_import_delivery_details_tenant_id_cargo_delivered_date_idx" ON "job_import_delivery_details"("tenant_id", "cargo_delivered_date");

SELECT enable_rls_for_table('job_status_catalog');
SELECT enable_rls_for_table('job_party_references');
SELECT enable_rls_for_table('job_gpum_allocations');
SELECT enable_rls_for_table('job_charge_attachments');
SELECT enable_rls_for_table('job_import_delivery_details');
