-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('CUSTOMER_INVOICE', 'PURCHASE_INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'VOID');
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED');

-- AlterEnum DocumentEntityType
ALTER TYPE "DocumentEntityType" ADD VALUE IF NOT EXISTS 'INVOICE';
ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'INVOICE_SENT';

-- CreateTable invoices
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "invoice_number" VARCHAR(40) NOT NULL,
    "invoice_type" "InvoiceType" NOT NULL DEFAULT 'CUSTOMER_INVOICE',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "job_id" UUID,
    "party_id" UUID NOT NULL,
    "branch_id" UUID,
    "department_id" UUID,
    "credited_invoice_id" UUID,
    "invoice_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" DATE,
    "currency_code" CHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(20,8) NOT NULL DEFAULT 1,
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "amount_paid" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "balance_due" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vat_rate" DECIMAL(6,3) NOT NULL DEFAULT 5,
    "party_vat_number" VARCHAR(50),
    "lpo_number" VARCHAR(100),
    "remarks" TEXT,
    "internal_notes" TEXT,
    "pdf_url" TEXT,
    "pdf_s3_key" TEXT,
    "pdf_generated_at" TIMESTAMPTZ,
    "posted_at" TIMESTAMPTZ,
    "sent_at" TIMESTAMPTZ,
    "last_emailed_at" TIMESTAMPTZ,
    "last_emailed_to" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "job_id" UUID,
    "job_charge_id" UUID,
    "charge_code_id" UUID,
    "description" VARCHAR(300) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "tax_rate_id" UUID,
    "tax_rate" DECIMAL(6,3) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_requests" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "request_number" VARCHAR(40) NOT NULL,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "invoice_id" UUID,
    "job_id" UUID,
    "party_id" UUID NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "due_date" DATE,
    "remarks" TEXT,
    "approved_at" TIMESTAMPTZ,
    "approved_by" UUID,
    "rejected_reason" VARCHAR(500),
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invoices_tenant_id_invoice_number_key" ON "invoices"("tenant_id", "invoice_number");
CREATE INDEX "invoices_tenant_id_idx" ON "invoices"("tenant_id");
CREATE INDEX "invoices_tenant_id_invoice_type_idx" ON "invoices"("tenant_id", "invoice_type");
CREATE INDEX "invoices_tenant_id_status_idx" ON "invoices"("tenant_id", "status");
CREATE INDEX "invoices_tenant_id_party_id_idx" ON "invoices"("tenant_id", "party_id");
CREATE INDEX "invoices_tenant_id_job_id_idx" ON "invoices"("tenant_id", "job_id");
CREATE INDEX "invoices_tenant_id_invoice_date_idx" ON "invoices"("tenant_id", "invoice_date");
CREATE INDEX "invoices_tenant_id_due_date_idx" ON "invoices"("tenant_id", "due_date");

CREATE UNIQUE INDEX "invoice_lines_job_charge_id_key" ON "invoice_lines"("job_charge_id");
CREATE INDEX "invoice_lines_tenant_id_idx" ON "invoice_lines"("tenant_id");
CREATE INDEX "invoice_lines_tenant_id_invoice_id_idx" ON "invoice_lines"("tenant_id", "invoice_id");
CREATE INDEX "invoice_lines_tenant_id_job_id_idx" ON "invoice_lines"("tenant_id", "job_id");

CREATE UNIQUE INDEX "payment_requests_tenant_id_request_number_key" ON "payment_requests"("tenant_id", "request_number");
CREATE INDEX "payment_requests_tenant_id_idx" ON "payment_requests"("tenant_id");
CREATE INDEX "payment_requests_tenant_id_status_idx" ON "payment_requests"("tenant_id", "status");
CREATE INDEX "payment_requests_tenant_id_party_id_idx" ON "payment_requests"("tenant_id", "party_id");
CREATE INDEX "payment_requests_tenant_id_invoice_id_idx" ON "payment_requests"("tenant_id", "invoice_id");
CREATE INDEX "payment_requests_tenant_id_job_id_idx" ON "payment_requests"("tenant_id", "job_id");

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_credited_invoice_id_fkey" FOREIGN KEY ("credited_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_job_charge_id_fkey" FOREIGN KEY ("job_charge_id") REFERENCES "job_charges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
