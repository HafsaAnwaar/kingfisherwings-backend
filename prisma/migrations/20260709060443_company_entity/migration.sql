-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "company_id" UUID;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "company_id" UUID;

-- AlterTable
ALTER TABLE "designations" ADD COLUMN     "company_id" UUID;

-- AlterTable
ALTER TABLE "parties" ADD COLUMN     "company_id" UUID;

-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "company_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company_id" UUID;

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "legal_name" VARCHAR(300),
    "registration_number" VARCHAR(100),
    "vat_number" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "country_code" CHAR(2),
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "companies_tenant_id_idx" ON "companies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tenant_id_code_key" ON "companies"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "branches_tenant_id_company_id_idx" ON "branches"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "departments_tenant_id_company_id_idx" ON "departments"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "designations_tenant_id_company_id_idx" ON "designations"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "parties_tenant_id_company_id_idx" ON "parties"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "quotations_tenant_id_company_id_idx" ON "quotations"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "users_tenant_id_company_id_idx" ON "users"("tenant_id", "company_id");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
