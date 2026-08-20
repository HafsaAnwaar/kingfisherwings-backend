-- Week 15 — Air Import (Ch.9)

CREATE TYPE "StorageRateBasis" AS ENUM ('KG', 'CBM');
CREATE TYPE "CustomsExaminationResult" AS ENUM ('HELD', 'RELEASED', 'SEIZED', 'QUERY');
CREATE TYPE "DepositAlertBand" AS ENUM ('NONE', 'OK', 'D90', 'D60', 'D30', 'D7', 'EXPIRED');

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CUSTOMS_DEPOSIT_EXPIRING';

ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "mawb_number_from_origin" VARCHAR(50);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "hawb_number_from_origin_agent" VARCHAR(50);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "arrival_flight_number" VARCHAR(20);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "actual_eta" TIMESTAMPTZ;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "agent_at_origin_id" UUID;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "notify_party_id" UUID;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "delivery_address" TEXT;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "final_destination" VARCHAR(200);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "customs_value" DECIMAL(18,4);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "dg_details" TEXT;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "special_handling_notes" TEXT;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "customs_entry_number" VARCHAR(100);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "customs_duty_amount" DECIMAL(18,4);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "customs_tax_amount" DECIMAL(18,4);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "customs_clearance_date" TIMESTAMPTZ;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "customs_status" "CustomsClearanceStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "customs_broker_id" UUID;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "storage_start_date" DATE;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "storage_free_days" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "storage_rate" DECIMAL(18,4);
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "storage_rate_basis" "StorageRateBasis";
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "storage_invoice_id" UUID;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "linked_export_job_id" UUID;
ALTER TABLE "air_job_details" ADD COLUMN IF NOT EXISTS "originating_branch_id" UUID;

CREATE INDEX IF NOT EXISTS "air_job_details_tenant_id_mawb_number_from_origin_idx"
  ON "air_job_details"("tenant_id", "mawb_number_from_origin");
CREATE INDEX IF NOT EXISTS "air_job_details_tenant_id_hawb_number_from_origin_agent_idx"
  ON "air_job_details"("tenant_id", "hawb_number_from_origin_agent");

ALTER TABLE "air_job_details"
  ADD CONSTRAINT "air_job_details_storage_invoice_id_fkey"
  FOREIGN KEY ("storage_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "job_deposits" ADD COLUMN IF NOT EXISTS "last_alert_band" "DepositAlertBand";
ALTER TABLE "job_deposits" ADD COLUMN IF NOT EXISTS "last_alerted_at" TIMESTAMPTZ;

ALTER TABLE "damage_reports" ADD COLUMN IF NOT EXISTS "damage_type" VARCHAR(100);
ALTER TABLE "damage_reports" ADD COLUMN IF NOT EXISTS "quantity_short" INTEGER;
ALTER TABLE "damage_reports" ADD COLUMN IF NOT EXISTS "notify_to" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TABLE IF NOT EXISTS "job_customs_examinations" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "examination_date" DATE NOT NULL,
  "examining_officer" VARCHAR(200),
  "items_examined" TEXT,
  "result" "CustomsExaminationResult" NOT NULL,
  "remarks" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_customs_examinations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_customs_examinations_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "job_customs_examinations_tenant_id_idx" ON "job_customs_examinations"("tenant_id");
ALTER TABLE "email_logs" ADD COLUMN IF NOT EXISTS "scheduled_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "email_logs_tenant_id_scheduled_at_idx"
  ON "email_logs"("tenant_id", "scheduled_at");
