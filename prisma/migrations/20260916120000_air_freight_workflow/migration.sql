-- Air freight department workflow alignment

DO $$ BEGIN
  CREATE TYPE "AirWorkflowStage" AS ENUM (
    'QUOTE_REQUESTED',
    'CS_TRIAGED',
    'QUOTE_SENT',
    'CUSTOMER_ACCEPTED',
    'BOOKING_FORM_COMPLETE',
    'INVOICE_SENT',
    'ULD_REQUEST_ISSUED',
    'ULD_ALLOCATED',
    'CARGO_DROPPED_OFF',
    'BUILD_UP',
    'DRAFT_HAWB_ISSUED',
    'PAYMENT_RECEIVED',
    'FINAL_HAWB_ISSUED',
    'MAWB_ISSUED',
    'MAWB_RECEIVED',
    'PRE_CAN_ISSUED',
    'CAN_ISSUED',
    'DELIVERY_ORDER_ISSUED',
    'POD_RECEIVED',
    'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AirUldRequestStatus" AS ENUM ('DRAFT', 'ISSUED', 'ALLOCATED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'ULD_REQUEST';
ALTER TYPE "PortalDocumentType" ADD VALUE IF NOT EXISTS 'ULD_REQUEST';

ALTER TABLE "air_job_details"
  ADD COLUMN IF NOT EXISTS "workflow_stage" "AirWorkflowStage" NOT NULL DEFAULT 'QUOTE_REQUESTED',
  ADD COLUMN IF NOT EXISTS "stage_changed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "stage_changed_by" UUID,
  ADD COLUMN IF NOT EXISTS "stage_override_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "invoice_id" UUID,
  ADD COLUMN IF NOT EXISTS "payment_confirmed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "payment_confirmed_by" UUID,
  ADD COLUMN IF NOT EXISTS "draft_hawb_requested_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "draft_hawb_issued_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "final_hawb_issued_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "delivery_order_requested_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "delivery_order_issued_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "cargo_dropped_off_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "pod_workflow_received_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "air_job_details_tenant_id_workflow_stage_idx"
  ON "air_job_details"("tenant_id", "workflow_stage");

ALTER TABLE "air_booking_forms"
  ALTER COLUMN "air_pallet_type_id" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "is_dg" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "flight_number" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "flight_date" DATE,
  ADD COLUMN IF NOT EXISTS "origin_airport_code" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "dest_airport_code" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "arrival_flight_number" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "mawb_from_origin" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "agent_at_origin" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "delivery_address" TEXT,
  ADD COLUMN IF NOT EXISTS "customs_value" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "is_complete" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "completed_by" UUID;

CREATE TABLE IF NOT EXISTS "air_booking_form_parties" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
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
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "air_booking_form_parties_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "air_booking_form_parties_tenant_id_form_id_party_kind_key"
  ON "air_booking_form_parties"("tenant_id", "form_id", "party_kind");
CREATE INDEX IF NOT EXISTS "air_booking_form_parties_tenant_id_form_id_idx"
  ON "air_booking_form_parties"("tenant_id", "form_id");

ALTER TABLE "air_booking_form_parties" DROP CONSTRAINT IF EXISTS "air_booking_form_parties_form_id_fkey";
ALTER TABLE "air_booking_form_parties"
  ADD CONSTRAINT "air_booking_form_parties_form_id_fkey"
  FOREIGN KEY ("form_id") REFERENCES "air_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "air_uld_requests" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "air_job_detail_id" UUID NOT NULL,
  "request_number" VARCHAR(40) NOT NULL,
  "status" "AirUldRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "airline_name" VARCHAR(200),
  "flight_number" VARCHAR(20),
  "flight_date" DATE,
  "warehouse_cfs" VARCHAR(200),
  "cutoff_at" TIMESTAMPTZ,
  "remarks" TEXT,
  "uld_count" INTEGER NOT NULL DEFAULT 1,
  "portal_visible_at" TIMESTAMPTZ,
  "issued_at" TIMESTAMPTZ,
  "issued_by" UUID,
  "allocated_at" TIMESTAMPTZ,
  "allocated_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "air_uld_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "air_uld_requests_tenant_id_request_number_key"
  ON "air_uld_requests"("tenant_id", "request_number");
CREATE INDEX IF NOT EXISTS "air_uld_requests_tenant_id_job_id_idx"
  ON "air_uld_requests"("tenant_id", "job_id");
CREATE INDEX IF NOT EXISTS "air_uld_requests_tenant_id_status_idx"
  ON "air_uld_requests"("tenant_id", "status");

ALTER TABLE "air_uld_requests" DROP CONSTRAINT IF EXISTS "air_uld_requests_air_job_detail_id_fkey";
ALTER TABLE "air_uld_requests"
  ADD CONSTRAINT "air_uld_requests_air_job_detail_id_fkey"
  FOREIGN KEY ("air_job_detail_id") REFERENCES "air_job_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "air_uld_request_lines" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "uld_request_id" UUID NOT NULL,
  "line_no" INTEGER NOT NULL DEFAULT 1,
  "uld_number" VARCHAR(30),
  "air_pallet_type_id" UUID,
  "dropped_off_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "air_uld_request_lines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "air_uld_request_lines_tenant_id_uld_number_key"
  ON "air_uld_request_lines"("tenant_id", "uld_number");
CREATE INDEX IF NOT EXISTS "air_uld_request_lines_tenant_id_uld_request_id_idx"
  ON "air_uld_request_lines"("tenant_id", "uld_request_id");

ALTER TABLE "air_uld_request_lines" DROP CONSTRAINT IF EXISTS "air_uld_request_lines_uld_request_id_fkey";
ALTER TABLE "air_uld_request_lines"
  ADD CONSTRAINT "air_uld_request_lines_uld_request_id_fkey"
  FOREIGN KEY ("uld_request_id") REFERENCES "air_uld_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "air_uld_request_lines" DROP CONSTRAINT IF EXISTS "air_uld_request_lines_air_pallet_type_id_fkey";
ALTER TABLE "air_uld_request_lines"
  ADD CONSTRAINT "air_uld_request_lines_air_pallet_type_id_fkey"
  FOREIGN KEY ("air_pallet_type_id") REFERENCES "air_pallet_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "tenant_uld_number_sequences" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "prefix" VARCHAR(10) NOT NULL DEFAULT 'ULD',
  "next_value" INTEGER NOT NULL DEFAULT 1,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tenant_uld_number_sequences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenant_uld_number_sequences_tenant_id_key"
  ON "tenant_uld_number_sequences"("tenant_id");

SELECT enable_rls_for_table('air_booking_form_parties');
SELECT enable_rls_for_table('air_uld_requests');
SELECT enable_rls_for_table('air_uld_request_lines');
SELECT enable_rls_for_table('tenant_uld_number_sequences');
