-- Standalone Customs Clearance job detail + lines + checklist + queries

DO $$ BEGIN
  CREATE TYPE "CcWorkflowStatus" AS ENUM (
    'PENDING', 'QUOTED', 'ACCEPTED', 'OPS_OPEN', 'DOCS', 'CLASSIFIED',
    'FILED', 'QUERY', 'ASSESSED', 'DUTY_PAID', 'CLEARED', 'RELEASED',
    'INVOICE_READY', 'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CcDirection" AS ENUM ('IMPORT', 'EXPORT', 'TRANSIT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CcQueryStatus" AS ENUM ('OPEN', 'RESPONDED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "job_customs_clearance_details" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "direction" "CcDirection" NOT NULL DEFAULT 'IMPORT',
  "cc_status" "CcWorkflowStatus" NOT NULL DEFAULT 'ACCEPTED',
  "cha_party_id" UUID,
  "border_or_port" VARCHAR(200),
  "entry_type" VARCHAR(20),
  "entry_number" VARCHAR(100),
  "shipping_bill_number" VARCHAR(100),
  "filing_date" DATE,
  "assessed_duty" DECIMAL(18,4),
  "assessed_tax" DECIMAL(18,4),
  "duty_currency" CHAR(3),
  "duty_paid_at" TIMESTAMPTZ,
  "duty_paid_by_client" BOOLEAN NOT NULL DEFAULT false,
  "duty_payment_notes" TEXT,
  "cleared_at" TIMESTAMPTZ,
  "released_at" TIMESTAMPTZ,
  "freight_job_id" UUID,
  "declaration_json" JSONB,
  "declaration_boe_id" UUID,
  "invoice_id" UUID,
  "remarks" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "job_customs_clearance_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "job_customs_clearance_details_job_id_key"
  ON "job_customs_clearance_details"("job_id");
CREATE INDEX IF NOT EXISTS "job_customs_clearance_details_tenant_id_idx"
  ON "job_customs_clearance_details"("tenant_id");
CREATE INDEX IF NOT EXISTS "job_customs_clearance_details_tenant_id_cc_status_idx"
  ON "job_customs_clearance_details"("tenant_id", "cc_status");
CREATE INDEX IF NOT EXISTS "job_customs_clearance_details_tenant_id_freight_job_id_idx"
  ON "job_customs_clearance_details"("tenant_id", "freight_job_id");

ALTER TABLE "job_customs_clearance_details"
  DROP CONSTRAINT IF EXISTS "job_customs_clearance_details_job_id_fkey";
ALTER TABLE "job_customs_clearance_details"
  ADD CONSTRAINT "job_customs_clearance_details_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "cc_cargo_lines" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "detail_id" UUID NOT NULL,
  "line_no" INTEGER NOT NULL DEFAULT 1,
  "description" VARCHAR(500) NOT NULL,
  "hs_code" VARCHAR(12),
  "country_of_origin" CHAR(2),
  "quantity" DECIMAL(18,4),
  "unit" VARCHAR(20),
  "value_amount" DECIMAL(18,4),
  "currency_code" CHAR(3),
  "is_classified" BOOLEAN NOT NULL DEFAULT false,
  "is_prohibited" BOOLEAN NOT NULL DEFAULT false,
  "is_restricted" BOOLEAN NOT NULL DEFAULT false,
  "permit_notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "cc_cargo_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "cc_cargo_lines_tenant_id_detail_id_idx"
  ON "cc_cargo_lines"("tenant_id", "detail_id");

ALTER TABLE "cc_cargo_lines"
  DROP CONSTRAINT IF EXISTS "cc_cargo_lines_detail_id_fkey";
ALTER TABLE "cc_cargo_lines"
  ADD CONSTRAINT "cc_cargo_lines_detail_id_fkey"
  FOREIGN KEY ("detail_id") REFERENCES "job_customs_clearance_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "cc_document_checklist_items" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "detail_id" UUID NOT NULL,
  "doc_code" VARCHAR(40) NOT NULL,
  "label" VARCHAR(200) NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "received" BOOLEAN NOT NULL DEFAULT false,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "job_document_id" UUID,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "cc_document_checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cc_document_checklist_items_detail_id_doc_code_key"
  ON "cc_document_checklist_items"("detail_id", "doc_code");
CREATE INDEX IF NOT EXISTS "cc_document_checklist_items_tenant_id_detail_id_idx"
  ON "cc_document_checklist_items"("tenant_id", "detail_id");

ALTER TABLE "cc_document_checklist_items"
  DROP CONSTRAINT IF EXISTS "cc_document_checklist_items_detail_id_fkey";
ALTER TABLE "cc_document_checklist_items"
  ADD CONSTRAINT "cc_document_checklist_items_detail_id_fkey"
  FOREIGN KEY ("detail_id") REFERENCES "job_customs_clearance_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "cc_customs_queries" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "detail_id" UUID NOT NULL,
  "status" "CcQueryStatus" NOT NULL DEFAULT 'OPEN',
  "query_text" TEXT NOT NULL,
  "response_text" TEXT,
  "raised_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "cc_customs_queries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "cc_customs_queries_tenant_id_detail_id_idx"
  ON "cc_customs_queries"("tenant_id", "detail_id");
CREATE INDEX IF NOT EXISTS "cc_customs_queries_tenant_id_status_idx"
  ON "cc_customs_queries"("tenant_id", "status");

ALTER TABLE "cc_customs_queries"
  DROP CONSTRAINT IF EXISTS "cc_customs_queries_detail_id_fkey";
ALTER TABLE "cc_customs_queries"
  ADD CONSTRAINT "cc_customs_queries_detail_id_fkey"
  FOREIGN KEY ("detail_id") REFERENCES "job_customs_clearance_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

SELECT enable_rls_for_table('job_customs_clearance_details');
SELECT enable_rls_for_table('cc_cargo_lines');
SELECT enable_rls_for_table('cc_document_checklist_items');
SELECT enable_rls_for_table('cc_customs_queries');
