-- Stripe payment hardening: processing fees, disputes/chargebacks,
-- operational notifications.

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_DISPUTED';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_ACTION_REQUIRED';
ALTER TYPE "OnlinePaymentStatus" ADD VALUE 'DISPUTED';

-- Stripe fee + dispute tracking on tenant invoice attempts
ALTER TABLE "payment_transactions" ADD COLUMN "dispute_status" VARCHAR(40),
ADD COLUMN "disputed_at" TIMESTAMPTZ,
ADD COLUMN "fee_recorded_at" TIMESTAMPTZ,
ADD COLUMN "fee_voucher_id" UUID,
ADD COLUMN "stripe_dispute_id" VARCHAR(255),
ADD COLUMN "stripe_fee_amount" DECIMAL(18,4),
ADD COLUMN "stripe_fee_currency" CHAR(3);

-- Same on platform payments
ALTER TABLE "platform_payments" ADD COLUMN "dispute_status" VARCHAR(40),
ADD COLUMN "disputed_at" TIMESTAMPTZ,
ADD COLUMN "stripe_dispute_id" VARCHAR(255),
ADD COLUMN "stripe_fee_amount" DECIMAL(18,4),
ADD COLUMN "stripe_fee_currency" CHAR(3);

-- Expense account for Stripe processing fees
ALTER TABLE "tenant_payment_gateways" ADD COLUMN "fee_gl_account_id" UUID;
