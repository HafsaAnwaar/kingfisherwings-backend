-- Shared staff continuum comments on ENQUIRY / QUOTATION / SHIPMENT / JOB

CREATE TABLE IF NOT EXISTS "ops_entity_comments" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "entity_type" "OpsEntityType" NOT NULL,
  "entity_id" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "ops_entity_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ops_entity_comments_tenant_id_entity_type_entity_id_idx"
  ON "ops_entity_comments"("tenant_id", "entity_type", "entity_id");
