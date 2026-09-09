-- Portal book-quote costing audit snapshot (sale rates / customer lines at create).
ALTER TABLE "quotations"
ADD COLUMN IF NOT EXISTS "portal_estimate_snapshot" JSONB;
