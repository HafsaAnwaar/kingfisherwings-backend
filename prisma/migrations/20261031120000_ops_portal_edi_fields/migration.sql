-- Job ops identity for show_all / portal / EDI / track
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "rotation_number" VARCHAR(50);
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "primary_container_number" VARCHAR(20);
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "primary_container_status" "ContainerStatus";
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "edi_company_code" VARCHAR(40);
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "vessel_name" VARCHAR(200);
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "voyage_number" VARCHAR(50);
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "line_code" VARCHAR(40);

-- NVOCC portal port-token form + draft BL customer comment
ALTER TABLE "nvocc_job_details" ADD COLUMN IF NOT EXISTS "port_token_form" JSONB;
ALTER TABLE "nvocc_job_details" ADD COLUMN IF NOT EXISTS "draft_bl_customer_comment" TEXT;
