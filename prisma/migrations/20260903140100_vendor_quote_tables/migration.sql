CREATE TYPE "VendorQuoteStatus" AS ENUM ('SENT', 'PRICED', 'APPROVED', 'DISAPPROVED');

CREATE TABLE "vendor_quotes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "vendor_party_id" UUID NOT NULL,
    "status" "VendorQuoteStatus" NOT NULL DEFAULT 'SENT',
    "currency_code" CHAR(3) NOT NULL DEFAULT 'AED',
    "cost_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vendor_notes" TEXT,
    "staff_notes" TEXT,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priced_at" TIMESTAMPTZ,
    "decided_at" TIMESTAMPTZ,
    "decided_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "vendor_quotes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vendor_quote_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "vendor_quote_id" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vendor_quote_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vendor_quotes_tenant_id_vendor_party_id_idx" ON "vendor_quotes"("tenant_id", "vendor_party_id");
CREATE INDEX "vendor_quotes_tenant_id_job_id_idx" ON "vendor_quotes"("tenant_id", "job_id");
CREATE INDEX "vendor_quotes_tenant_id_status_idx" ON "vendor_quotes"("tenant_id", "status");
CREATE INDEX "vendor_quote_lines_tenant_id_vendor_quote_id_idx" ON "vendor_quote_lines"("tenant_id", "vendor_quote_id");

ALTER TABLE "vendor_quotes" ADD CONSTRAINT "vendor_quotes_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_quotes" ADD CONSTRAINT "vendor_quotes_vendor_party_id_fkey" FOREIGN KEY ("vendor_party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vendor_quote_lines" ADD CONSTRAINT "vendor_quote_lines_vendor_quote_id_fkey" FOREIGN KEY ("vendor_quote_id") REFERENCES "vendor_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
