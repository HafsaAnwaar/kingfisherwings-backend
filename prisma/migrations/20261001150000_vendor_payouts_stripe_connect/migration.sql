-- Automatic vendor payouts via Stripe Connect (gated by STRIPE_CONNECT_ENABLED).

-- AlterTable
ALTER TABLE "tenant_payment_gateways" ADD COLUMN     "auto_vendor_payouts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "connect_webhook_secret_encrypted" TEXT;

-- CreateTable
CREATE TABLE "vendor_payout_accounts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "account_ref" VARCHAR(80) NOT NULL,
    "stripe_account_id" VARCHAR(255) NOT NULL,
    "details_submitted" BOOLEAN NOT NULL DEFAULT false,
    "payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "transfers_active" BOOLEAN NOT NULL DEFAULT false,
    "requirements_due" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vendor_payout_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_payouts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "invoice_id" UUID,
    "payment_request_id" UUID,
    "status" "OnlinePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "account_ref" VARCHAR(80) NOT NULL,
    "stripe_account_id" VARCHAR(255) NOT NULL,
    "stripe_transfer_id" VARCHAR(255),
    "erp_payment_id" UUID,
    "failure_message" TEXT,
    "initiated_by_type" "PaymentInitiatorType" NOT NULL,
    "initiated_by_id" UUID,
    "paid_at" TIMESTAMPTZ,
    "reversed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vendor_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_payout_accounts_stripe_account_id_key" ON "vendor_payout_accounts"("stripe_account_id");

-- CreateIndex
CREATE INDEX "vendor_payout_accounts_tenant_id_idx" ON "vendor_payout_accounts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_payout_accounts_tenant_id_party_id_account_ref_key" ON "vendor_payout_accounts"("tenant_id", "party_id", "account_ref");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_payouts_stripe_transfer_id_key" ON "vendor_payouts"("stripe_transfer_id");

-- CreateIndex
CREATE INDEX "vendor_payouts_tenant_id_idx" ON "vendor_payouts"("tenant_id");

-- CreateIndex
CREATE INDEX "vendor_payouts_tenant_id_party_id_idx" ON "vendor_payouts"("tenant_id", "party_id");

-- CreateIndex
CREATE INDEX "vendor_payouts_tenant_id_payment_request_id_idx" ON "vendor_payouts"("tenant_id", "payment_request_id");

-- CreateIndex
CREATE INDEX "vendor_payouts_tenant_id_invoice_id_idx" ON "vendor_payouts"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "vendor_payouts_tenant_id_status_idx" ON "vendor_payouts"("tenant_id", "status");

-- One live payout per payment request / vendor bill: a vendor can never be
-- transferred the same obligation twice (failed/reversed payouts excluded).
CREATE UNIQUE INDEX IF NOT EXISTS "vendor_payouts_live_request_key"
  ON "vendor_payouts" ("tenant_id", "payment_request_id")
  WHERE payment_request_id IS NOT NULL AND status IN ('PENDING', 'PROCESSING', 'PAID');
CREATE UNIQUE INDEX IF NOT EXISTS "vendor_payouts_live_invoice_key"
  ON "vendor_payouts" ("tenant_id", "invoice_id")
  WHERE payment_request_id IS NULL AND invoice_id IS NOT NULL AND status IN ('PENDING', 'PROCESSING');

-- Tenant data. vendor_payout_accounts is resolved by stripe_account_id from
-- Connect webhooks before a tenant context exists (filtered in code).
SELECT enable_rls_for_table('vendor_payouts');
