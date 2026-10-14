-- Typed document uploads + party visibility (JobDocument ACL, invoice/voucher attachments)

CREATE TYPE "DocumentSource" AS ENUM ('GENERATED', 'UPLOADED');

ALTER TABLE "job_documents"
  ADD COLUMN IF NOT EXISTS "source" "DocumentSource" NOT NULL DEFAULT 'GENERATED',
  ADD COLUMN IF NOT EXISTS "uploader_side" "OpsUploaderSide",
  ADD COLUMN IF NOT EXISTS "uploaded_by_party_id" UUID,
  ADD COLUMN IF NOT EXISTS "visible_to_customer" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "visible_to_vendor" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "booking_form_kind" VARCHAR(60);

-- Internal generated docs should not be customer-visible by default.
UPDATE "job_documents"
SET "visible_to_customer" = false
WHERE "document_type"::text IN ('JOB_PNL', 'JOB_COSTING', 'JOB_CARD', 'FREIGHT_MANIFEST', 'JOB_PNL_CUSTOM_DUTY');

CREATE INDEX IF NOT EXISTS "job_documents_tenant_id_job_id_uploader_side_idx"
  ON "job_documents"("tenant_id", "job_id", "uploader_side");

CREATE TABLE IF NOT EXISTS "invoice_attachments" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "invoice_id" UUID NOT NULL,
  "file_name" VARCHAR(300) NOT NULL,
  "file_url" TEXT NOT NULL,
  "s3_key" TEXT,
  "mime_type" VARCHAR(120),
  "file_size" INTEGER,
  "uploader_side" "OpsUploaderSide" NOT NULL DEFAULT 'STAFF',
  "uploaded_by_party_id" UUID,
  "uploaded_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "invoice_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "invoice_attachments_tenant_id_idx" ON "invoice_attachments"("tenant_id");
CREATE INDEX IF NOT EXISTS "invoice_attachments_tenant_id_invoice_id_idx"
  ON "invoice_attachments"("tenant_id", "invoice_id");

DO $$ BEGIN
  ALTER TABLE "invoice_attachments"
    ADD CONSTRAINT "invoice_attachments_invoice_id_fkey"
    FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "voucher_attachments" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "voucher_id" UUID NOT NULL,
  "file_name" VARCHAR(300) NOT NULL,
  "file_url" TEXT NOT NULL,
  "s3_key" TEXT,
  "mime_type" VARCHAR(120),
  "file_size" INTEGER,
  "uploader_side" "OpsUploaderSide" NOT NULL DEFAULT 'STAFF',
  "uploaded_by_party_id" UUID,
  "uploaded_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "voucher_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "voucher_attachments_tenant_id_idx" ON "voucher_attachments"("tenant_id");
CREATE INDEX IF NOT EXISTS "voucher_attachments_tenant_id_voucher_id_idx"
  ON "voucher_attachments"("tenant_id", "voucher_id");

DO $$ BEGIN
  ALTER TABLE "voucher_attachments"
    ADD CONSTRAINT "voucher_attachments_voucher_id_fkey"
    FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
