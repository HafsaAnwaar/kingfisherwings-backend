-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "JobChargeAttachmentPurpose" AS ENUM ('GENERAL', 'PAYMENT_PROOF');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable JobChargeAttachment
ALTER TABLE "job_charge_attachments"
  ADD COLUMN IF NOT EXISTS "purpose" "JobChargeAttachmentPurpose" NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS "visible_to_customer" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "visible_to_vendor" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "downloadable_by_customer" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "downloadable_by_vendor" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable Tenant
ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "costing_payment_proof_auto_mark_paid" BOOLEAN NOT NULL DEFAULT true;
