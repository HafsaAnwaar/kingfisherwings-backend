-- Air customer compliance booking form (same fields as NVOCC)

CREATE TABLE IF NOT EXISTS "air_compliance_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "air_job_detail_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "voyage_ref" VARCHAR(50),
  "client_booking_no" VARCHAR(50),
  "gross_weight_kg" DECIMAL(12,3),
  "net_weight_kg" DECIMAL(12,3),
  "pol" VARCHAR(100),
  "pod" VARCHAR(100),
  "shipper_owned_container" BOOLEAN NOT NULL DEFAULT false,
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "teu_count" DECIMAL(8,2),
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(20),
  "final_use" VARCHAR(200),
  "activity_sector" "NvoccActivitySector",
  "insurance_details" TEXT,
  "lc_bank_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_correspondence" BOOLEAN NOT NULL DEFAULT false,
  "attach_cod_form" BOOLEAN NOT NULL DEFAULT false,
  "attach_licence" BOOLEAN NOT NULL DEFAULT false,
  "doc_commercial_invoice_key" VARCHAR(500),
  "doc_correspondence_key" VARCHAR(500),
  "doc_cod_form_key" VARCHAR(500),
  "doc_licence_key" VARCHAR(500),
  "booking_agent_line" VARCHAR(100),
  "agent_requester_name" VARCHAR(200),
  "sq_bl_booking_reference" VARCHAR(200),
  "request_details" TEXT,
  "consent_accepted_at" TIMESTAMPTZ,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS "air_compliance_booking_forms_tenant_id_idx"
  ON "air_compliance_booking_forms"("tenant_id");

DO $$ BEGIN
  ALTER TABLE "air_compliance_booking_forms"
    ADD CONSTRAINT "air_compliance_booking_forms_air_job_detail_id_fkey"
    FOREIGN KEY ("air_job_detail_id") REFERENCES "air_job_details"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "air_compliance_booking_form_parties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "party_kind" "NvoccBookingPartyKind" NOT NULL,
  "full_name" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "entity_kind" "PartyEntityKind",
  "other_details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "air_compliance_booking_form_parties_tenant_form_kind_key"
  ON "air_compliance_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "air_compliance_booking_form_parties_tenant_form_idx"
  ON "air_compliance_booking_form_parties"("tenant_id", "form_id");

DO $$ BEGIN
  ALTER TABLE "air_compliance_booking_form_parties"
    ADD CONSTRAINT "air_compliance_booking_form_parties_form_id_fkey"
    FOREIGN KEY ("form_id") REFERENCES "air_compliance_booking_forms"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
