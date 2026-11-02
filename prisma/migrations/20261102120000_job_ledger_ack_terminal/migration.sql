-- Job show_all / track: location / terminal
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "location_terminal" VARCHAR(200);

-- Delivery acknowledgement: admin → customer flow + container select
ALTER TYPE "DeliveryAcknowledgementStatus" ADD VALUE IF NOT EXISTS 'SENT_TO_CUSTOMER';
ALTER TYPE "DeliveryAcknowledgementStatus" ADD VALUE IF NOT EXISTS 'ACKNOWLEDGED_BY_CUSTOMER';

ALTER TABLE "delivery_acknowledgements"
  ADD COLUMN IF NOT EXISTS "container_id" UUID,
  ADD COLUMN IF NOT EXISTS "sent_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "sent_by_user_id" UUID;

CREATE INDEX IF NOT EXISTS "delivery_acknowledgements_container_id_idx"
  ON "delivery_acknowledgements" ("container_id");
