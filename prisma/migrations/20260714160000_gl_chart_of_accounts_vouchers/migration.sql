-- Week 11 / Ch.17 — Chart of Accounts + Vouchers / GL

CREATE TYPE "AccountGroup" AS ENUM ('ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUE', 'EXPENSES');
CREATE TYPE "AccountType" AS ENUM (
  'CURRENT_ASSET', 'FIXED_ASSET', 'CURRENT_LIABILITY', 'LONG_TERM_LIABILITY',
  'EQUITY', 'REVENUE', 'COST_OF_SALES', 'EXPENSE', 'OTHER_INCOME', 'OTHER_EXPENSE'
);
CREATE TYPE "AccountSubType" AS ENUM (
  'BANK', 'CASH', 'TRADE_RECEIVABLE', 'TRADE_PAYABLE', 'TAX', 'INVENTORY',
  'FIXED_ASSET', 'EQUITY', 'REVENUE', 'EXPENSE', 'GENERAL'
);
CREATE TYPE "VoucherType" AS ENUM (
  'JOURNAL', 'BANK_PAYMENT', 'CASH_PAYMENT', 'BANK_RECEIPT', 'CASH_RECEIPT',
  'CONTRA', 'PURCHASE_INVOICE', 'PURCHASE_CREDIT_NOTE', 'OPENING_BALANCE', 'RECURRING'
);
CREATE TYPE "VoucherStatus" AS ENUM ('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED');

CREATE TABLE "chart_of_accounts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "parent_id" UUID,
    "account_code" VARCHAR(30) NOT NULL,
    "account_name" VARCHAR(200) NOT NULL,
    "account_name_ar" VARCHAR(200),
    "account_group" "AccountGroup" NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "account_sub_type" "AccountSubType" NOT NULL DEFAULT 'GENERAL',
    "is_header" BOOLEAN NOT NULL DEFAULT false,
    "is_postable" BOOLEAN NOT NULL DEFAULT true,
    "is_bank_account" BOOLEAN NOT NULL DEFAULT false,
    "is_cash_account" BOOLEAN NOT NULL DEFAULT false,
    "currency_code" CHAR(3),
    "opening_balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "opening_balance_type" VARCHAR(6) NOT NULL DEFAULT 'DEBIT',
    "allow_manual_entry" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "chart_of_accounts_tenant_id_account_code_key" ON "chart_of_accounts"("tenant_id", "account_code");
CREATE INDEX "chart_of_accounts_tenant_id_idx" ON "chart_of_accounts"("tenant_id");
CREATE INDEX "chart_of_accounts_tenant_id_account_group_idx" ON "chart_of_accounts"("tenant_id", "account_group");
CREATE INDEX "chart_of_accounts_tenant_id_parent_id_idx" ON "chart_of_accounts"("tenant_id", "parent_id");

CREATE TABLE "vouchers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "branch_id" UUID,
    "voucher_number" VARCHAR(40) NOT NULL,
    "voucher_type" "VoucherType" NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'DRAFT',
    "voucher_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency_code" CHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(20,8) NOT NULL DEFAULT 1,
    "narration" TEXT,
    "reference_number" VARCHAR(100),
    "party_id" UUID,
    "job_id" UUID,
    "invoice_id" UUID,
    "total_debit" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_credit" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "posted_at" TIMESTAMPTZ,
    "posted_by" UUID,
    "reversed_at" TIMESTAMPTZ,
    "reversed_by" UUID,
    "reversal_of_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vouchers_tenant_id_voucher_number_key" ON "vouchers"("tenant_id", "voucher_number");
CREATE INDEX "vouchers_tenant_id_idx" ON "vouchers"("tenant_id");
CREATE INDEX "vouchers_tenant_id_voucher_type_idx" ON "vouchers"("tenant_id", "voucher_type");
CREATE INDEX "vouchers_tenant_id_status_idx" ON "vouchers"("tenant_id", "status");
CREATE INDEX "vouchers_tenant_id_voucher_date_idx" ON "vouchers"("tenant_id", "voucher_date");
CREATE INDEX "vouchers_tenant_id_party_id_idx" ON "vouchers"("tenant_id", "party_id");
CREATE INDEX "vouchers_tenant_id_job_id_idx" ON "vouchers"("tenant_id", "job_id");
CREATE INDEX "vouchers_tenant_id_invoice_id_idx" ON "vouchers"("tenant_id", "invoice_id");

CREATE TABLE "voucher_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "voucher_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL DEFAULT 1,
    "debit_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "credit_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currency_code" CHAR(3),
    "exchange_rate" DECIMAL(20,8) NOT NULL DEFAULT 1,
    "debit_base" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "credit_base" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "narration" VARCHAR(500),
    "party_id" UUID,
    "job_id" UUID,
    "cost_center" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "voucher_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "voucher_lines_tenant_id_idx" ON "voucher_lines"("tenant_id");
CREATE INDEX "voucher_lines_tenant_id_voucher_id_idx" ON "voucher_lines"("tenant_id", "voucher_id");
CREATE INDEX "voucher_lines_tenant_id_account_id_idx" ON "voucher_lines"("tenant_id", "account_id");
CREATE INDEX "voucher_lines_tenant_id_party_id_idx" ON "voucher_lines"("tenant_id", "party_id");

ALTER TABLE "charge_codes" ADD COLUMN IF NOT EXISTS "gl_revenue_account_id" UUID;
ALTER TABLE "charge_codes" ADD COLUMN IF NOT EXISTS "gl_cost_account_id" UUID;

ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_reversal_of_id_fkey"
  FOREIGN KEY ("reversal_of_id") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "voucher_lines" ADD CONSTRAINT "voucher_lines_voucher_id_fkey"
  FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "voucher_lines_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "voucher_lines_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "voucher_lines_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "charge_codes" ADD CONSTRAINT "charge_codes_gl_revenue_account_id_fkey"
  FOREIGN KEY ("gl_revenue_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "charge_codes" ADD CONSTRAINT "charge_codes_gl_cost_account_id_fkey"
  FOREIGN KEY ("gl_cost_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

SELECT enable_rls_for_table('chart_of_accounts');
SELECT enable_rls_for_table('vouchers');
SELECT enable_rls_for_table('voucher_lines');
SELECT add_soft_delete_index('chart_of_accounts');
SELECT add_soft_delete_index('vouchers');
SELECT add_soft_delete_index('voucher_lines');
