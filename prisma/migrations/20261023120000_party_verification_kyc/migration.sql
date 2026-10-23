-- Party KYC verification (portal customers + vendor portal users)

CREATE TYPE "PartyVerificationStatus" AS ENUM (
  'NOT_STARTED',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE "PartyVerificationDocKind" AS ENUM (
  'VAT_CERTIFICATE',
  'BUSINESS_LICENSE',
  'OTHER'
);

CREATE TABLE "party_verifications" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "status" "PartyVerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "reviewed_at" TIMESTAMPTZ,
  "reviewed_by" UUID,
  "rejection_reason" TEXT,
  "submitted_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,

  CONSTRAINT "party_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "party_verifications_party_id_key" ON "party_verifications"("party_id");
CREATE INDEX "party_verifications_tenant_id_status_idx" ON "party_verifications"("tenant_id", "status");

ALTER TABLE "party_verifications"
  ADD CONSTRAINT "party_verifications_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "party_verification_documents" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "doc_kind" "PartyVerificationDocKind" NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(100),
  "file_url" TEXT,
  "s3_key" TEXT,
  "file_size" INTEGER,
  "uploaded_by_side" VARCHAR(20) NOT NULL,
  "uploaded_by_user_id" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "deleted_at" TIMESTAMPTZ,

  CONSTRAINT "party_verification_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "party_verification_documents_tenant_id_party_id_idx"
  ON "party_verification_documents"("tenant_id", "party_id");
CREATE INDEX "party_verification_documents_tenant_id_party_id_doc_kind_idx"
  ON "party_verification_documents"("tenant_id", "party_id", "doc_kind");

ALTER TABLE "party_verification_documents"
  ADD CONSTRAINT "party_verification_documents_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vendor_users"
  ADD COLUMN IF NOT EXISTS "must_change_password" BOOLEAN NOT NULL DEFAULT false;
