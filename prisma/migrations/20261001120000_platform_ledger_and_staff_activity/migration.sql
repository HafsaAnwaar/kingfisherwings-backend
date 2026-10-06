-- Super Admin finance: mirror platform invoices/payments into the platform
-- ledger company's existing invoices/payments (PLATFORM_LEDGER_TENANT_ID).
ALTER TABLE "platform_invoices" ADD COLUMN "erp_invoice_id" UUID,
ADD COLUMN "erp_sync_claimed_at" TIMESTAMPTZ;

ALTER TABLE "platform_payments" ADD COLUMN "erp_payment_id" UUID,
ADD COLUMN "erp_synced_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN "erp_sync_claimed_at" TIMESTAMPTZ;

-- Staff activity emails to tenant admins (existing email_logs).
ALTER TYPE "EmailEventType" ADD VALUE 'STAFF_ACTIVITY';
