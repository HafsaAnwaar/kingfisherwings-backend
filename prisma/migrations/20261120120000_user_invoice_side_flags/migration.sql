-- Staff invoice sale/purchase visibility (independent of costing can_see_sales/cost).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "can_see_sale_invoices" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "can_see_purchase_invoices" BOOLEAN NOT NULL DEFAULT false;
