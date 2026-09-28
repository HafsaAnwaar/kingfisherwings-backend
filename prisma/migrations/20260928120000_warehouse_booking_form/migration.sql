-- Warehouse job specialized booking / intake form (staff).
-- Does not alter WMS ASN/GRN/GDO ops tables.

CREATE TABLE IF NOT EXISTS "warehouse_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "client_booking_no" VARCHAR(50),
  "voyage_ref" VARCHAR(50),
  "service_scope" "ServiceScope",
  "origin_door_address" TEXT,
  "dest_door_address" TEXT,
  "warehouse_id" UUID,
  "warehouse_name" VARCHAR(200),
  "expected_inbound_at" TIMESTAMPTZ,
  "expected_outbound_at" TIMESTAMPTZ,
  "storage_days_requested" INTEGER,
  "bonded" BOOLEAN NOT NULL DEFAULT false,
  "temperature_controlled" BOOLEAN NOT NULL DEFAULT false,
  "handling_instructions" TEXT,
  "freight_job_id" UUID,
  "stock_lines_json" JSONB,
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
  CONSTRAINT "warehouse_booking_forms_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "warehouse_booking_forms_tenant_id_idx"
  ON "warehouse_booking_forms"("tenant_id");

CREATE TABLE IF NOT EXISTS "warehouse_booking_form_parties" (
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
  CONSTRAINT "warehouse_booking_form_parties_form_id_fkey"
    FOREIGN KEY ("form_id") REFERENCES "warehouse_booking_forms"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "warehouse_booking_form_parties_tenant_id_form_id_party_kind_key"
  ON "warehouse_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "warehouse_booking_form_parties_tenant_id_form_id_idx"
  ON "warehouse_booking_form_parties"("tenant_id", "form_id");
