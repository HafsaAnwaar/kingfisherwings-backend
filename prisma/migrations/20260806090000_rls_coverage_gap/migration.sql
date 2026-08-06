-- Closes an RLS coverage gap: these tenant-scoped tables were created by
-- later migrations (Weeks 3-13) without a call to enable_rls_for_table(),
-- so isolation on them relied solely on hand-written tenant_id filters at
-- the application layer with no database-level backstop.
--
-- Every table below was verified against src/ to confirm all reads/writes
-- go through prisma.runWithTenant(...) (which sets app.tenant_id before
-- querying) — the same precondition documented for the original RLS pass
-- in 20260703070000_enable_row_level_security. Two call sites that were
-- NOT going through runWithTenant (src/shared/queue/document-generation.service.ts
-- and src/shared/email/email.service.ts) were fixed in the same change so
-- document_generation_tasks, email_logs, and quotations are safe to include.
--
-- Intentionally still excluded (unchanged from the original migration):
-- tenants, super_admins, super_admin_sessions (root/cross-tenant tables),
-- and sessions (looked up by a globally-unique jti before tenant is known).

SELECT enable_rls_for_table('companies');
SELECT enable_rls_for_table('tenant_bank_accounts');
SELECT enable_rls_for_table('document_number_formats');
SELECT enable_rls_for_table('document_number_sequences');
SELECT enable_rls_for_table('document_generation_tasks');
SELECT enable_rls_for_table('user_role_assignments');
SELECT enable_rls_for_table('password_history');
SELECT enable_rls_for_table('login_history');
SELECT enable_rls_for_table('quotations');
SELECT enable_rls_for_table('quotation_lines');
SELECT enable_rls_for_table('quotation_status_history');
SELECT enable_rls_for_table('quotation_approvals');
SELECT enable_rls_for_table('tariffs');
SELECT enable_rls_for_table('zip_distances');
SELECT enable_rls_for_table('awb_stock_batches');
SELECT enable_rls_for_table('awb_stock_allocations');
SELECT enable_rls_for_table('email_logs');
SELECT enable_rls_for_table('invoices');
SELECT enable_rls_for_table('invoice_lines');
SELECT enable_rls_for_table('payment_requests');
