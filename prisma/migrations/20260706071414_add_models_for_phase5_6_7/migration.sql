-- CreateEnum
CREATE TYPE "SingleDevicePolicy" AS ENUM ('TERMINATE_OLDEST', 'REJECT_NEW');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'DOCUMENTATION';
ALTER TYPE "UserRole" ADD VALUE 'CUSTOMER_SUPPORT';
ALTER TYPE "UserRole" ADD VALUE 'DRIVER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "single_device_login" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "single_device_policy" "SingleDevicePolicy" NOT NULL DEFAULT 'TERMINATE_OLDEST';
