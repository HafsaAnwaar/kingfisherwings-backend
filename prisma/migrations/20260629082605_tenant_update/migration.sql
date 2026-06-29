/*
  Warnings:

  - The `subscription_plan` column on the `tenants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[code]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('TRIAL', 'BASIC', 'STANDARD', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "code" VARCHAR(20) NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "display_name" VARCHAR(200),
ADD COLUMN     "language" VARCHAR(10) NOT NULL DEFAULT 'en',
ADD COLUMN     "max_branches" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "max_storage_gb" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "primary_color" VARCHAR(20),
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "trial_ends" TIMESTAMP(3),
ADD COLUMN     "website" VARCHAR(255),
DROP COLUMN "subscription_plan",
ADD COLUMN     "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'TRIAL';

-- CreateIndex
CREATE UNIQUE INDEX "tenants_code_key" ON "tenants"("code");
