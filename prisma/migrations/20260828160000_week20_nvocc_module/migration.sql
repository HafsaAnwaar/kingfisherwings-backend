-- Week 20 — NVOCC (Vessel Voyage Master · Enquiries · Bookings · Load List · Jobs)

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'NVOCC_LOAD_LIST';

ALTER TYPE "DocumentNumberType" ADD VALUE IF NOT EXISTS 'NVOCC_VOYAGE';
ALTER TYPE "DocumentNumberType" ADD VALUE IF NOT EXISTS 'NVOCC_ENQUIRY';
ALTER TYPE "DocumentNumberType" ADD VALUE IF NOT EXISTS 'NVOCC_BOOKING';

CREATE TYPE "NvoccVoyageStatus" AS ENUM ('OPEN', 'FULL', 'SAILED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "NvoccCargoType" AS ENUM ('FCL', 'LCL');
CREATE TYPE "NvoccEnquiryStatus" AS ENUM ('NEW', 'RATE_SENT', 'ACCEPTED', 'CONVERTED', 'LOST', 'CANCELLED');
CREATE TYPE "NvoccBookingStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED', 'CONVERTED');
CREATE TYPE "NvoccLoadListCargoStatus" AS ENUM ('PENDING', 'RECEIVED_AT_CFS', 'STUFFED', 'LOADED_ON_VESSEL', 'MANIFESTED');
CREATE TYPE "NvoccHblStatus" AS ENUM ('DRAFT', 'ORIGINAL', 'SURRENDERED', 'RELEASED');
CREATE TYPE "NvoccTariffCommodityType" AS ENUM ('GENERAL', 'DG', 'REEFER', 'OOG');
CREATE TYPE "NvoccTariffStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "nvocc_voyages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "voyage_number" VARCHAR(40) NOT NULL,
    "vessel_id" UUID,
    "shipping_line_id" UUID,
    "pol_id" UUID,
    "pod_id" UUID,
    "transshipment_port_id" UUID,
    "etd" TIMESTAMPTZ,
    "eta" TIMESTAMPTZ,
    "si_cutoff" TIMESTAMPTZ,
    "vgm_cutoff" TIMESTAMPTZ,
    "cy_cutoff" TIMESTAMPTZ,
    "cargo_cutoff" TIMESTAMPTZ,
    "slot_allocation_containers" INTEGER NOT NULL DEFAULT 0,
    "fcl_booked_containers" INTEGER NOT NULL DEFAULT 0,
    "lcl_capacity_cbm" DECIMAL(10,3),
    "lcl_booked_cbm" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "voyage_status" "NvoccVoyageStatus" NOT NULL DEFAULT 'OPEN',
    "mbl_number" VARCHAR(50),
    "nvocc_freight_rate" DECIMAL(18,4),
    "carrier_cost" DECIMAL(18,4),
    "agent_pol_id" UUID,
    "agent_pod_id" UUID,
    "published_at" TIMESTAMPTZ,
    "closed_at" TIMESTAMPTZ,
    "sailed_at" TIMESTAMPTZ,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "nvocc_voyages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvocc_voyages_tenant_id_voyage_number_key" ON "nvocc_voyages"("tenant_id", "voyage_number");
CREATE INDEX "nvocc_voyages_tenant_id_idx" ON "nvocc_voyages"("tenant_id");
CREATE INDEX "nvocc_voyages_tenant_id_voyage_status_idx" ON "nvocc_voyages"("tenant_id", "voyage_status");
CREATE INDEX "nvocc_voyages_tenant_id_etd_idx" ON "nvocc_voyages"("tenant_id", "etd");

CREATE TABLE "nvocc_enquiries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "enquiry_number" VARCHAR(40) NOT NULL,
    "enquiry_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID,
    "voyage_id" UUID,
    "cargo_type" "NvoccCargoType",
    "container_type_id" UUID,
    "container_count" INTEGER,
    "cbm" DECIMAL(10,3),
    "gross_weight" DECIMAL(12,3),
    "pieces" INTEGER,
    "commodity" VARCHAR(500),
    "hs_code" VARCHAR(12),
    "incoterms" VARCHAR(10),
    "freight_terms" VARCHAR(30),
    "rate_quoted" DECIMAL(18,4),
    "rate_validity" DATE,
    "enquiry_status" "NvoccEnquiryStatus" NOT NULL DEFAULT 'NEW',
    "loss_reason" VARCHAR(100),
    "salesperson_id" UUID,
    "follow_up_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "nvocc_enquiries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvocc_enquiries_tenant_id_enquiry_number_key" ON "nvocc_enquiries"("tenant_id", "enquiry_number");
CREATE INDEX "nvocc_enquiries_tenant_id_idx" ON "nvocc_enquiries"("tenant_id");
CREATE INDEX "nvocc_enquiries_tenant_id_enquiry_status_idx" ON "nvocc_enquiries"("tenant_id", "enquiry_status");
CREATE INDEX "nvocc_enquiries_tenant_id_voyage_id_idx" ON "nvocc_enquiries"("tenant_id", "voyage_id");

ALTER TABLE "nvocc_enquiries"
    ADD CONSTRAINT "nvocc_enquiries_voyage_id_fkey"
    FOREIGN KEY ("voyage_id") REFERENCES "nvocc_voyages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "nvocc_bookings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "booking_number" VARCHAR(40) NOT NULL,
    "booking_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voyage_id" UUID NOT NULL,
    "enquiry_id" UUID,
    "shipper_id" UUID,
    "consignee_id" UUID,
    "notify_id" UUID,
    "agent_pol_id" UUID,
    "agent_pod_id" UUID,
    "cargo_type" "NvoccCargoType" NOT NULL,
    "container_type_id" UUID,
    "container_count" INTEGER,
    "cbm_allocated" DECIMAL(10,3),
    "gross_weight" DECIMAL(12,3),
    "pieces" INTEGER,
    "commodity" VARCHAR(500),
    "hs_code" VARCHAR(12),
    "is_dg" BOOLEAN NOT NULL DEFAULT false,
    "dg_un_number" VARCHAR(20),
    "dg_class" VARCHAR(20),
    "dg_packing_group" VARCHAR(10),
    "marks_numbers" TEXT,
    "incoterms" VARCHAR(10),
    "freight_terms" VARCHAR(30),
    "other_charges_terms" VARCHAR(30),
    "nvocc_hbl_number" VARCHAR(50),
    "shipper_ref" VARCHAR(100),
    "booking_status" "NvoccBookingStatus" NOT NULL DEFAULT 'DRAFT',
    "job_type" "JobType" NOT NULL DEFAULT 'NVOCC_EXPORT',
    "converted_job_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "nvocc_bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvocc_bookings_tenant_id_booking_number_key" ON "nvocc_bookings"("tenant_id", "booking_number");
CREATE INDEX "nvocc_bookings_tenant_id_idx" ON "nvocc_bookings"("tenant_id");
CREATE INDEX "nvocc_bookings_tenant_id_voyage_id_idx" ON "nvocc_bookings"("tenant_id", "voyage_id");
CREATE INDEX "nvocc_bookings_tenant_id_booking_status_idx" ON "nvocc_bookings"("tenant_id", "booking_status");
CREATE INDEX "nvocc_bookings_tenant_id_nvocc_hbl_number_idx" ON "nvocc_bookings"("tenant_id", "nvocc_hbl_number");

ALTER TABLE "nvocc_bookings"
    ADD CONSTRAINT "nvocc_bookings_voyage_id_fkey"
    FOREIGN KEY ("voyage_id") REFERENCES "nvocc_voyages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "nvocc_bookings"
    ADD CONSTRAINT "nvocc_bookings_enquiry_id_fkey"
    FOREIGN KEY ("enquiry_id") REFERENCES "nvocc_enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "nvocc_booking_charges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "charge_code_id" UUID,
    "description" VARCHAR(200) NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "is_cost" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "nvocc_booking_charges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nvocc_booking_charges_tenant_id_idx" ON "nvocc_booking_charges"("tenant_id");
CREATE INDEX "nvocc_booking_charges_tenant_id_booking_id_idx" ON "nvocc_booking_charges"("tenant_id", "booking_id");

ALTER TABLE "nvocc_booking_charges"
    ADD CONSTRAINT "nvocc_booking_charges_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "nvocc_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "nvocc_load_list" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "voyage_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "container_number" VARCHAR(20),
    "seal_number" VARCHAR(30),
    "container_type_id" UUID,
    "pieces" INTEGER,
    "gross_weight_kg" DECIMAL(12,3),
    "cbm" DECIMAL(10,3),
    "commodity" VARCHAR(500),
    "marks_numbers" TEXT,
    "hbl_number" VARCHAR(50),
    "agent_pol_id" UUID,
    "freight_terms" VARCHAR(30),
    "cargo_status" "NvoccLoadListCargoStatus" NOT NULL DEFAULT 'PENDING',
    "cargo_received_date" TIMESTAMPTZ,
    "stuffing_date" TIMESTAMPTZ,
    "vessel_loaded_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "nvocc_load_list_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nvocc_load_list_tenant_id_idx" ON "nvocc_load_list"("tenant_id");
CREATE INDEX "nvocc_load_list_tenant_id_voyage_id_idx" ON "nvocc_load_list"("tenant_id", "voyage_id");
CREATE INDEX "nvocc_load_list_tenant_id_booking_id_idx" ON "nvocc_load_list"("tenant_id", "booking_id");

ALTER TABLE "nvocc_load_list"
    ADD CONSTRAINT "nvocc_load_list_voyage_id_fkey"
    FOREIGN KEY ("voyage_id") REFERENCES "nvocc_voyages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nvocc_load_list"
    ADD CONSTRAINT "nvocc_load_list_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "nvocc_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "nvocc_job_details" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "voyage_id" UUID,
    "booking_id" UUID,
    "hbl_number" VARCHAR(50),
    "hbl_issued_date" TIMESTAMPTZ,
    "hbl_status" "NvoccHblStatus" NOT NULL DEFAULT 'DRAFT',
    "mbl_number" VARCHAR(50),
    "mbl_received_date" TIMESTAMPTZ,
    "carrier_booking_ref" VARCHAR(100),
    "stuffing_report_ref" VARCHAR(100),
    "pre_alert_sent_at" TIMESTAMPTZ,
    "can_sent_at" TIMESTAMPTZ,
    "do_issued_at" TIMESTAMPTZ,
    "pod_received_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "nvocc_job_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvocc_job_details_job_id_key" ON "nvocc_job_details"("job_id");
CREATE UNIQUE INDEX "nvocc_job_details_booking_id_key" ON "nvocc_job_details"("booking_id");
CREATE INDEX "nvocc_job_details_tenant_id_idx" ON "nvocc_job_details"("tenant_id");
CREATE INDEX "nvocc_job_details_tenant_id_hbl_number_idx" ON "nvocc_job_details"("tenant_id", "hbl_number");

ALTER TABLE "nvocc_job_details"
    ADD CONSTRAINT "nvocc_job_details_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nvocc_job_details"
    ADD CONSTRAINT "nvocc_job_details_voyage_id_fkey"
    FOREIGN KEY ("voyage_id") REFERENCES "nvocc_voyages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "nvocc_job_details"
    ADD CONSTRAINT "nvocc_job_details_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "nvocc_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "nvocc_tariffs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "trade_lane" VARCHAR(200) NOT NULL,
    "pol_region" VARCHAR(100),
    "pod_region" VARCHAR(100),
    "origin_port_id" UUID,
    "dest_port_id" UUID,
    "commodity_type" "NvoccTariffCommodityType" NOT NULL DEFAULT 'GENERAL',
    "container_type_id" UUID,
    "lcl_rate_cbm" DECIMAL(18,4),
    "lcl_rate_wm" DECIMAL(18,4),
    "lcl_minimum_charge" DECIMAL(18,4),
    "fcl_rate" DECIMAL(18,4),
    "origin_thc" DECIMAL(18,4),
    "dest_thc" DECIMAL(18,4),
    "bl_fee" DECIMAL(18,4),
    "baf_surcharge" DECIMAL(18,4),
    "caf_surcharge" DECIMAL(18,4),
    "pss_surcharge" DECIMAL(18,4),
    "gri_surcharge" DECIMAL(18,4),
    "rate_valid_from" DATE NOT NULL,
    "rate_valid_to" DATE,
    "customer_id" UUID,
    "currency_code" CHAR(3) NOT NULL,
    "status" "NvoccTariffStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "nvocc_tariffs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nvocc_tariffs_tenant_id_idx" ON "nvocc_tariffs"("tenant_id");
CREATE INDEX "nvocc_tariffs_tenant_id_status_idx" ON "nvocc_tariffs"("tenant_id", "status");
CREATE INDEX "nvocc_tariffs_tenant_id_origin_port_id_dest_port_id_idx" ON "nvocc_tariffs"("tenant_id", "origin_port_id", "dest_port_id");
CREATE INDEX "nvocc_tariffs_tenant_id_customer_id_idx" ON "nvocc_tariffs"("tenant_id", "customer_id");

SELECT enable_rls_for_table('nvocc_voyages');
SELECT enable_rls_for_table('nvocc_enquiries');
SELECT enable_rls_for_table('nvocc_bookings');
SELECT enable_rls_for_table('nvocc_booking_charges');
SELECT enable_rls_for_table('nvocc_load_list');
SELECT enable_rls_for_table('nvocc_job_details');
SELECT enable_rls_for_table('nvocc_tariffs');
