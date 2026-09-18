-- Compliance booking form fields + drop air pallet / ULD

DO $$ BEGIN
  CREATE TYPE "NvoccActivitySector" AS ENUM ('CIVILIAN', 'MILITARY', 'NUCLEAR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Map legacy free-text activity_sector into enum column via temp text
ALTER TABLE "nvocc_booking_forms"
  ADD COLUMN IF NOT EXISTS "client_booking_no" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "net_weight_kg" DECIMAL(12,3),
  ADD COLUMN IF NOT EXISTS "doc_commercial_invoice_key" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "doc_correspondence_key" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "doc_cod_form_key" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "doc_licence_key" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "consent_accepted_at" TIMESTAMPTZ;

-- Convert activity_sector String → enum (add new col, migrate, drop old)
ALTER TABLE "nvocc_booking_forms"
  ADD COLUMN IF NOT EXISTS "activity_sector_enum" "NvoccActivitySector";

UPDATE "nvocc_booking_forms"
SET "activity_sector_enum" = CASE
  WHEN UPPER(TRIM(COALESCE("activity_sector", ''))) IN ('CIVILIAN', 'CIVIL') THEN 'CIVILIAN'::"NvoccActivitySector"
  WHEN UPPER(TRIM(COALESCE("activity_sector", ''))) IN ('MILITARY', 'MIL') THEN 'MILITARY'::"NvoccActivitySector"
  WHEN UPPER(TRIM(COALESCE("activity_sector", ''))) IN ('NUCLEAR', 'NUKE') THEN 'NUCLEAR'::"NvoccActivitySector"
  ELSE NULL
END
WHERE "activity_sector_enum" IS NULL;

ALTER TABLE "nvocc_booking_forms" DROP COLUMN IF EXISTS "activity_sector";
ALTER TABLE "nvocc_booking_forms" RENAME COLUMN "activity_sector_enum" TO "activity_sector";

-- Remap any air jobs stuck on removed ULD stages
UPDATE "air_job_details"
SET "workflow_stage" = 'BUILD_UP'
WHERE "workflow_stage"::text IN ('ULD_REQUEST_ISSUED', 'ULD_ALLOCATED', 'CARGO_DROPPED_OFF');

-- Drop ULD / air pallet tables and FK
ALTER TABLE "air_booking_forms" DROP COLUMN IF EXISTS "air_pallet_type_id";

DROP TABLE IF EXISTS "air_uld_request_lines" CASCADE;
DROP TABLE IF EXISTS "air_uld_requests" CASCADE;
DROP TABLE IF EXISTS "tenant_uld_number_sequences" CASCADE;
DROP TABLE IF EXISTS "air_pallet_types" CASCADE;

DROP TYPE IF EXISTS "AirUldRequestStatus";
