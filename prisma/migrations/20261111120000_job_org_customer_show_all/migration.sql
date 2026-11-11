-- JobPartyRole.CUSTOMER (distinct from CLIENT) + Job show_all commercial fields.

ALTER TYPE "JobPartyRole" ADD VALUE IF NOT EXISTS 'CUSTOMER';

ALTER TABLE "jobs"
  ADD COLUMN IF NOT EXISTS "commodity_description" TEXT,
  ADD COLUMN IF NOT EXISTS "chargeable_units" DECIMAL(12,3),
  ADD COLUMN IF NOT EXISTS "freight_payable_at" VARCHAR(100);
