-- Quotation-scoped booking form (customer draft/submit before Generate Job).
ALTER TABLE "quotations"
  ADD COLUMN IF NOT EXISTS "booking_form_payload" JSONB,
  ADD COLUMN IF NOT EXISTS "booking_form_kind" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "booking_form_is_complete" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "booking_form_submitted_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "booking_form_submitted_by" UUID;
