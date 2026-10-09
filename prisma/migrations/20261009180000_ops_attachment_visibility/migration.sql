-- Ops continuum attachments: uploader side + customer/vendor visibility (R2-backed)

DO $$ BEGIN
  CREATE TYPE "OpsUploaderSide" AS ENUM ('STAFF', 'CUSTOMER', 'VENDOR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ops_entity_attachments"
  ADD COLUMN IF NOT EXISTS "file_url" VARCHAR(1000),
  ADD COLUMN IF NOT EXISTS "uploader_side" "OpsUploaderSide" NOT NULL DEFAULT 'STAFF',
  ADD COLUMN IF NOT EXISTS "uploaded_by_party_id" UUID,
  ADD COLUMN IF NOT EXISTS "visible_to_customer" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "visible_to_vendor" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "ops_entity_attachments_tenant_id_uploaded_by_party_id_idx"
  ON "ops_entity_attachments" ("tenant_id", "uploaded_by_party_id");
