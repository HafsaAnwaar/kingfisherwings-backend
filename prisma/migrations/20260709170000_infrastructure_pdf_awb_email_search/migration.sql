-- CreateEnum
CREATE TYPE "AwbStockStatus" AS ENUM ('AVAILABLE', 'ALLOCATED', 'USED', 'VOIDED', 'DEPLETED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "EmailEventType" AS ENUM ('QUOTATION_PDF', 'QUOTATION_SENT', 'PRE_ALERT', 'JOB_DOCUMENT', 'AWB_LOW_STOCK_ALERT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentGenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "QuotationPdfMode" AS ENUM ('CUSTOMER', 'INTERNAL');

-- CreateEnum
CREATE TYPE "DocumentEntityType" AS ENUM ('QUOTATION', 'JOB');

-- AlterTable quotations — PDF + email tracking
ALTER TABLE "quotations" ADD COLUMN "customer_pdf_url" TEXT,
ADD COLUMN "customer_pdf_s3_key" TEXT,
ADD COLUMN "customer_pdf_generated_at" TIMESTAMPTZ,
ADD COLUMN "internal_pdf_url" TEXT,
ADD COLUMN "internal_pdf_s3_key" TEXT,
ADD COLUMN "internal_pdf_generated_at" TIMESTAMPTZ,
ADD COLUMN "last_emailed_at" TIMESTAMPTZ,
ADD COLUMN "last_emailed_to" VARCHAR(500);

-- AlterTable job_documents — generation workflow fields
ALTER TABLE "job_documents" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "is_original" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "layout_variant" VARCHAR(50),
ADD COLUMN "generation_status" "DocumentGenerationStatus" NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN "generated_at" TIMESTAMPTZ,
ADD COLUMN "generation_task_id" UUID,
ADD COLUMN "emailed_at" TIMESTAMPTZ,
ADD COLUMN "emailed_to" VARCHAR(500);

-- CreateTable awb_stock_batches
CREATE TABLE "awb_stock_batches" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID,
    "airline_id" UUID NOT NULL,
    "prefix" VARCHAR(3) NOT NULL,
    "range_from" INTEGER NOT NULL,
    "range_to" INTEGER NOT NULL,
    "next_number" INTEGER NOT NULL,
    "status" "AwbStockStatus" NOT NULL DEFAULT 'AVAILABLE',
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "received_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "awb_stock_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable awb_stock_allocations
CREATE TABLE "awb_stock_allocations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "job_id" UUID,
    "awb_number" VARCHAR(20) NOT NULL,
    "status" "AwbStockStatus" NOT NULL DEFAULT 'ALLOCATED',
    "void_reason" VARCHAR(255),
    "allocated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMPTZ,
    "voided_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "awb_stock_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable email_logs
CREATE TABLE "email_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "event_type" "EmailEventType" NOT NULL,
    "to_email" VARCHAR(255) NOT NULL,
    "cc_email" VARCHAR(500),
    "subject" VARCHAR(500) NOT NULL,
    "body" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "attachment_url" TEXT,
    "attachment_name" VARCHAR(300),
    "error_message" TEXT,
    "quotation_id" UUID,
    "job_id" UUID,
    "job_document_id" UUID,
    "sent_at" TIMESTAMPTZ,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable document_generation_tasks
CREATE TABLE "document_generation_tasks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "entity_type" "DocumentEntityType" NOT NULL,
    "quotation_id" UUID,
    "job_id" UUID,
    "document_type" "DocumentType",
    "pdf_mode" "QuotationPdfMode",
    "layout_variant" VARCHAR(50),
    "status" "DocumentGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "bull_job_id" VARCHAR(100),
    "file_url" TEXT,
    "s3_key" TEXT,
    "file_name" VARCHAR(300),
    "file_size" INTEGER,
    "error_message" TEXT,
    "requested_by" UUID,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_generation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "awb_stock_batches_tenant_id_idx" ON "awb_stock_batches"("tenant_id");
CREATE INDEX "awb_stock_batches_tenant_id_airline_id_idx" ON "awb_stock_batches"("tenant_id", "airline_id");
CREATE INDEX "awb_stock_batches_tenant_id_branch_id_idx" ON "awb_stock_batches"("tenant_id", "branch_id");
CREATE INDEX "awb_stock_batches_tenant_id_status_idx" ON "awb_stock_batches"("tenant_id", "status");

CREATE UNIQUE INDEX "awb_stock_allocations_tenant_id_awb_number_key" ON "awb_stock_allocations"("tenant_id", "awb_number");
CREATE INDEX "awb_stock_allocations_tenant_id_idx" ON "awb_stock_allocations"("tenant_id");
CREATE INDEX "awb_stock_allocations_tenant_id_batch_id_idx" ON "awb_stock_allocations"("tenant_id", "batch_id");
CREATE INDEX "awb_stock_allocations_tenant_id_job_id_idx" ON "awb_stock_allocations"("tenant_id", "job_id");

CREATE INDEX "email_logs_tenant_id_idx" ON "email_logs"("tenant_id");
CREATE INDEX "email_logs_tenant_id_event_type_idx" ON "email_logs"("tenant_id", "event_type");
CREATE INDEX "email_logs_tenant_id_status_idx" ON "email_logs"("tenant_id", "status");
CREATE INDEX "email_logs_tenant_id_quotation_id_idx" ON "email_logs"("tenant_id", "quotation_id");
CREATE INDEX "email_logs_tenant_id_job_id_idx" ON "email_logs"("tenant_id", "job_id");

CREATE INDEX "document_generation_tasks_tenant_id_idx" ON "document_generation_tasks"("tenant_id");
CREATE INDEX "document_generation_tasks_tenant_id_status_idx" ON "document_generation_tasks"("tenant_id", "status");
CREATE INDEX "document_generation_tasks_tenant_id_entity_type_idx" ON "document_generation_tasks"("tenant_id", "entity_type");
CREATE INDEX "document_generation_tasks_bull_job_id_idx" ON "document_generation_tasks"("bull_job_id");

CREATE INDEX "job_documents_tenant_id_generation_status_idx" ON "job_documents"("tenant_id", "generation_status");

-- AddForeignKey
ALTER TABLE "awb_stock_batches" ADD CONSTRAINT "awb_stock_batches_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "awb_stock_allocations" ADD CONSTRAINT "awb_stock_allocations_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "awb_stock_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "awb_stock_allocations" ADD CONSTRAINT "awb_stock_allocations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_generation_tasks" ADD CONSTRAINT "document_generation_tasks_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_generation_tasks" ADD CONSTRAINT "document_generation_tasks_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "job_documents" ADD CONSTRAINT "job_documents_generation_task_id_fkey" FOREIGN KEY ("generation_task_id") REFERENCES "document_generation_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
