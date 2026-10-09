-- Enquiry 5-step wizard fields + charge charges + ops continuum side panels

DO $$ BEGIN
  CREATE TYPE "OpsEntityType" AS ENUM ('ENQUIRY', 'QUOTATION', 'SHIPMENT', 'JOB');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "follow_ups"
  ADD COLUMN IF NOT EXISTS "quotation_id" UUID,
  ADD COLUMN IF NOT EXISTS "shipment_id" UUID,
  ADD COLUMN IF NOT EXISTS "job_id" UUID;

CREATE INDEX IF NOT EXISTS "follow_ups_tenant_id_quotation_id_idx" ON "follow_ups" ("tenant_id", "quotation_id");
CREATE INDEX IF NOT EXISTS "follow_ups_tenant_id_shipment_id_idx" ON "follow_ups" ("tenant_id", "shipment_id");
CREATE INDEX IF NOT EXISTS "follow_ups_tenant_id_job_id_idx" ON "follow_ups" ("tenant_id", "job_id");

ALTER TABLE "enquiries"
  ADD COLUMN IF NOT EXISTS "sales_coordinator_id" UUID,
  ADD COLUMN IF NOT EXISTS "price_coordinator_id" UUID,
  ADD COLUMN IF NOT EXISTS "enquiry_date" DATE,
  ADD COLUMN IF NOT EXISTS "shipper_id" UUID,
  ADD COLUMN IF NOT EXISTS "consignee_id" UUID,
  ADD COLUMN IF NOT EXISTS "shipper_address" TEXT,
  ADD COLUMN IF NOT EXISTS "consignee_address" TEXT,
  ADD COLUMN IF NOT EXISTS "customer_address" TEXT,
  ADD COLUMN IF NOT EXISTS "payable_at" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "dispatch_at" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "carrier_id" UUID,
  ADD COLUMN IF NOT EXISTS "voyage_number" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "vessel_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "unit_price" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "net_weight" DECIMAL(12,3),
  ADD COLUMN IF NOT EXISTS "weight_unit" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "cbm_unit" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "hs_code" VARCHAR(12);

CREATE TABLE IF NOT EXISTS "enquiry_charges" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "enquiry_id" UUID NOT NULL REFERENCES "enquiries"("id") ON DELETE CASCADE,
  "party_id" UUID,
  "department_id" UUID,
  "charge_code_id" UUID,
  "description" VARCHAR(300) NOT NULL,
  "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
  "unit_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "amount" DECIMAL(18,4) NOT NULL,
  "currency_code" CHAR(3) NOT NULL,
  "is_cost" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "enquiry_charges_tenant_id_enquiry_id_idx" ON "enquiry_charges" ("tenant_id", "enquiry_id");

CREATE TABLE IF NOT EXISTS "ops_entity_attachments" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "entity_type" "OpsEntityType" NOT NULL,
  "entity_id" UUID NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "storage_key" VARCHAR(500) NOT NULL,
  "mime_type" VARCHAR(120),
  "size_bytes" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "ops_entity_attachments_tenant_entity_idx"
  ON "ops_entity_attachments" ("tenant_id", "entity_type", "entity_id");

CREATE TABLE IF NOT EXISTS "ops_entity_references" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "entity_type" "OpsEntityType" NOT NULL,
  "entity_id" UUID NOT NULL,
  "ref_type" VARCHAR(80) NOT NULL,
  "ref_value" VARCHAR(300) NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "ops_entity_references_tenant_entity_idx"
  ON "ops_entity_references" ("tenant_id", "entity_type", "entity_id");

CREATE TABLE IF NOT EXISTS "ops_entity_tags" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "entity_type" "OpsEntityType" NOT NULL,
  "entity_id" UUID NOT NULL,
  "tag" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "ops_entity_tags_unique"
  ON "ops_entity_tags" ("tenant_id", "entity_type", "entity_id", "tag");
CREATE INDEX IF NOT EXISTS "ops_entity_tags_tenant_entity_idx"
  ON "ops_entity_tags" ("tenant_id", "entity_type", "entity_id");

CREATE TABLE IF NOT EXISTS "ops_entity_links" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "entity_type" "OpsEntityType" NOT NULL,
  "entity_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "url" VARCHAR(1000) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "ops_entity_links_tenant_entity_idx"
  ON "ops_entity_links" ("tenant_id", "entity_type", "entity_id");

CREATE TABLE IF NOT EXISTS "ops_entity_likes" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "entity_type" "OpsEntityType" NOT NULL,
  "entity_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "ops_entity_likes_unique"
  ON "ops_entity_likes" ("tenant_id", "entity_type", "entity_id", "user_id");
CREATE INDEX IF NOT EXISTS "ops_entity_likes_tenant_entity_idx"
  ON "ops_entity_likes" ("tenant_id", "entity_type", "entity_id");

CREATE TABLE IF NOT EXISTS "ops_entity_complaints" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "entity_type" "OpsEntityType" NOT NULL,
  "entity_id" UUID NOT NULL,
  "subject" VARCHAR(200) NOT NULL,
  "body" TEXT NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "closed_at" TIMESTAMPTZ,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "ops_entity_complaints_tenant_entity_idx"
  ON "ops_entity_complaints" ("tenant_id", "entity_type", "entity_id");
