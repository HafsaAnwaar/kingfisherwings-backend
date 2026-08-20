-- Phase B/C/D hardening: tracking tokens, SuperAdmin 2FA, search indexes, invite token uniqueness

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS tracking_token VARCHAR(64);

UPDATE jobs
SET tracking_token = replace(gen_random_uuid()::text, '-', '')
WHERE tracking_token IS NULL;

ALTER TABLE jobs
  ALTER COLUMN tracking_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_tracking_token ON jobs (tracking_token);

ALTER TABLE super_admins
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
  ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[] NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_invite_token ON users (invite_token)
  WHERE invite_token IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_job_number_trgm ON jobs USING GIN (job_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_parties_name_trgm ON parties USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_invoices_number_trgm ON invoices USING GIN (invoice_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_quotations_number_trgm ON quotations USING GIN (quotation_number gin_trgm_ops);
