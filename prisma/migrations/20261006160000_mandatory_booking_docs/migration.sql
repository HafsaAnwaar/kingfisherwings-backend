-- Mandatory booking documents: invoice, packing list, BL/AWB, licence, UAT/TAX certificate
-- One ADD COLUMN per statement for Postgres compatibility.

ALTER TABLE "nvocc_booking_forms" ADD COLUMN IF NOT EXISTS "attach_packing_list" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "nvocc_booking_forms" ADD COLUMN IF NOT EXISTS "attach_bill_of_lading" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "nvocc_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "nvocc_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "nvocc_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bill_of_lading_key" VARCHAR(500);
ALTER TABLE "nvocc_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);

ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "attach_packing_list" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "attach_bill_of_lading" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bill_of_lading_key" VARCHAR(500);
ALTER TABLE "air_compliance_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);

ALTER TABLE "sea_fcl_booking_forms" ADD COLUMN IF NOT EXISTS "attach_licence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sea_fcl_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sea_fcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_commercial_invoice_key" VARCHAR(500);
ALTER TABLE "sea_fcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "sea_fcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bl_awb_copy_key" VARCHAR(500);
ALTER TABLE "sea_fcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_licence_key" VARCHAR(500);
ALTER TABLE "sea_fcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);

ALTER TABLE "sea_lcl_booking_forms" ADD COLUMN IF NOT EXISTS "attach_licence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sea_lcl_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sea_lcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_commercial_invoice_key" VARCHAR(500);
ALTER TABLE "sea_lcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "sea_lcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bl_awb_copy_key" VARCHAR(500);
ALTER TABLE "sea_lcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_licence_key" VARCHAR(500);
ALTER TABLE "sea_lcl_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);

ALTER TABLE "land_booking_forms" ADD COLUMN IF NOT EXISTS "attach_licence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "land_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "land_booking_forms" ADD COLUMN IF NOT EXISTS "doc_commercial_invoice_key" VARCHAR(500);
ALTER TABLE "land_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "land_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bl_awb_copy_key" VARCHAR(500);
ALTER TABLE "land_booking_forms" ADD COLUMN IF NOT EXISTS "doc_licence_key" VARCHAR(500);
ALTER TABLE "land_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);

ALTER TABLE "road_freight_booking_forms" ADD COLUMN IF NOT EXISTS "attach_licence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "road_freight_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "road_freight_booking_forms" ADD COLUMN IF NOT EXISTS "doc_commercial_invoice_key" VARCHAR(500);
ALTER TABLE "road_freight_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "road_freight_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bl_awb_copy_key" VARCHAR(500);
ALTER TABLE "road_freight_booking_forms" ADD COLUMN IF NOT EXISTS "doc_licence_key" VARCHAR(500);
ALTER TABLE "road_freight_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);

ALTER TABLE "courier_booking_forms" ADD COLUMN IF NOT EXISTS "attach_licence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "courier_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "courier_booking_forms" ADD COLUMN IF NOT EXISTS "doc_commercial_invoice_key" VARCHAR(500);
ALTER TABLE "courier_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "courier_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bl_awb_copy_key" VARCHAR(500);
ALTER TABLE "courier_booking_forms" ADD COLUMN IF NOT EXISTS "doc_licence_key" VARCHAR(500);
ALTER TABLE "courier_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);

ALTER TABLE "customs_clearance_booking_forms" ADD COLUMN IF NOT EXISTS "attach_licence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "customs_clearance_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "customs_clearance_booking_forms" ADD COLUMN IF NOT EXISTS "doc_commercial_invoice_key" VARCHAR(500);
ALTER TABLE "customs_clearance_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "customs_clearance_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bl_awb_copy_key" VARCHAR(500);
ALTER TABLE "customs_clearance_booking_forms" ADD COLUMN IF NOT EXISTS "doc_licence_key" VARCHAR(500);
ALTER TABLE "customs_clearance_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);

ALTER TABLE "warehouse_booking_forms" ADD COLUMN IF NOT EXISTS "attach_licence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "warehouse_booking_forms" ADD COLUMN IF NOT EXISTS "attach_uat_tax_certificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "warehouse_booking_forms" ADD COLUMN IF NOT EXISTS "doc_commercial_invoice_key" VARCHAR(500);
ALTER TABLE "warehouse_booking_forms" ADD COLUMN IF NOT EXISTS "doc_packing_list_key" VARCHAR(500);
ALTER TABLE "warehouse_booking_forms" ADD COLUMN IF NOT EXISTS "doc_bl_awb_copy_key" VARCHAR(500);
ALTER TABLE "warehouse_booking_forms" ADD COLUMN IF NOT EXISTS "doc_licence_key" VARCHAR(500);
ALTER TABLE "warehouse_booking_forms" ADD COLUMN IF NOT EXISTS "doc_uat_tax_certificate_key" VARCHAR(500);
