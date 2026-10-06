-- SuperAdmin per-tenant product module enablement
ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "enabled_modules" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Existing tenants: empty means "all" at runtime; leave empty for migrate safety.
-- New creates set the full list in application code.
