/*
  Warnings:

  - You are about to drop the column `created_by` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "created_by_super_admin_id" UUID;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_by",
ADD COLUMN     "created_by_super_admin_id" UUID,
ADD COLUMN     "created_by_tenant_id" UUID,
ADD COLUMN     "created_by_user_id" UUID;

-- CreateIndex
CREATE INDEX "tenants_created_by_super_admin_id_idx" ON "tenants"("created_by_super_admin_id");

-- CreateIndex
CREATE INDEX "users_created_by_user_id_idx" ON "users"("created_by_user_id");

-- CreateIndex
CREATE INDEX "users_created_by_tenant_id_idx" ON "users"("created_by_tenant_id");

-- CreateIndex
CREATE INDEX "users_created_by_super_admin_id_idx" ON "users"("created_by_super_admin_id");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_created_by_super_admin_id_fkey" FOREIGN KEY ("created_by_super_admin_id") REFERENCES "super_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_tenant_id_fkey" FOREIGN KEY ("created_by_tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_super_admin_id_fkey" FOREIGN KEY ("created_by_super_admin_id") REFERENCES "super_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
