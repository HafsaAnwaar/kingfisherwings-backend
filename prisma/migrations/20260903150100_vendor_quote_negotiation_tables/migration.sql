ALTER TABLE "vendor_quotes" ADD COLUMN IF NOT EXISTS "negotiation_round" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "vendor_quotes" ADD COLUMN IF NOT EXISTS "vendor_proposed_total" DECIMAL(18,4);
ALTER TABLE "vendor_quotes" ADD COLUMN IF NOT EXISTS "vendor_proposed_lines" JSONB;
ALTER TABLE "vendor_quotes" ADD COLUMN IF NOT EXISTS "vendor_proposed_at" TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS "vendor_quote_negotiation_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "vendor_quote_id" UUID NOT NULL,
    "round" INTEGER NOT NULL,
    "actor" "VendorQuoteNegotiationActor" NOT NULL,
    "action" "VendorQuoteNegotiationAction" NOT NULL,
    "message" TEXT,
    "proposed_total" DECIMAL(18,4),
    "proposed_lines" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_quote_negotiation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "vendor_quote_negotiation_events_tenant_id_vendor_quote_id_idx"
  ON "vendor_quote_negotiation_events"("tenant_id", "vendor_quote_id");

ALTER TABLE "vendor_quote_negotiation_events"
  DROP CONSTRAINT IF EXISTS "vendor_quote_negotiation_events_vendor_quote_id_fkey";
ALTER TABLE "vendor_quote_negotiation_events"
  ADD CONSTRAINT "vendor_quote_negotiation_events_vendor_quote_id_fkey"
  FOREIGN KEY ("vendor_quote_id") REFERENCES "vendor_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
