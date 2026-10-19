-- Custom status catalogs + entity status_code + delivery acknowledgement

ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "status_code" VARCHAR(40);
ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "status_code" VARCHAR(40);
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "status_code" VARCHAR(40);

ALTER TABLE "job_status_catalog"
  ADD COLUMN IF NOT EXISTS "maps_to_system_status" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "is_system" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "is_custom" BOOLEAN NOT NULL DEFAULT false;

UPDATE "job_status_catalog"
SET "maps_to_system_status" = "code"
WHERE "maps_to_system_status" IS NULL OR "maps_to_system_status" = '';

UPDATE "job_status_catalog"
SET "is_system" = true
WHERE "is_custom" = false;

ALTER TABLE "job_status_catalog"
  ALTER COLUMN "maps_to_system_status" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "shipment_status_catalog" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "label" VARCHAR(120) NOT NULL,
  "is_terminal" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "maps_to_system_status" VARCHAR(40) NOT NULL,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "is_custom" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "shipment_status_catalog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "shipment_status_catalog_tenant_id_code_key"
  ON "shipment_status_catalog"("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "shipment_status_catalog_tenant_id_is_active_idx"
  ON "shipment_status_catalog"("tenant_id", "is_active");

CREATE TABLE IF NOT EXISTS "quotation_status_catalog" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "label" VARCHAR(120) NOT NULL,
  "is_terminal" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "maps_to_system_status" VARCHAR(40) NOT NULL,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "is_custom" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "quotation_status_catalog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_status_catalog_tenant_id_code_key"
  ON "quotation_status_catalog"("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "quotation_status_catalog_tenant_id_is_active_idx"
  ON "quotation_status_catalog"("tenant_id", "is_active");

DO $$ BEGIN
  CREATE TYPE "DeliveryAcknowledgementStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RECEIVED_BY_ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "delivery_acknowledgements" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "status" "DeliveryAcknowledgementStatus" NOT NULL DEFAULT 'DRAFT',
  "acknowledged_at" TIMESTAMPTZ,
  "receiver_name" VARCHAR(200),
  "receiver_title" VARCHAR(120),
  "goods_condition" VARCHAR(120),
  "remarks" TEXT,
  "signature_s3_key" TEXT,
  "signature_file_url" TEXT,
  "template_snapshot" JSONB,
  "submitted_by_party_id" UUID,
  "submitted_by_user_id" UUID,
  "received_by_user_id" UUID,
  "received_at" TIMESTAMPTZ,
  "proof_of_delivery_id" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "delivery_acknowledgements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_acknowledgements_job_id_key"
  ON "delivery_acknowledgements"("job_id");
CREATE UNIQUE INDEX IF NOT EXISTS "delivery_acknowledgements_tenant_id_job_id_key"
  ON "delivery_acknowledgements"("tenant_id", "job_id");
CREATE INDEX IF NOT EXISTS "delivery_acknowledgements_tenant_id_status_idx"
  ON "delivery_acknowledgements"("tenant_id", "status");

DO $$ BEGIN
  ALTER TABLE "delivery_acknowledgements"
    ADD CONSTRAINT "delivery_acknowledgements_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
