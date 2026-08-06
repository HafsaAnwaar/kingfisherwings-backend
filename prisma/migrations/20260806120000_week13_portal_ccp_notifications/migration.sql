-- Week 13 remaining: messages, disputes, credit-limit requests, notifications + RLS

CREATE TYPE "PortalDisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');
CREATE TYPE "CreditLimitRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "NotificationType" AS ENUM (
  'INVOICE_OVERDUE',
  'JOB_MILESTONE_UPDATED',
  'QUOTATION_APPROVED',
  'QUOTATION_REJECTED',
  'PAYMENT_RECEIVED',
  'PDC_MATURITY_APPROACHING',
  'DOCUMENT_EXPIRY',
  'CREDIT_LIMIT_EXCEEDED',
  'PORTAL_MESSAGE',
  'PORTAL_DISPUTE',
  'CREDIT_LIMIT_REQUEST',
  'QUOTATION_REQUEST'
);

CREATE TABLE "portal_messages" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "portal_user_id" UUID NOT NULL,
  "subject" VARCHAR(200) NOT NULL,
  "body" TEXT NOT NULL,
  "job_id" UUID,
  "invoice_id" UUID,
  "attachment_path" VARCHAR(500),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "read_by_staff_at" TIMESTAMPTZ,
  CONSTRAINT "portal_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "portal_messages_tenant_id_party_id_created_at_idx"
  ON "portal_messages"("tenant_id", "party_id", "created_at");
CREATE INDEX "portal_messages_tenant_id_read_by_staff_at_idx"
  ON "portal_messages"("tenant_id", "read_by_staff_at");

ALTER TABLE "portal_messages"
  ADD CONSTRAINT "portal_messages_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portal_messages"
  ADD CONSTRAINT "portal_messages_portal_user_id_fkey"
  FOREIGN KEY ("portal_user_id") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "portal_disputes" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "portal_user_id" UUID NOT NULL,
  "invoice_id" UUID NOT NULL,
  "reason" VARCHAR(200) NOT NULL,
  "description" TEXT NOT NULL,
  "attachment_path" VARCHAR(500),
  "status" "PortalDisputeStatus" NOT NULL DEFAULT 'OPEN',
  "staff_notes" TEXT,
  "resolved_at" TIMESTAMPTZ,
  "resolved_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "portal_disputes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "portal_disputes_tenant_id_party_id_status_idx"
  ON "portal_disputes"("tenant_id", "party_id", "status");
CREATE INDEX "portal_disputes_tenant_id_invoice_id_idx"
  ON "portal_disputes"("tenant_id", "invoice_id");

ALTER TABLE "portal_disputes"
  ADD CONSTRAINT "portal_disputes_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portal_disputes"
  ADD CONSTRAINT "portal_disputes_portal_user_id_fkey"
  FOREIGN KEY ("portal_user_id") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "credit_limit_requests" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "portal_user_id" UUID NOT NULL,
  "requested_limit" DECIMAL(18,2) NOT NULL,
  "current_limit" DECIMAL(18,2),
  "justification" TEXT NOT NULL,
  "status" "CreditLimitRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewed_by" UUID,
  "reviewed_at" TIMESTAMPTZ,
  "review_notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "credit_limit_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "credit_limit_requests_tenant_id_party_id_status_idx"
  ON "credit_limit_requests"("tenant_id", "party_id", "status");

ALTER TABLE "credit_limit_requests"
  ADD CONSTRAINT "credit_limit_requests_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "credit_limit_requests"
  ADD CONSTRAINT "credit_limit_requests_portal_user_id_fkey"
  FOREIGN KEY ("portal_user_id") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "user_id" UUID,
  "portal_user_id" UUID,
  "type" "NotificationType" NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "message" TEXT NOT NULL,
  "entity_type" VARCHAR(50),
  "entity_id" UUID,
  "link_path" VARCHAR(500),
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_tenant_id_user_id_is_read_created_at_idx"
  ON "notifications"("tenant_id", "user_id", "is_read", "created_at");
CREATE INDEX "notifications_tenant_id_portal_user_id_is_read_created_at_idx"
  ON "notifications"("tenant_id", "portal_user_id", "is_read", "created_at");
CREATE INDEX "notifications_tenant_id_type_idx"
  ON "notifications"("tenant_id", "type");

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_portal_user_id_fkey"
  FOREIGN KEY ("portal_user_id") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

SELECT enable_rls_for_table('portal_messages');
SELECT enable_rls_for_table('portal_disputes');
SELECT enable_rls_for_table('credit_limit_requests');
SELECT enable_rls_for_table('notifications');
