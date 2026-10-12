-- Organization / Dimension / Container tab parity

ALTER TYPE "JobPartyRole" ADD VALUE IF NOT EXISTS 'NOTIFY';

CREATE TYPE "JobContainerKind" AS ENUM ('PLANNED', 'ACTUAL');
CREATE TYPE "DimensionLengthUnit" AS ENUM ('CM', 'IN', 'M', 'MM', 'FT');
CREATE TYPE "DimensionWeightUnit" AS ENUM ('KG', 'LB', 'MT', 'G');
CREATE TYPE "DimensionVolumeUnit" AS ENUM ('CBM', 'CFT', 'CI');
CREATE TYPE "DimensionPackageType" AS ENUM (
  'PACKAGES', 'CARTONS', 'PALLETS', 'CRATES', 'DRUMS', 'BAGS', 'BALES', 'BOXES', 'UNITS', 'OTHER'
);

-- Job containers: job-scoped + Fresa fields
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "job_id" UUID;
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "line_no" INTEGER;
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "container_kind" "JobContainerKind" NOT NULL DEFAULT 'ACTUAL';
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "actual_seal" VARCHAR(30);
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "packages" INTEGER;
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "hs_code" VARCHAR(12);
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "net_weight" DECIMAL(10,3);
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "volume_weight" DECIMAL(10,3);
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "chargeable_units" DECIMAL(12,3);
ALTER TABLE "job_containers" ADD COLUMN IF NOT EXISTS "shipment_id" UUID;

UPDATE "job_containers" jc
SET "job_id" = s.job_id
FROM "sea_fcl_job_details" s
WHERE jc."sea_fcl_detail_id" = s.id
  AND jc."job_id" IS NULL;

-- Orphan safety: delete containers that cannot be backfilled (should be none)
DELETE FROM "job_containers" WHERE "job_id" IS NULL;

ALTER TABLE "job_containers" ALTER COLUMN "job_id" SET NOT NULL;
ALTER TABLE "job_containers" ALTER COLUMN "sea_fcl_detail_id" DROP NOT NULL;

ALTER TABLE "job_containers"
  ADD CONSTRAINT "job_containers_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_containers"
  ADD CONSTRAINT "job_containers_shipment_id_fkey"
  FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "job_containers_tenant_id_job_id_idx" ON "job_containers"("tenant_id", "job_id");
CREATE INDEX IF NOT EXISTS "job_containers_tenant_id_job_id_container_kind_idx"
  ON "job_containers"("tenant_id", "job_id", "container_kind");

CREATE TABLE "job_organizations" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "org_type" "JobPartyRole" NOT NULL,
  "party_id" UUID NOT NULL,
  "is_primary_customer" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_organizations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_organizations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "job_organizations_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "job_organizations_tenant_id_job_id_org_type_key"
  ON "job_organizations"("tenant_id", "job_id", "org_type");
CREATE INDEX "job_organizations_tenant_id_job_id_idx" ON "job_organizations"("tenant_id", "job_id");
CREATE INDEX "job_organizations_tenant_id_party_id_idx" ON "job_organizations"("tenant_id", "party_id");

-- Seed CLIENT org from existing job party FKs
INSERT INTO "job_organizations" ("tenant_id", "job_id", "org_type", "party_id", "is_primary_customer", "created_at", "updated_at")
SELECT j.tenant_id, j.id, 'CLIENT'::"JobPartyRole", j.billing_party_id, true, NOW(), NOW()
FROM "jobs" j
WHERE j.billing_party_id IS NOT NULL AND j.deleted_at IS NULL
ON CONFLICT ("tenant_id", "job_id", "org_type") DO NOTHING;

INSERT INTO "job_organizations" ("tenant_id", "job_id", "org_type", "party_id", "is_primary_customer", "created_at", "updated_at")
SELECT j.tenant_id, j.id, 'SHIPPER'::"JobPartyRole", j.shipper_id, false, NOW(), NOW()
FROM "jobs" j
WHERE j.shipper_id IS NOT NULL AND j.deleted_at IS NULL
ON CONFLICT ("tenant_id", "job_id", "org_type") DO NOTHING;

INSERT INTO "job_organizations" ("tenant_id", "job_id", "org_type", "party_id", "is_primary_customer", "created_at", "updated_at")
SELECT j.tenant_id, j.id, 'CONSIGNEE'::"JobPartyRole", j.consignee_id, false, NOW(), NOW()
FROM "jobs" j
WHERE j.consignee_id IS NOT NULL AND j.deleted_at IS NULL
ON CONFLICT ("tenant_id", "job_id", "org_type") DO NOTHING;

INSERT INTO "job_organizations" ("tenant_id", "job_id", "org_type", "party_id", "is_primary_customer", "created_at", "updated_at")
SELECT j.tenant_id, j.id, 'AGENT'::"JobPartyRole", j.agent_id, false, NOW(), NOW()
FROM "jobs" j
WHERE j.agent_id IS NOT NULL AND j.deleted_at IS NULL
ON CONFLICT ("tenant_id", "job_id", "org_type") DO NOTHING;

CREATE TABLE "job_dimension_lines" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "line_no" INTEGER NOT NULL,
  "length_unit" "DimensionLengthUnit" NOT NULL DEFAULT 'CM',
  "length" DECIMAL(12,3),
  "width" DECIMAL(12,3),
  "height" DECIMAL(12,3),
  "no_of_pcs" INTEGER NOT NULL DEFAULT 1,
  "package_type" "DimensionPackageType" NOT NULL DEFAULT 'PACKAGES',
  "g_weight" DECIMAL(12,3),
  "g_weight_unit" "DimensionWeightUnit" NOT NULL DEFAULT 'KG',
  "v_weight" DECIMAL(12,3),
  "v_weight_unit" "DimensionWeightUnit" NOT NULL DEFAULT 'KG',
  "n_weight" DECIMAL(12,3),
  "n_weight_unit" "DimensionWeightUnit" NOT NULL DEFAULT 'KG',
  "total_weight" DECIMAL(12,3),
  "total_weight_unit" "DimensionWeightUnit" NOT NULL DEFAULT 'KG',
  "volume" DECIMAL(12,6),
  "volume_unit" "DimensionVolumeUnit" NOT NULL DEFAULT 'CBM',
  "hs_code" VARCHAR(12),
  "dimension_type" VARCHAR(80),
  "cod" VARCHAR(80),
  "total_inner_city" DECIMAL(18,4),
  "quantity" DECIMAL(12,3),
  "currency_code" CHAR(3),
  "goods_value" DECIMAL(18,4),
  "total_value" DECIMAL(18,4),
  "container_no" VARCHAR(20),
  "container_id" UUID,
  "commodity" VARCHAR(500),
  "commodity_description" TEXT,
  "remarks" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_dimension_lines_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_dimension_lines_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "job_dimension_lines_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "job_containers"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "job_dimension_lines_tenant_id_job_id_line_no_key"
  ON "job_dimension_lines"("tenant_id", "job_id", "line_no");
CREATE INDEX "job_dimension_lines_tenant_id_job_id_idx" ON "job_dimension_lines"("tenant_id", "job_id");
CREATE INDEX "job_dimension_lines_tenant_id_container_id_idx" ON "job_dimension_lines"("tenant_id", "container_id");
