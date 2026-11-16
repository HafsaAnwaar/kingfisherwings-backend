-- Stop silent 5% VAT on new invoices/lines (existing rows unchanged).
ALTER TABLE "invoices" ALTER COLUMN "vat_rate" SET DEFAULT 0;
ALTER TABLE "invoice_lines" ALTER COLUMN "is_taxable" SET DEFAULT false;

-- Separate COMPLETED vs CLOSED job lifecycle statuses.
ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'CLOSED';
