-- jobs.tracking_token was NOT NULL without a column DEFAULT, so Prisma INSERTs
-- that omit the field (relying on @default(dbgenerated(...))) hit a null violation.

ALTER TABLE "jobs"
  ALTER COLUMN "tracking_token" SET DEFAULT replace(gen_random_uuid()::text, '-', '');
