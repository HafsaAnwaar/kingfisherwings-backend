-- Week 21 — Documentation module + Week 22 public API keys

CREATE TYPE "DocumentationBoeType" AS ENUM ('IMPORT', 'EXPORT', 'TRANSIT', 'WAREHOUSE', 'OTHER');
CREATE TYPE "DocumentationBoeStatus" AS ENUM ('DRAFT', 'FILED', 'CLEARED', 'CLAIM_PENDING');
CREATE TYPE "DocumentationDoStatus" AS ENUM ('ISSUED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "DocumentationBulkCostStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CANCELLED');
CREATE TYPE "DocumentationEdiType" AS ENUM ('BAYAN_MASTER', 'BAYAN_HOUSE', 'CCN_FWB', 'CCN_FHL', 'CGM', 'EQO_DUBAI', 'EQO_OMAN', 'IAL', 'MPCI');
CREATE TYPE "DocumentationEdiStatus" AS ENUM ('DRAFT', 'GENERATED', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'AMENDED');
CREATE TYPE "DocumentationUploadType" AS ENUM ('CONTAINER_NUMBERS', 'CONTAINER_TRANSPORT', 'DPWORLD_TRACKING', 'TRUCK_POSITIONS');
CREATE TYPE "DocumentationUploadBatchStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "DocumentationMpciStatus" AS ENUM ('PREPARED', 'SUBMITTED', 'ACKNOWLEDGED', 'REJECTED');
CREATE TYPE "DocumentationSaleOrCost" AS ENUM ('SALE', 'COST');
CREATE TYPE "DocumentationDrCr" AS ENUM ('Dr', 'Cr');
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED');

CREATE TABLE "documentation_boe_records" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID,
    "job_id" UUID,
    "boe_number" VARCHAR(50) NOT NULL,
    "boe_date" DATE,
    "boe_type" "DocumentationBoeType" NOT NULL DEFAULT 'IMPORT',
    "status" "DocumentationBoeStatus" NOT NULL DEFAULT 'DRAFT',
    "customs_office" VARCHAR(100),
    "port_id" UUID,
    "party_id" UUID,
    "salesperson_id" UUID,
    "department_id" UUID,
    "filed_by" UUID,
    "filed_at" TIMESTAMPTZ,
    "claim_status" VARCHAR(50),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "documentation_boe_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "documentation_boe_records_tenant_id_boe_number_key" ON "documentation_boe_records"("tenant_id", "boe_number");
CREATE INDEX "documentation_boe_records_tenant_id_job_id_idx" ON "documentation_boe_records"("tenant_id", "job_id");
CREATE INDEX "documentation_boe_records_tenant_id_status_idx" ON "documentation_boe_records"("tenant_id", "status");
CREATE INDEX "documentation_boe_records_tenant_id_boe_date_idx" ON "documentation_boe_records"("tenant_id", "boe_date");

CREATE TABLE "documentation_delivery_orders" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "do_number" VARCHAR(50) NOT NULL,
    "do_date" DATE,
    "do_status" "DocumentationDoStatus" NOT NULL DEFAULT 'ISSUED',
    "closed_job_only" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "documentation_delivery_orders_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_delivery_orders_tenant_id_job_id_idx" ON "documentation_delivery_orders"("tenant_id", "job_id");

CREATE TABLE "documentation_charge_templates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "job_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "documentation_charge_templates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_charge_templates_tenant_id_idx" ON "documentation_charge_templates"("tenant_id");

CREATE TABLE "documentation_charge_template_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "charge_code_id" UUID,
    "description" VARCHAR(200) NOT NULL,
    "sale_or_cost" "DocumentationSaleOrCost" NOT NULL DEFAULT 'SALE',
    "dr_cr" "DocumentationDrCr" NOT NULL DEFAULT 'Dr',
    "currency_code" CHAR(3) NOT NULL,
    "default_amount" DECIMAL(18,4),
    "tax_group_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentation_charge_template_lines_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_charge_template_lines_tenant_id_template_id_idx" ON "documentation_charge_template_lines"("tenant_id", "template_id");
ALTER TABLE "documentation_charge_template_lines" ADD CONSTRAINT "documentation_charge_template_lines_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "documentation_charge_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "documentation_bulk_cost_batches" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "organization_id" UUID,
    "vessel_id" UUID,
    "voyage_number" VARCHAR(50),
    "prorate_method" VARCHAR(50),
    "status" "DocumentationBulkCostStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "documentation_bulk_cost_batches_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_bulk_cost_batches_tenant_id_status_idx" ON "documentation_bulk_cost_batches"("tenant_id", "status");

CREATE TABLE "documentation_bulk_cost_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "charge_code_id" UUID,
    "description" VARCHAR(200) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(18,8) NOT NULL DEFAULT 1,
    "fcy_amount" DECIMAL(18,4) NOT NULL,
    "amount_aed" DECIMAL(18,4) NOT NULL,
    "sale_or_cost" "DocumentationSaleOrCost" NOT NULL DEFAULT 'COST',
    "dr_cr" "DocumentationDrCr" NOT NULL DEFAULT 'Dr',
    "tax_group_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentation_bulk_cost_lines_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_bulk_cost_lines_tenant_id_batch_id_idx" ON "documentation_bulk_cost_lines"("tenant_id", "batch_id");
CREATE INDEX "documentation_bulk_cost_lines_tenant_id_job_id_idx" ON "documentation_bulk_cost_lines"("tenant_id", "job_id");
ALTER TABLE "documentation_bulk_cost_lines" ADD CONSTRAINT "documentation_bulk_cost_lines_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "documentation_bulk_cost_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "documentation_edi_submissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "edi_type" "DocumentationEdiType" NOT NULL,
    "reference_type" VARCHAR(30) NOT NULL,
    "reference_id" UUID NOT NULL,
    "status" "DocumentationEdiStatus" NOT NULL DEFAULT 'DRAFT',
    "file_storage_key" VARCHAR(500),
    "external_ref" VARCHAR(100),
    "payload_hash" VARCHAR(64),
    "error_message" TEXT,
    "amendment_of_id" UUID,
    "submitted_by" UUID,
    "submitted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "documentation_edi_submissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_edi_submissions_tenant_id_edi_type_reference_id_idx" ON "documentation_edi_submissions"("tenant_id", "edi_type", "reference_id");
CREATE INDEX "documentation_edi_submissions_tenant_id_status_idx" ON "documentation_edi_submissions"("tenant_id", "status");

CREATE TABLE "documentation_cgm_vessel_voyages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "vessel_id" UUID,
    "voyage_number" VARCHAR(50) NOT NULL,
    "origin_port_id" UUID,
    "dest_port_id" UUID,
    "etd" TIMESTAMPTZ,
    "eta" TIMESTAMPTZ,
    "atd" TIMESTAMPTZ,
    "ata" TIMESTAMPTZ,
    "status" VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "documentation_cgm_vessel_voyages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_cgm_vessel_voyages_tenant_id_voyage_number_idx" ON "documentation_cgm_vessel_voyages"("tenant_id", "voyage_number");

CREATE TABLE "documentation_mpci_filings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID,
    "filing_number" VARCHAR(50),
    "filing_type" VARCHAR(50),
    "status" "DocumentationMpciStatus" NOT NULL DEFAULT 'PREPARED',
    "uae_customs_ref" VARCHAR(100),
    "submitted_at" TIMESTAMPTZ,
    "response_payload" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "documentation_mpci_filings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_mpci_filings_tenant_id_job_id_idx" ON "documentation_mpci_filings"("tenant_id", "job_id");
CREATE INDEX "documentation_mpci_filings_tenant_id_status_idx" ON "documentation_mpci_filings"("tenant_id", "status");

CREATE TABLE "documentation_upload_batches" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "upload_type" "DocumentationUploadType" NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_storage_key" VARCHAR(500),
    "status" "DocumentationUploadBatchStatus" NOT NULL DEFAULT 'PENDING',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "success_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "documentation_upload_batches_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "documentation_upload_batches_tenant_id_upload_type_idx" ON "documentation_upload_batches"("tenant_id", "upload_type");
CREATE INDEX "documentation_upload_batches_tenant_id_status_idx" ON "documentation_upload_batches"("tenant_id", "status");

CREATE TABLE "documentation_air_tracking_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "mawb_number" VARCHAR(20) NOT NULL,
    "carrier_code" VARCHAR(10),
    "events" JSONB NOT NULL DEFAULT '[]',
    "fetched_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentation_air_tracking_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "documentation_air_tracking_events_tenant_id_mawb_number_key" ON "documentation_air_tracking_events"("tenant_id", "mawb_number");

CREATE TABLE "tenant_api_keys" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "key_prefix" VARCHAR(12) NOT NULL,
    "key_hash" VARCHAR(128) NOT NULL,
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_used_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "revoked_at" TIMESTAMPTZ,
    CONSTRAINT "tenant_api_keys_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "tenant_api_keys_tenant_id_status_idx" ON "tenant_api_keys"("tenant_id", "status");
CREATE INDEX "tenant_api_keys_key_prefix_idx" ON "tenant_api_keys"("key_prefix");

CREATE TABLE "tenant_webhooks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "secret" VARCHAR(128) NOT NULL,
    "events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "tenant_webhooks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "tenant_webhooks_tenant_id_is_active_idx" ON "tenant_webhooks"("tenant_id", "is_active");

SELECT enable_rls_for_table('documentation_boe_records');
SELECT enable_rls_for_table('documentation_delivery_orders');
SELECT enable_rls_for_table('documentation_charge_templates');
SELECT enable_rls_for_table('documentation_charge_template_lines');
SELECT enable_rls_for_table('documentation_bulk_cost_batches');
SELECT enable_rls_for_table('documentation_bulk_cost_lines');
SELECT enable_rls_for_table('documentation_edi_submissions');
SELECT enable_rls_for_table('documentation_cgm_vessel_voyages');
SELECT enable_rls_for_table('documentation_mpci_filings');
SELECT enable_rls_for_table('documentation_upload_batches');
SELECT enable_rls_for_table('documentation_air_tracking_events');
SELECT enable_rls_for_table('tenant_api_keys');
SELECT enable_rls_for_table('tenant_webhooks');
