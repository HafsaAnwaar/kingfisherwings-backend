-- EDI submission metadata
ALTER TABLE "documentation_edi_submissions" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Job hold/resume + booking custom fields
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "hold_reason" TEXT;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "held_at" TIMESTAMPTZ;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "expected_release_at" TIMESTAMPTZ;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "resume_reason" TEXT;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "resumed_at" TIMESTAMPTZ;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "booking_custom_fields" JSONB;

-- Shipment booking custom fields
ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "booking_custom_fields" JSONB;

-- Document downloadable flags (default true = legacy download behavior)
ALTER TABLE "job_documents" ADD COLUMN IF NOT EXISTS "downloadable_by_customer" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "job_documents" ADD COLUMN IF NOT EXISTS "downloadable_by_vendor" BOOLEAN NOT NULL DEFAULT true;

-- Acknowledgement attachments
CREATE TABLE IF NOT EXISTS "delivery_acknowledgement_attachments" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "acknowledgement_id" UUID NOT NULL,
  "file_name" VARCHAR(300) NOT NULL,
  "file_url" TEXT NOT NULL,
  "s3_key" TEXT,
  "mime_type" VARCHAR(120),
  "file_size" INTEGER,
  "uploaded_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "delivery_acknowledgement_attachments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "delivery_acknowledgement_attachments_tenant_ack_idx"
  ON "delivery_acknowledgement_attachments"("tenant_id", "acknowledgement_id");
DO $$ BEGIN
  ALTER TABLE "delivery_acknowledgement_attachments"
    ADD CONSTRAINT "delivery_acknowledgement_attachments_acknowledgement_id_fkey"
    FOREIGN KEY ("acknowledgement_id") REFERENCES "delivery_acknowledgements"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
