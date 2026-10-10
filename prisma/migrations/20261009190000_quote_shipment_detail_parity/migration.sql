-- Quote & Shipment detail parity (Fresa header fields + shipment tab tables)

ALTER TABLE "quotations"
  ADD COLUMN IF NOT EXISTS "por_port_id" UUID,
  ADD COLUMN IF NOT EXISTS "pof_port_id" UUID,
  ADD COLUMN IF NOT EXISTS "place_of_receipt" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "place_of_delivery" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "etd" DATE,
  ADD COLUMN IF NOT EXISTS "eta" DATE,
  ADD COLUMN IF NOT EXISTS "vessel_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "voyage_number" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "quotation_date" DATE,
  ADD COLUMN IF NOT EXISTS "customer_address" TEXT,
  ADD COLUMN IF NOT EXISTS "frequency" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "freight_payment_type" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "marks_numbers" TEXT,
  ADD COLUMN IF NOT EXISTS "source_enquiry_id" UUID,
  ADD COLUMN IF NOT EXISTS "shipper_id" UUID,
  ADD COLUMN IF NOT EXISTS "consignee_id" UUID;

CREATE INDEX IF NOT EXISTS "quotations_tenant_id_source_enquiry_id_idx"
  ON "quotations" ("tenant_id", "source_enquiry_id");

UPDATE "quotations"
SET "quotation_date" = ("created_at" AT TIME ZONE 'UTC')::date
WHERE "quotation_date" IS NULL;

ALTER TABLE "shipments"
  ADD COLUMN IF NOT EXISTS "mbl_number" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "mbl_date" DATE,
  ADD COLUMN IF NOT EXISTS "shipment_date" DATE,
  ADD COLUMN IF NOT EXISTS "customer_address" TEXT,
  ADD COLUMN IF NOT EXISTS "pof_port_id" UUID,
  ADD COLUMN IF NOT EXISTS "place_of_delivery" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "freight_terms" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "freight_payable_at" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "freight_payment_type" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "marks_numbers" TEXT,
  ADD COLUMN IF NOT EXISTS "is_cross_trade" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  CREATE TYPE "ShipmentSplitLinkType" AS ENUM ('SPLIT', 'MERGE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "shipment_routing_legs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_id" UUID NOT NULL,
  "leg_sequence" INTEGER NOT NULL DEFAULT 1,
  "transport_mode" VARCHAR(20),
  "port_id" UUID,
  "etd" DATE,
  "eta" DATE,
  "carrier_id" UUID,
  "vessel_name" VARCHAR(200),
  "voyage_number" VARCHAR(50),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "shipment_container_plans" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_id" UUID NOT NULL,
  "container_type_id" UUID,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "container_number" VARCHAR(40),
  "seal_number" VARCHAR(40),
  "gross_weight" DECIMAL(12,3),
  "volume_cbm" DECIMAL(10,3),
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "shipment_container_actuals" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_id" UUID NOT NULL,
  "container_type_id" UUID,
  "container_number" VARCHAR(40),
  "seal_number" VARCHAR(40),
  "gross_weight" DECIMAL(12,3),
  "volume_cbm" DECIMAL(10,3),
  "status" VARCHAR(40),
  "gate_in_at" TIMESTAMPTZ,
  "gate_out_at" TIMESTAMPTZ,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "shipment_exchange_rates" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_id" UUID NOT NULL,
  "currency_code" CHAR(3) NOT NULL,
  "exchange_rate" DECIMAL(20,8) NOT NULL,
  "effective_date" DATE,
  "source" VARCHAR(80),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "shipment_customs_refs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_id" UUID NOT NULL,
  "sb_number" VARCHAR(50),
  "boe_number" VARCHAR(50),
  "customs_status" VARCHAR(40),
  "filed_at" DATE,
  "cleared_at" DATE,
  "remarks" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "shipment_split_links" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "parent_shipment_id" UUID NOT NULL,
  "child_shipment_id" UUID NOT NULL,
  "link_type" "ShipmentSplitLinkType" NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID
);

CREATE INDEX IF NOT EXISTS "shipment_routing_legs_tenant_id_shipment_id_idx"
  ON "shipment_routing_legs" ("tenant_id", "shipment_id");
CREATE INDEX IF NOT EXISTS "shipment_container_plans_tenant_id_shipment_id_idx"
  ON "shipment_container_plans" ("tenant_id", "shipment_id");
CREATE INDEX IF NOT EXISTS "shipment_container_actuals_tenant_id_shipment_id_idx"
  ON "shipment_container_actuals" ("tenant_id", "shipment_id");
CREATE INDEX IF NOT EXISTS "shipment_exchange_rates_tenant_id_shipment_id_idx"
  ON "shipment_exchange_rates" ("tenant_id", "shipment_id");
CREATE INDEX IF NOT EXISTS "shipment_customs_refs_tenant_id_shipment_id_idx"
  ON "shipment_customs_refs" ("tenant_id", "shipment_id");
CREATE INDEX IF NOT EXISTS "shipment_split_links_tenant_id_parent_shipment_id_idx"
  ON "shipment_split_links" ("tenant_id", "parent_shipment_id");
CREATE INDEX IF NOT EXISTS "shipment_split_links_tenant_id_child_shipment_id_idx"
  ON "shipment_split_links" ("tenant_id", "child_shipment_id");
CREATE UNIQUE INDEX IF NOT EXISTS "shipment_split_links_tenant_parent_child_type_key"
  ON "shipment_split_links" ("tenant_id", "parent_shipment_id", "child_shipment_id", "link_type");

DO $$ BEGIN
  ALTER TABLE "shipment_routing_legs" ADD CONSTRAINT "shipment_routing_legs_shipment_id_fkey"
    FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shipment_container_plans" ADD CONSTRAINT "shipment_container_plans_shipment_id_fkey"
    FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shipment_container_actuals" ADD CONSTRAINT "shipment_container_actuals_shipment_id_fkey"
    FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shipment_exchange_rates" ADD CONSTRAINT "shipment_exchange_rates_shipment_id_fkey"
    FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shipment_customs_refs" ADD CONSTRAINT "shipment_customs_refs_shipment_id_fkey"
    FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shipment_split_links" ADD CONSTRAINT "shipment_split_links_parent_fkey"
    FOREIGN KEY ("parent_shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shipment_split_links" ADD CONSTRAINT "shipment_split_links_child_fkey"
    FOREIGN KEY ("child_shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "shipment_routing_legs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipment_container_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipment_container_actuals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipment_exchange_rates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipment_customs_refs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipment_split_links" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shipment_routing_legs_tenant_isolation ON "shipment_routing_legs";
CREATE POLICY shipment_routing_legs_tenant_isolation ON "shipment_routing_legs"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS shipment_container_plans_tenant_isolation ON "shipment_container_plans";
CREATE POLICY shipment_container_plans_tenant_isolation ON "shipment_container_plans"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS shipment_container_actuals_tenant_isolation ON "shipment_container_actuals";
CREATE POLICY shipment_container_actuals_tenant_isolation ON "shipment_container_actuals"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS shipment_exchange_rates_tenant_isolation ON "shipment_exchange_rates";
CREATE POLICY shipment_exchange_rates_tenant_isolation ON "shipment_exchange_rates"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS shipment_customs_refs_tenant_isolation ON "shipment_customs_refs";
CREATE POLICY shipment_customs_refs_tenant_isolation ON "shipment_customs_refs"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS shipment_split_links_tenant_isolation ON "shipment_split_links";
CREATE POLICY shipment_split_links_tenant_isolation ON "shipment_split_links"
  USING (tenant_id::text = current_setting('app.tenant_id', true));
