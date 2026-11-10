-- Customs tab: hold / inspection / release fields on job_customs_refs
ALTER TABLE "job_customs_refs"
  ADD COLUMN IF NOT EXISTS "on_hold" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "held_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "inspection_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "inspection_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "released_at" TIMESTAMPTZ;
