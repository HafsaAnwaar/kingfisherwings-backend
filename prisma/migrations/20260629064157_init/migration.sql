-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'BRANCH_MANAGER', 'FINANCE_MANAGER', 'ACCOUNTANT', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS_MANAGER', 'OPERATIONS_EXECUTIVE', 'WAREHOUSE_STAFF', 'HR_MANAGER', 'CUSTOMER', 'AGENT', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INVITED', 'SUSPENDED', 'LOCKED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('AIR_EXPORT', 'AIR_IMPORT', 'SEA_FCL_EXPORT', 'SEA_FCL_IMPORT', 'SEA_LCL_EXPORT', 'SEA_LCL_IMPORT', 'LAND', 'COURIER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ENQUIRY', 'QUOTATION', 'BOOKING_CONFIRMED', 'IN_PROGRESS', 'DOCS_PENDING', 'CUSTOMS_CLEARANCE', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "ShipmentMode" AS ENUM ('AIR', 'SEA', 'LAND', 'COURIER');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('VAT', 'GST', 'CUSTOMS', 'WITHHOLDING', 'NONE');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('CUSTOMER', 'AGENT', 'AIRLINE', 'SHIPPING_LINE', 'TRUCKER', 'CUSTOMS_BROKER', 'CFS_PORT_AGENT', 'WAREHOUSE', 'SUPPLIER', 'OVERSEAS_AGENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ChargeGroup" AS ENUM ('FREIGHT', 'LOCAL_CHARGES', 'CUSTOMS', 'DOCUMENTATION', 'HANDLING', 'STORAGE', 'DEMURRAGE', 'DETENTION', 'INSURANCE', 'ORIGIN_CHARGES', 'DESTINATION_CHARGES', 'SURCHARGES', 'OTHER');

-- CreateEnum
CREATE TYPE "ContainerSize" AS ENUM ('SIZE_20GP', 'SIZE_40GP', 'SIZE_40HC', 'SIZE_45HC', 'SIZE_20REEFER', 'SIZE_40REEFER', 'SIZE_20OT', 'SIZE_40OT', 'SIZE_20FR', 'SIZE_40FR', 'SIZE_20TANK', 'SIZE_40TANK');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('HAWB', 'MAWB', 'HBL', 'MBL', 'BOOKING_CONFIRMATION', 'CARGO_MANIFEST', 'PACKING_LIST', 'COMMERCIAL_INVOICE', 'CERTIFICATE_OF_ORIGIN', 'DELIVERY_ORDER', 'ARRIVAL_NOTICE', 'PRE_ALERT', 'CUSTOMS_ENTRY', 'VGM', 'SHIPPING_INSTRUCTION', 'FREIGHT_MANIFEST', 'JOB_CARD', 'OTHER');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "domain" VARCHAR(200),
    "logo_url" TEXT,
    "base_currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "financial_year_start" INTEGER NOT NULL DEFAULT 1,
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'Asia/Dubai',
    "country_code" CHAR(2) NOT NULL DEFAULT 'AE',
    "vat_number" VARCHAR(50),
    "cr_number" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "subscription_plan" VARCHAR(50) NOT NULL DEFAULT 'trial',
    "subscription_ends" TIMESTAMP(3),
    "max_users" INTEGER NOT NULL DEFAULT 10,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(30),
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'READ_ONLY',
    "status" "UserStatus" NOT NULL DEFAULT 'INVITED',
    "branch_id" UUID,
    "department_id" UUID,
    "is_salesperson" BOOLEAN NOT NULL DEFAULT false,
    "is_cs_rep" BOOLEAN NOT NULL DEFAULT false,
    "is_operations" BOOLEAN NOT NULL DEFAULT false,
    "is_finance" BOOLEAN NOT NULL DEFAULT false,
    "can_see_sales" BOOLEAN NOT NULL DEFAULT false,
    "can_see_cost" BOOLEAN NOT NULL DEFAULT false,
    "can_see_gp" BOOLEAN NOT NULL DEFAULT false,
    "can_see_invoices" BOOLEAN NOT NULL DEFAULT false,
    "can_see_payments" BOOLEAN NOT NULL DEFAULT false,
    "can_see_bank_balances" BOOLEAN NOT NULL DEFAULT false,
    "can_see_ar_ap" BOOLEAN NOT NULL DEFAULT false,
    "can_see_mgmt_reports" BOOLEAN NOT NULL DEFAULT false,
    "can_see_job_pnl" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ,
    "last_login_ip" VARCHAR(45),
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ,
    "allowed_ips" TEXT[],
    "allowed_mac_addresses" TEXT[],
    "office_hours_start" VARCHAR(5),
    "office_hours_end" VARCHAR(5),
    "office_hours_timezone" VARCHAR(100),
    "max_concurrent_sessions" INTEGER NOT NULL DEFAULT 3,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "two_factor_backup_codes" TEXT[],
    "invite_token" VARCHAR(200),
    "invite_expires_at" TIMESTAMPTZ,
    "password_reset_token" VARCHAR(200),
    "password_reset_expires" TIMESTAMPTZ,
    "password_changed_at" TIMESTAMPTZ,
    "refresh_token_hash" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "jti" VARCHAR(200) NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "device_info" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_used_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,
    "revoked_reason" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "country_code" CHAR(2) NOT NULL DEFAULT 'AE',
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "is_head_office" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "iso_code" CHAR(2) NOT NULL,
    "iso3_code" CHAR(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "dial_code" VARCHAR(10),
    "region" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "code" CHAR(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "is_base" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "currency_id" UUID NOT NULL,
    "base_currency" CHAR(3) NOT NULL,
    "rate" DECIMAL(20,8) NOT NULL,
    "rate_date" DATE NOT NULL,
    "source" VARCHAR(50) NOT NULL DEFAULT 'xe.com',
    "manual_override" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "un_locode" VARCHAR(10) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100),
    "country_code" CHAR(2) NOT NULL,
    "mode" "ShipmentMode" NOT NULL DEFAULT 'SEA',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "iata_code" CHAR(3) NOT NULL,
    "icao_code" CHAR(4),
    "name" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100),
    "country_code" CHAR(2) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "timezone" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airlines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "iata_code" CHAR(2) NOT NULL,
    "icao_code" CHAR(3),
    "prefix_code" CHAR(3),
    "name" VARCHAR(200) NOT NULL,
    "country_code" CHAR(2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "airlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "scac_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "short_name" VARCHAR(50),
    "country_code" CHAR(2),
    "website" VARCHAR(200),
    "tracking_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "shipping_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessels" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "imo_number" VARCHAR(20),
    "flag_country" CHAR(2),
    "shipping_line_id" UUID,
    "vessel_type" VARCHAR(50),
    "year_built" INTEGER,
    "gross_tonnage" DECIMAL(12,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "vessels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_types" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "size" "ContainerSize" NOT NULL,
    "teu" DECIMAL(4,2) NOT NULL DEFAULT 1,
    "max_payload" DECIMAL(10,2),
    "volume_cbm" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "container_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charge_codes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "charge_group" "ChargeGroup" NOT NULL DEFAULT 'OTHER',
    "applicable_modes" TEXT[],
    "tax_applicable" BOOLEAN NOT NULL DEFAULT false,
    "tax_rate_id" UUID,
    "gl_revenue_code" VARCHAR(20),
    "gl_cost_code" VARCHAR(20),
    "unit" VARCHAR(30),
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "charge_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hs_codes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "hs_code" VARCHAR(12) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "import_duty_rate" DECIMAL(6,3),
    "export_duty_rate" DECIMAL(6,3),
    "dg_class" VARCHAR(20),
    "un_number" VARCHAR(10),
    "is_prohibited" BOOLEAN NOT NULL DEFAULT false,
    "is_restricted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hs_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "tax_type" "TaxType" NOT NULL DEFAULT 'VAT',
    "rate" DECIMAL(6,3) NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "parent_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "department_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "short_name" VARCHAR(50),
    "swift_code" VARCHAR(20),
    "iban_prefix" VARCHAR(10),
    "country_code" CHAR(2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "date" DATE NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units_of_measure" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truckers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "country_code" CHAR(2),
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "contact_person" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "truckers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "country_code" CHAR(2),
    "capacity_sqm" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "party_type" "PartyType" NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "short_name" VARCHAR(100),
    "vat_number" VARCHAR(50),
    "cr_number" VARCHAR(50),
    "country_code" CHAR(2),
    "city" VARCHAR(100),
    "address" TEXT,
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "credit_limit" DECIMAL(18,2),
    "credit_days" INTEGER,
    "currency_code" CHAR(3),
    "salesperson_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_contacts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "designation" VARCHAR(100),
    "phone" VARCHAR(30),
    "mobile" VARCHAR(30),
    "email" VARCHAR(255),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "party_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_addresses" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country_code" CHAR(2) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "party_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_number" VARCHAR(30) NOT NULL,
    "job_type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'ENQUIRY',
    "branch_id" UUID,
    "shipper_id" UUID,
    "consignee_id" UUID,
    "agent_id" UUID,
    "salesperson_id" UUID,
    "ops_user_id" UUID,
    "origin_port_id" UUID,
    "dest_port_id" UUID,
    "commodity" VARCHAR(500),
    "hs_code" VARCHAR(12),
    "gross_weight" DECIMAL(12,3),
    "chargeable_weight" DECIMAL(12,3),
    "volume_cbm" DECIMAL(10,3),
    "pieces" INTEGER,
    "incoterms" VARCHAR(10),
    "is_dg" BOOLEAN NOT NULL DEFAULT false,
    "dg_class" VARCHAR(20),
    "notes" TEXT,
    "etd" DATE,
    "eta" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "air_job_details" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "airline_id" UUID,
    "origin_airport_id" UUID,
    "dest_airport_id" UUID,
    "hawb_number" VARCHAR(50),
    "mawb_number" VARCHAR(50),
    "flight_number" VARCHAR(20),
    "flight_date" DATE,
    "screened" BOOLEAN NOT NULL DEFAULT false,
    "screening_ref" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "air_job_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sea_fcl_job_details" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "shipping_line_id" UUID,
    "vessel_id" UUID,
    "voyage_number" VARCHAR(50),
    "hbl_number" VARCHAR(50),
    "mbl_number" VARCHAR(50),
    "booking_number" VARCHAR(50),
    "si_cutoff" TIMESTAMPTZ,
    "vgm_cutoff" TIMESTAMPTZ,
    "cy_cutoff" TIMESTAMPTZ,
    "port_of_loading_id" UUID,
    "port_of_discharge_id" UUID,
    "bl_type" VARCHAR(20),
    "freight_terms" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "sea_fcl_job_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_containers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "sea_fcl_detail_id" UUID NOT NULL,
    "container_number" VARCHAR(20),
    "container_type_id" UUID NOT NULL,
    "seal_number" VARCHAR(30),
    "tare_weight" DECIMAL(10,3),
    "gross_weight" DECIMAL(10,3),
    "vgm_weight" DECIMAL(10,3),
    "cbm" DECIMAL(10,3),
    "is_soc" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_charges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "charge_code_id" UUID NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(20,8) NOT NULL DEFAULT 1,
    "amount" DECIMAL(18,4) NOT NULL,
    "amount_base_currency" DECIMAL(18,4) NOT NULL,
    "tax_rate_id" UUID,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "is_billable" BOOLEAN NOT NULL DEFAULT true,
    "is_cost" BOOLEAN NOT NULL DEFAULT false,
    "party_id" UUID,
    "is_invoiced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_milestones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "milestone" VARCHAR(100) NOT NULL,
    "planned_date" DATE,
    "actual_date" DATE,
    "notes" TEXT,
    "completed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "reference_number" VARCHAR(100),
    "file_name" VARCHAR(300) NOT NULL,
    "file_url" TEXT NOT NULL,
    "s3_key" TEXT,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "is_finalized" BOOLEAN NOT NULL DEFAULT false,
    "finalized_at" TIMESTAMPTZ,
    "finalized_by" UUID,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_notes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_tenant_id_status_idx" ON "users"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "users_tenant_id_role_idx" ON "users"("tenant_id", "role");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_jti_key" ON "sessions"("jti");

-- CreateIndex
CREATE INDEX "sessions_tenant_id_idx" ON "sessions"("tenant_id");

-- CreateIndex
CREATE INDEX "sessions_tenant_id_user_id_idx" ON "sessions"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "sessions_jti_idx" ON "sessions"("jti");

-- CreateIndex
CREATE INDEX "sessions_tenant_id_is_active_idx" ON "sessions"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "roles_tenant_id_idx" ON "roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "permissions_tenant_id_idx" ON "permissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_tenant_id_module_action_key" ON "permissions"("tenant_id", "module", "action");

-- CreateIndex
CREATE INDEX "role_permissions_tenant_id_idx" ON "role_permissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_tenant_id_role_id_permission_id_key" ON "role_permissions"("tenant_id", "role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_permissions_tenant_id_idx" ON "user_permissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_tenant_id_user_id_permission_id_key" ON "user_permissions"("tenant_id", "user_id", "permission_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_entity_entity_id_idx" ON "audit_logs"("tenant_id", "entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_user_id_idx" ON "audit_logs"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "branches_tenant_id_idx" ON "branches"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_tenant_id_code_key" ON "branches"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "countries_tenant_id_idx" ON "countries"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_tenant_id_iso_code_key" ON "countries"("tenant_id", "iso_code");

-- CreateIndex
CREATE INDEX "currencies_tenant_id_idx" ON "currencies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_tenant_id_code_key" ON "currencies"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "exchange_rates_tenant_id_idx" ON "exchange_rates"("tenant_id");

-- CreateIndex
CREATE INDEX "exchange_rates_tenant_id_rate_date_idx" ON "exchange_rates"("tenant_id", "rate_date");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_tenant_id_currency_id_rate_date_key" ON "exchange_rates"("tenant_id", "currency_id", "rate_date");

-- CreateIndex
CREATE INDEX "ports_tenant_id_idx" ON "ports"("tenant_id");

-- CreateIndex
CREATE INDEX "ports_tenant_id_mode_idx" ON "ports"("tenant_id", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "ports_tenant_id_un_locode_key" ON "ports"("tenant_id", "un_locode");

-- CreateIndex
CREATE INDEX "airports_tenant_id_idx" ON "airports"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "airports_tenant_id_iata_code_key" ON "airports"("tenant_id", "iata_code");

-- CreateIndex
CREATE INDEX "airlines_tenant_id_idx" ON "airlines"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "airlines_tenant_id_iata_code_key" ON "airlines"("tenant_id", "iata_code");

-- CreateIndex
CREATE INDEX "shipping_lines_tenant_id_idx" ON "shipping_lines"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_lines_tenant_id_scac_code_key" ON "shipping_lines"("tenant_id", "scac_code");

-- CreateIndex
CREATE INDEX "vessels_tenant_id_idx" ON "vessels"("tenant_id");

-- CreateIndex
CREATE INDEX "container_types_tenant_id_idx" ON "container_types"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "container_types_tenant_id_code_key" ON "container_types"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "charge_codes_tenant_id_idx" ON "charge_codes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "charge_codes_tenant_id_code_key" ON "charge_codes"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "hs_codes_tenant_id_idx" ON "hs_codes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_codes_tenant_id_hs_code_key" ON "hs_codes"("tenant_id", "hs_code");

-- CreateIndex
CREATE INDEX "tax_rates_tenant_id_idx" ON "tax_rates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_tenant_id_code_key" ON "tax_rates"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "departments_tenant_id_idx" ON "departments"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenant_id_code_key" ON "departments"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "designations_tenant_id_idx" ON "designations"("tenant_id");

-- CreateIndex
CREATE INDEX "banks_tenant_id_idx" ON "banks"("tenant_id");

-- CreateIndex
CREATE INDEX "holidays_tenant_id_idx" ON "holidays"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_tenant_id_country_code_date_key" ON "holidays"("tenant_id", "country_code", "date");

-- CreateIndex
CREATE INDEX "units_of_measure_tenant_id_idx" ON "units_of_measure"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_tenant_id_code_key" ON "units_of_measure"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "truckers_tenant_id_idx" ON "truckers"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "truckers_tenant_id_code_key" ON "truckers"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "warehouses_tenant_id_idx" ON "warehouses"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_tenant_id_code_key" ON "warehouses"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "parties_tenant_id_idx" ON "parties"("tenant_id");

-- CreateIndex
CREATE INDEX "parties_tenant_id_party_type_idx" ON "parties"("tenant_id", "party_type");

-- CreateIndex
CREATE UNIQUE INDEX "parties_tenant_id_code_key" ON "parties"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "party_contacts_tenant_id_idx" ON "party_contacts"("tenant_id");

-- CreateIndex
CREATE INDEX "party_contacts_tenant_id_party_id_idx" ON "party_contacts"("tenant_id", "party_id");

-- CreateIndex
CREATE INDEX "party_addresses_tenant_id_idx" ON "party_addresses"("tenant_id");

-- CreateIndex
CREATE INDEX "party_addresses_tenant_id_party_id_idx" ON "party_addresses"("tenant_id", "party_id");

-- CreateIndex
CREATE INDEX "jobs_tenant_id_idx" ON "jobs"("tenant_id");

-- CreateIndex
CREATE INDEX "jobs_tenant_id_job_type_idx" ON "jobs"("tenant_id", "job_type");

-- CreateIndex
CREATE INDEX "jobs_tenant_id_status_idx" ON "jobs"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "jobs_tenant_id_etd_idx" ON "jobs"("tenant_id", "etd");

-- CreateIndex
CREATE INDEX "jobs_tenant_id_created_at_idx" ON "jobs"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_tenant_id_job_number_key" ON "jobs"("tenant_id", "job_number");

-- CreateIndex
CREATE UNIQUE INDEX "air_job_details_job_id_key" ON "air_job_details"("job_id");

-- CreateIndex
CREATE INDEX "air_job_details_tenant_id_idx" ON "air_job_details"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "sea_fcl_job_details_job_id_key" ON "sea_fcl_job_details"("job_id");

-- CreateIndex
CREATE INDEX "sea_fcl_job_details_tenant_id_idx" ON "sea_fcl_job_details"("tenant_id");

-- CreateIndex
CREATE INDEX "job_containers_tenant_id_idx" ON "job_containers"("tenant_id");

-- CreateIndex
CREATE INDEX "job_charges_tenant_id_idx" ON "job_charges"("tenant_id");

-- CreateIndex
CREATE INDEX "job_charges_tenant_id_job_id_idx" ON "job_charges"("tenant_id", "job_id");

-- CreateIndex
CREATE INDEX "job_milestones_tenant_id_idx" ON "job_milestones"("tenant_id");

-- CreateIndex
CREATE INDEX "job_milestones_tenant_id_job_id_idx" ON "job_milestones"("tenant_id", "job_id");

-- CreateIndex
CREATE INDEX "job_documents_tenant_id_idx" ON "job_documents"("tenant_id");

-- CreateIndex
CREATE INDEX "job_documents_tenant_id_job_id_idx" ON "job_documents"("tenant_id", "job_id");

-- CreateIndex
CREATE INDEX "job_notes_tenant_id_idx" ON "job_notes"("tenant_id");

-- CreateIndex
CREATE INDEX "job_notes_tenant_id_job_id_idx" ON "job_notes"("tenant_id", "job_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_contacts" ADD CONSTRAINT "party_contacts_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_addresses" ADD CONSTRAINT "party_addresses_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "air_job_details" ADD CONSTRAINT "air_job_details_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sea_fcl_job_details" ADD CONSTRAINT "sea_fcl_job_details_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_containers" ADD CONSTRAINT "job_containers_sea_fcl_detail_id_fkey" FOREIGN KEY ("sea_fcl_detail_id") REFERENCES "sea_fcl_job_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_charges" ADD CONSTRAINT "job_charges_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_milestones" ADD CONSTRAINT "job_milestones_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_documents" ADD CONSTRAINT "job_documents_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_notes" ADD CONSTRAINT "job_notes_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
