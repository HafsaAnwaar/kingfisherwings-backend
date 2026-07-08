-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobType" ADD VALUE 'CUSTOMS_CLEARANCE';
ALTER TYPE "JobType" ADD VALUE 'NVOCC_EXPORT';
ALTER TYPE "JobType" ADD VALUE 'NVOCC_IMPORT';
ALTER TYPE "JobType" ADD VALUE 'SERVICE_JOB';
ALTER TYPE "JobType" ADD VALUE 'WAREHOUSE';

-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "carrier_id" UUID,
ADD COLUMN     "department_id" UUID;

-- CreateTable
CREATE TABLE "tariffs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "service_type" "JobType" NOT NULL,
    "origin_port_id" UUID,
    "dest_port_id" UUID,
    "container_type_id" UUID,
    "charge_code_id" UUID NOT NULL,
    "customer_id" UUID,
    "unit" VARCHAR(50),
    "sale_rate" DECIMAL(18,4) NOT NULL,
    "cost_rate" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zip_distances" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "from_zip" VARCHAR(20) NOT NULL,
    "from_city" VARCHAR(100),
    "to_zip" VARCHAR(20) NOT NULL,
    "to_city" VARCHAR(100),
    "distance" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(10) NOT NULL DEFAULT 'KM',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "zip_distances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tariffs_tenant_id_idx" ON "tariffs"("tenant_id");

-- CreateIndex
CREATE INDEX "tariffs_tenant_id_service_type_idx" ON "tariffs"("tenant_id", "service_type");

-- CreateIndex
CREATE INDEX "tariffs_tenant_id_origin_port_id_dest_port_id_idx" ON "tariffs"("tenant_id", "origin_port_id", "dest_port_id");

-- CreateIndex
CREATE INDEX "tariffs_tenant_id_customer_id_idx" ON "tariffs"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "zip_distances_tenant_id_idx" ON "zip_distances"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "zip_distances_tenant_id_from_zip_to_zip_key" ON "zip_distances"("tenant_id", "from_zip", "to_zip");

-- CreateIndex
CREATE INDEX "quotations_tenant_id_department_id_idx" ON "quotations"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "quotations_tenant_id_carrier_id_idx" ON "quotations"("tenant_id", "carrier_id");
