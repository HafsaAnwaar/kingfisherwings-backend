/*
  Warnings:

  - Added the required column `first_name` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "idx_jobs_job_number_trgm";

-- DropIndex
DROP INDEX "idx_parties_name_trgm";

-- DropIndex
DROP INDEX "idx_users_email_trgm";

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "first_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "last_name" VARCHAR(100) NOT NULL;
