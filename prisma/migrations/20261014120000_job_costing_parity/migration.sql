-- Job Costing tab parity: paired sale/cost fields, revisions, attachment side

CREATE TYPE "JobChargePpCc" AS ENUM ('PP', 'CC');
CREATE TYPE "JobChargeDrCr" AS ENUM ('DR', 'CR');
CREATE TYPE "JobChargeAttachmentSide" AS ENUM ('CHARGE', 'SALE', 'COST');
CREATE TYPE "JobChargeProrateStatus" AS ENUM ('NONE', 'PARTIAL', 'FULL', 'CANCELLED');

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'JOB_PNL_CUSTOM_DUTY';

ALTER TABLE "job_charges"
  ADD COLUMN IF NOT EXISTS "line_no" INTEGER,
  ADD COLUMN IF NOT EXISTS "unit" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "remarks" TEXT,
  ADD COLUMN IF NOT EXISTS "pp_cc" "JobChargePpCc",
  ADD COLUMN IF NOT EXISTS "ofd_type" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "sale_party_id" UUID,
  ADD COLUMN IF NOT EXISTS "sale_dr_cr" "JobChargeDrCr",
  ADD COLUMN IF NOT EXISTS "sale_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "sale_qty" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "sale_tax_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "sale_tax_rate_id" UUID,
  ADD COLUMN IF NOT EXISTS "sale_tax_group_code" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "sale_currency" CHAR(3),
  ADD COLUMN IF NOT EXISTS "sale_ex_rate" DECIMAL(20,8),
  ADD COLUMN IF NOT EXISTS "sale_fcy_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "sale_taxable_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "sale_remarks" TEXT,
  ADD COLUMN IF NOT EXISTS "sale_editable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "sale_voucher_id" UUID,
  ADD COLUMN IF NOT EXISTS "cost_party_id" UUID,
  ADD COLUMN IF NOT EXISTS "cost_dr_cr" "JobChargeDrCr",
  ADD COLUMN IF NOT EXISTS "cost_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "cost_tax_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "cost_currency" CHAR(3),
  ADD COLUMN IF NOT EXISTS "cost_ex_rate" DECIMAL(20,8),
  ADD COLUMN IF NOT EXISTS "cost_fcy_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "cost_declaration_no" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "cost_declaration_date" DATE,
  ADD COLUMN IF NOT EXISTS "cost_reference_no" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "cost_date" DATE,
  ADD COLUMN IF NOT EXISTS "cost_remarks" TEXT,
  ADD COLUMN IF NOT EXISTS "cost_editable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "cost_voucher_id" UUID,
  ADD COLUMN IF NOT EXISTS "gp_amount" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "freight_flag" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "prorate_status" "JobChargeProrateStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "synced_from_shipment_charge_id" UUID,
  ADD COLUMN IF NOT EXISTS "visible_to_customer" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "visible_to_vendor" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "is_profit_share" BOOLEAN NOT NULL DEFAULT false;

-- Backfill sale side from legacy revenue lines
UPDATE "job_charges"
SET
  "sale_amount" = "amount",
  "sale_qty" = "quantity",
  "sale_tax_amount" = "tax_amount",
  "sale_tax_rate_id" = "tax_rate_id",
  "sale_currency" = "currency_code",
  "sale_ex_rate" = "exchange_rate",
  "sale_fcy_amount" = "amount",
  "sale_taxable_amount" = "amount",
  "sale_party_id" = "party_id",
  "sale_dr_cr" = 'CR',
  "visible_to_customer" = true,
  "visible_to_vendor" = false
WHERE "is_cost" = false AND "sale_amount" IS NULL;

-- Backfill cost side from legacy cost lines
UPDATE "job_charges"
SET
  "cost_amount" = "amount",
  "cost_tax_amount" = "tax_amount",
  "cost_currency" = "currency_code",
  "cost_ex_rate" = "exchange_rate",
  "cost_fcy_amount" = "amount",
  "cost_party_id" = "party_id",
  "cost_dr_cr" = 'DR',
  "visible_to_customer" = false,
  "visible_to_vendor" = true
WHERE "is_cost" = true AND "cost_amount" IS NULL;

-- Assign line_no per job
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY job_id ORDER BY created_at ASC) AS rn
  FROM "job_charges"
  WHERE deleted_at IS NULL AND line_no IS NULL
)
UPDATE "job_charges" jc
SET line_no = numbered.rn
FROM numbered
WHERE jc.id = numbered.id;

UPDATE "job_charges" jc
SET
  freight_flag = true,
  unit = COALESCE(jc.unit, cc.unit)
FROM "charge_codes" cc
WHERE jc.charge_code_id = cc.id
  AND cc.charge_group = 'FREIGHT';

UPDATE "job_charges"
SET gp_amount = COALESCE(sale_amount, 0) * COALESCE(sale_ex_rate, 1)
              - COALESCE(cost_amount, 0) * COALESCE(cost_ex_rate, 1)
WHERE gp_amount IS NULL;

ALTER TABLE "job_charges"
  ADD CONSTRAINT "job_charges_sale_voucher_id_fkey"
  FOREIGN KEY ("sale_voucher_id") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "job_charges"
  ADD CONSTRAINT "job_charges_cost_voucher_id_fkey"
  FOREIGN KEY ("cost_voucher_id") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "job_charges_tenant_id_job_id_line_no_idx"
  ON "job_charges"("tenant_id", "job_id", "line_no");

ALTER TABLE "job_charge_attachments"
  ADD COLUMN IF NOT EXISTS "side" "JobChargeAttachmentSide" NOT NULL DEFAULT 'CHARGE';

CREATE TABLE "job_charge_revisions" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "job_charge_id" UUID NOT NULL,
  "action" VARCHAR(40) NOT NULL,
  "before_json" JSONB,
  "after_json" JSONB,
  "actor_id" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "job_charge_revisions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_charge_revisions_job_charge_id_fkey"
    FOREIGN KEY ("job_charge_id") REFERENCES "job_charges"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "job_charge_revisions_tenant_id_job_id_idx" ON "job_charge_revisions"("tenant_id", "job_id");
CREATE INDEX "job_charge_revisions_tenant_id_job_charge_id_idx" ON "job_charge_revisions"("tenant_id", "job_charge_id");
