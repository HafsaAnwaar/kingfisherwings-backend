-- Documentation Phase 1: PortNet reference on jobs
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "portnet_ref_no" VARCHAR(50);
