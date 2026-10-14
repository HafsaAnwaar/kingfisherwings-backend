-- Shipment ↔ Job shared-tab parity (org, dimensions, costing sides, routing/customs fields)

ALTER TABLE "shipment_charges"
  ADD COLUMN IF NOT EXISTS "line_no" INTEGER,
  ADD COLUMN IF NOT EXISTS "sale_party_id" UUID,
  ADD COLUMN IF NOT EXISTS "sale_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "sale_tax_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "sale_currency" CHAR(3),
  ADD COLUMN IF NOT EXISTS "sale_ex_rate" DECIMAL(20,8),
  ADD COLUMN IF NOT EXISTS "cost_party_id" UUID,
  ADD COLUMN IF NOT EXISTS "cost_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "cost_tax_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "cost_currency" CHAR(3),
  ADD COLUMN IF NOT EXISTS "cost_ex_rate" DECIMAL(20,8),
  ADD COLUMN IF NOT EXISTS "gp_amount" DECIMAL(18,4);

UPDATE "shipment_charges"
SET
  "sale_amount" = "amount",
  "sale_tax_amount" = "tax_amount",
  "sale_currency" = "currency_code",
  "sale_ex_rate" = "exchange_rate",
  "sale_party_id" = "party_id",
  "gp_amount" = "amount_base_currency"
WHERE "is_cost" = false AND "sale_amount" IS NULL;

UPDATE "shipment_charges"
SET
  "cost_amount" = "amount",
  "cost_tax_amount" = "tax_amount",
  "cost_currency" = "currency_code",
  "cost_ex_rate" = "exchange_rate",
  "cost_party_id" = "party_id",
  "gp_amount" = -"amount_base_currency"
WHERE "is_cost" = true AND "cost_amount" IS NULL;

ALTER TABLE "shipment_routing_legs"
  ADD COLUMN IF NOT EXISTS "origin_port_id" UUID,
  ADD COLUMN IF NOT EXISTS "dest_port_id" UUID;

ALTER TABLE "shipment_customs_refs"
  ADD COLUMN IF NOT EXISTS "customs_house" VARCHAR(100);

CREATE TABLE IF NOT EXISTS "shipment_organizations" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_id" UUID NOT NULL,
  "org_type" "JobPartyRole" NOT NULL,
  "party_id" UUID NOT NULL,
  "is_primary_customer" BOOLEAN NOT NULL DEFAULT false,
  "party_snapshot" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "shipment_organizations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "shipment_organizations_shipment_id_fkey"
    FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "shipment_organizations_party_id_fkey"
    FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "shipment_organizations_tenant_id_shipment_id_org_type_key"
  ON "shipment_organizations"("tenant_id", "shipment_id", "org_type");
CREATE INDEX IF NOT EXISTS "shipment_organizations_tenant_id_shipment_id_idx"
  ON "shipment_organizations"("tenant_id", "shipment_id");

CREATE TABLE IF NOT EXISTS "shipment_dimension_lines" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_id" UUID NOT NULL,
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
  "commodity" VARCHAR(500),
  "commodity_description" TEXT,
  "remarks" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "shipment_dimension_lines_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "shipment_dimension_lines_shipment_id_fkey"
    FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "shipment_dimension_lines_tenant_id_shipment_id_idx"
  ON "shipment_dimension_lines"("tenant_id", "shipment_id");

-- Seed org rows from shipment header FKs where missing
INSERT INTO "shipment_organizations" ("tenant_id", "shipment_id", "org_type", "party_id", "is_primary_customer")
SELECT s."tenant_id", s."id", 'CLIENT', s."customer_id", true
FROM "shipments" s
WHERE s."deleted_at" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "shipment_organizations" o
    WHERE o."shipment_id" = s."id" AND o."org_type" = 'CLIENT' AND o."deleted_at" IS NULL
  );

INSERT INTO "shipment_organizations" ("tenant_id", "shipment_id", "org_type", "party_id", "is_primary_customer")
SELECT s."tenant_id", s."id", 'SHIPPER', s."shipper_id", false
FROM "shipments" s
WHERE s."deleted_at" IS NULL AND s."shipper_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "shipment_organizations" o
    WHERE o."shipment_id" = s."id" AND o."org_type" = 'SHIPPER' AND o."deleted_at" IS NULL
  );

INSERT INTO "shipment_organizations" ("tenant_id", "shipment_id", "org_type", "party_id", "is_primary_customer")
SELECT s."tenant_id", s."id", 'CONSIGNEE', s."consignee_id", false
FROM "shipments" s
WHERE s."deleted_at" IS NULL AND s."consignee_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "shipment_organizations" o
    WHERE o."shipment_id" = s."id" AND o."org_type" = 'CONSIGNEE' AND o."deleted_at" IS NULL
  );

INSERT INTO "shipment_organizations" ("tenant_id", "shipment_id", "org_type", "party_id", "is_primary_customer")
SELECT s."tenant_id", s."id", 'NOTIFY', s."notify_party_id", false
FROM "shipments" s
WHERE s."deleted_at" IS NULL AND s."notify_party_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "shipment_organizations" o
    WHERE o."shipment_id" = s."id" AND o."org_type" = 'NOTIFY' AND o."deleted_at" IS NULL
  );
