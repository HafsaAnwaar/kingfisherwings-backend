-- Week 13 — portal document permissions matrix per customer party

CREATE TYPE "PortalDocumentType" AS ENUM (
  'HAWB',
  'MAWB',
  'HBL',
  'MBL',
  'INVOICE',
  'CREDIT_NOTE',
  'STATEMENT',
  'CAN',
  'DO',
  'POD',
  'PRE_ALERT',
  'OTHER'
);

CREATE TABLE "portal_permissions" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "document_type" "PortalDocumentType" NOT NULL,
  "can_view" BOOLEAN NOT NULL DEFAULT true,
  "can_download" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "created_by" UUID,
  "updated_by" UUID,

  CONSTRAINT "portal_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "portal_permissions_tenant_id_party_id_document_type_key"
  ON "portal_permissions"("tenant_id", "party_id", "document_type");

CREATE INDEX "portal_permissions_tenant_id_party_id_idx"
  ON "portal_permissions"("tenant_id", "party_id");

ALTER TABLE "portal_permissions"
  ADD CONSTRAINT "portal_permissions_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
