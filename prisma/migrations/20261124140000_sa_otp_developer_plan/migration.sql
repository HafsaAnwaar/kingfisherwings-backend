-- Super Admin email OTP challenges
CREATE TABLE IF NOT EXISTS "super_admin_login_challenges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "super_admin_id" UUID NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_sent_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "super_admin_login_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "super_admin_login_challenges_super_admin_id_idx"
  ON "super_admin_login_challenges"("super_admin_id");
CREATE INDEX IF NOT EXISTS "super_admin_login_challenges_expires_at_idx"
  ON "super_admin_login_challenges"("expires_at");

-- Developer subscription tier
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'DEVELOPER';
