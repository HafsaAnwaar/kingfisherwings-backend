-- RLS for customer portal tenant-scoped tables

SELECT enable_rls_for_table('portal_users');
SELECT enable_rls_for_table('portal_sessions');
SELECT enable_rls_for_table('portal_permissions');
