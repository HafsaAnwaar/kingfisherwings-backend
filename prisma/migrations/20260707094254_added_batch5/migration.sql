-- CreateEnum
CREATE TYPE "DocumentNumberType" AS ENUM ('JOB_NUMBER', 'QUOTATION', 'INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE', 'HAWB', 'MAWB', 'HBL', 'MBL', 'VOUCHER', 'BOOKING', 'GRN', 'GDO', 'PURCHASE_INVOICE');

-- CreateEnum
CREATE TYPE "DocumentNumberResetFrequency" AS ENUM ('NEVER', 'YEARLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "customs_code" VARCHAR(50),
ADD COLUMN     "customs_license_no" VARCHAR(50),
ADD COLUMN     "iata_cargo_agent_code" VARCHAR(20);

-- CreateTable
CREATE TABLE "tenant_bank_accounts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "bank_name" VARCHAR(200) NOT NULL,
    "account_name" VARCHAR(200) NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "iban" VARCHAR(50),
    "swift_code" VARCHAR(20),
    "currency_code" CHAR(3) NOT NULL DEFAULT 'AED',
    "branch_id" UUID,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "tenant_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_number_formats" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "document_type" "DocumentNumberType" NOT NULL,
    "prefix" VARCHAR(20) NOT NULL,
    "include_branch_code" BOOLEAN NOT NULL DEFAULT false,
    "include_year" BOOLEAN NOT NULL DEFAULT true,
    "year_digits" INTEGER NOT NULL DEFAULT 2,
    "include_month" BOOLEAN NOT NULL DEFAULT false,
    "sequence_length" INTEGER NOT NULL DEFAULT 5,
    "separator" VARCHAR(3) NOT NULL DEFAULT '/',
    "reset_frequency" "DocumentNumberResetFrequency" NOT NULL DEFAULT 'YEARLY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "document_number_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_number_sequences" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "document_type" "DocumentNumberType" NOT NULL,
    "branch_code" VARCHAR(20) NOT NULL DEFAULT '',
    "period_key" VARCHAR(20) NOT NULL DEFAULT '',
    "last_sequence" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_number_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tenant_bank_accounts_tenant_id_idx" ON "tenant_bank_accounts"("tenant_id");

-- CreateIndex
CREATE INDEX "document_number_formats_tenant_id_idx" ON "document_number_formats"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_number_formats_tenant_id_document_type_key" ON "document_number_formats"("tenant_id", "document_type");

-- CreateIndex
CREATE INDEX "document_number_sequences_tenant_id_idx" ON "document_number_sequences"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_number_sequences_tenant_id_document_type_branch_co_key" ON "document_number_sequences"("tenant_id", "document_type", "branch_code", "period_key");

-- AddForeignKey
ALTER TABLE "tenant_bank_accounts" ADD CONSTRAINT "tenant_bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
