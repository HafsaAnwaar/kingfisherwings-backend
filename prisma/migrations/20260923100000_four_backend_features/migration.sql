-- Four backend features: ROAD_FREIGHT, barcodes, booking forms, WMS overdue storage

-- Enums
ALTER TYPE "JobType" ADD VALUE IF NOT EXISTS 'ROAD_FREIGHT';
ALTER TYPE "ShipmentMode" ADD VALUE IF NOT EXISTS 'ROAD';

DO $$ BEGIN
  CREATE TYPE "ServiceScope" AS ENUM ('DOOR_TO_DOOR', 'DOOR_TO_PORT', 'PORT_TO_DOOR', 'PORT_TO_PORT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CargoCategory" AS ENUM (
    'GENERAL', 'VEHICLES', 'FOOD_PERISHABLE', 'PHARMA', 'CHEMICALS_DG',
    'PERSONAL_EFFECTS', 'PROJECT_OOG', 'LIVESTOCK', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "WmsLotStorageStatus" AS ENUM ('IN_STORAGE', 'NOT_COLLECTED', 'COLLECTED', 'WAIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "WmsStorageChargeKind" AS ENUM ('INCLUDED_OVERAGE', 'OVERDUE_EXTRA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "JobBookingPartyKind" AS ENUM ('SHIPPER', 'CONSIGNEE', 'NOTIFY', 'BILLING', 'AGENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Jobs: barcode + service scope
ALTER TABLE "jobs"
  ADD COLUMN IF NOT EXISTS "barcode_value" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "service_scope" "ServiceScope",
  ADD COLUMN IF NOT EXISTS "origin_door_address" TEXT,
  ADD COLUMN IF NOT EXISTS "dest_door_address" TEXT,
  ADD COLUMN IF NOT EXISTS "cargo_category" "CargoCategory";

CREATE UNIQUE INDEX IF NOT EXISTS "jobs_tenant_id_barcode_value_key"
  ON "jobs"("tenant_id", "barcode_value");

-- WMS settings / lots / charges
ALTER TABLE "wms_settings"
  ADD COLUMN IF NOT EXISTS "default_overdue_rate_per_day" DECIMAL(18,4) NOT NULL DEFAULT 0;

ALTER TABLE "wms_stock_lots"
  ADD COLUMN IF NOT EXISTS "paid_storage_days" INTEGER NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS "storage_rate_per_day" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "overdue_rate_per_day" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "storage_starts_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "paid_until_date" DATE,
  ADD COLUMN IF NOT EXISTS "storage_status" "WmsLotStorageStatus" NOT NULL DEFAULT 'IN_STORAGE',
  ADD COLUMN IF NOT EXISTS "collected_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "wms_stock_lots_tenant_id_storage_status_idx"
  ON "wms_stock_lots"("tenant_id", "storage_status");

ALTER TABLE "wms_storage_charges"
  ADD COLUMN IF NOT EXISTS "extra_days" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "overdue_rate_per_day" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "charge_kind" "WmsStorageChargeKind" NOT NULL DEFAULT 'INCLUDED_OVERAGE';

CREATE INDEX IF NOT EXISTS "wms_storage_charges_tenant_id_charge_kind_status_idx"
  ON "wms_storage_charges"("tenant_id", "charge_kind", "status");

-- Road freight detail
CREATE TABLE IF NOT EXISTS "road_freight_job_details" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "trucker_id" UUID,
  "vehicle_type" "LandVehicleType",
  "vehicle_number" VARCHAR(40),
  "trailer_number" VARCHAR(40),
  "driver_name" VARCHAR(200),
  "driver_license" VARCHAR(50),
  "origin_city_country" VARCHAR(200),
  "destination_city_country" VARCHAR(200),
  "route_notes" TEXT,
  "etd" TIMESTAMPTZ,
  "eta" TIMESTAMPTZ,
  "incoterms" VARCHAR(10),
  "freight_terms" VARCHAR(30),
  "cross_border_docs_required" BOOLEAN NOT NULL DEFAULT false,
  "border_origin_country" CHAR(2),
  "border_destination_country" CHAR(2),
  "border_declaration_number" VARCHAR(100),
  "border_commodity" VARCHAR(500),
  "border_hs_code" VARCHAR(12),
  "border_declared_value" DECIMAL(18,4),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "road_freight_job_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "road_freight_job_details_job_id_key"
  ON "road_freight_job_details"("job_id");
CREATE INDEX IF NOT EXISTS "road_freight_job_details_tenant_id_idx"
  ON "road_freight_job_details"("tenant_id");
CREATE INDEX IF NOT EXISTS "road_freight_job_details_tenant_id_vehicle_number_idx"
  ON "road_freight_job_details"("tenant_id", "vehicle_number");

DO $$ BEGIN
  ALTER TABLE "road_freight_job_details"
    ADD CONSTRAINT "road_freight_job_details_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "road_freight_job_details"
    ADD CONSTRAINT "road_freight_job_details_trucker_id_fkey"
    FOREIGN KEY ("trucker_id") REFERENCES "truckers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Job scan events
CREATE TABLE IF NOT EXISTS "job_scan_events" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "barcode_value" VARCHAR(80) NOT NULL,
  "location" VARCHAR(200),
  "notes" TEXT,
  "scanned_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "scanned_by" UUID,
  CONSTRAINT "job_scan_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "job_scan_events_tenant_id_job_id_idx"
  ON "job_scan_events"("tenant_id", "job_id");
CREATE INDEX IF NOT EXISTS "job_scan_events_tenant_id_barcode_value_idx"
  ON "job_scan_events"("tenant_id", "barcode_value");

DO $$ BEGIN
  ALTER TABLE "job_scan_events"
    ADD CONSTRAINT "job_scan_events_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Unified job booking form
CREATE TABLE IF NOT EXISTS "job_booking_forms" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "date_of_request" DATE,
  "client_booking_no" VARCHAR(50),
  "voyage_ref" VARCHAR(50),
  "service_scope" "ServiceScope",
  "origin_door_address" TEXT,
  "dest_door_address" TEXT,
  "pol" VARCHAR(100),
  "pod" VARCHAR(100),
  "origin_city_country" VARCHAR(200),
  "dest_city_country" VARCHAR(200),
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
  "final_use" VARCHAR(200),
  "activity_sector" "NvoccActivitySector",
  "insurance_details" TEXT,
  "lc_bank_details" TEXT,
  "request_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_packing_list" BOOLEAN NOT NULL DEFAULT false,
  "attach_bl_awb_copy" BOOLEAN NOT NULL DEFAULT false,
  "attach_correspondence" BOOLEAN NOT NULL DEFAULT false,
  "attach_cod_form" BOOLEAN NOT NULL DEFAULT false,
  "attach_licence" BOOLEAN NOT NULL DEFAULT false,
  "attach_certificate_of_origin" BOOLEAN NOT NULL DEFAULT false,
  "attach_insurance_certificate" BOOLEAN NOT NULL DEFAULT false,
  "attach_poa_cha" BOOLEAN NOT NULL DEFAULT false,
  "doc_commercial_invoice_key" VARCHAR(500),
  "doc_packing_list_key" VARCHAR(500),
  "doc_bl_awb_copy_key" VARCHAR(500),
  "doc_correspondence_key" VARCHAR(500),
  "doc_cod_form_key" VARCHAR(500),
  "doc_licence_key" VARCHAR(500),
  "doc_certificate_of_origin_key" VARCHAR(500),
  "doc_insurance_certificate_key" VARCHAR(500),
  "doc_poa_cha_key" VARCHAR(500),
  "attach_carnet" BOOLEAN NOT NULL DEFAULT false,
  "attach_vehicle_title" BOOLEAN NOT NULL DEFAULT false,
  "attach_vehicle_inspection" BOOLEAN NOT NULL DEFAULT false,
  "attach_msds" BOOLEAN NOT NULL DEFAULT false,
  "attach_dangerous_goods_declaration" BOOLEAN NOT NULL DEFAULT false,
  "attach_phytosanitary" BOOLEAN NOT NULL DEFAULT false,
  "attach_health_veterinary" BOOLEAN NOT NULL DEFAULT false,
  "attach_fda_moh" BOOLEAN NOT NULL DEFAULT false,
  "attach_fumigation" BOOLEAN NOT NULL DEFAULT false,
  "attach_packing_declaration" BOOLEAN NOT NULL DEFAULT false,
  "attach_battery_un38" BOOLEAN NOT NULL DEFAULT false,
  "attach_export_declaration" BOOLEAN NOT NULL DEFAULT false,
  "attach_other_supporting" BOOLEAN NOT NULL DEFAULT false,
  "doc_carnet_key" VARCHAR(500),
  "doc_vehicle_title_key" VARCHAR(500),
  "doc_vehicle_inspection_key" VARCHAR(500),
  "doc_msds_key" VARCHAR(500),
  "doc_dangerous_goods_declaration_key" VARCHAR(500),
  "doc_phytosanitary_key" VARCHAR(500),
  "doc_health_veterinary_key" VARCHAR(500),
  "doc_fda_moh_key" VARCHAR(500),
  "doc_fumigation_key" VARCHAR(500),
  "doc_packing_declaration_key" VARCHAR(500),
  "doc_battery_un38_key" VARCHAR(500),
  "doc_export_declaration_key" VARCHAR(500),
  "doc_other_supporting_key" VARCHAR(500),
  "other_supporting_description" TEXT,
  "consent_accepted_at" TIMESTAMPTZ,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_booking_forms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "job_booking_forms_job_id_key"
  ON "job_booking_forms"("job_id");
CREATE INDEX IF NOT EXISTS "job_booking_forms_tenant_id_idx"
  ON "job_booking_forms"("tenant_id");

DO $$ BEGIN
  ALTER TABLE "job_booking_forms"
    ADD CONSTRAINT "job_booking_forms_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "job_booking_form_parties" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "party_kind" "JobBookingPartyKind" NOT NULL,
  "full_name" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "entity_kind" "PartyEntityKind",
  "other_details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "job_booking_form_parties_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "job_booking_form_parties_tenant_id_form_id_party_kind_key"
  ON "job_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "job_booking_form_parties_tenant_id_form_id_idx"
  ON "job_booking_form_parties"("tenant_id", "form_id");

DO $$ BEGIN
  ALTER TABLE "job_booking_form_parties"
    ADD CONSTRAINT "job_booking_form_parties_form_id_fkey"
    FOREIGN KEY ("form_id") REFERENCES "job_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Legacy booking forms: service_scope
ALTER TABLE "nvocc_booking_forms"
  ADD COLUMN IF NOT EXISTS "service_scope" "ServiceScope",
  ADD COLUMN IF NOT EXISTS "origin_door_address" TEXT,
  ADD COLUMN IF NOT EXISTS "dest_door_address" TEXT;

ALTER TABLE "air_compliance_booking_forms"
  ADD COLUMN IF NOT EXISTS "service_scope" "ServiceScope",
  ADD COLUMN IF NOT EXISTS "origin_door_address" TEXT,
  ADD COLUMN IF NOT EXISTS "dest_door_address" TEXT;
