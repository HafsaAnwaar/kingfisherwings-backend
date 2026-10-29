-- Per-staff WhatsApp receive number + opt-in (manual send phase; auto-notify later).
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "whatsapp_number" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "whatsapp_notifications_opt_in" BOOLEAN NOT NULL DEFAULT false;
