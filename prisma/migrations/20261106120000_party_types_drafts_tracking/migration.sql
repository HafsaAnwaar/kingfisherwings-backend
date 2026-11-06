-- Custom party types, job create drafts, YQN-style job tracking profile

ALTER TABLE "parties" ADD COLUMN IF NOT EXISTS "party_type_code" VARCHAR(60);
UPDATE "parties" SET "party_type_code" = "party_type"::text WHERE "party_type_code" IS NULL;
CREATE INDEX IF NOT EXISTS "parties_tenant_id_party_type_code_idx" ON "parties"("tenant_id", "party_type_code");

CREATE TABLE IF NOT EXISTS "party_type_catalog" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(60) NOT NULL,
  "label" VARCHAR(120) NOT NULL,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "party_type_catalog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "party_type_catalog_tenant_id_code_key" ON "party_type_catalog"("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "party_type_catalog_tenant_id_idx" ON "party_type_catalog"("tenant_id");
CREATE INDEX IF NOT EXISTS "party_type_catalog_tenant_id_is_active_idx" ON "party_type_catalog"("tenant_id", "is_active");

CREATE TABLE IF NOT EXISTS "job_create_drafts" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "branch_id" UUID,
  "job_type" "JobType",
  "step" VARCHAR(80),
  "payload" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_create_drafts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "job_create_drafts_tenant_id_user_id_idx" ON "job_create_drafts"("tenant_id", "user_id");
CREATE INDEX IF NOT EXISTS "job_create_drafts_tenant_user_updated_idx" ON "job_create_drafts"("tenant_id", "user_id", "updated_at" DESC);

CREATE TABLE IF NOT EXISTS "job_tracking_profiles" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "origin_label" VARCHAR(200),
  "dest_label" VARCHAR(200),
  "at_before" TIMESTAMPTZ,
  "terminal_cutoff_at" TIMESTAMPTZ,
  "legs" JSONB NOT NULL DEFAULT '[]',
  "port_of_call" JSONB NOT NULL DEFAULT '[]',
  "container_events" JSONB NOT NULL DEFAULT '[]',
  "arrival_report" JSONB NOT NULL DEFAULT '[]',
  "customs_status" JSONB NOT NULL DEFAULT '[]',
  "detailed_data" JSONB NOT NULL DEFAULT '{}',
  "pre_manifest" JSONB NOT NULL DEFAULT '[]',
  "qty_gw_vol" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_by" UUID,
  CONSTRAINT "job_tracking_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "job_tracking_profiles_job_id_key" ON "job_tracking_profiles"("job_id");
CREATE INDEX IF NOT EXISTS "job_tracking_profiles_tenant_id_idx" ON "job_tracking_profiles"("tenant_id");
DO $$ BEGIN
  ALTER TABLE "job_tracking_profiles"
    ADD CONSTRAINT "job_tracking_profiles_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
