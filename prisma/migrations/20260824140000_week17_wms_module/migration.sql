-- Week 17 — Warehouse Management System (Ch.22)

-- AlterEnum
ALTER TYPE "DocumentNumberType" ADD VALUE IF NOT EXISTS 'ASN';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WMS_LOW_STOCK';

-- CreateEnum
CREATE TYPE "WmsValuationMethod" AS ENUM ('FIFO', 'LIFO');

-- CreateEnum
CREATE TYPE "WmsDocumentStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WmsAsnStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WmsMovementType" AS ENUM ('GRN_IN', 'GDO_OUT', 'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "WmsStorageChargeStatus" AS ENUM ('OPEN', 'INVOICED', 'WAIVED');

-- CreateTable
CREATE TABLE "wms_settings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "valuation_method" "WmsValuationMethod" NOT NULL DEFAULT 'FIFO',
    "default_free_days" INTEGER NOT NULL DEFAULT 7,
    "default_storage_rate" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "default_currency" CHAR(3) NOT NULL DEFAULT 'AED',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "wms_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "uom_code" VARCHAR(20),
    "low_stock_threshold" DECIMAL(18,4),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "wms_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_asns" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "asn_number" VARCHAR(40) NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "party_id" UUID,
    "job_id" UUID,
    "expected_at" TIMESTAMPTZ,
    "status" "WmsAsnStatus" NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "wms_asns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_asn_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "asn_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "cbm" DECIMAL(18,4),
    "remarks" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wms_asn_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_grns" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "grn_number" VARCHAR(40) NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "party_id" UUID,
    "job_id" UUID,
    "asn_id" UUID,
    "received_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "WmsDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "posted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "wms_grns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_grn_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "cbm" DECIMAL(18,4),
    "batch_code" VARCHAR(60),
    "remarks" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wms_grn_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_gdos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "gdo_number" VARCHAR(40) NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "party_id" UUID,
    "job_id" UUID,
    "delivered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "WmsDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "posted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "wms_gdos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_gdo_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "gdo_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "remarks" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wms_gdo_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_stock_lots" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "grn_line_id" UUID,
    "party_id" UUID,
    "job_id" UUID,
    "batch_code" VARCHAR(60),
    "qty_received" DECIMAL(18,4) NOT NULL,
    "qty_remaining" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "cbm_per_unit" DECIMAL(18,6),
    "received_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "wms_stock_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_stock_movements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "lot_id" UUID,
    "movement_type" "WmsMovementType" NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reference_type" VARCHAR(30),
    "reference_id" UUID,
    "remarks" TEXT,
    "moved_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "wms_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_stock_transfers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "transfer_number" VARCHAR(40) NOT NULL,
    "from_warehouse_id" UUID NOT NULL,
    "to_warehouse_id" UUID NOT NULL,
    "status" "WmsDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "posted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "wms_stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_stock_transfer_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "transfer_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wms_stock_transfer_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_storage_charges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "lot_id" UUID,
    "item_id" UUID,
    "period_from" DATE NOT NULL,
    "period_to" DATE NOT NULL,
    "free_days" INTEGER NOT NULL DEFAULT 0,
    "chargeable_days" INTEGER NOT NULL DEFAULT 0,
    "quantity" DECIMAL(18,4) NOT NULL,
    "cbm" DECIMAL(18,4),
    "rate_per_day" DECIMAL(18,4) NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "WmsStorageChargeStatus" NOT NULL DEFAULT 'OPEN',
    "invoice_id" UUID,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "wms_storage_charges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wms_settings_tenant_id_key" ON "wms_settings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "wms_items_tenant_id_code_key" ON "wms_items"("tenant_id", "code");
CREATE INDEX "wms_items_tenant_id_deleted_at_idx" ON "wms_items"("tenant_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "wms_asns_tenant_id_asn_number_key" ON "wms_asns"("tenant_id", "asn_number");
CREATE INDEX "wms_asns_tenant_id_status_idx" ON "wms_asns"("tenant_id", "status");
CREATE INDEX "wms_asns_tenant_id_warehouse_id_idx" ON "wms_asns"("tenant_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "wms_asn_lines_tenant_id_asn_id_idx" ON "wms_asn_lines"("tenant_id", "asn_id");

-- CreateIndex
CREATE UNIQUE INDEX "wms_grns_tenant_id_grn_number_key" ON "wms_grns"("tenant_id", "grn_number");
CREATE INDEX "wms_grns_tenant_id_status_idx" ON "wms_grns"("tenant_id", "status");
CREATE INDEX "wms_grns_tenant_id_warehouse_id_idx" ON "wms_grns"("tenant_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "wms_grn_lines_tenant_id_grn_id_idx" ON "wms_grn_lines"("tenant_id", "grn_id");

-- CreateIndex
CREATE UNIQUE INDEX "wms_gdos_tenant_id_gdo_number_key" ON "wms_gdos"("tenant_id", "gdo_number");
CREATE INDEX "wms_gdos_tenant_id_status_idx" ON "wms_gdos"("tenant_id", "status");
CREATE INDEX "wms_gdos_tenant_id_warehouse_id_idx" ON "wms_gdos"("tenant_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "wms_gdo_lines_tenant_id_gdo_id_idx" ON "wms_gdo_lines"("tenant_id", "gdo_id");

-- CreateIndex
CREATE UNIQUE INDEX "wms_stock_lots_grn_line_id_key" ON "wms_stock_lots"("grn_line_id");
CREATE INDEX "wms_stock_lots_tenant_id_warehouse_id_item_id_idx" ON "wms_stock_lots"("tenant_id", "warehouse_id", "item_id");
CREATE INDEX "wms_stock_lots_tenant_id_item_id_received_at_idx" ON "wms_stock_lots"("tenant_id", "item_id", "received_at");
CREATE INDEX "wms_stock_lots_tenant_id_party_id_idx" ON "wms_stock_lots"("tenant_id", "party_id");

-- CreateIndex
CREATE INDEX "wms_stock_movements_tenant_id_warehouse_id_item_id_idx" ON "wms_stock_movements"("tenant_id", "warehouse_id", "item_id");
CREATE INDEX "wms_stock_movements_tenant_id_moved_at_idx" ON "wms_stock_movements"("tenant_id", "moved_at");
CREATE INDEX "wms_stock_movements_tenant_id_reference_type_reference_id_idx" ON "wms_stock_movements"("tenant_id", "reference_type", "reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "wms_stock_transfers_tenant_id_transfer_number_key" ON "wms_stock_transfers"("tenant_id", "transfer_number");
CREATE INDEX "wms_stock_transfers_tenant_id_status_idx" ON "wms_stock_transfers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "wms_stock_transfer_lines_tenant_id_transfer_id_idx" ON "wms_stock_transfer_lines"("tenant_id", "transfer_id");

-- CreateIndex
CREATE INDEX "wms_storage_charges_tenant_id_party_id_status_idx" ON "wms_storage_charges"("tenant_id", "party_id", "status");
CREATE INDEX "wms_storage_charges_tenant_id_warehouse_id_idx" ON "wms_storage_charges"("tenant_id", "warehouse_id");

-- AddForeignKey
ALTER TABLE "wms_asns" ADD CONSTRAINT "wms_asns_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_asn_lines" ADD CONSTRAINT "wms_asn_lines_asn_id_fkey" FOREIGN KEY ("asn_id") REFERENCES "wms_asns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wms_asn_lines" ADD CONSTRAINT "wms_asn_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "wms_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_grns" ADD CONSTRAINT "wms_grns_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wms_grns" ADD CONSTRAINT "wms_grns_asn_id_fkey" FOREIGN KEY ("asn_id") REFERENCES "wms_asns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_grn_lines" ADD CONSTRAINT "wms_grn_lines_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "wms_grns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wms_grn_lines" ADD CONSTRAINT "wms_grn_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "wms_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_gdos" ADD CONSTRAINT "wms_gdos_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_gdo_lines" ADD CONSTRAINT "wms_gdo_lines_gdo_id_fkey" FOREIGN KEY ("gdo_id") REFERENCES "wms_gdos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wms_gdo_lines" ADD CONSTRAINT "wms_gdo_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "wms_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_stock_lots" ADD CONSTRAINT "wms_stock_lots_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wms_stock_lots" ADD CONSTRAINT "wms_stock_lots_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "wms_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wms_stock_lots" ADD CONSTRAINT "wms_stock_lots_grn_line_id_fkey" FOREIGN KEY ("grn_line_id") REFERENCES "wms_grn_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_stock_movements" ADD CONSTRAINT "wms_stock_movements_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wms_stock_movements" ADD CONSTRAINT "wms_stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "wms_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wms_stock_movements" ADD CONSTRAINT "wms_stock_movements_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "wms_stock_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_stock_transfers" ADD CONSTRAINT "wms_stock_transfers_from_warehouse_id_fkey" FOREIGN KEY ("from_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wms_stock_transfers" ADD CONSTRAINT "wms_stock_transfers_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_stock_transfer_lines" ADD CONSTRAINT "wms_stock_transfer_lines_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "wms_stock_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wms_stock_transfer_lines" ADD CONSTRAINT "wms_stock_transfer_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "wms_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_storage_charges" ADD CONSTRAINT "wms_storage_charges_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wms_storage_charges" ADD CONSTRAINT "wms_storage_charges_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "wms_stock_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "wms_storage_charges" ADD CONSTRAINT "wms_storage_charges_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS
SELECT enable_rls_for_table('wms_settings');
SELECT enable_rls_for_table('wms_items');
SELECT enable_rls_for_table('wms_asns');
SELECT enable_rls_for_table('wms_asn_lines');
SELECT enable_rls_for_table('wms_grns');
SELECT enable_rls_for_table('wms_grn_lines');
SELECT enable_rls_for_table('wms_gdos');
SELECT enable_rls_for_table('wms_gdo_lines');
SELECT enable_rls_for_table('wms_stock_lots');
SELECT enable_rls_for_table('wms_stock_movements');
SELECT enable_rls_for_table('wms_stock_transfers');
SELECT enable_rls_for_table('wms_stock_transfer_lines');
SELECT enable_rls_for_table('wms_storage_charges');
