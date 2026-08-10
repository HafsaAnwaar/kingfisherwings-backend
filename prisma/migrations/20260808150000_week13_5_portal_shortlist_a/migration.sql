-- Week 13.5 Shortlist A: portal preferences + DOCUMENT_READY

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'DOCUMENT_READY';

CREATE TABLE IF NOT EXISTS "portal_user_preferences" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "portal_user_id" UUID NOT NULL,
  "milestone_alerts_enabled" BOOLEAN NOT NULL DEFAULT false,
  "document_alerts_enabled" BOOLEAN NOT NULL DEFAULT true,
  "default_shipment_filters" JSONB,
  "default_invoice_filters" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "portal_user_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "portal_user_preferences_portal_user_id_key"
  ON "portal_user_preferences"("portal_user_id");

CREATE INDEX IF NOT EXISTS "portal_user_preferences_tenant_id_idx"
  ON "portal_user_preferences"("tenant_id");

ALTER TABLE "portal_user_preferences"
  DROP CONSTRAINT IF EXISTS "portal_user_preferences_portal_user_id_fkey";
ALTER TABLE "portal_user_preferences"
  ADD CONSTRAINT "portal_user_preferences_portal_user_id_fkey"
  FOREIGN KEY ("portal_user_id") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

SELECT enable_rls_for_table('portal_user_preferences');
