-- Wave 2: SABER / RA_CODE / ISF refs + OVERSEAS_AGENT org role

ALTER TYPE "JobPartyReferenceType" ADD VALUE IF NOT EXISTS 'SABER';
ALTER TYPE "JobPartyReferenceType" ADD VALUE IF NOT EXISTS 'RA_CODE';
ALTER TYPE "JobPartyReferenceType" ADD VALUE IF NOT EXISTS 'ISF';

ALTER TYPE "JobPartyRole" ADD VALUE IF NOT EXISTS 'OVERSEAS_AGENT';

ALTER TABLE "jobs"
  ADD COLUMN IF NOT EXISTS "overseas_agent_id" UUID;

CREATE INDEX IF NOT EXISTS "jobs_tenant_id_overseas_agent_id_idx"
  ON "jobs"("tenant_id", "overseas_agent_id");

ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "allow_create_party_from_job" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "job_import_delivery_details"
  ADD COLUMN IF NOT EXISTS "return_to_terminal_date" DATE,
  ADD COLUMN IF NOT EXISTS "load_onboard_date" DATE;
