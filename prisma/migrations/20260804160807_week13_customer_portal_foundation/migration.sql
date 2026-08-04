-- Week 13 foundation: Customer Portal users + sessions + email event type

ALTER TYPE "EmailEventType" ADD VALUE 'PORTAL_CREDENTIALS';

CREATE TYPE "PortalUserStatus" AS ENUM ('ACTIVE', 'DISABLED');

CREATE TABLE "portal_users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(30),
    "status" "PortalUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "portal_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "portal_sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "portal_user_id" UUID NOT NULL,
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

    CONSTRAINT "portal_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "portal_users_tenant_id_email_key" ON "portal_users"("tenant_id", "email");
CREATE INDEX "portal_users_tenant_id_party_id_idx" ON "portal_users"("tenant_id", "party_id");
CREATE INDEX "portal_users_tenant_id_status_idx" ON "portal_users"("tenant_id", "status");

CREATE UNIQUE INDEX "portal_sessions_jti_key" ON "portal_sessions"("jti");
CREATE INDEX "portal_sessions_portal_user_id_idx" ON "portal_sessions"("portal_user_id");
CREATE INDEX "portal_sessions_tenant_id_is_active_idx" ON "portal_sessions"("tenant_id", "is_active");

ALTER TABLE "portal_users" ADD CONSTRAINT "portal_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portal_users" ADD CONSTRAINT "portal_users_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portal_sessions" ADD CONSTRAINT "portal_sessions_portal_user_id_fkey" FOREIGN KEY ("portal_user_id") REFERENCES "portal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
