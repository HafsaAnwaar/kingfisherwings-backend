-- ═══════════════════════════════════════════════════════════════
-- Stripe payment gateway integration
--   * gateway attempts / refunds / payment links / webhook events
--   * per-tenant Stripe account settings
--   * platform (Super Admin → Tenant) billing: plans, invoices, payments
--   * Stripe Billing subscription sync fields on tenants
-- The ERP ledger (payments / vouchers / allocations) is unchanged: Stripe
-- receipts are posted through the existing gl PaymentsService.
-- ═══════════════════════════════════════════════════════════════

-- CreateEnum
CREATE TYPE "OnlinePaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'REQUIRES_ACTION', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'PENDING_VERIFICATION', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentGatewayProvider" AS ENUM ('STRIPE', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentInitiatorType" AS ENUM ('STAFF', 'PORTAL_USER', 'PAYMENT_LINK', 'TENANT_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "PaymentRefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OnlinePaymentScope" AS ENUM ('TENANT_INVOICE', 'PLATFORM_INVOICE');

-- CreateEnum
CREATE TYPE "StripeWebhookEventStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'IGNORED', 'FAILED');

-- CreateEnum
CREATE TYPE "PlatformInvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTH', 'YEAR');

-- AlterEnum

ALTER TYPE "EmailEventType" ADD VALUE 'PAYMENT_LINK';
ALTER TYPE "EmailEventType" ADD VALUE 'PAYMENT_RECEIPT';
ALTER TYPE "EmailEventType" ADD VALUE 'PLATFORM_INVOICE_SENT';

-- AlterEnum

ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_REFUNDED';
ALTER TYPE "NotificationType" ADD VALUE 'PLATFORM_INVOICE_ISSUED';
ALTER TYPE "NotificationType" ADD VALUE 'PLATFORM_PAYMENT_RECEIVED';

-- AlterTable
ALTER TABLE "payment_proofs" ADD COLUMN     "file_name" VARCHAR(255);

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "billing_plan_id" UUID,
ADD COLUMN     "stripe_subscription_id" VARCHAR(255),
ADD COLUMN     "stripe_subscription_status" VARCHAR(40),
ADD COLUMN     "subscription_cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscription_current_period_end" TIMESTAMPTZ,
ADD COLUMN     "subscription_current_period_start" TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "tenant_payment_gateways" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "provider" "PaymentGatewayProvider" NOT NULL DEFAULT 'STRIPE',
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "use_platform_account" BOOLEAN NOT NULL DEFAULT false,
    "secret_key_encrypted" TEXT,
    "webhook_secret_encrypted" TEXT,
    "publishable_key" VARCHAR(255),
    "webhook_token" VARCHAR(64) NOT NULL,
    "allow_partial_payments" BOOLEAN NOT NULL DEFAULT false,
    "bank_account_id" UUID,
    "statement_descriptor" VARCHAR(22),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "tenant_payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_customers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "account_ref" VARCHAR(80) NOT NULL,
    "subject_type" VARCHAR(20) NOT NULL,
    "subject_id" UUID NOT NULL,
    "stripe_customer_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "provider" "PaymentGatewayProvider" NOT NULL DEFAULT 'STRIPE',
    "status" "OnlinePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "amount_refunded" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "account_ref" VARCHAR(80) NOT NULL,
    "stripe_customer_id" VARCHAR(255),
    "stripe_checkout_session_id" VARCHAR(255),
    "stripe_payment_intent_id" VARCHAR(255),
    "stripe_charge_id" VARCHAR(255),
    "checkout_url" TEXT,
    "checkout_expires_at" TIMESTAMPTZ,
    "payment_id" UUID,
    "erp_posting_claimed_at" TIMESTAMPTZ,
    "failure_code" VARCHAR(100),
    "failure_message" TEXT,
    "paid_at" TIMESTAMPTZ,
    "payer_email" VARCHAR(255),
    "initiated_by_type" "PaymentInitiatorType" NOT NULL,
    "initiated_by_id" UUID,
    "payment_link_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_refunds" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "scope" "OnlinePaymentScope" NOT NULL,
    "payment_transaction_id" UUID,
    "platform_payment_id" UUID,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "reason" VARCHAR(500),
    "status" "PaymentRefundStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_refund_id" VARCHAR(255),
    "accounting_applied_at" TIMESTAMPTZ,
    "failure_reason" TEXT,
    "requested_by" UUID,
    "requested_by_type" "PaymentInitiatorType" NOT NULL,
    "processed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_links" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "scope" "OnlinePaymentScope" NOT NULL,
    "invoice_id" UUID,
    "platform_invoice_id" UUID,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "last_used_at" TIMESTAMPTZ,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "stripe_event_id" VARCHAR(255) NOT NULL,
    "event_type" VARCHAR(120) NOT NULL,
    "account_ref" VARCHAR(80) NOT NULL,
    "tenant_id" UUID,
    "livemode" BOOLEAN NOT NULL DEFAULT false,
    "status" "StripeWebhookEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "error" TEXT,
    "processing_started_at" TIMESTAMPTZ,
    "processed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_billing_plans" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "subscription_plan" "SubscriptionPlan" NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "interval" "BillingInterval" NOT NULL DEFAULT 'MONTH',
    "stripe_product_id" VARCHAR(255),
    "stripe_price_id" VARCHAR(255),
    "max_users" INTEGER,
    "max_branches" INTEGER,
    "max_storage_gb" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "platform_billing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_invoices" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "invoice_number" VARCHAR(40) NOT NULL,
    "tenant_id" UUID NOT NULL,
    "status" "PlatformInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "currency_code" CHAR(3) NOT NULL,
    "issue_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" DATE,
    "period_start" DATE,
    "period_end" DATE,
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(6,3) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "amount_paid" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "amount_refunded" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "balance_due" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "sent_at" TIMESTAMPTZ,
    "last_emailed_at" TIMESTAMPTZ,
    "last_emailed_to" VARCHAR(255),
    "cancelled_at" TIMESTAMPTZ,
    "cancel_reason" VARCHAR(500),
    "created_by_super_admin_id" UUID,
    "updated_by_super_admin_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "platform_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_invoice_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "platform_invoice_id" UUID NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "platform_invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_payments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "platform_invoice_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "provider" "PaymentGatewayProvider" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD',
    "status" "OnlinePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "amount_minor" BIGINT,
    "amount_refunded" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "applied_at" TIMESTAMPTZ,
    "stripe_customer_id" VARCHAR(255),
    "stripe_checkout_session_id" VARCHAR(255),
    "stripe_payment_intent_id" VARCHAR(255),
    "stripe_charge_id" VARCHAR(255),
    "checkout_url" TEXT,
    "checkout_expires_at" TIMESTAMPTZ,
    "reference_number" VARCHAR(100),
    "payment_date" DATE,
    "notes" TEXT,
    "failure_message" TEXT,
    "paid_at" TIMESTAMPTZ,
    "proof_file_url" VARCHAR(500),
    "proof_s3_key" VARCHAR(500),
    "proof_file_name" VARCHAR(255),
    "proof_mime_type" VARCHAR(100),
    "proof_file_size" INTEGER,
    "submitted_by_user_id" UUID,
    "initiated_by_type" "PaymentInitiatorType" NOT NULL,
    "reviewed_by_super_admin_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "rejection_reason" VARCHAR(1000),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "platform_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_payment_gateways_tenant_id_key" ON "tenant_payment_gateways"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_payment_gateways_webhook_token_key" ON "tenant_payment_gateways"("webhook_token");

-- CreateIndex
CREATE INDEX "stripe_customers_tenant_id_idx" ON "stripe_customers"("tenant_id");

-- CreateIndex
CREATE INDEX "stripe_customers_stripe_customer_id_idx" ON "stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_account_ref_subject_type_subject_id_key" ON "stripe_customers"("account_ref", "subject_type", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_stripe_checkout_session_id_key" ON "payment_transactions"("stripe_checkout_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_stripe_payment_intent_id_key" ON "payment_transactions"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_payment_id_key" ON "payment_transactions"("payment_id");

-- CreateIndex
CREATE INDEX "payment_transactions_tenant_id_idx" ON "payment_transactions"("tenant_id");

-- CreateIndex
CREATE INDEX "payment_transactions_tenant_id_invoice_id_idx" ON "payment_transactions"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "payment_transactions_tenant_id_party_id_idx" ON "payment_transactions"("tenant_id", "party_id");

-- CreateIndex
CREATE INDEX "payment_transactions_tenant_id_status_idx" ON "payment_transactions"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_refunds_stripe_refund_id_key" ON "payment_refunds"("stripe_refund_id");

-- CreateIndex
CREATE INDEX "payment_refunds_tenant_id_idx" ON "payment_refunds"("tenant_id");

-- CreateIndex
CREATE INDEX "payment_refunds_tenant_id_payment_transaction_id_idx" ON "payment_refunds"("tenant_id", "payment_transaction_id");

-- CreateIndex
CREATE INDEX "payment_refunds_tenant_id_platform_payment_id_idx" ON "payment_refunds"("tenant_id", "platform_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_token_hash_key" ON "payment_links"("token_hash");

-- CreateIndex
CREATE INDEX "payment_links_tenant_id_invoice_id_idx" ON "payment_links"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "payment_links_platform_invoice_id_idx" ON "payment_links"("platform_invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_webhook_events_account_ref_stripe_event_id_key" ON "stripe_webhook_events"("account_ref", "stripe_event_id");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_status_idx" ON "stripe_webhook_events"("status");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_tenant_id_idx" ON "stripe_webhook_events"("tenant_id");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_event_type_idx" ON "stripe_webhook_events"("event_type");

-- CreateIndex
CREATE UNIQUE INDEX "platform_billing_plans_code_key" ON "platform_billing_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "platform_invoices_invoice_number_key" ON "platform_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "platform_invoices_tenant_id_idx" ON "platform_invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "platform_invoices_tenant_id_status_idx" ON "platform_invoices"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "platform_invoices_status_due_date_idx" ON "platform_invoices"("status", "due_date");

-- CreateIndex
CREATE INDEX "platform_invoice_lines_platform_invoice_id_idx" ON "platform_invoice_lines"("platform_invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_payments_stripe_checkout_session_id_key" ON "platform_payments"("stripe_checkout_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_payments_stripe_payment_intent_id_key" ON "platform_payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "platform_payments_platform_invoice_id_idx" ON "platform_payments"("platform_invoice_id");

-- CreateIndex
CREATE INDEX "platform_payments_tenant_id_status_idx" ON "platform_payments"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_stripe_subscription_id_key" ON "tenants"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_billing_plan_id_fkey" FOREIGN KEY ("billing_plan_id") REFERENCES "platform_billing_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_payment_gateways" ADD CONSTRAINT "tenant_payment_gateways_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_payment_transaction_id_fkey" FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_platform_payment_id_fkey" FOREIGN KEY ("platform_payment_id") REFERENCES "platform_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_platform_invoice_id_fkey" FOREIGN KEY ("platform_invoice_id") REFERENCES "platform_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_invoices" ADD CONSTRAINT "platform_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_invoice_lines" ADD CONSTRAINT "platform_invoice_lines_platform_invoice_id_fkey" FOREIGN KEY ("platform_invoice_id") REFERENCES "platform_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_payments" ADD CONSTRAINT "platform_payments_platform_invoice_id_fkey" FOREIGN KEY ("platform_invoice_id") REFERENCES "platform_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_payments" ADD CONSTRAINT "platform_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Integrity checks ───────────────────────────────────────────
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_target_check"
  CHECK (
    (scope = 'TENANT_INVOICE' AND invoice_id IS NOT NULL AND platform_invoice_id IS NULL)
    OR (scope = 'PLATFORM_INVOICE' AND platform_invoice_id IS NOT NULL AND invoice_id IS NULL)
  );

ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_target_check"
  CHECK (
    (scope = 'TENANT_INVOICE' AND payment_transaction_id IS NOT NULL)
    OR (scope = 'PLATFORM_INVOICE' AND platform_payment_id IS NOT NULL)
  );

ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_amount_positive"
  CHECK (amount > 0);

ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_amount_positive"
  CHECK (amount > 0 AND amount_minor > 0);

ALTER TABLE "platform_payments" ADD CONSTRAINT "platform_payments_amount_positive"
  CHECK (amount > 0);

-- ── Duplicate-accounting guard ─────────────────────────────────
-- A gateway payment (STRIPE:<payment_intent>) or an approved manual proof
-- (PROOF:<proof id>) may back at most one live ERP payment per tenant.
-- Cancelled payments (refund re-posting) are excluded.
CREATE UNIQUE INDEX IF NOT EXISTS "payments_gateway_reference_live_key"
  ON "payments" ("tenant_id", "reference_number")
  WHERE deleted_at IS NULL
    AND status <> 'CANCELLED'
    AND (reference_number LIKE 'STRIPE:%' OR reference_number LIKE 'PROOF:%');

-- ── Platform invoice numbering (PF-000001) ─────────────────────
CREATE SEQUENCE IF NOT EXISTS "platform_invoice_number_seq" START WITH 1 INCREMENT BY 1;

-- ── Row level security ─────────────────────────────────────────
-- Tenant ERP data. tenant_payment_gateways, payment_links,
-- stripe_webhook_events and platform_* tables are intentionally NOT under
-- RLS (resolved before a tenant context exists / platform-level ledger);
-- services always filter them by tenant explicitly.
SELECT enable_rls_for_table('payment_transactions');
SELECT enable_rls_for_table('payment_refunds');
SELECT enable_rls_for_table('stripe_customers');
