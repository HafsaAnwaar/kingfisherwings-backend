-- Per-type booking forms: drop unified JobBookingForm; enhance NVOCC/Air; add mode forms.

-- Drop unified booking form
DROP TABLE IF EXISTS "job_booking_form_parties";
DROP TABLE IF EXISTS "job_booking_forms";

-- NVOCC: container size lines JSON
ALTER TABLE "nvocc_booking_forms" ADD COLUMN IF NOT EXISTS "containers_json" JSONB;

-- Air ops form: CBM + pallets
ALTER TABLE "air_booking_forms" ADD COLUMN IF NOT EXISTS "volume_cbm" DECIMAL(10,3);
ALTER TABLE "air_booking_forms" ADD COLUMN IF NOT EXISTS "pallet_count" INTEGER;
ALTER TABLE "air_booking_forms" ADD COLUMN IF NOT EXISTS "pallets_json" JSONB;

-- Air compliance: airports, pieces, chargeable, CBM, pallets
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "origin_airport_code" VARCHAR(10);
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "dest_airport_code" VARCHAR(10);
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "pieces" INTEGER;
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "chargeable_weight_kg" DECIMAL(12,3);
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "volume_cbm" DECIMAL(10,3);
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "pallet_count" INTEGER;
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "pallets_json" JSONB;

-- Helper: shared columns pattern via CREATE TABLE for each mode form
CREATE TABLE IF NOT EXISTS "sea_fcl_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "client_booking_no" VARCHAR(50),
  "voyage_ref" VARCHAR(50),
  "service_scope" "ServiceScope",
  "origin_door_address" TEXT,
  "dest_door_address" TEXT,
  "pol" VARCHAR(100),
  "pod" VARCHAR(100),
  "shipper_owned_container" BOOLEAN NOT NULL DEFAULT false,
  "teu_count" DECIMAL(8,2),
  "containers_json" JSONB,
  "etd" DATE,
  "eta" DATE,
  "incoterms" VARCHAR(10),
  "freight_terms" VARCHAR(30),
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(20),
  "cargo_category" "CargoCategory",
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "dg_class" VARCHAR(20),
  "gross_weight_kg" DECIMAL(12,3),
  "net_weight_kg" DECIMAL(12,3),
  "volume_cbm" DECIMAL(10,3),
  "pieces" INTEGER,
  "insurance_details" TEXT,
  "request_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_packing_list" BOOLEAN NOT NULL DEFAULT false,
  "attach_bl_awb_copy" BOOLEAN NOT NULL DEFAULT false,
  "attach_carnet" BOOLEAN NOT NULL DEFAULT false,
  "attach_vehicle_title" BOOLEAN NOT NULL DEFAULT false,
  "attach_msds" BOOLEAN NOT NULL DEFAULT false,
  "attach_dangerous_goods_declaration" BOOLEAN NOT NULL DEFAULT false,
  "attach_health_veterinary" BOOLEAN NOT NULL DEFAULT false,
  "attach_fda_moh" BOOLEAN NOT NULL DEFAULT false,
  "consent_accepted_at" TIMESTAMPTZ,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "sea_fcl_booking_forms_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "sea_fcl_booking_forms_tenant_id_idx" ON "sea_fcl_booking_forms"("tenant_id");

CREATE TABLE IF NOT EXISTS "sea_fcl_booking_form_parties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "party_kind" "JobBookingPartyKind" NOT NULL,
  "full_name" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "entity_kind" "PartyEntityKind",
  "other_details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "sea_fcl_booking_form_parties_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "sea_fcl_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "sea_fcl_booking_form_parties_tenant_id_form_id_party_kind_key"
  ON "sea_fcl_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "sea_fcl_booking_form_parties_tenant_id_form_id_idx"
  ON "sea_fcl_booking_form_parties"("tenant_id", "form_id");

CREATE TABLE IF NOT EXISTS "sea_lcl_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "client_booking_no" VARCHAR(50),
  "voyage_ref" VARCHAR(50),
  "service_scope" "ServiceScope",
  "origin_door_address" TEXT,
  "dest_door_address" TEXT,
  "pol" VARCHAR(100),
  "pod" VARCHAR(100),
  "cfs_warehouse" VARCHAR(200),
  "etd" DATE,
  "eta" DATE,
  "incoterms" VARCHAR(10),
  "freight_terms" VARCHAR(30),
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(20),
  "cargo_category" "CargoCategory",
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "dg_class" VARCHAR(20),
  "gross_weight_kg" DECIMAL(12,3),
  "net_weight_kg" DECIMAL(12,3),
  "volume_cbm" DECIMAL(10,3),
  "pieces" INTEGER,
  "insurance_details" TEXT,
  "request_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_packing_list" BOOLEAN NOT NULL DEFAULT false,
  "attach_bl_awb_copy" BOOLEAN NOT NULL DEFAULT false,
  "attach_carnet" BOOLEAN NOT NULL DEFAULT false,
  "attach_vehicle_title" BOOLEAN NOT NULL DEFAULT false,
  "attach_msds" BOOLEAN NOT NULL DEFAULT false,
  "attach_dangerous_goods_declaration" BOOLEAN NOT NULL DEFAULT false,
  "attach_health_veterinary" BOOLEAN NOT NULL DEFAULT false,
  "attach_fda_moh" BOOLEAN NOT NULL DEFAULT false,
  "consent_accepted_at" TIMESTAMPTZ,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "sea_lcl_booking_forms_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "sea_lcl_booking_forms_tenant_id_idx" ON "sea_lcl_booking_forms"("tenant_id");

CREATE TABLE IF NOT EXISTS "sea_lcl_booking_form_parties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "party_kind" "JobBookingPartyKind" NOT NULL,
  "full_name" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "entity_kind" "PartyEntityKind",
  "other_details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "sea_lcl_booking_form_parties_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "sea_lcl_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "sea_lcl_booking_form_parties_tenant_id_form_id_party_kind_key"
  ON "sea_lcl_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "sea_lcl_booking_form_parties_tenant_id_form_id_idx"
  ON "sea_lcl_booking_form_parties"("tenant_id", "form_id");

CREATE TABLE IF NOT EXISTS "land_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "client_booking_no" VARCHAR(50),
  "voyage_ref" VARCHAR(50),
  "service_scope" "ServiceScope",
  "origin_door_address" TEXT,
  "dest_door_address" TEXT,
  "origin_city_country" VARCHAR(200),
  "dest_city_country" VARCHAR(200),
  "vehicle_type" VARCHAR(100),
  "etd" DATE,
  "eta" DATE,
  "incoterms" VARCHAR(10),
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(20),
  "cargo_category" "CargoCategory",
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "dg_class" VARCHAR(20),
  "gross_weight_kg" DECIMAL(12,3),
  "net_weight_kg" DECIMAL(12,3),
  "volume_cbm" DECIMAL(10,3),
  "pieces" INTEGER,
  "insurance_details" TEXT,
  "request_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_packing_list" BOOLEAN NOT NULL DEFAULT false,
  "attach_bl_awb_copy" BOOLEAN NOT NULL DEFAULT false,
  "attach_carnet" BOOLEAN NOT NULL DEFAULT false,
  "attach_vehicle_title" BOOLEAN NOT NULL DEFAULT false,
  "attach_msds" BOOLEAN NOT NULL DEFAULT false,
  "attach_dangerous_goods_declaration" BOOLEAN NOT NULL DEFAULT false,
  "attach_health_veterinary" BOOLEAN NOT NULL DEFAULT false,
  "attach_fda_moh" BOOLEAN NOT NULL DEFAULT false,
  "consent_accepted_at" TIMESTAMPTZ,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "land_booking_forms_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "land_booking_forms_tenant_id_idx" ON "land_booking_forms"("tenant_id");

CREATE TABLE IF NOT EXISTS "land_booking_form_parties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "party_kind" "JobBookingPartyKind" NOT NULL,
  "full_name" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "entity_kind" "PartyEntityKind",
  "other_details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "land_booking_form_parties_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "land_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "land_booking_form_parties_tenant_id_form_id_party_kind_key"
  ON "land_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "land_booking_form_parties_tenant_id_form_id_idx"
  ON "land_booking_form_parties"("tenant_id", "form_id");

CREATE TABLE IF NOT EXISTS "road_freight_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "client_booking_no" VARCHAR(50),
  "voyage_ref" VARCHAR(50),
  "service_scope" "ServiceScope",
  "origin_door_address" TEXT,
  "dest_door_address" TEXT,
  "origin_city_country" VARCHAR(200),
  "dest_city_country" VARCHAR(200),
  "vehicle_type" VARCHAR(100),
  "border_crossing" VARCHAR(200),
  "etd" DATE,
  "eta" DATE,
  "incoterms" VARCHAR(10),
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(20),
  "cargo_category" "CargoCategory",
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "dg_class" VARCHAR(20),
  "gross_weight_kg" DECIMAL(12,3),
  "net_weight_kg" DECIMAL(12,3),
  "volume_cbm" DECIMAL(10,3),
  "pieces" INTEGER,
  "insurance_details" TEXT,
  "request_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_packing_list" BOOLEAN NOT NULL DEFAULT false,
  "attach_bl_awb_copy" BOOLEAN NOT NULL DEFAULT false,
  "attach_carnet" BOOLEAN NOT NULL DEFAULT false,
  "attach_vehicle_title" BOOLEAN NOT NULL DEFAULT false,
  "attach_msds" BOOLEAN NOT NULL DEFAULT false,
  "attach_dangerous_goods_declaration" BOOLEAN NOT NULL DEFAULT false,
  "attach_health_veterinary" BOOLEAN NOT NULL DEFAULT false,
  "attach_fda_moh" BOOLEAN NOT NULL DEFAULT false,
  "consent_accepted_at" TIMESTAMPTZ,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "road_freight_booking_forms_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "road_freight_booking_forms_tenant_id_idx" ON "road_freight_booking_forms"("tenant_id");

CREATE TABLE IF NOT EXISTS "road_freight_booking_form_parties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "party_kind" "JobBookingPartyKind" NOT NULL,
  "full_name" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "entity_kind" "PartyEntityKind",
  "other_details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "road_freight_booking_form_parties_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "road_freight_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "road_freight_booking_form_parties_tenant_id_form_id_party_kind_key"
  ON "road_freight_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "road_freight_booking_form_parties_tenant_id_form_id_idx"
  ON "road_freight_booking_form_parties"("tenant_id", "form_id");

CREATE TABLE IF NOT EXISTS "courier_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "client_booking_no" VARCHAR(50),
  "voyage_ref" VARCHAR(50),
  "service_scope" "ServiceScope",
  "origin_door_address" TEXT,
  "dest_door_address" TEXT,
  "origin_city_country" VARCHAR(200),
  "dest_city_country" VARCHAR(200),
  "tracking_number" VARCHAR(100),
  "etd" DATE,
  "eta" DATE,
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(20),
  "cargo_category" "CargoCategory",
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "dg_class" VARCHAR(20),
  "gross_weight_kg" DECIMAL(12,3),
  "net_weight_kg" DECIMAL(12,3),
  "volume_cbm" DECIMAL(10,3),
  "pieces" INTEGER,
  "insurance_details" TEXT,
  "request_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_packing_list" BOOLEAN NOT NULL DEFAULT false,
  "attach_bl_awb_copy" BOOLEAN NOT NULL DEFAULT false,
  "attach_carnet" BOOLEAN NOT NULL DEFAULT false,
  "attach_vehicle_title" BOOLEAN NOT NULL DEFAULT false,
  "attach_msds" BOOLEAN NOT NULL DEFAULT false,
  "attach_dangerous_goods_declaration" BOOLEAN NOT NULL DEFAULT false,
  "attach_health_veterinary" BOOLEAN NOT NULL DEFAULT false,
  "attach_fda_moh" BOOLEAN NOT NULL DEFAULT false,
  "consent_accepted_at" TIMESTAMPTZ,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "courier_booking_forms_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "courier_booking_forms_tenant_id_idx" ON "courier_booking_forms"("tenant_id");

CREATE TABLE IF NOT EXISTS "courier_booking_form_parties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "party_kind" "JobBookingPartyKind" NOT NULL,
  "full_name" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "entity_kind" "PartyEntityKind",
  "other_details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "courier_booking_form_parties_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "courier_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "courier_booking_form_parties_tenant_id_form_id_party_kind_key"
  ON "courier_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "courier_booking_form_parties_tenant_id_form_id_idx"
  ON "courier_booking_form_parties"("tenant_id", "form_id");
