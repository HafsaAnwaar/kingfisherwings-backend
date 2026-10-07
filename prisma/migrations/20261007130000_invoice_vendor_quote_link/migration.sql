-- Link purchase invoices auto-created from approved vendor job offers.
ALTER TABLE "invoices"
  ADD COLUMN IF NOT EXISTS "vendor_quote_id" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "invoices_tenant_id_vendor_quote_id_key"
  ON "invoices" ("tenant_id", "vendor_quote_id")
  WHERE "vendor_quote_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "invoices_tenant_id_vendor_quote_id_idx"
  ON "invoices" ("tenant_id", "vendor_quote_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_vendor_quote_id_fkey'
  ) THEN
    ALTER TABLE "invoices"
      ADD CONSTRAINT "invoices_vendor_quote_id_fkey"
      FOREIGN KEY ("vendor_quote_id") REFERENCES "vendor_quotes"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
