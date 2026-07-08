
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED','ACCEPTED', 'REJECTED');

-- AlterEnum
-- BEGIN;
-- CREATE TYPE "QuotationStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SENT', 'WON', 'LOST', 'EXPIRED', 'CONVERTED');
-- ALTER TABLE "quotations" ALTER COLUMN "status" TYPE "QuotationStatus_new" USING ("status"::text::"QuotationStatus_new");
-- ALTER TABLE "quotation_status_history" ALTER COLUMN "from_status" TYPE "QuotationStatus_new" USING ("from_status"::text::"QuotationStatus_new");
-- ALTER TABLE "quotation_status_history" ALTER COLUMN "to_status" TYPE "QuotationStatus_new" USING ("to_status"::text::"QuotationStatus_new");
-- ALTER TYPE "QuotationStatus" RENAME TO "QuotationStatus_old";
-- ALTER TYPE "QuotationStatus_new" RENAME TO "QuotationStatus";
-- DROP TYPE "QuotationStatus_old";
-- COMMIT;

-- CreateTable
CREATE TABLE "quotations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "quotation_number" VARCHAR(30) NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "job_type" "JobType" NOT NULL,
    "customer_id" UUID NOT NULL,
    "salesperson_id" UUID,
    "branch_id" UUID,
    "origin_port_id" UUID,
    "dest_port_id" UUID,
    "incoterm" VARCHAR(10),
    "commodity" VARCHAR(500),
    "hs_code" VARCHAR(12),
    "gross_weight" DECIMAL(12,3),
    "chargeable_weight" DECIMAL(12,3),
    "volume_cbm" DECIMAL(10,3),
    "pieces" INTEGER,
    "container_type_id" UUID,
    "container_count" INTEGER,
    "is_dg" BOOLEAN NOT NULL DEFAULT false,
    "dg_class" VARCHAR(20),
    "special_requirements" TEXT,
    "carrier_preference" VARCHAR(200),
    "transit_time_days" INTEGER,
    "routing_notes" TEXT,
    "remarks" TEXT,
    "internal_notes" TEXT,
    "valid_until" DATE,
    "currency_code" CHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(20,8) NOT NULL DEFAULT 1,
    "revenue_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "cost_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "gp_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "gp_percent" DECIMAL(7,4) NOT NULL DEFAULT 0,
    "discount_percent" DECIMAL(5,2),
    "discount_amount" DECIMAL(18,4),
    "version" INTEGER NOT NULL DEFAULT 1,
    "parent_quotation_id" UUID,
    "lost_reason" VARCHAR(200),
    "submitted_at" TIMESTAMPTZ,
    "approved_at" TIMESTAMPTZ,
    "approved_by" UUID,
    "sent_at" TIMESTAMPTZ,
    "won_at" TIMESTAMPTZ,
    "lost_at" TIMESTAMPTZ,
    "converted_job_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "quotation_id" UUID NOT NULL,
    "charge_code_id" UUID NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "unit" VARCHAR(50),
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(20,8) NOT NULL DEFAULT 1,
    "amount" DECIMAL(18,4) NOT NULL,
    "amount_base_currency" DECIMAL(18,4) NOT NULL,
    "tax_rate_id" UUID,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "is_cost" BOOLEAN NOT NULL DEFAULT false,
    "supplier_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "quotation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_status_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "quotation_id" UUID NOT NULL,
    "from_status" "QuotationStatus",
    "to_status" "QuotationStatus" NOT NULL,
    "changed_by" UUID,
    "reason" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_approvals" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "quotation_id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "approver_id" UUID,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "decided_at" TIMESTAMPTZ,
    "comments" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quotations_tenant_id_idx" ON "quotations"("tenant_id");

-- CreateIndex
CREATE INDEX "quotations_tenant_id_status_idx" ON "quotations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "quotations_tenant_id_customer_id_idx" ON "quotations"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "quotations_tenant_id_parent_quotation_id_idx" ON "quotations"("tenant_id", "parent_quotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_tenant_id_quotation_number_key" ON "quotations"("tenant_id", "quotation_number");

-- CreateIndex
CREATE INDEX "quotation_lines_tenant_id_idx" ON "quotation_lines"("tenant_id");

-- CreateIndex
CREATE INDEX "quotation_lines_tenant_id_quotation_id_idx" ON "quotation_lines"("tenant_id", "quotation_id");

-- CreateIndex
CREATE INDEX "quotation_status_history_tenant_id_quotation_id_idx" ON "quotation_status_history"("tenant_id", "quotation_id");

-- CreateIndex
CREATE INDEX "quotation_approvals_tenant_id_quotation_id_idx" ON "quotation_approvals"("tenant_id", "quotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotation_approvals_tenant_id_quotation_id_level_key" ON "quotation_approvals"("tenant_id", "quotation_id", "level");

-- AddForeignKey
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_status_history" ADD CONSTRAINT "quotation_status_history_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_approvals" ADD CONSTRAINT "quotation_approvals_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
