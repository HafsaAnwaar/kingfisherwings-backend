-- Week 13 remaining: invite flow, message replies, billing_party_id, PORTAL_INVITE

ALTER TYPE "PortalUserStatus" ADD VALUE IF NOT EXISTS 'INVITED';
ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'PORTAL_INVITE';

ALTER TABLE "portal_users"
  ADD COLUMN IF NOT EXISTS "invite_token" VARCHAR(128),
  ADD COLUMN IF NOT EXISTS "invite_expires_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "invited_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "activated_at" TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS "portal_users_invite_token_key"
  ON "portal_users"("invite_token");

ALTER TABLE "jobs"
  ADD COLUMN IF NOT EXISTS "billing_party_id" UUID;

CREATE INDEX IF NOT EXISTS "jobs_tenant_id_billing_party_id_idx"
  ON "jobs"("tenant_id", "billing_party_id");

CREATE TABLE IF NOT EXISTS "portal_message_replies" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "message_id" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "staff_user_id" UUID,
  "portal_user_id" UUID,
  "attachment_path" VARCHAR(500),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "portal_message_replies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "portal_message_replies_tenant_id_message_id_created_at_idx"
  ON "portal_message_replies"("tenant_id", "message_id", "created_at");

ALTER TABLE "portal_message_replies"
  DROP CONSTRAINT IF EXISTS "portal_message_replies_message_id_fkey";
ALTER TABLE "portal_message_replies"
  ADD CONSTRAINT "portal_message_replies_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES "portal_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "portal_message_replies"
  DROP CONSTRAINT IF EXISTS "portal_message_replies_portal_user_id_fkey";
ALTER TABLE "portal_message_replies"
  ADD CONSTRAINT "portal_message_replies_portal_user_id_fkey"
  FOREIGN KEY ("portal_user_id") REFERENCES "portal_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

SELECT enable_rls_for_table('portal_message_replies');
