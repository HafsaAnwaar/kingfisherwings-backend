-- Portal users: force password change after temp credential issuance (online quote / staff reset)
ALTER TABLE "portal_users"
  ADD COLUMN IF NOT EXISTS "must_change_password" BOOLEAN NOT NULL DEFAULT false;
