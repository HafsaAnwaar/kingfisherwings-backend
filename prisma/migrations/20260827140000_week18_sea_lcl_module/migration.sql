-- Week 18 — Sea LCL Export + Import (Ch.12–13)

CREATE TABLE "sea_lcl_job_details" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "shipping_line_id" UUID,
    "vessel_id" UUID,
    "voyage_number" VARCHAR(50),
    "hbl_number" VARCHAR(50),
    "mbl_number" VARCHAR(50),
    "booking_number" VARCHAR(50),
    "carrier_booking_ref" VARCHAR(50),
    "place_of_receipt" VARCHAR(200),
    "place_of_delivery" VARCHAR(200),
    "etd" TIMESTAMPTZ,
    "eta" TIMESTAMPTZ,
    "sailed_at" TIMESTAMPTZ,
    "port_of_loading_id" UUID,
    "port_of_discharge_id" UUID,
    "incoterms" VARCHAR(10),
    "bl_type" VARCHAR(30),
    "freight_terms" VARCHAR(30),
    "transhipment_port" VARCHAR(200),
    "cfs_warehouse_id" UUID,
    "consolidation_number" VARCHAR(50),
    "si_cutoff" TIMESTAMPTZ,
    "si_submitted_at" TIMESTAMPTZ,
    "si_version" INTEGER,
    "mbl_number_from_line" VARCHAR(50),
    "hbl_number_from_agent" VARCHAR(50),
    "actual_eta" TIMESTAMPTZ,
    "customs_entry_number" VARCHAR(100),
    "customs_examination_details" TEXT,
    "customs_duty_amount" DECIMAL(18,4),
    "customs_tax_amount" DECIMAL(18,4),
    "customs_clearance_date" TIMESTAMPTZ,
    "customs_status" "CustomsClearanceStatus" NOT NULL DEFAULT 'PENDING',
    "customs_broker_id" UUID,
    "linked_export_job_id" UUID,
    "cfs_storage_rate_per_day" DECIMAL(18,4),
    "cfs_storage_start_date" DATE,
    "cfs_storage_free_days" INTEGER NOT NULL DEFAULT 0,
    "storage_rate_basis" "StorageRateBasis",
    "storage_invoice_id" UUID,
    "wms_storage_charge_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "sea_lcl_job_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sea_lcl_job_details_job_id_key" ON "sea_lcl_job_details"("job_id");
CREATE INDEX "sea_lcl_job_details_tenant_id_idx" ON "sea_lcl_job_details"("tenant_id");
CREATE INDEX "sea_lcl_job_details_tenant_id_consolidation_number_idx" ON "sea_lcl_job_details"("tenant_id", "consolidation_number");

ALTER TABLE "sea_lcl_job_details"
    ADD CONSTRAINT "sea_lcl_job_details_job_id_fkey"
    FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sea_lcl_job_details"
    ADD CONSTRAINT "sea_lcl_job_details_cfs_warehouse_id_fkey"
    FOREIGN KEY ("cfs_warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sea_lcl_job_details"
    ADD CONSTRAINT "sea_lcl_job_details_storage_invoice_id_fkey"
    FOREIGN KEY ("storage_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sea_lcl_job_details"
    ADD CONSTRAINT "sea_lcl_job_details_wms_storage_charge_id_fkey"
    FOREIGN KEY ("wms_storage_charge_id") REFERENCES "wms_storage_charges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

SELECT enable_rls_for_table('sea_lcl_job_details');
