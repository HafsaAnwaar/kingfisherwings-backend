-- Fresa parity Phase 0–1: VERIFIED quote status, Shipment domain, favourites

ALTER TYPE "QuotationStatus" ADD VALUE IF NOT EXISTS 'VERIFIED';
ALTER TYPE "DocumentNumberType" ADD VALUE IF NOT EXISTS 'SHIPMENT';

DO $$ BEGIN
  CREATE TYPE "ShipmentStatus" AS ENUM ('BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BlDocumentStatus" AS ENUM ('DRAFT', 'ORIGINAL', 'SURRENDERED', 'TELEX_RELEASE', 'SEAWAY', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "quotations"
  ADD COLUMN IF NOT EXISTS "terms_and_conditions" TEXT,
  ADD COLUMN IF NOT EXISTS "valid_from" DATE,
  ADD COLUMN IF NOT EXISTS "converted_shipment_id" UUID;

CREATE INDEX IF NOT EXISTS "quotations_tenant_id_converted_shipment_id_idx"
  ON "quotations" ("tenant_id", "converted_shipment_id");

ALTER TABLE "enquiries"
  ADD COLUMN IF NOT EXISTS "shipment_id" UUID,
  ADD COLUMN IF NOT EXISTS "job_id" UUID,
  ADD COLUMN IF NOT EXISTS "company_id" UUID,
  ADD COLUMN IF NOT EXISTS "branch_id" UUID,
  ADD COLUMN IF NOT EXISTS "department_id" UUID,
  ADD COLUMN IF NOT EXISTS "por_port_id" UUID,
  ADD COLUMN IF NOT EXISTS "etd" DATE,
  ADD COLUMN IF NOT EXISTS "eta" DATE,
  ADD COLUMN IF NOT EXISTS "gross_weight" DECIMAL(12,3),
  ADD COLUMN IF NOT EXISTS "chargeable_weight" DECIMAL(12,3),
  ADD COLUMN IF NOT EXISTS "volume_cbm" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "pieces" INTEGER,
  ADD COLUMN IF NOT EXISTS "container_type_id" UUID,
  ADD COLUMN IF NOT EXISTS "container_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "commodity" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "standard_charges_snapshot" JSONB,
  ADD COLUMN IF NOT EXISTS "cancel_reason" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "enquiries_tenant_id_shipment_id_idx" ON "enquiries" ("tenant_id", "shipment_id");
CREATE INDEX IF NOT EXISTS "enquiries_tenant_id_job_id_idx" ON "enquiries" ("tenant_id", "job_id");

CREATE TABLE IF NOT EXISTS "shipments" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_number" VARCHAR(40) NOT NULL,
  "job_type" "JobType" NOT NULL,
  "status" "ShipmentStatus" NOT NULL DEFAULT 'BOOKED',
  "company_id" UUID,
  "branch_id" UUID,
  "department_id" UUID,
  "quotation_id" UUID,
  "enquiry_id" UUID,
  "job_id" UUID,
  "customer_id" UUID NOT NULL,
  "shipper_id" UUID,
  "consignee_id" UUID,
  "notify_party_id" UUID,
  "delivery_agent_id" UUID,
  "carrier_agent_id" UUID,
  "salesperson_id" UUID,
  "carrier_id" UUID,
  "origin_port_id" UUID,
  "dest_port_id" UUID,
  "por_port_id" UUID,
  "etd" DATE,
  "eta" DATE,
  "atd" DATE,
  "ata" DATE,
  "onboard_date" DATE,
  "vessel_name" VARCHAR(200),
  "voyage_number" VARCHAR(50),
  "flight_number" VARCHAR(50),
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(12),
  "gross_weight" DECIMAL(12,3),
  "chargeable_weight" DECIMAL(12,3),
  "volume_cbm" DECIMAL(10,3),
  "pieces" INTEGER,
  "container_type_id" UUID,
  "container_count" INTEGER,
  "container_numbers" TEXT,
  "seal_numbers" TEXT,
  "incoterms" VARCHAR(10),
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "dg_class" VARCHAR(20),
  "notes" TEXT,
  "hbl_number" VARCHAR(50),
  "hbl_date" DATE,
  "bl_status" "BlDocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "revenue_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "cost_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "gp_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "gp_percent" DECIMAL(7,4) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS "shipments_tenant_id_shipment_number_key"
  ON "shipments" ("tenant_id", "shipment_number");
CREATE INDEX IF NOT EXISTS "shipments_tenant_id_idx" ON "shipments" ("tenant_id");
CREATE INDEX IF NOT EXISTS "shipments_tenant_id_status_idx" ON "shipments" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "shipments_tenant_id_job_type_idx" ON "shipments" ("tenant_id", "job_type");
CREATE INDEX IF NOT EXISTS "shipments_tenant_id_customer_id_idx" ON "shipments" ("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "shipments_tenant_id_job_id_idx" ON "shipments" ("tenant_id", "job_id");
CREATE INDEX IF NOT EXISTS "shipments_tenant_id_quotation_id_idx" ON "shipments" ("tenant_id", "quotation_id");
CREATE INDEX IF NOT EXISTS "shipments_tenant_id_enquiry_id_idx" ON "shipments" ("tenant_id", "enquiry_id");
CREATE INDEX IF NOT EXISTS "shipments_tenant_id_etd_idx" ON "shipments" ("tenant_id", "etd");

DO $$ BEGIN
  ALTER TABLE "shipments" ADD CONSTRAINT "shipments_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shipments" ADD CONSTRAINT "shipments_quotation_id_fkey"
    FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shipments" ADD CONSTRAINT "shipments_enquiry_id_fkey"
    FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "shipment_charges" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "shipment_id" UUID NOT NULL,
  "charge_code_id" UUID,
  "description" VARCHAR(300) NOT NULL,
  "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
  "unit_price" DECIMAL(18,4) NOT NULL,
  "currency_code" CHAR(3) NOT NULL,
  "exchange_rate" DECIMAL(20,8) NOT NULL DEFAULT 1,
  "amount" DECIMAL(18,4) NOT NULL,
  "amount_base_currency" DECIMAL(18,4) NOT NULL,
  "tax_rate_id" UUID,
  "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "is_billable" BOOLEAN NOT NULL DEFAULT true,
  "is_cost" BOOLEAN NOT NULL DEFAULT false,
  "is_provisional" BOOLEAN NOT NULL DEFAULT false,
  "party_id" UUID,
  "is_invoiced" BOOLEAN NOT NULL DEFAULT false,
  "prorated_from_job_charge_id" UUID,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS "shipment_charges_tenant_id_idx" ON "shipment_charges" ("tenant_id");
CREATE INDEX IF NOT EXISTS "shipment_charges_tenant_id_shipment_id_idx" ON "shipment_charges" ("tenant_id", "shipment_id");

DO $$ BEGIN
  ALTER TABLE "shipment_charges" ADD CONSTRAINT "shipment_charges_shipment_id_fkey"
    FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "user_favourites" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "kind" VARCHAR(40) NOT NULL,
  "target_key" VARCHAR(200) NOT NULL,
  "label" VARCHAR(200),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_favourites_tenant_id_user_id_kind_target_key_key"
  ON "user_favourites" ("tenant_id", "user_id", "kind", "target_key");
CREATE INDEX IF NOT EXISTS "user_favourites_tenant_id_user_id_idx"
  ON "user_favourites" ("tenant_id", "user_id");

-- RLS (tenant isolation) for new tables
ALTER TABLE "shipments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipment_charges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_favourites" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shipments_tenant_isolation ON "shipments";
CREATE POLICY shipments_tenant_isolation ON "shipments"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS shipment_charges_tenant_isolation ON "shipment_charges";
CREATE POLICY shipment_charges_tenant_isolation ON "shipment_charges"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS user_favourites_tenant_isolation ON "user_favourites";
CREATE POLICY user_favourites_tenant_isolation ON "user_favourites"
  USING (tenant_id::text = current_setting('app.tenant_id', true));
