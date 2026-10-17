-- Vendor party type + org role; shipment confirm/approve gate before Generate Job.

DO $$ BEGIN
  ALTER TYPE "PartyType" ADD VALUE IF NOT EXISTS 'VENDOR';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "JobPartyRole" ADD VALUE IF NOT EXISTS 'VENDOR';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "ShipmentStatus" ADD VALUE IF NOT EXISTS 'CONFIRMED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "ShipmentStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
