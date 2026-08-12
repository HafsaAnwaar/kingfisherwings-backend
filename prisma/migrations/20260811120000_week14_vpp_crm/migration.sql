-- Week 14: Vendor Payment Portal + CRM

ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'VENDOR_CREDENTIALS';
ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'VENDOR_INVITE';
ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'CRM_CAMPAIGN';
ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'FOLLOW_UP_REMINDER';

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'VENDOR_INVOICE_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'VENDOR_PAYMENT_POSTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'VENDOR_DISPUTE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'FOLLOW_UP_DUE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'LEAD_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CAMPAIGN_SENT';

ALTER TABLE "parties"
  ADD COLUMN IF NOT EXISTS "vendor_portal_access" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "VendorUserStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');
CREATE TYPE "VendorDocumentType" AS ENUM ('PURCHASE_INVOICE', 'REMITTANCE', 'CREDIT_NOTE', 'STATEMENT', 'TDS_CERTIFICATE');
CREATE TYPE "LeadSource" AS ENUM ('REFERRAL', 'COLD_CALL', 'EMAIL', 'EXHIBITION', 'WEBSITE', 'OTHER');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'ON_HOLD');
CREATE TYPE "LeadPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "CallType" AS ENUM ('VISIT', 'PHONE', 'VIDEO', 'EMAIL');
CREATE TYPE "CallPurpose" AS ENUM ('PROSPECTING', 'FOLLOW_UP', 'COMPLAINT', 'RENEWAL', 'INTRODUCTION');
CREATE TYPE "CallOutcome" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'QUOTATION_REQUESTED', 'COMPLAINT_RESOLVED');
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'QUOTED', 'BOOKED', 'LOST', 'CANCELLED');
CREATE TYPE "BudgetPeriodType" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED');

CREATE TABLE IF NOT EXISTS "vendor_users" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "full_name" VARCHAR(200) NOT NULL,
  "phone" VARCHAR(30),
  "status" "VendorUserStatus" NOT NULL DEFAULT 'ACTIVE',
  "invite_token" VARCHAR(128),
  "invite_expires_at" TIMESTAMPTZ,
  "invited_at" TIMESTAMPTZ,
  "activated_at" TIMESTAMPTZ,
  "last_login_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "vendor_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vendor_users_tenant_id_email_key" ON "vendor_users"("tenant_id", "email");
CREATE UNIQUE INDEX IF NOT EXISTS "vendor_users_invite_token_key" ON "vendor_users"("invite_token");
CREATE INDEX IF NOT EXISTS "vendor_users_tenant_id_party_id_idx" ON "vendor_users"("tenant_id", "party_id");
CREATE INDEX IF NOT EXISTS "vendor_users_tenant_id_status_idx" ON "vendor_users"("tenant_id", "status");

ALTER TABLE "vendor_users"
  ADD CONSTRAINT "vendor_users_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_users"
  ADD CONSTRAINT "vendor_users_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "vendor_sessions" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "vendor_user_id" UUID NOT NULL,
  "jti" VARCHAR(200) NOT NULL,
  "refresh_token_hash" TEXT NOT NULL,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "last_used_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMPTZ,
  "revoked_reason" VARCHAR(100),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendor_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vendor_sessions_jti_key" ON "vendor_sessions"("jti");
CREATE INDEX IF NOT EXISTS "vendor_sessions_vendor_user_id_idx" ON "vendor_sessions"("vendor_user_id");
CREATE INDEX IF NOT EXISTS "vendor_sessions_tenant_id_is_active_idx" ON "vendor_sessions"("tenant_id", "is_active");

ALTER TABLE "vendor_sessions"
  ADD CONSTRAINT "vendor_sessions_vendor_user_id_fkey"
  FOREIGN KEY ("vendor_user_id") REFERENCES "vendor_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "vendor_permissions" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "document_type" "VendorDocumentType" NOT NULL,
  "can_view" BOOLEAN NOT NULL DEFAULT true,
  "can_download" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  CONSTRAINT "vendor_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vendor_permissions_tenant_id_party_id_document_type_key"
  ON "vendor_permissions"("tenant_id", "party_id", "document_type");
CREATE INDEX IF NOT EXISTS "vendor_permissions_tenant_id_party_id_idx" ON "vendor_permissions"("tenant_id", "party_id");

ALTER TABLE "vendor_permissions"
  ADD CONSTRAINT "vendor_permissions_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "vendor_disputes" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "vendor_user_id" UUID NOT NULL,
  "invoice_id" UUID NOT NULL,
  "reason" VARCHAR(200) NOT NULL,
  "description" TEXT NOT NULL,
  "attachment_path" VARCHAR(500),
  "status" "PortalDisputeStatus" NOT NULL DEFAULT 'OPEN',
  "staff_notes" TEXT,
  "resolved_at" TIMESTAMPTZ,
  "resolved_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendor_disputes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "vendor_disputes_tenant_id_party_id_status_idx" ON "vendor_disputes"("tenant_id", "party_id", "status");
CREATE INDEX IF NOT EXISTS "vendor_disputes_tenant_id_invoice_id_idx" ON "vendor_disputes"("tenant_id", "invoice_id");

ALTER TABLE "vendor_disputes"
  ADD CONSTRAINT "vendor_disputes_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_disputes"
  ADD CONSTRAINT "vendor_disputes_vendor_user_id_fkey"
  FOREIGN KEY ("vendor_user_id") REFERENCES "vendor_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "vendor_user_id" UUID;

CREATE INDEX IF NOT EXISTS "notifications_tenant_id_vendor_user_id_is_read_created_at_idx"
  ON "notifications"("tenant_id", "vendor_user_id", "is_read", "created_at");

ALTER TABLE "notifications"
  DROP CONSTRAINT IF EXISTS "notifications_vendor_user_id_fkey";
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_vendor_user_id_fkey"
  FOREIGN KEY ("vendor_user_id") REFERENCES "vendor_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "leads" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "company_name" VARCHAR(300) NOT NULL,
  "contact_name" VARCHAR(200) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(30),
  "potential_volume" VARCHAR(200),
  "service_requirements" TEXT,
  "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "assigned_salesperson_id" UUID,
  "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "converted_party_id" UUID,
  "lost_reason" VARCHAR(300),
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "leads_tenant_id_status_idx" ON "leads"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "leads_tenant_id_assigned_salesperson_id_idx" ON "leads"("tenant_id", "assigned_salesperson_id");
CREATE INDEX IF NOT EXISTS "leads_tenant_id_source_idx" ON "leads"("tenant_id", "source");

ALTER TABLE "leads"
  ADD CONSTRAINT "leads_assigned_salesperson_id_fkey"
  FOREIGN KEY ("assigned_salesperson_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "leads"
  ADD CONSTRAINT "leads_converted_party_id_fkey"
  FOREIGN KEY ("converted_party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "lead_activities" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "lead_id" UUID NOT NULL,
  "kind" VARCHAR(50) NOT NULL,
  "summary" TEXT NOT NULL,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "lead_activities_tenant_id_lead_id_created_at_idx"
  ON "lead_activities"("tenant_id", "lead_id", "created_at");

ALTER TABLE "lead_activities"
  ADD CONSTRAINT "lead_activities_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "call_logs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "owner_id" UUID NOT NULL,
  "lead_id" UUID,
  "party_id" UUID,
  "date_time" TIMESTAMPTZ NOT NULL,
  "contact_person" VARCHAR(200) NOT NULL,
  "call_type" "CallType" NOT NULL,
  "purpose" "CallPurpose" NOT NULL,
  "discussion_summary" TEXT NOT NULL,
  "outcome" "CallOutcome" NOT NULL,
  "next_action" VARCHAR(300),
  "next_followup_date" DATE,
  "gps_latitude" DECIMAL(10, 7),
  "gps_longitude" DECIMAL(10, 7),
  "duration_minutes" INTEGER,
  "attachment_path" VARCHAR(500),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "call_logs_tenant_id_owner_id_date_time_idx" ON "call_logs"("tenant_id", "owner_id", "date_time");
CREATE INDEX IF NOT EXISTS "call_logs_tenant_id_lead_id_idx" ON "call_logs"("tenant_id", "lead_id");
CREATE INDEX IF NOT EXISTS "call_logs_tenant_id_party_id_idx" ON "call_logs"("tenant_id", "party_id");

ALTER TABLE "call_logs"
  ADD CONSTRAINT "call_logs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "call_logs"
  ADD CONSTRAINT "call_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "call_logs"
  ADD CONSTRAINT "call_logs_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "enquiries" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "lead_id" UUID,
  "party_id" UUID,
  "quotation_id" UUID,
  "salesperson_id" UUID,
  "service_type" "JobType" NOT NULL,
  "origin_port_id" UUID,
  "dest_port_id" UUID,
  "cargo_details" TEXT,
  "incoterms" VARCHAR(10),
  "special_requirements" TEXT,
  "currency_code" CHAR(3) NOT NULL,
  "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "enquiries_tenant_id_status_idx" ON "enquiries"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "enquiries_tenant_id_salesperson_id_idx" ON "enquiries"("tenant_id", "salesperson_id");
CREATE INDEX IF NOT EXISTS "enquiries_tenant_id_quotation_id_idx" ON "enquiries"("tenant_id", "quotation_id");

ALTER TABLE "enquiries"
  ADD CONSTRAINT "enquiries_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enquiries"
  ADD CONSTRAINT "enquiries_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "follow_ups" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "owner_id" UUID NOT NULL,
  "lead_id" UUID,
  "party_id" UUID,
  "enquiry_id" UUID,
  "due_date" DATE NOT NULL,
  "subject" VARCHAR(200) NOT NULL,
  "notes" TEXT,
  "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
  "completed_at" TIMESTAMPTZ,
  "reminder_sent_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "follow_ups_tenant_id_owner_id_due_date_idx" ON "follow_ups"("tenant_id", "owner_id", "due_date");
CREATE INDEX IF NOT EXISTS "follow_ups_tenant_id_status_due_date_idx" ON "follow_ups"("tenant_id", "status", "due_date");

ALTER TABLE "follow_ups"
  ADD CONSTRAINT "follow_ups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follow_ups"
  ADD CONSTRAINT "follow_ups_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "follow_ups"
  ADD CONSTRAINT "follow_ups_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "follow_ups"
  ADD CONSTRAINT "follow_ups_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "salesperson_budgets" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "salesperson_id" UUID NOT NULL,
  "period_type" "BudgetPeriodType" NOT NULL,
  "period_start" DATE NOT NULL,
  "job_type" "JobType",
  "target_amount" DECIMAL(18, 2) NOT NULL,
  "target_volume" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  CONSTRAINT "salesperson_budgets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "salesperson_budgets_unique_idx"
  ON "salesperson_budgets"("tenant_id", "salesperson_id", "period_type", "period_start", COALESCE("job_type", 'SERVICE_JOB'));
CREATE INDEX IF NOT EXISTS "salesperson_budgets_tenant_id_salesperson_id_idx"
  ON "salesperson_budgets"("tenant_id", "salesperson_id");

ALTER TABLE "salesperson_budgets"
  ADD CONSTRAINT "salesperson_budgets_salesperson_id_fkey"
  FOREIGN KEY ("salesperson_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "crm_subscribers" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "party_id" UUID,
  "email" VARCHAR(255) NOT NULL,
  "full_name" VARCHAR(200),
  "country_code" CHAR(2),
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "unsubscribed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "crm_subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "crm_subscribers_tenant_id_email_key" ON "crm_subscribers"("tenant_id", "email");
CREATE INDEX IF NOT EXISTS "crm_subscribers_tenant_id_unsubscribed_at_idx" ON "crm_subscribers"("tenant_id", "unsubscribed_at");

ALTER TABLE "crm_subscribers"
  ADD CONSTRAINT "crm_subscribers_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "email_campaigns" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "subject" VARCHAR(300) NOT NULL,
  "body" TEXT NOT NULL,
  "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduled_at" TIMESTAMPTZ,
  "sent_at" TIMESTAMPTZ,
  "filter_party_type" VARCHAR(40),
  "filter_country" CHAR(2),
  "sent_count" INTEGER NOT NULL DEFAULT 0,
  "failed_count" INTEGER NOT NULL DEFAULT 0,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_campaigns_tenant_id_status_idx" ON "email_campaigns"("tenant_id", "status");

ALTER TABLE "email_campaigns"
  ADD CONSTRAINT "email_campaigns_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "email_campaign_templates" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "subject" VARCHAR(300) NOT NULL,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "email_campaign_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_campaign_templates_tenant_id_idx" ON "email_campaign_templates"("tenant_id");

SELECT enable_rls_for_table('vendor_users');
SELECT enable_rls_for_table('vendor_sessions');
SELECT enable_rls_for_table('vendor_permissions');
SELECT enable_rls_for_table('vendor_disputes');
SELECT enable_rls_for_table('leads');
SELECT enable_rls_for_table('lead_activities');
SELECT enable_rls_for_table('call_logs');
SELECT enable_rls_for_table('follow_ups');
SELECT enable_rls_for_table('enquiries');
SELECT enable_rls_for_table('salesperson_budgets');
SELECT enable_rls_for_table('crm_subscribers');
SELECT enable_rls_for_table('email_campaigns');
SELECT enable_rls_for_table('email_campaign_templates');
