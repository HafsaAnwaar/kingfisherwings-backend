-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verified_at" TIMESTAMPTZ,
ADD COLUMN     "last_activity_at" TIMESTAMPTZ,
ADD COLUMN     "last_failed_login_at" TIMESTAMPTZ,
ADD COLUMN     "last_login_browser" VARCHAR(255),
ADD COLUMN     "last_login_device" VARCHAR(255),
ADD COLUMN     "last_login_location" VARCHAR(255),
ADD COLUMN     "locale" VARCHAR(10) NOT NULL DEFAULT 'en',
ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_expires_at" TIMESTAMPTZ;
