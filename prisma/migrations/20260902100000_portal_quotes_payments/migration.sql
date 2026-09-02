-- Portal quotes, negotiation, payment proofs, and payment request GL link

-- QuotationStatus additions
ALTER TYPE "QuotationStatus" ADD VALUE IF NOT EXISTS 'NEGOTIATING';
ALTER TYPE "QuotationStatus" ADD VALUE IF NOT EXISTS 'CUSTOMER_REVIEW';

-- New enums
CREATE TYPE "ServicePricingBasis" AS ENUM ('FLAT', 'PER_KG', 'PER_CBM', 'PER_PIECE', 'PER_CONTAINER');
CREATE TYPE "QuotationSource" AS ENUM ('STAFF', 'CUSTOMER_PORTAL', 'ONLINE_WIDGET');
CREATE TYPE "QuotationNegotiationActor" AS ENUM ('TENANT', 'CUSTOMER');
CREATE TYPE "QuotationNegotiationAction" AS ENUM ('REVISE', 'SEND', 'ACCEPT', 'REJECT', 'COUNTER_OFFER');
CREATE TYPE "PaymentProofStatus" AS ENUM ('SUBMITTED', 'ACKNOWLEDGED', 'REJECTED');
CREATE TYPE "PaymentProofDirection" AS ENUM ('CUSTOMER_TO_TENANT', 'TENANT_TO_VENDOR');

-- NotificationType additions
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'QUOTATION_REVISED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'QUOTATION_COUNTER_OFFER';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'QUOTATION_CUSTOMER_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'QUOTATION_CUSTOMER_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_PROOF_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_PROOF_REVIEWED';

-- Quotation extensions
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "source" "QuotationSource" NOT NULL DEFAULT 'STAFF';
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "negotiation_round" INTEGER NOT NULL DEFAULT 0;

-- Tenant service catalog
CREATE TABLE IF NOT EXISTS "tenant_service_catalog_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "job_type" "JobType",
    "charge_code_id" UUID,
    "pricing_basis" "ServicePricingBasis" NOT NULL DEFAULT 'FLAT',
    "unit_price" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "min_charge" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "is_portal_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "tenant_service_catalog_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenant_service_catalog_items_tenant_id_code_key"
    ON "tenant_service_catalog_items"("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "tenant_service_catalog_items_tenant_id_idx"
    ON "tenant_service_catalog_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "tenant_service_catalog_items_tenant_id_is_active_is_portal_visible_idx"
    ON "tenant_service_catalog_items"("tenant_id", "is_active", "is_portal_visible");

-- Quotation cargo packages
CREATE TABLE IF NOT EXISTS "quotation_cargo_packages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "quotation_id" UUID NOT NULL,
    "length_cm" DECIMAL(10,2) NOT NULL,
    "width_cm" DECIMAL(10,2) NOT NULL,
    "height_cm" DECIMAL(10,2) NOT NULL,
    "gross_weight_kg" DECIMAL(12,3) NOT NULL,
    "pieces" INTEGER NOT NULL DEFAULT 1,
    "cbm" DECIMAL(12,6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "quotation_cargo_packages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "quotation_cargo_packages_tenant_id_quotation_id_idx"
    ON "quotation_cargo_packages"("tenant_id", "quotation_id");

ALTER TABLE "quotation_cargo_packages"
    DROP CONSTRAINT IF EXISTS "quotation_cargo_packages_quotation_id_fkey";
ALTER TABLE "quotation_cargo_packages"
    ADD CONSTRAINT "quotation_cargo_packages_quotation_id_fkey"
    FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Quotation negotiation events
CREATE TABLE IF NOT EXISTS "quotation_negotiation_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "quotation_id" UUID NOT NULL,
    "round" INTEGER NOT NULL,
    "actor" "QuotationNegotiationActor" NOT NULL,
    "action" "QuotationNegotiationAction" NOT NULL,
    "message" TEXT,
    "proposed_total" DECIMAL(18,4),
    "proposed_lines" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quotation_negotiation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "quotation_negotiation_events_tenant_id_quotation_id_idx"
    ON "quotation_negotiation_events"("tenant_id", "quotation_id");

ALTER TABLE "quotation_negotiation_events"
    DROP CONSTRAINT IF EXISTS "quotation_negotiation_events_quotation_id_fkey";
ALTER TABLE "quotation_negotiation_events"
    ADD CONSTRAINT "quotation_negotiation_events_quotation_id_fkey"
    FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Payment request GL link
ALTER TABLE "payment_requests" ADD COLUMN IF NOT EXISTS "payment_id" UUID;

ALTER TABLE "payment_requests"
    DROP CONSTRAINT IF EXISTS "payment_requests_payment_id_fkey";
ALTER TABLE "payment_requests"
    ADD CONSTRAINT "payment_requests_payment_id_fkey"
    FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Payment proofs
CREATE TABLE IF NOT EXISTS "payment_proofs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "direction" "PaymentProofDirection" NOT NULL,
    "invoice_id" UUID NOT NULL,
    "submitted_by_party_id" UUID,
    "submitted_by_user_id" UUID,
    "submitted_by_staff_id" UUID,
    "amount_claimed" DECIMAL(18,4) NOT NULL,
    "payment_date" DATE NOT NULL,
    "reference_number" VARCHAR(100),
    "notes" TEXT,
    "file_url" VARCHAR(500),
    "s3_key" VARCHAR(500),
    "mime_type" VARCHAR(100),
    "file_size" INTEGER,
    "status" "PaymentProofStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "review_notes" TEXT,
    "linked_payment_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "payment_proofs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "payment_proofs_tenant_id_invoice_id_idx"
    ON "payment_proofs"("tenant_id", "invoice_id");
CREATE INDEX IF NOT EXISTS "payment_proofs_tenant_id_status_idx"
    ON "payment_proofs"("tenant_id", "status");

ALTER TABLE "payment_proofs"
    DROP CONSTRAINT IF EXISTS "payment_proofs_invoice_id_fkey";
ALTER TABLE "payment_proofs"
    ADD CONSTRAINT "payment_proofs_invoice_id_fkey"
    FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS
SELECT enable_rls_for_table('tenant_service_catalog_items');
SELECT enable_rls_for_table('quotation_cargo_packages');
SELECT enable_rls_for_table('quotation_negotiation_events');
SELECT enable_rls_for_table('payment_proofs');
