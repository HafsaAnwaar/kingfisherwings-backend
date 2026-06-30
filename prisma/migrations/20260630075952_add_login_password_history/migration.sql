/*
  Warnings:

  - You are about to drop the column `device_info` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "device_info",
ADD COLUMN     "browser" VARCHAR(100),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(100),
ADD COLUMN     "device_name" VARCHAR(150),
ADD COLUMN     "last_ip_address" VARCHAR(45),
ADD COLUMN     "login_method" VARCHAR(30) NOT NULL DEFAULT 'PASSWORD',
ADD COLUMN     "operating_system" VARCHAR(100),
ADD COLUMN     "remember_me" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "session_type" VARCHAR(30) NOT NULL DEFAULT 'WEB',
ADD COLUMN     "terminated_by" UUID,
ADD COLUMN     "termination_type" VARCHAR(50);

-- CreateTable
CREATE TABLE "password_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "changed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" UUID,
    "reason" VARCHAR(100),

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "email" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "browser" VARCHAR(100),
    "operating_system" VARCHAR(100),
    "device" VARCHAR(100),
    "location" VARCHAR(255),
    "success" BOOLEAN NOT NULL,
    "failure_reason" VARCHAR(255),
    "logged_in_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_history_tenant_id_idx" ON "password_history"("tenant_id");

-- CreateIndex
CREATE INDEX "password_history_user_id_idx" ON "password_history"("user_id");

-- CreateIndex
CREATE INDEX "login_history_tenant_id_idx" ON "login_history"("tenant_id");

-- CreateIndex
CREATE INDEX "login_history_user_id_idx" ON "login_history"("user_id");

-- CreateIndex
CREATE INDEX "login_history_email_idx" ON "login_history"("email");

-- CreateIndex
CREATE INDEX "login_history_logged_in_at_idx" ON "login_history"("logged_in_at");

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
