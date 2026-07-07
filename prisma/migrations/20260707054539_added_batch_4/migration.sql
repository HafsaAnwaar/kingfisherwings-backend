-- CreateEnum
CREATE TYPE "PartyCreditStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'BLACKLISTED');

-- AlterTable
ALTER TABLE "parties" ADD COLUMN     "credit_status" "PartyCreditStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "iata_code" VARCHAR(10),
ADD COLUMN     "marketing_subscription" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "portal_access" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scac_code" VARCHAR(10),
ADD COLUMN     "tags" TEXT[];

-- CreateIndex
CREATE INDEX "parties_tenant_id_credit_status_idx" ON "parties"("tenant_id", "credit_status");
