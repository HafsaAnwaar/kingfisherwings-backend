/*
  Warnings:

  - The values [ACCEPTED] on the enum `ApprovalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL,ACCEPTED] on the enum `QuotationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApprovalStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "quotation_approvals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "quotation_approvals" ALTER COLUMN "status" TYPE "ApprovalStatus_new" USING ("status"::text::"ApprovalStatus_new");
ALTER TYPE "ApprovalStatus" RENAME TO "ApprovalStatus_old";
ALTER TYPE "ApprovalStatus_new" RENAME TO "ApprovalStatus";
DROP TYPE "ApprovalStatus_old";
ALTER TABLE "quotation_approvals" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "QuotationStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SENT', 'WON', 'LOST', 'EXPIRED', 'CONVERTED');
ALTER TABLE "quotations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "quotations" ALTER COLUMN "status" TYPE "QuotationStatus_new" USING ("status"::text::"QuotationStatus_new");
ALTER TABLE "quotation_status_history" ALTER COLUMN "from_status" TYPE "QuotationStatus_new" USING ("from_status"::text::"QuotationStatus_new");
ALTER TABLE "quotation_status_history" ALTER COLUMN "to_status" TYPE "QuotationStatus_new" USING ("to_status"::text::"QuotationStatus_new");
ALTER TYPE "QuotationStatus" RENAME TO "QuotationStatus_old";
ALTER TYPE "QuotationStatus_new" RENAME TO "QuotationStatus";
DROP TYPE "QuotationStatus_old";
ALTER TABLE "quotations" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
