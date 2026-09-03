-- Quotation negotiation: customer proposed price on header (visible to both parties)

ALTER TABLE "quotations"
  ADD COLUMN IF NOT EXISTS "customer_proposed_total" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "customer_proposed_lines" JSONB,
  ADD COLUMN IF NOT EXISTS "customer_proposed_at" TIMESTAMPTZ;
