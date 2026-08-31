-- Week 23–28 closure: party EDI, webhooks delivery log, sea scans, performance indexes

CREATE TABLE "tenant_webhook_deliveries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "webhook_id" UUID NOT NULL,
    "event" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "response_status" INTEGER,
    "error_message" TEXT,
    "signature" VARCHAR(128),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMPTZ,
    CONSTRAINT "tenant_webhook_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "tenant_webhook_deliveries_tenant_id_webhook_id_idx" ON "tenant_webhook_deliveries"("tenant_id", "webhook_id");
CREATE INDEX "tenant_webhook_deliveries_tenant_id_status_idx" ON "tenant_webhook_deliveries"("tenant_id", "status");
ALTER TABLE "tenant_webhook_deliveries" ADD CONSTRAINT "tenant_webhook_deliveries_webhook_id_fkey" FOREIGN KEY ("webhook_id") REFERENCES "tenant_webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "party_edi_codes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "edi_type" VARCHAR(50) NOT NULL,
    "edi_code" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "party_edi_codes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "party_edi_codes_tenant_id_party_id_edi_type_key" ON "party_edi_codes"("tenant_id", "party_id", "edi_type");
CREATE INDEX "party_edi_codes_tenant_id_party_id_idx" ON "party_edi_codes"("tenant_id", "party_id");

CREATE TABLE "party_standard_charges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "charge_code_id" UUID,
    "description" VARCHAR(200) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "default_amount" DECIMAL(18,4) NOT NULL,
    "is_cost" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "party_standard_charges_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "party_standard_charges_tenant_id_party_id_idx" ON "party_standard_charges"("tenant_id", "party_id");

CREATE TABLE "job_sea_scans" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "scan_type" VARCHAR(50) NOT NULL,
    "barcode_value" VARCHAR(100),
    "container_number" VARCHAR(20),
    "scanned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(200),
    "notes" TEXT,
    "created_by" UUID,
    CONSTRAINT "job_sea_scans_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_sea_scans_tenant_id_job_id_idx" ON "job_sea_scans"("tenant_id", "job_id");
CREATE INDEX "job_sea_scans_tenant_id_barcode_value_idx" ON "job_sea_scans"("tenant_id", "barcode_value");

CREATE INDEX IF NOT EXISTS "jobs_tenant_id_department_id_idx" ON "jobs"("tenant_id", "department_id");
CREATE INDEX IF NOT EXISTS "jobs_tenant_id_consignee_id_idx" ON "jobs"("tenant_id", "consignee_id");
CREATE INDEX IF NOT EXISTS "jobs_tenant_id_created_by_idx" ON "jobs"("tenant_id", "created_by");

SELECT enable_rls_for_table('tenant_webhook_deliveries');
SELECT enable_rls_for_table('party_edi_codes');
SELECT enable_rls_for_table('party_standard_charges');
SELECT enable_rls_for_table('job_sea_scans');
