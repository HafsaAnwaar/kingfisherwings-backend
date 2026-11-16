-- Job reopen approval workflow (staff request → Tenant Admin decide).
CREATE TYPE "JobReopenRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "job_reopen_requests" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "target_status" "JobStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "status" "JobReopenRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" UUID,
    "review_notes" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "job_reopen_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "job_reopen_requests_tenant_id_status_idx" ON "job_reopen_requests"("tenant_id", "status");
CREATE INDEX "job_reopen_requests_tenant_id_job_id_status_idx" ON "job_reopen_requests"("tenant_id", "job_id", "status");

ALTER TABLE "job_reopen_requests"
  ADD CONSTRAINT "job_reopen_requests_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "jobs_tenant_id_department_id_idx" ON "jobs"("tenant_id", "department_id");
CREATE INDEX IF NOT EXISTS "jobs_tenant_id_ops_user_id_idx" ON "jobs"("tenant_id", "ops_user_id");

-- At most one PENDING reopen request per job (partial unique).
CREATE UNIQUE INDEX "job_reopen_requests_one_pending_per_job"
  ON "job_reopen_requests"("tenant_id", "job_id")
  WHERE "status" = 'PENDING';
