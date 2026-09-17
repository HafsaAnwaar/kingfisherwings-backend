-- NVOCC workflow alignment
DO $$ BEGIN
  CREATE TYPE "NvoccWorkflowStage" AS ENUM (
    'QUOTE_REQUESTED','CS_TRIAGED','QUOTE_SENT','CUSTOMER_ACCEPTED','BOOKING_FORM_COMPLETE',
    'INVOICE_SENT','CRO_ISSUED','CONTAINER_ALLOCATED','PICKED','LOADING','PORT_TOKEN',
    'DRAFT_BL_ISSUED','PAYMENT_RECEIVED','ORIGINAL_BL_ISSUED','CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE "NvoccContainerRequestStatus" AS ENUM ('DRAFT','ISSUED','ALLOCATED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "NvoccBookingPartyKind" AS ENUM ('SHIPPER','CONSIGNEE','NOTIFY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PartyEntityKind" AS ENUM ('COMPANY','INDIVIDUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CRO';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CONTAINER_REQUEST';
ALTER TYPE "PortalDocumentType" ADD VALUE IF NOT EXISTS 'CRO';
ALTER TYPE "ContainerStatus" ADD VALUE IF NOT EXISTS 'PICKED';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_20HC';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_40REEFER_HC';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_PLATFORM_20';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_PLATFORM_40';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_CHASSIS';

ALTER TABLE "container_types"
  ADD COLUMN IF NOT EXISTS "volume_cft" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "inside_length_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "inside_width_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "inside_height_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "door_width_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "door_height_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "tare_kg" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "max_cargo_kg" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "category" VARCHAR(40);

ALTER TABLE "nvocc_bookings"
  ADD COLUMN IF NOT EXISTS "workflow_stage" "NvoccWorkflowStage" NOT NULL DEFAULT 'QUOTE_REQUESTED',
  ADD COLUMN IF NOT EXISTS "stage_changed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "stage_changed_by" UUID,
  ADD COLUMN IF NOT EXISTS "stage_override_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "invoice_id" UUID;

ALTER TABLE "nvocc_job_details"
  ADD COLUMN IF NOT EXISTS "workflow_stage" "NvoccWorkflowStage" NOT NULL DEFAULT 'BOOKING_FORM_COMPLETE',
  ADD COLUMN IF NOT EXISTS "stage_changed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "stage_changed_by" UUID,
  ADD COLUMN IF NOT EXISTS "stage_override_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "port_gate_token" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "port_token_obtained_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "draft_bl_requested_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "draft_bl_issued_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "payment_confirmed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "payment_confirmed_by" UUID;

CREATE TABLE IF NOT EXISTS "nvocc_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "booking_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "voyage_ref" VARCHAR(50),
  "gross_weight_kg" DECIMAL(12,3),
  "pol" VARCHAR(100),
  "pod" VARCHAR(100),
  "shipper_owned_container" BOOLEAN NOT NULL DEFAULT false,
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "teu_count" DECIMAL(8,2),
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(20),
  "final_use" VARCHAR(200),
  "activity_sector" VARCHAR(200),
  "insurance_details" TEXT,
  "lc_bank_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_correspondence" BOOLEAN NOT NULL DEFAULT false,
  "attach_cod_form" BOOLEAN NOT NULL DEFAULT false,
  "attach_licence" BOOLEAN NOT NULL DEFAULT false,
  "booking_agent_line" VARCHAR(100),
  "agent_requester_name" VARCHAR(200),
  "sq_bl_booking_reference" VARCHAR(200),
  "request_details" TEXT,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "nvocc_booking_forms_tenant_id_idx" ON "nvocc_booking_forms"("tenant_id");
ALTER TABLE "nvocc_booking_forms" DROP CONSTRAINT IF EXISTS "nvocc_booking_forms_booking_id_fkey";
ALTER TABLE "nvocc_booking_forms" ADD CONSTRAINT "nvocc_booking_forms_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "nvocc_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "nvocc_booking_form_parties" (
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
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "nvocc_booking_form_parties_tenant_id_form_id_party_kind_key" ON "nvocc_booking_form_parties"("tenant_id","form_id","party_kind");
CREATE INDEX IF NOT EXISTS "nvocc_booking_form_parties_tenant_id_form_id_idx" ON "nvocc_booking_form_parties"("tenant_id","form_id");
ALTER TABLE "nvocc_booking_form_parties" DROP CONSTRAINT IF EXISTS "nvocc_booking_form_parties_form_id_fkey";
ALTER TABLE "nvocc_booking_form_parties" ADD CONSTRAINT "nvocc_booking_form_parties_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "nvocc_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "nvocc_container_requests" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "nvocc_job_detail_id" UUID NOT NULL,
  "request_number" VARCHAR(40) NOT NULL,
  "status" "NvoccContainerRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "line_agent" VARCHAR(200),
  "agent_reference_no" VARCHAR(100),
  "delivery_release_terminal" VARCHAR(200),
  "created_date" TIMESTAMPTZ,
  "request_date" TIMESTAMPTZ,
  "expiry_date" TIMESTAMPTZ,
  "dpw_reference_no" VARCHAR(100),
  "remarks" TEXT,
  "vessel_name" VARCHAR(200),
  "in_voyage_number" VARCHAR(50),
  "out_voyage_number" VARCHAR(50),
  "rotation" VARCHAR(50),
  "eta" TIMESTAMPTZ,
  "load_cut_off_date" TIMESTAMPTZ,
  "instruction_type" VARCHAR(100),
  "stuffing_location" VARCHAR(200),
  "port_cfs" VARCHAR(200),
  "receive_to_port_location" VARCHAR(200),
  "move_type" VARCHAR(50),
  "destination_port" VARCHAR(100),
  "next_port_of_discharge" VARCHAR(100),
  "iso_code" VARCHAR(30),
  "imco_code" VARCHAR(50),
  "category" VARCHAR(50),
  "container_count" INTEGER NOT NULL DEFAULT 1,
  "is_oog" BOOLEAN NOT NULL DEFAULT false,
  "is_dry" BOOLEAN NOT NULL DEFAULT true,
  "temperature" VARCHAR(30),
  "ventilation" VARCHAR(30),
  "consignee_name" VARCHAR(200),
  "haulier_name" VARCHAR(200),
  "portal_visible_at" TIMESTAMPTZ,
  "issued_at" TIMESTAMPTZ,
  "issued_by" UUID,
  "allocated_at" TIMESTAMPTZ,
  "allocated_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "nvocc_container_requests_tenant_id_request_number_key" ON "nvocc_container_requests"("tenant_id","request_number");
CREATE INDEX IF NOT EXISTS "nvocc_container_requests_tenant_id_job_id_idx" ON "nvocc_container_requests"("tenant_id","job_id");
ALTER TABLE "nvocc_container_requests" DROP CONSTRAINT IF EXISTS "nvocc_container_requests_nvocc_job_detail_id_fkey";
ALTER TABLE "nvocc_container_requests" ADD CONSTRAINT "nvocc_container_requests_nvocc_job_detail_id_fkey" FOREIGN KEY ("nvocc_job_detail_id") REFERENCES "nvocc_job_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "nvocc_container_request_lines" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "container_request_id" UUID NOT NULL,
  "line_no" INTEGER NOT NULL DEFAULT 1,
  "container_number" VARCHAR(20),
  "container_type_id" UUID,
  "seal_number" VARCHAR(30),
  "picked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "nvocc_container_request_lines_tenant_id_container_number_key" ON "nvocc_container_request_lines"("tenant_id","container_number");
CREATE INDEX IF NOT EXISTS "nvocc_container_request_lines_tenant_id_container_request_id_idx" ON "nvocc_container_request_lines"("tenant_id","container_request_id");
ALTER TABLE "nvocc_container_request_lines" DROP CONSTRAINT IF EXISTS "nvocc_container_request_lines_container_request_id_fkey";
ALTER TABLE "nvocc_container_request_lines" ADD CONSTRAINT "nvocc_container_request_lines_container_request_id_fkey" FOREIGN KEY ("container_request_id") REFERENCES "nvocc_container_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "tenant_container_number_sequences" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL UNIQUE,
  "prefix" VARCHAR(10) NOT NULL DEFAULT 'KF',
  "next_value" INTEGER NOT NULL DEFAULT 1,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "air_pallet_types" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "iata_codes" TEXT[],
  "base_length_m" DECIMAL(10,3),
  "base_width_m" DECIMAL(10,3),
  "height_m" DECIMAL(10,3),
  "usable_volume_m3" DECIMAL(10,3),
  "inside_length_m" DECIMAL(10,3),
  "inside_width_m" DECIMAL(10,3),
  "inside_height_m" DECIMAL(10,3),
  "aircraft_types" TEXT[],
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "air_pallet_types_tenant_id_code_key" ON "air_pallet_types"("tenant_id","code");
CREATE INDEX IF NOT EXISTS "air_pallet_types_tenant_id_deleted_at_idx" ON "air_pallet_types"("tenant_id","deleted_at");

CREATE TABLE IF NOT EXISTS "air_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "air_job_detail_id" UUID NOT NULL UNIQUE,
  "air_pallet_type_id" UUID NOT NULL,
  "pieces" INTEGER,
  "gross_weight_kg" DECIMAL(12,3),
  "chargeable_weight_kg" DECIMAL(12,3),
  "commodity" VARCHAR(500),
  "special_handling" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "air_booking_forms_tenant_id_idx" ON "air_booking_forms"("tenant_id");
ALTER TABLE "air_booking_forms" DROP CONSTRAINT IF EXISTS "air_booking_forms_air_job_detail_id_fkey";
ALTER TABLE "air_booking_forms" ADD CONSTRAINT "air_booking_forms_air_job_detail_id_fkey" FOREIGN KEY ("air_job_detail_id") REFERENCES "air_job_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "air_booking_forms" DROP CONSTRAINT IF EXISTS "air_booking_forms_air_pallet_type_id_fkey";
ALTER TABLE "air_booking_forms" ADD CONSTRAINT "air_booking_forms_air_pallet_type_id_fkey" FOREIGN KEY ("air_pallet_type_id") REFERENCES "air_pallet_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

SELECT enable_rls_for_table('nvocc_booking_forms');
SELECT enable_rls_for_table('nvocc_booking_form_parties');
SELECT enable_rls_for_table('nvocc_container_requests');
SELECT enable_rls_for_table('nvocc_container_request_lines');
SELECT enable_rls_for_table('tenant_container_number_sequences');
SELECT enable_rls_for_table('air_pallet_types');
SELECT enable_rls_for_table('air_booking_forms');
