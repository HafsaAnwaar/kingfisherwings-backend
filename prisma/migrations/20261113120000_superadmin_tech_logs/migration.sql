-- Super Admin Tech Logs (platform-wide, no RLS)

CREATE TYPE "TechIssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'IGNORED');
CREATE TYPE "TechIssueSeverity" AS ENUM ('INFO', 'WARN', 'ERROR', 'CRITICAL');
CREATE TYPE "TechLogPrincipal" AS ENUM ('USER', 'SUPER_ADMIN', 'PORTAL', 'VENDOR', 'ANONYMOUS', 'SYSTEM');

CREATE TABLE "tech_activity_logs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID,
  "tenant_name" VARCHAR(200),
  "tenant_slug" VARCHAR(100),
  "principal" "TechLogPrincipal" NOT NULL DEFAULT 'ANONYMOUS',
  "user_id" UUID,
  "user_name" VARCHAR(200),
  "user_email" VARCHAR(255),
  "method" VARCHAR(10) NOT NULL,
  "path" VARCHAR(500) NOT NULL,
  "status_code" INTEGER,
  "action" VARCHAR(100),
  "summary" VARCHAR(500),
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "duration_ms" INTEGER,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tech_activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tech_activity_logs_created_at_idx" ON "tech_activity_logs"("created_at" DESC);
CREATE INDEX "tech_activity_logs_tenant_id_created_at_idx" ON "tech_activity_logs"("tenant_id", "created_at" DESC);
CREATE INDEX "tech_activity_logs_user_id_created_at_idx" ON "tech_activity_logs"("user_id", "created_at" DESC);
CREATE INDEX "tech_activity_logs_principal_created_at_idx" ON "tech_activity_logs"("principal", "created_at" DESC);

CREATE TABLE "tech_issues" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID,
  "tenant_name" VARCHAR(200),
  "tenant_slug" VARCHAR(100),
  "principal" "TechLogPrincipal" NOT NULL DEFAULT 'ANONYMOUS',
  "user_id" UUID,
  "user_name" VARCHAR(200),
  "user_email" VARCHAR(255),
  "severity" "TechIssueSeverity" NOT NULL DEFAULT 'ERROR',
  "status" "TechIssueStatus" NOT NULL DEFAULT 'OPEN',
  "source" VARCHAR(40) NOT NULL DEFAULT 'API',
  "method" VARCHAR(10),
  "path" VARCHAR(500),
  "status_code" INTEGER,
  "error_code" VARCHAR(80),
  "message" TEXT NOT NULL,
  "stack" TEXT,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "metadata" JSONB,
  "occurrence_count" INTEGER NOT NULL DEFAULT 1,
  "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMPTZ,
  "resolved_by_super_admin_id" UUID,
  "resolution_notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tech_issues_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tech_issues_status_created_at_idx" ON "tech_issues"("status", "created_at" DESC);
CREATE INDEX "tech_issues_severity_created_at_idx" ON "tech_issues"("severity", "created_at" DESC);
CREATE INDEX "tech_issues_tenant_id_created_at_idx" ON "tech_issues"("tenant_id", "created_at" DESC);
CREATE INDEX "tech_issues_user_id_created_at_idx" ON "tech_issues"("user_id", "created_at" DESC);
CREATE INDEX "tech_issues_last_seen_at_idx" ON "tech_issues"("last_seen_at" DESC);
CREATE INDEX "tech_issues_status_code_created_at_idx" ON "tech_issues"("status_code", "created_at" DESC);
