-- Remaining Masters tiles (Waves 1–3)
CREATE TYPE "MasterCategoryType" AS ENUM ('PARTY', 'CARGO', 'OTHER');
CREATE TYPE "OutboundMessageChannel" AS ENUM ('WHATSAPP', 'SMS');

CREATE TABLE "regions" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "country_code" CHAR(2),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "regions_tenant_id_code_key" ON "regions"("tenant_id", "code");
CREATE INDEX "regions_tenant_id_deleted_at_idx" ON "regions"("tenant_id", "deleted_at");

CREATE TABLE "cities" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "country_code" CHAR(2),
  "region_id" UUID,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cities_tenant_id_code_key" ON "cities"("tenant_id", "code");
CREATE INDEX "cities_tenant_id_deleted_at_idx" ON "cities"("tenant_id", "deleted_at");
ALTER TABLE "cities" ADD CONSTRAINT "cities_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "zones" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "region_id" UUID,
  "city_id" UUID,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "zones_tenant_id_code_key" ON "zones"("tenant_id", "code");
CREATE INDEX "zones_tenant_id_deleted_at_idx" ON "zones"("tenant_id", "deleted_at");
ALTER TABLE "zones" ADD CONSTRAINT "zones_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "zones" ADD CONSTRAINT "zones_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "divisions" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "company_id" UUID,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "divisions_tenant_id_code_key" ON "divisions"("tenant_id", "code");
CREATE INDEX "divisions_tenant_id_deleted_at_idx" ON "divisions"("tenant_id", "deleted_at");

CREATE TABLE "master_categories" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "category_type" "MasterCategoryType" NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "master_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "master_categories_tenant_id_code_key" ON "master_categories"("tenant_id", "code");
CREATE INDEX "master_categories_tenant_id_deleted_at_idx" ON "master_categories"("tenant_id", "deleted_at");

CREATE TABLE "commodities" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "hs_code" VARCHAR(20),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "commodities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "commodities_tenant_id_code_key" ON "commodities"("tenant_id", "code");
CREATE INDEX "commodities_tenant_id_deleted_at_idx" ON "commodities"("tenant_id", "deleted_at");

CREATE TABLE "pack_types" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "length_cm" DECIMAL(10,2),
  "width_cm" DECIMAL(10,2),
  "height_cm" DECIMAL(10,2),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "pack_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pack_types_tenant_id_code_key" ON "pack_types"("tenant_id", "code");
CREATE INDEX "pack_types_tenant_id_deleted_at_idx" ON "pack_types"("tenant_id", "deleted_at");

CREATE TABLE "clauses" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "body" TEXT NOT NULL,
  "clause_type" VARCHAR(50),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "clauses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "clauses_tenant_id_code_key" ON "clauses"("tenant_id", "code");
CREATE INDEX "clauses_tenant_id_deleted_at_idx" ON "clauses"("tenant_id", "deleted_at");

CREATE TABLE "port_clause_maps" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "port_id" UUID NOT NULL,
  "clause_id" UUID NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "port_clause_maps_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "port_clause_maps_tenant_id_port_id_clause_id_key" ON "port_clause_maps"("tenant_id", "port_id", "clause_id");
CREATE INDEX "port_clause_maps_tenant_id_deleted_at_idx" ON "port_clause_maps"("tenant_id", "deleted_at");
ALTER TABLE "port_clause_maps" ADD CONSTRAINT "port_clause_maps_clause_id_fkey" FOREIGN KEY ("clause_id") REFERENCES "clauses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "port_clause_maps" ADD CONSTRAINT "port_clause_maps_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "rate_bases" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "rate_bases_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "rate_bases_tenant_id_code_key" ON "rate_bases"("tenant_id", "code");
CREATE INDEX "rate_bases_tenant_id_deleted_at_idx" ON "rate_bases"("tenant_id", "deleted_at");

CREATE TABLE "voyage_masters" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "voyage_code" VARCHAR(50) NOT NULL,
  "vessel_id" UUID,
  "shipping_line_id" UUID,
  "etd" TIMESTAMPTZ,
  "eta" TIMESTAMPTZ,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "voyage_masters_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "voyage_masters_tenant_id_voyage_code_key" ON "voyage_masters"("tenant_id", "voyage_code");
CREATE INDEX "voyage_masters_tenant_id_deleted_at_idx" ON "voyage_masters"("tenant_id", "deleted_at");

CREATE TABLE "storage_slabs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "from_days" INTEGER NOT NULL,
  "to_days" INTEGER NOT NULL,
  "rate" DECIMAL(18,4) NOT NULL,
  "rate_basis_id" UUID,
  "currency_code" CHAR(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "storage_slabs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "storage_slabs_tenant_id_code_key" ON "storage_slabs"("tenant_id", "code");
CREATE INDEX "storage_slabs_tenant_id_deleted_at_idx" ON "storage_slabs"("tenant_id", "deleted_at");
ALTER TABLE "storage_slabs" ADD CONSTRAINT "storage_slabs_rate_basis_id_fkey" FOREIGN KEY ("rate_basis_id") REFERENCES "rate_bases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "activity_types" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "module" VARCHAR(50),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "activity_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "activity_types_tenant_id_code_key" ON "activity_types"("tenant_id", "code");
CREATE INDEX "activity_types_tenant_id_deleted_at_idx" ON "activity_types"("tenant_id", "deleted_at");

CREATE TABLE "sales_call_activity_types" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "sales_call_activity_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sales_call_activity_types_tenant_id_code_key" ON "sales_call_activity_types"("tenant_id", "code");
CREATE INDEX "sales_call_activity_types_tenant_id_deleted_at_idx" ON "sales_call_activity_types"("tenant_id", "deleted_at");

CREATE TABLE "user_favorites" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "entity_type" VARCHAR(50) NOT NULL,
  "entity_id" UUID NOT NULL,
  "label" VARCHAR(200),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_favorites_tenant_id_user_id_entity_type_entity_id_key" ON "user_favorites"("tenant_id", "user_id", "entity_type", "entity_id");
CREATE INDEX "user_favorites_tenant_id_user_id_deleted_at_idx" ON "user_favorites"("tenant_id", "user_id", "deleted_at");

CREATE TABLE "outbound_message_logs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "channel" "OutboundMessageChannel" NOT NULL,
  "to_address" VARCHAR(100) NOT NULL,
  "body_snippet" VARCHAR(500) NOT NULL,
  "status" VARCHAR(30) NOT NULL,
  "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "outbound_message_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "outbound_message_logs_tenant_id_sent_at_idx" ON "outbound_message_logs"("tenant_id", "sent_at" DESC);
CREATE INDEX "outbound_message_logs_tenant_id_channel_idx" ON "outbound_message_logs"("tenant_id", "channel");

CREATE TABLE "organization_groups" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "organization_groups_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organization_groups_tenant_id_code_key" ON "organization_groups"("tenant_id", "code");
CREATE INDEX "organization_groups_tenant_id_deleted_at_idx" ON "organization_groups"("tenant_id", "deleted_at");

CREATE TABLE "organization_group_members" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "group_id" UUID NOT NULL,
  "company_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organization_group_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organization_group_members_tenant_id_group_id_company_id_key" ON "organization_group_members"("tenant_id", "group_id", "company_id");
CREATE INDEX "organization_group_members_tenant_id_group_id_idx" ON "organization_group_members"("tenant_id", "group_id");
ALTER TABLE "organization_group_members" ADD CONSTRAINT "organization_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "organization_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "custom_report_masters" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "report_template_code" VARCHAR(100) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "custom_report_masters_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "custom_report_masters_tenant_id_code_key" ON "custom_report_masters"("tenant_id", "code");
CREATE INDEX "custom_report_masters_tenant_id_deleted_at_idx" ON "custom_report_masters"("tenant_id", "deleted_at");

SELECT enable_rls_for_table('regions');
SELECT enable_rls_for_table('cities');
SELECT enable_rls_for_table('zones');
SELECT enable_rls_for_table('divisions');
SELECT enable_rls_for_table('master_categories');
SELECT enable_rls_for_table('commodities');
SELECT enable_rls_for_table('pack_types');
SELECT enable_rls_for_table('clauses');
SELECT enable_rls_for_table('port_clause_maps');
SELECT enable_rls_for_table('rate_bases');
SELECT enable_rls_for_table('voyage_masters');
SELECT enable_rls_for_table('storage_slabs');
SELECT enable_rls_for_table('activity_types');
SELECT enable_rls_for_table('sales_call_activity_types');
SELECT enable_rls_for_table('user_favorites');
SELECT enable_rls_for_table('outbound_message_logs');
SELECT enable_rls_for_table('organization_groups');
SELECT enable_rls_for_table('organization_group_members');
SELECT enable_rls_for_table('custom_report_masters');
