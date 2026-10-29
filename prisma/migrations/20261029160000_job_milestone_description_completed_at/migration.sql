ALTER TABLE "job_milestones"
ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "job_milestones"
ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMPTZ;

UPDATE "job_milestones"
SET "description" = COALESCE("description", "notes")
WHERE "description" IS NULL
  AND "notes" IS NOT NULL;

UPDATE "job_milestones"
SET "completed_at" = ("actual_date"::timestamp AT TIME ZONE 'UTC')
WHERE "completed_at" IS NULL
  AND "actual_date" IS NOT NULL;