-- Week 19 — Land / Trucking + Courier (Ch.14–15)

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CROSS_BORDER_DECLARATION';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CUSTOMS_TRANSIT';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'DELIVERY_NOTE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'COURIER_REPORT';

ALTER TYPE "DocumentNumberType" ADD VALUE IF NOT EXISTS 'TRANSPORT_REQUEST';

ALTER TYPE "DocumentNumberType" ADD VALUE IF NOT EXISTS 'TRASPORT_REQUEST';

CREATE TYPE "LandVehicleType" AS ENUM ('TRUCK', 'TRAILER', 'VAN');
CREATE TYPE "CourierServiceType" AS ENUM ('EXPRESS', 'STANDARD', 'ECONOMY');
CREATE TYPE "CourierLabelFormat" AS ENUM ('A4_4UP', 'A4_6UP', 'A4_8UP', 'THERMAL');
CREATE TYPE "TransportRequestType" AS ENUM ('PICKUP', 'DELIVERY');
CREATE TYPE "TransportRequestStatus" AS ENUM (
  'CREATED',
  'ASSIGNED',
  'PICKUP_CONFIRMED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED'
);

CREATE TABLE "courier_vendors" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "country_code" CHAR(2),
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "tracking_url_template" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "courier_vendors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "courier_vendors_tenant_id_code_key" ON "courier_vendors"("tenant_id", "code");
CREATE INDEX "courier_vendors_tenant_id_idx" ON "courier_vendors"("tenant_id");

CREATE TABLE "land_job_details" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "trucker_id" UUID,
    "vehicle_type" "LandVehicleType",
    "vehicle_number" VARCHAR(40),
    "driver_name" VARCHAR(200),
    "driver_license" VARCHAR(50),
    "origin_city_country" VARCHAR(200),
    "destination_city_country" VARCHAR(200),
    "etd" TIMESTAMPTZ,
    "eta" TIMESTAMPTZ,
    "incoterms" VARCHAR(10),
    "freight_terms" VARCHAR(30),
    "cross_border_docs_required" BOOLEAN NOT NULL DEFAULT false,
    "border_origin_country" CHAR(2),
    "border_destination_country" CHAR(2),
    "border_declaration_number" VARCHAR(100),
    "border_commodity" VARCHAR(500),
    "border_hs_code" VARCHAR(12),
    "border_declared_value" DECIMAL(18,4),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "land_job_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "land_job_details_job_id_key" ON "land_job_details"("job_id");
CREATE INDEX "land_job_details_tenant_id_idx" ON "land_job_details"("tenant_id");
CREATE INDEX "land_job_details_tenant_id_vehicle_number_idx" ON "land_job_details"("tenant_id", "vehicle_number");

ALTER TABLE "land_job_details"
    ADD CONSTRAINT "land_job_details_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "land_job_details"
    ADD CONSTRAINT "land_job_details_trucker_id_fkey"
    FOREIGN KEY ("trucker_id") REFERENCES "truckers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "courier_job_details" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "courier_vendor_id" UUID,
    "service_type" "CourierServiceType",
    "tracking_number" VARCHAR(80),
    "barcode_value" VARCHAR(80),
    "length_cm" DECIMAL(10,2),
    "width_cm" DECIMAL(10,2),
    "height_cm" DECIMAL(10,2),
    "pickup_address" TEXT,
    "delivery_address" TEXT,
    "label_format" "CourierLabelFormat",
    "linked_export_job_id" UUID,
    "linked_import_job_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "courier_job_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "courier_job_details_job_id_key" ON "courier_job_details"("job_id");
CREATE INDEX "courier_job_details_tenant_id_idx" ON "courier_job_details"("tenant_id");
CREATE INDEX "courier_job_details_tenant_id_tracking_number_idx" ON "courier_job_details"("tenant_id", "tracking_number");
CREATE INDEX "courier_job_details_tenant_id_barcode_value_idx" ON "courier_job_details"("tenant_id", "barcode_value");

ALTER TABLE "courier_job_details"
    ADD CONSTRAINT "courier_job_details_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "courier_job_details"
    ADD CONSTRAINT "courier_job_details_courier_vendor_id_fkey"
    FOREIGN KEY ("courier_vendor_id") REFERENCES "courier_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "transport_requests" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "request_number" VARCHAR(40) NOT NULL,
    "request_type" "TransportRequestType" NOT NULL,
    "status" "TransportRequestStatus" NOT NULL DEFAULT 'CREATED',
    "pickup_address" TEXT,
    "delivery_address" TEXT,
    "scheduled_pickup_datetime" TIMESTAMPTZ,
    "scheduled_delivery_datetime" TIMESTAMPTZ,
    "actual_pickup_datetime" TIMESTAMPTZ,
    "actual_delivery_datetime" TIMESTAMPTZ,
    "assigned_trucker_id" UUID,
    "vehicle_type" "LandVehicleType",
    "vehicle_number" VARCHAR(40),
    "driver_name" VARCHAR(200),
    "driver_license" VARCHAR(50),
    "cargo_details" TEXT,
    "distance_km" DECIMAL(10,2),
    "zip_distance_id" UUID,
    "transport_cost_amount" DECIMAL(18,4),
    "job_charge_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "transport_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "transport_requests_tenant_id_request_number_key" ON "transport_requests"("tenant_id", "request_number");
CREATE UNIQUE INDEX "transport_requests_job_charge_id_key" ON "transport_requests"("job_charge_id");
CREATE INDEX "transport_requests_tenant_id_idx" ON "transport_requests"("tenant_id");
CREATE INDEX "transport_requests_tenant_id_job_id_idx" ON "transport_requests"("tenant_id", "job_id");
CREATE INDEX "transport_requests_tenant_id_status_idx" ON "transport_requests"("tenant_id", "status");

ALTER TABLE "transport_requests"
    ADD CONSTRAINT "transport_requests_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transport_requests"
    ADD CONSTRAINT "transport_requests_assigned_trucker_id_fkey"
    FOREIGN KEY ("assigned_trucker_id") REFERENCES "truckers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transport_requests"
    ADD CONSTRAINT "transport_requests_zip_distance_id_fkey"
    FOREIGN KEY ("zip_distance_id") REFERENCES "zip_distances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transport_requests"
    ADD CONSTRAINT "transport_requests_zip_distance_id_fkey"
    FOREIGN KEY ("zip_distance_id") REFERENCES "zip_distances"("id") ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE "transport_requests"
    ADD CONSTRAINT "transport_requests_job_charge_id_fkey"
    FOREIGN KEY ("job_charge_id") REFERENCES "job_charges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "courier_delivery_checkpoints" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "checkpoint" VARCHAR(100) NOT NULL,
    "scanned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barcode_scanned" VARCHAR(80),
    "location" VARCHAR(200),
    "notes" TEXT,
    "scanned_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "courier_delivery_checkpoints_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "courier_delivery_checkpoints_tenant_id_idx" ON "courier_delivery_checkpoints"("tenant_id");
CREATE INDEX "courier_delivery_checkpoints_tenant_id_job_id_idx" ON "courier_delivery_checkpoints"("tenant_id", "job_id");

CREATE INDEX "courier_delievry_checkpoints_tenant_id_idx" ON "courier_delievery_checkpoints"("tenant_id");
CREATE INDEX "courier_delievery_checkpoints_tenant_id_idx" ON "courier_delievery_checkpoints"("tenant_id", "job_id");

ALTER TABLE "courier_delivery_checkpoints"
    ADD CONSTRAINT "courier_delivery_checkpoints_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

SELECT enable_rls_for_table('courier_vendors');
SELECT enable_rls_for_table('land_job_details');
SELECT enable_rls_for_table('courier_job_details');
SELECT enable_rls_for_table('transport_requests');
SELECT enable_rls_for_table('courier_delivery_checkpoints');
SELECT enable_rls_for_table('courier_vendors');
SELECT enable_rls_for_table('land_job_details');
SELECT enable_rls_for_table('courier_job_details');
SELECT enable_rls_for_table('transport_requests');
SELECT enable_rls_for_table('courier_delievery_checkpoints');
SELECT enable_rls_for_table('courier_vendors');
SELECT enable_rls_for_table('land_job_details');
SELECT enable_rls_for_table('courier_job_details');
SELECT enable_rls_for_table('transport_requests');
SELECT enable_rls_for_table('courier_delievery_service');


