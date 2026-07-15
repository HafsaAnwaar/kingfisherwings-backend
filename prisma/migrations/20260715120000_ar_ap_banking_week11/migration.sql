-- Week 11 / Ch.19 — AR, AP, Payments, Cheques, Bank Reconciliation
-- Extends Chart of Accounts + Vouchers from 20260714160000

CREATE TYPE "PaymentDirection" AS ENUM ('RECEIPT', 'PAYMENT');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT_CARD', 'OTHER');
CREATE TYPE "PaymentStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');
CREATE TYPE "ChequeType" AS ENUM ('RECEIVABLE', 'PAYABLE');
CREATE TYPE "ChequeStatus" AS ENUM ('PENDING', 'DEPOSITED', 'CLEARED', 'BOUNCED', 'CANCELLED');
CREATE TYPE "BankReconciliationStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');

DO $$ BEGIN
  ALTER TYPE "DocumentNumberType" ADD VALUE 'PAYMENT';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "tenant_bank_accounts" ADD COLUMN IF NOT EXISTS "gl_account_id" UUID;
CREATE INDEX IF NOT EXISTS "tenant_bank_accounts_tenant_id_gl_account_id_idx"
  ON "tenant_bank_accounts"("tenant_id", "gl_account_id");

CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "branch_id" UUID,
    "payment_number" VARCHAR(40) NOT NULL,
    "direction" "PaymentDirection" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "status" "PaymentStatus" NOT NULL DEFAULT 'DRAFT',
    "payment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "party_id" UUID NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(20,8) NOT NULL DEFAULT 1,
    "amount_base" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unallocated_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "bank_account_id" UUID,
    "gl_account_id" UUID,
    "cheque_id" UUID,
    "voucher_id" UUID,
    "reference_number" VARCHAR(100),
    "narration" TEXT,
    "posted_at" TIMESTAMPTZ,
    "posted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_tenant_id_payment_number_key" ON "payments"("tenant_id", "payment_number");
CREATE UNIQUE INDEX "payments_cheque_id_key" ON "payments"("cheque_id");
CREATE UNIQUE INDEX "payments_voucher_id_key" ON "payments"("voucher_id");
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");
CREATE INDEX "payments_tenant_id_direction_idx" ON "payments"("tenant_id", "direction");
CREATE INDEX "payments_tenant_id_status_idx" ON "payments"("tenant_id", "status");
CREATE INDEX "payments_tenant_id_party_id_idx" ON "payments"("tenant_id", "party_id");
CREATE INDEX "payments_tenant_id_payment_date_idx" ON "payments"("tenant_id", "payment_date");

CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_allocations_payment_id_invoice_id_key"
  ON "payment_allocations"("payment_id", "invoice_id");
CREATE INDEX "payment_allocations_tenant_id_idx" ON "payment_allocations"("tenant_id");
CREATE INDEX "payment_allocations_tenant_id_payment_id_idx" ON "payment_allocations"("tenant_id", "payment_id");
CREATE INDEX "payment_allocations_tenant_id_invoice_id_idx" ON "payment_allocations"("tenant_id", "invoice_id");

CREATE TABLE "cheques" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "cheque_number" VARCHAR(50) NOT NULL,
    "cheque_type" "ChequeType" NOT NULL,
    "status" "ChequeStatus" NOT NULL DEFAULT 'PENDING',
    "party_id" UUID NOT NULL,
    "bank_account_id" UUID,
    "bank_name" VARCHAR(200),
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "cheque_date" DATE NOT NULL,
    "due_date" DATE,
    "is_pdc" BOOLEAN NOT NULL DEFAULT false,
    "deposited_at" TIMESTAMPTZ,
    "cleared_at" TIMESTAMPTZ,
    "bounced_at" TIMESTAMPTZ,
    "bounce_reason" VARCHAR(500),
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "cheques_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cheques_tenant_id_cheque_number_cheque_type_key"
  ON "cheques"("tenant_id", "cheque_number", "cheque_type");
CREATE INDEX "cheques_tenant_id_idx" ON "cheques"("tenant_id");
CREATE INDEX "cheques_tenant_id_status_idx" ON "cheques"("tenant_id", "status");
CREATE INDEX "cheques_tenant_id_party_id_idx" ON "cheques"("tenant_id", "party_id");
CREATE INDEX "cheques_tenant_id_due_date_idx" ON "cheques"("tenant_id", "due_date");
CREATE INDEX "cheques_tenant_id_is_pdc_idx" ON "cheques"("tenant_id", "is_pdc");

CREATE TABLE "bank_reconciliations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "bank_account_id" UUID,
    "gl_account_id" UUID NOT NULL,
    "statement_date" DATE NOT NULL,
    "statement_balance" DECIMAL(18,4) NOT NULL,
    "book_balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" "BankReconciliationStatus" NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "completed_at" TIMESTAMPTZ,
    "completed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "bank_reconciliations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bank_reconciliations_tenant_id_idx" ON "bank_reconciliations"("tenant_id");
CREATE INDEX "bank_reconciliations_tenant_id_status_idx" ON "bank_reconciliations"("tenant_id", "status");
CREATE INDEX "bank_reconciliations_tenant_id_gl_account_id_idx" ON "bank_reconciliations"("tenant_id", "gl_account_id");
CREATE INDEX "bank_reconciliations_tenant_id_statement_date_idx" ON "bank_reconciliations"("tenant_id", "statement_date");

CREATE TABLE "bank_reconciliation_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "reconciliation_id" UUID NOT NULL,
    "voucher_id" UUID,
    "voucher_line_id" UUID,
    "account_id" UUID,
    "txn_date" DATE NOT NULL,
    "description" VARCHAR(500),
    "debit_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "credit_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "is_matched" BOOLEAN NOT NULL DEFAULT false,
    "statement_ref" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "bank_reconciliation_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bank_reconciliation_lines_tenant_id_idx" ON "bank_reconciliation_lines"("tenant_id");
CREATE INDEX "bank_reconciliation_lines_tenant_id_reconciliation_id_idx"
  ON "bank_reconciliation_lines"("tenant_id", "reconciliation_id");
CREATE INDEX "bank_reconciliation_lines_tenant_id_voucher_id_idx"
  ON "bank_reconciliation_lines"("tenant_id", "voucher_id");

-- Foreign keys
ALTER TABLE "tenant_bank_accounts" ADD CONSTRAINT "tenant_bank_accounts_gl_account_id_fkey"
  FOREIGN KEY ("gl_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_bank_account_id_fkey"
  FOREIGN KEY ("bank_account_id") REFERENCES "tenant_bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_gl_account_id_fkey"
  FOREIGN KEY ("gl_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_cheque_id_fkey"
  FOREIGN KEY ("cheque_id") REFERENCES "cheques"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_voucher_id_fkey"
  FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey"
  FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cheques" ADD CONSTRAINT "cheques_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cheques" ADD CONSTRAINT "cheques_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cheques" ADD CONSTRAINT "cheques_bank_account_id_fkey"
  FOREIGN KEY ("bank_account_id") REFERENCES "tenant_bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_bank_account_id_fkey"
  FOREIGN KEY ("bank_account_id") REFERENCES "tenant_bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_gl_account_id_fkey"
  FOREIGN KEY ("gl_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bank_reconciliation_lines" ADD CONSTRAINT "bank_reconciliation_lines_reconciliation_id_fkey"
  FOREIGN KEY ("reconciliation_id") REFERENCES "bank_reconciliations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bank_reconciliation_lines" ADD CONSTRAINT "bank_reconciliation_lines_voucher_id_fkey"
  FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bank_reconciliation_lines" ADD CONSTRAINT "bank_reconciliation_lines_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

SELECT enable_rls_for_table('payments');
SELECT enable_rls_for_table('payment_allocations');
SELECT enable_rls_for_table('cheques');
SELECT enable_rls_for_table('bank_reconciliations');
SELECT enable_rls_for_table('bank_reconciliation_lines');
SELECT add_soft_delete_index('payments');
SELECT add_soft_delete_index('payment_allocations');
SELECT add_soft_delete_index('cheques');
SELECT add_soft_delete_index('bank_reconciliations');
SELECT add_soft_delete_index('bank_reconciliation_lines');
