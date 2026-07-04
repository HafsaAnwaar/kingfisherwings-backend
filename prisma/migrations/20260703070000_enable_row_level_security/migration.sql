-- src/database/migrations/001_enable_rls.sql
-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 001 — Enable Row Level Security
-- Applies to every tenant-scoped table.
-- Run once after all tables are created via Prisma migrate.
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ── Session variable reader ─────────────────────────────────────
-- Called inside every RLS policy USING clause.
-- Returns NULL when no tenant context is set (blocks all rows).
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT NULLIF(
    current_setting('app.tenant_id', TRUE),
    ''
  )::UUID
$$;

-- ── Session variable setter ─────────────────────────────────────
-- Called by TenantMiddleware once per request, before any query.
-- TRUE = scoped to current transaction only.
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.tenant_id', p_tenant_id::TEXT, TRUE);
END;
$$;

-- ── RLS enablement macro ────────────────────────────────────────
-- Enables RLS + FORCE RLS + creates the isolation policy.
-- FORCE RLS ensures even the table owner cannot bypass it.
CREATE OR REPLACE FUNCTION enable_rls_for_table(p_table TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format(
    'ALTER TABLE %I ENABLE ROW LEVEL SECURITY', p_table
  );
  EXECUTE format(
    'ALTER TABLE %I FORCE ROW LEVEL SECURITY', p_table
  );
  EXECUTE format(
    $policy$
      CREATE POLICY tenant_isolation ON %I
        AS PERMISSIVE
        FOR ALL
        TO PUBLIC
        USING      (tenant_id = current_tenant_id())
        WITH CHECK (tenant_id = current_tenant_id())
    $policy$,
    p_table
  );
END;
$$;

-- ── Soft delete partial index macro ────────────────────────────
-- All list queries filter WHERE deleted_at IS NULL.
-- Partial index makes this O(active rows), not O(all rows).
CREATE OR REPLACE FUNCTION add_soft_delete_index(p_table TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format(
    $idx$
      CREATE INDEX IF NOT EXISTS idx_%s_not_deleted
        ON %I (tenant_id, created_at DESC)
        WHERE deleted_at IS NULL
    $idx$,
    p_table, p_table
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- APPLY RLS — All tenant-scoped tables
-- 'tenants' is intentionally excluded: it is the root table,
-- accessed only by SUPER_ADMIN via unsafeBypassRLS.
-- ═══════════════════════════════════════════════════════════════

SELECT enable_rls_for_table('users');
-- 'sessions' is intentionally excluded from RLS: it is looked up by
-- a globally-unique opaque jti token as the entry point for refresh /
-- logout, before the tenant is known -- that's a genuine chicken-and-
-- egg with FORCE RLS. It remains fully tenant-scoped at the
-- application layer (every query filters by tenant_id/user_id
-- explicitly). The correct long-term fix is a dedicated BYPASSRLS
-- Postgres role for this one narrow lookup; out of scope for this pass.
SELECT enable_rls_for_table('roles');
SELECT enable_rls_for_table('permissions');
SELECT enable_rls_for_table('role_permissions');
SELECT enable_rls_for_table('user_permissions');
SELECT enable_rls_for_table('audit_logs');
SELECT enable_rls_for_table('branches');

-- Master data
SELECT enable_rls_for_table('countries');
SELECT enable_rls_for_table('currencies');
SELECT enable_rls_for_table('exchange_rates');
SELECT enable_rls_for_table('ports');
SELECT enable_rls_for_table('airports');
SELECT enable_rls_for_table('airlines');
SELECT enable_rls_for_table('shipping_lines');
SELECT enable_rls_for_table('vessels');
SELECT enable_rls_for_table('container_types');
SELECT enable_rls_for_table('charge_codes');
SELECT enable_rls_for_table('hs_codes');
SELECT enable_rls_for_table('tax_rates');
SELECT enable_rls_for_table('departments');
SELECT enable_rls_for_table('designations');
SELECT enable_rls_for_table('banks');
SELECT enable_rls_for_table('holidays');
SELECT enable_rls_for_table('units_of_measure');
SELECT enable_rls_for_table('truckers');
SELECT enable_rls_for_table('warehouses');

-- Parties
SELECT enable_rls_for_table('parties');
SELECT enable_rls_for_table('party_contacts');
SELECT enable_rls_for_table('party_addresses');

-- Jobs
SELECT enable_rls_for_table('jobs');
SELECT enable_rls_for_table('air_job_details');
SELECT enable_rls_for_table('sea_fcl_job_details');
SELECT enable_rls_for_table('job_containers');
SELECT enable_rls_for_table('job_charges');
SELECT enable_rls_for_table('job_milestones');
SELECT enable_rls_for_table('job_documents');
SELECT enable_rls_for_table('job_notes');

-- ═══════════════════════════════════════════════════════════════
-- SOFT DELETE PARTIAL INDEXES
-- ═══════════════════════════════════════════════════════════════

SELECT add_soft_delete_index('users');
SELECT add_soft_delete_index('parties');
SELECT add_soft_delete_index('jobs');
SELECT add_soft_delete_index('sessions');

-- ═══════════════════════════════════════════════════════════════
-- FULL-TEXT SEARCH GIN INDEXES (pg_trgm)
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_parties_name_trgm
  ON parties USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_jobs_job_number_trgm
  ON jobs USING GIN (job_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_users_email_trgm
  ON users USING GIN (email gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════════
-- COMPOSITE PERFORMANCE INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_jobs_tenant_type_status
  ON jobs (tenant_id, job_type, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_tenant_etd
  ON jobs (tenant_id, etd DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_tenant_user_active
  ON sessions (tenant_id, user_id, is_active)
  WHERE deleted_at IS NULL;
