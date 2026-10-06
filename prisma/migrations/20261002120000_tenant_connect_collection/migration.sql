-- Customer invoice payments settled into the company's own Stripe Connect
-- account (destination charges). Additive only; gated by STRIPE_CONNECT_ENABLED.

-- AlterTable
ALTER TABLE "tenant_payment_gateways" ADD COLUMN     "use_connect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "connect_account_id" VARCHAR(255),
ADD COLUMN     "connect_charges_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "connect_payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "connect_details_submitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "connect_requirements_due" JSONB;

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "connect_destination_id" VARCHAR(255),
ADD COLUMN     "application_fee_minor" BIGINT;

-- AlterTable
ALTER TABLE "vendor_payouts" ADD COLUMN     "stripe_debit_transfer_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_payment_gateways_connect_account_id_key" ON "tenant_payment_gateways"("connect_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_payouts_stripe_debit_transfer_id_key" ON "vendor_payouts"("stripe_debit_transfer_id");
