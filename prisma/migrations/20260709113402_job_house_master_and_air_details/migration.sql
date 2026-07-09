-- AlterTable
ALTER TABLE "air_job_details" ADD COLUMN     "awb_type" VARCHAR(20),
ADD COLUMN     "conversion_factor" DECIMAL(6,2) NOT NULL DEFAULT 167,
ADD COLUMN     "freight_type" VARCHAR(20);

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "company_id" UUID,
ADD COLUMN     "container_count" INTEGER,
ADD COLUMN     "container_type_id" UUID,
ADD COLUMN     "cost_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "created_from_quote_id" UUID,
ADD COLUMN     "customer_remarks" TEXT,
ADD COLUMN     "department_id" UUID,
ADD COLUMN     "gp_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "gp_percent" DECIMAL(7,4) NOT NULL DEFAULT 0,
ADD COLUMN     "parent_job_id" UUID,
ADD COLUMN     "revenue_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[];

-- CreateIndex
CREATE INDEX "jobs_tenant_id_parent_job_id_idx" ON "jobs"("tenant_id", "parent_job_id");

-- CreateIndex
CREATE INDEX "jobs_tenant_id_company_id_idx" ON "jobs"("tenant_id", "company_id");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_parent_job_id_fkey" FOREIGN KEY ("parent_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
