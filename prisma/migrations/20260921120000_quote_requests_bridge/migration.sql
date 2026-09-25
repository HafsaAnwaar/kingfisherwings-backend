-- Quote Requests bridge: feature flag + connection + mirror + sync runs

ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "quote_requests_bridge_enabled" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  CREATE TYPE "ExternalQuoteRequestProvider" AS ENUM ('KFPP_WP', 'GENERIC_REST');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "external_quote_request_connections" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "provider" "ExternalQuoteRequestProvider" NOT NULL DEFAULT 'KFPP_WP',
  "base_url" VARCHAR(500) NOT NULL,
  "api_key_ciphertext" TEXT NOT NULL,
  "api_key_prefix" VARCHAR(12) NOT NULL,
  "auth_header_name" VARCHAR(80) NOT NULL DEFAULT 'X-KFPP-Api-Key',
  "status_map" JSONB,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_health_at" TIMESTAMPTZ,
  "last_health_ok" BOOLEAN,
  "last_health_error" TEXT,
  "last_sync_at" TIMESTAMPTZ,
  "sync_cursor" VARCHAR(100),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  CONSTRAINT "external_quote_request_connections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "external_quote_request_connections_tenant_id_key"
  ON "external_quote_request_connections"("tenant_id");

ALTER TABLE "external_quote_request_connections"
  DROP CONSTRAINT IF EXISTS "external_quote_request_connections_tenant_id_fkey";
ALTER TABLE "external_quote_request_connections"
  ADD CONSTRAINT "external_quote_request_connections_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "external_quote_requests" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "external_id" VARCHAR(64) NOT NULL,
  "status" VARCHAR(80),
  "contact_name" VARCHAR(200),
  "contact_email" VARCHAR(255),
  "contact_phone" VARCHAR(40),
  "company_name" VARCHAR(300),
  "message" TEXT,
  "commodity" VARCHAR(300),
  "submitted_at" TIMESTAMPTZ,
  "company_id" UUID,
  "party_id" UUID,
  "lead_id" UUID,
  "enquiry_id" UUID,
  "raw_json" JSONB NOT NULL,
  "last_synced_at" TIMESTAMPTZ,
  "status_pushed_at" TIMESTAMPTZ,
  "pending_status_push" BOOLEAN NOT NULL DEFAULT false,
  "sync_error" TEXT,
  "remote_status_at_pull" VARCHAR(80),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "external_quote_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "external_quote_requests_tenant_id_external_id_key"
  ON "external_quote_requests"("tenant_id", "external_id");
CREATE INDEX IF NOT EXISTS "external_quote_requests_tenant_id_status_idx"
  ON "external_quote_requests"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "external_quote_requests_tenant_id_contact_email_idx"
  ON "external_quote_requests"("tenant_id", "contact_email");
CREATE INDEX IF NOT EXISTS "external_quote_requests_tenant_id_last_synced_at_idx"
  ON "external_quote_requests"("tenant_id", "last_synced_at");

ALTER TABLE "external_quote_requests"
  DROP CONSTRAINT IF EXISTS "external_quote_requests_tenant_id_fkey";
ALTER TABLE "external_quote_requests"
  ADD CONSTRAINT "external_quote_requests_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "external_quote_request_sync_runs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finished_at" TIMESTAMPTZ,
  "fetched" INTEGER NOT NULL DEFAULT 0,
  "upserted" INTEGER NOT NULL DEFAULT 0,
  "failed" INTEGER NOT NULL DEFAULT 0,
  "error_summary" TEXT,
  "trigger" VARCHAR(20) NOT NULL DEFAULT 'manual',
  CONSTRAINT "external_quote_request_sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "external_quote_request_sync_runs_tenant_id_started_at_idx"
  ON "external_quote_request_sync_runs"("tenant_id", "started_at");

ALTER TABLE "external_quote_request_sync_runs"
  DROP CONSTRAINT IF EXISTS "external_quote_request_sync_runs_tenant_id_fkey";
ALTER TABLE "external_quote_request_sync_runs"
  ADD CONSTRAINT "external_quote_request_sync_runs_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

SELECT enable_rls_for_table('external_quote_request_connections');
SELECT enable_rls_for_table('external_quote_requests');
SELECT enable_rls_for_table('external_quote_request_sync_runs');
