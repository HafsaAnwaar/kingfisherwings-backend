-- Customer outcome: WON -> APPROVED, LOST -> DISAPPROVED
-- Internal staff approval: previous APPROVED -> INTERNALLY_APPROVED
-- Add new values first; do not drop WON/LOST (PostgreSQL cannot drop enum values easily).

ALTER TYPE "QuotationStatus" ADD VALUE IF NOT EXISTS 'INTERNALLY_APPROVED';
ALTER TYPE "QuotationStatus" ADD VALUE IF NOT EXISTS 'DISAPPROVED';
