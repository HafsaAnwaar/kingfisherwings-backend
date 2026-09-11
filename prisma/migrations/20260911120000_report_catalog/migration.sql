-- FRESA Report Catalog: platform templates + tenant-scoped generation jobs

CREATE TYPE "ReportFamily" AS ENUM (
  'ops_list',
  'sea_docs',
  'air_docs',
  'commercial',
  'finance',
  'wms',
  'quotation',
  'other'
);

CREATE TYPE "ReportContext" AS ENUM (
  'job',
  'quotation',
  'invoice',
  'gl',
  'wms',
  'list',
  'party'
);

CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'XLSX', 'CSV');

CREATE TYPE "ReportJobStatus" AS ENUM ('queued', 'running', 'ready', 'failed');

CREATE TABLE "report_templates" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "code" VARCHAR(100) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "family" "ReportFamily" NOT NULL,
  "contexts" "ReportContext"[] NOT NULL,
  "formats" "ReportFormat"[] NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT false,
  "parameters_schema" JSONB NOT NULL DEFAULT '[]',
  "renderer_key" VARCHAR(100) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "report_templates_code_key" ON "report_templates"("code");
CREATE INDEX "report_templates_family_is_active_idx" ON "report_templates"("family", "is_active");
CREATE INDEX "report_templates_is_active_sort_order_idx" ON "report_templates"("is_active", "sort_order");

CREATE TABLE "report_jobs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "template_id" UUID NOT NULL,
  "template_code" VARCHAR(100) NOT NULL,
  "format" "ReportFormat" NOT NULL,
  "status" "ReportJobStatus" NOT NULL DEFAULT 'queued',
  "parameters" JSONB NOT NULL DEFAULT '{}',
  "context" JSONB NOT NULL DEFAULT '{}',
  "file_url" TEXT,
  "s3_key" TEXT,
  "file_name" VARCHAR(300),
  "file_size" INTEGER,
  "mime_type" VARCHAR(100),
  "download_url" TEXT,
  "expires_at" TIMESTAMPTZ,
  "error" TEXT,
  "bull_job_id" VARCHAR(100),
  "requested_by" UUID,
  "started_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "report_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "report_jobs_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "report_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "report_jobs_tenant_id_status_idx" ON "report_jobs"("tenant_id", "status");
CREATE INDEX "report_jobs_tenant_id_created_at_idx" ON "report_jobs"("tenant_id", "created_at" DESC);
CREATE INDEX "report_jobs_expires_at_idx" ON "report_jobs"("expires_at");
CREATE INDEX "report_jobs_bull_job_id_idx" ON "report_jobs"("bull_job_id");

SELECT enable_rls_for_table('report_jobs');
