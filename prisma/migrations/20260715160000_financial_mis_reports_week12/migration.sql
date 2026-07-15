-- Week 12 / Ch.20–23 — Financial reports + MIS saved reports

CREATE TYPE "SavedReportType" AS ENUM (
  'BALANCE_SHEET',
  'PROFIT_AND_LOSS',
  'CASH_FLOW',
  'TRIAL_BALANCE',
  'VAT_RETURN',
  'AR_AGING',
  'AP_AGING',
  'JOB_PROFITABILITY',
  'MIS_DASHBOARD',
  'CUSTOM'
);

CREATE TABLE "saved_reports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "report_type" "SavedReportType" NOT NULL,
    "description" TEXT,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "saved_reports_tenant_id_idx" ON "saved_reports"("tenant_id");
CREATE INDEX "saved_reports_tenant_id_report_type_idx" ON "saved_reports"("tenant_id", "report_type");
CREATE INDEX "saved_reports_tenant_id_created_by_idx" ON "saved_reports"("tenant_id", "created_by");

ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

SELECT enable_rls_for_table('saved_reports');
SELECT add_soft_delete_index('saved_reports');
