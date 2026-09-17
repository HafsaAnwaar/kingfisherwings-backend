/**
 * Append NVOCC workflow schema + write SQL migration.
 * Run: node scripts/apply-nvocc-workflow-schema.cjs
 */
const fs = require("fs");
const path = require("path");

const schemaPath = path.join("prisma", "schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf8");

function ensureOnce(marker, block) {
  if (schema.includes(marker)) {
    console.log("skip existing", marker);
    return;
  }
  schema += "\n" + block + "\n";
  console.log("appended", marker);
}

function injectAfter(needle, insertion) {
  if (schema.includes(insertion.trim().slice(0, 40))) {
    console.log("skip inject near", needle.slice(0, 30));
    return;
  }
  const i = schema.indexOf(needle);
  if (i < 0) throw new Error("needle not found: " + needle);
  const end = i + needle.length;
  schema = schema.slice(0, end) + insertion + schema.slice(end);
  console.log("injected after", needle.slice(0, 40));
}

// DocumentType CRO
if (!schema.includes("\n  CRO\n") && !schema.includes("CRO\n  CONTAINER_REQUEST")) {
  injectAfter("  NVOCC_LOAD_LIST\n  OTHER\n}", "\n");
  schema = schema.replace(
    "  NVOCC_LOAD_LIST\n  OTHER\n}",
    "  NVOCC_LOAD_LIST\n  CRO\n  CONTAINER_REQUEST\n  OTHER\n}",
  );
  console.log("DocumentType + CRO");
}

// PortalDocumentType CRO
if (!schema.includes("enum PortalDocumentType") || !/enum PortalDocumentType \{[\s\S]*?\bCRO\b/.test(schema)) {
  schema = schema.replace(
    "enum PortalDocumentType {\n  HAWB\n  MAWB\n  HBL\n  MBL\n  INVOICE",
    "enum PortalDocumentType {\n  HAWB\n  MAWB\n  HBL\n  MBL\n  CRO\n  INVOICE",
  );
  console.log("PortalDocumentType + CRO");
}

// ContainerStatus PICKED
if (!schema.includes("PICKED")) {
  schema = schema.replace(
    "enum ContainerStatus {\n  EMPTY\n  STUFFED",
    "enum ContainerStatus {\n  EMPTY\n  PICKED\n  STUFFED",
  );
  console.log("ContainerStatus + PICKED");
}

// ContainerSize extras
if (!schema.includes("SIZE_20HC")) {
  schema = schema.replace(
    "  SIZE_40HC\n  SIZE_45HC",
    "  SIZE_20HC\n  SIZE_40HC\n  SIZE_45HC\n  SIZE_40REEFER_HC\n  SIZE_PLATFORM_20\n  SIZE_PLATFORM_40\n  SIZE_CHASSIS",
  );
  console.log("ContainerSize extended");
}

// ContainerType dimensions
if (!schema.includes("inside_length_m")) {
  schema = schema.replace(
    `model ContainerType {
  id          String        @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id   String        @db.Uuid
  code        String        @db.VarChar(20)
  name        String        @db.VarChar(100)
  size        ContainerSize
  teu         Decimal       @default(1) @db.Decimal(4, 2)
  max_payload Decimal?      @db.Decimal(10, 2)
  volume_cbm  Decimal?      @db.Decimal(10, 2)
  is_active   Boolean       @default(true)`,
    `model ContainerType {
  id          String        @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id   String        @db.Uuid
  code        String        @db.VarChar(20)
  name        String        @db.VarChar(100)
  size        ContainerSize
  teu         Decimal       @default(1) @db.Decimal(4, 2)
  max_payload Decimal?      @db.Decimal(10, 2)
  volume_cbm  Decimal?      @db.Decimal(10, 2)
  volume_cft  Decimal?      @db.Decimal(10, 2)
  inside_length_m  Decimal? @db.Decimal(10, 3)
  inside_width_m   Decimal? @db.Decimal(10, 3)
  inside_height_m  Decimal? @db.Decimal(10, 3)
  door_width_m     Decimal? @db.Decimal(10, 3)
  door_height_m    Decimal? @db.Decimal(10, 3)
  tare_kg          Decimal? @db.Decimal(10, 2)
  max_cargo_kg     Decimal? @db.Decimal(10, 2)
  category         String?  @db.VarChar(40)
  is_active   Boolean       @default(true)`,
  );
  console.log("ContainerType dimensions");
}

// NvoccBooking workflow fields
if (!schema.includes("workflow_stage")) {
  schema = schema.replace(
    `  booking_status        NvoccBookingStatus @default(DRAFT)
  job_type              JobType            @default(NVOCC_EXPORT)
  converted_job_id      String?            @db.Uuid
  created_at            DateTime           @default(now()) @db.Timestamptz
  updated_at            DateTime           @updatedAt @db.Timestamptz
  created_by            String?            @db.Uuid
  updated_by            String?            @db.Uuid
  deleted_at            DateTime?          @db.Timestamptz

  voyage    NvoccVoyage         @relation(fields: [voyage_id], references: [id], onDelete: Restrict)
  enquiry   NvoccEnquiry?       @relation(fields: [enquiry_id], references: [id], onDelete: SetNull)
  load_list NvoccLoadListItem[]
  charges   NvoccBookingCharge[]
  job       NvoccJobDetail?`,
    `  booking_status        NvoccBookingStatus @default(DRAFT)
  job_type              JobType            @default(NVOCC_EXPORT)
  converted_job_id      String?            @db.Uuid
  workflow_stage        NvoccWorkflowStage @default(QUOTE_REQUESTED)
  stage_changed_at      DateTime?          @db.Timestamptz
  stage_changed_by      String?            @db.Uuid
  stage_override_reason String?            @db.Text
  invoice_id            String?            @db.Uuid
  created_at            DateTime           @default(now()) @db.Timestamptz
  updated_at            DateTime           @updatedAt @db.Timestamptz
  created_by            String?            @db.Uuid
  updated_by            String?            @db.Uuid
  deleted_at            DateTime?          @db.Timestamptz

  voyage    NvoccVoyage         @relation(fields: [voyage_id], references: [id], onDelete: Restrict)
  enquiry   NvoccEnquiry?       @relation(fields: [enquiry_id], references: [id], onDelete: SetNull)
  load_list NvoccLoadListItem[]
  charges   NvoccBookingCharge[]
  job       NvoccJobDetail?
  booking_form NvoccBookingForm?`,
  );
  console.log("NvoccBooking workflow fields");
}

// NvoccJobDetail workflow / BL gate fields
if (!schema.includes("port_gate_token")) {
  schema = schema.replace(
    `  do_issued_at        DateTime?      @db.Timestamptz
  pod_received_at     DateTime?      @db.Timestamptz
  created_at          DateTime       @default(now()) @db.Timestamptz
  updated_at          DateTime       @updatedAt @db.Timestamptz
  created_by          String?        @db.Uuid
  updated_by          String?        @db.Uuid
  deleted_at          DateTime?      @db.Timestamptz

  job     Job          @relation(fields: [job_id], references: [id], onDelete: Cascade)
  voyage  NvoccVoyage? @relation(fields: [voyage_id], references: [id], onDelete: SetNull)
  booking NvoccBooking? @relation(fields: [booking_id], references: [id], onDelete: SetNull)`,
    `  do_issued_at        DateTime?      @db.Timestamptz
  pod_received_at     DateTime?      @db.Timestamptz
  workflow_stage      NvoccWorkflowStage @default(BOOKING_FORM_COMPLETE)
  stage_changed_at    DateTime?      @db.Timestamptz
  stage_changed_by    String?        @db.Uuid
  stage_override_reason String?      @db.Text
  port_gate_token     String?        @db.VarChar(64)
  port_token_obtained_at DateTime?   @db.Timestamptz
  draft_bl_requested_at DateTime?    @db.Timestamptz
  draft_bl_issued_at  DateTime?      @db.Timestamptz
  payment_confirmed_at DateTime?     @db.Timestamptz
  payment_confirmed_by String?       @db.Uuid
  created_at          DateTime       @default(now()) @db.Timestamptz
  updated_at          DateTime       @updatedAt @db.Timestamptz
  created_by          String?        @db.Uuid
  updated_by          String?        @db.Uuid
  deleted_at          DateTime?      @db.Timestamptz

  job     Job          @relation(fields: [job_id], references: [id], onDelete: Cascade)
  voyage  NvoccVoyage? @relation(fields: [voyage_id], references: [id], onDelete: SetNull)
  booking NvoccBooking? @relation(fields: [booking_id], references: [id], onDelete: SetNull)
  container_requests NvoccContainerRequest[]`,
  );
  console.log("NvoccJobDetail gate fields");
}

// AirJobDetail air booking form relation
if (!schema.includes("air_booking_form")) {
  schema = schema.replace(
    `  job             Job      @relation(fields: [job_id], references: [id], onDelete: Cascade)
  storage_invoice Invoice? @relation("AirImportStorageInvoice", fields: [storage_invoice_id], references: [id], onDelete: SetNull)

  @@index([tenant_id])
  @@index([tenant_id, mawb_number_from_origin])
  @@index([tenant_id, hawb_number_from_origin_agent])
  @@map("air_job_details")
}`,
    `  job             Job      @relation(fields: [job_id], references: [id], onDelete: Cascade)
  storage_invoice Invoice? @relation("AirImportStorageInvoice", fields: [storage_invoice_id], references: [id], onDelete: SetNull)
  air_booking_form AirBookingForm?

  @@index([tenant_id])
  @@index([tenant_id, mawb_number_from_origin])
  @@index([tenant_id, hawb_number_from_origin_agent])
  @@map("air_job_details")
}`,
  );
  console.log("AirJobDetail booking form relation");
}

ensureOnce(
  "enum NvoccWorkflowStage",
  `
enum NvoccWorkflowStage {
  QUOTE_REQUESTED
  CS_TRIAGED
  QUOTE_SENT
  CUSTOMER_ACCEPTED
  BOOKING_FORM_COMPLETE
  INVOICE_SENT
  CRO_ISSUED
  CONTAINER_ALLOCATED
  PICKED
  LOADING
  PORT_TOKEN
  DRAFT_BL_ISSUED
  PAYMENT_RECEIVED
  ORIGINAL_BL_ISSUED
  CLOSED
}

enum NvoccContainerRequestStatus {
  DRAFT
  ISSUED
  ALLOCATED
  CANCELLED
}

enum NvoccBookingPartyKind {
  SHIPPER
  CONSIGNEE
  NOTIFY
}

enum PartyEntityKind {
  COMPANY
  INDIVIDUAL
}
`,
);

ensureOnce(
  "model NvoccBookingForm",
  `
model NvoccBookingForm {
  id                    String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id             String    @db.Uuid
  booking_id            String    @unique @db.Uuid
  date_of_request       DateTime? @db.Date
  voyage_ref            String?   @db.VarChar(50)
  gross_weight_kg       Decimal?  @db.Decimal(12, 3)
  pol                   String?   @db.VarChar(100)
  pod                   String?   @db.VarChar(100)
  shipper_owned_container Boolean @default(false)
  is_dg                 Boolean   @default(false)
  teu_count             Decimal?  @db.Decimal(8, 2)
  commodity             String?   @db.VarChar(500)
  hs_code               String?   @db.VarChar(20)
  final_use             String?   @db.VarChar(200)
  activity_sector       String?   @db.VarChar(200)
  insurance_details     String?   @db.Text
  lc_bank_details       String?   @db.Text
  attach_commercial_invoice Boolean @default(false)
  attach_correspondence Boolean   @default(false)
  attach_cod_form       Boolean   @default(false)
  attach_licence        Boolean   @default(false)
  booking_agent_line    String?   @db.VarChar(100)
  agent_requester_name  String?   @db.VarChar(200)
  sq_bl_booking_reference String? @db.VarChar(200)
  request_details       String?   @db.Text
  is_complete           Boolean   @default(false)
  completed_at          DateTime? @db.Timestamptz
  completed_by          String?   @db.Uuid
  created_at            DateTime  @default(now()) @db.Timestamptz
  updated_at            DateTime  @updatedAt @db.Timestamptz
  created_by            String?   @db.Uuid
  updated_by            String?   @db.Uuid
  deleted_at            DateTime? @db.Timestamptz

  booking NvoccBooking @relation(fields: [booking_id], references: [id], onDelete: Cascade)
  parties NvoccBookingFormParty[]

  @@index([tenant_id])
  @@map("nvocc_booking_forms")
}

model NvoccBookingFormParty {
  id            String             @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id     String             @db.Uuid
  form_id       String             @db.Uuid
  party_kind    NvoccBookingPartyKind
  full_name     String?            @db.VarChar(300)
  address       String?            @db.Text
  city          String?            @db.VarChar(100)
  country       String?            @db.VarChar(100)
  entity_kind   PartyEntityKind?
  other_details String?            @db.Text
  created_at    DateTime           @default(now()) @db.Timestamptz
  updated_at    DateTime           @updatedAt @db.Timestamptz

  form NvoccBookingForm @relation(fields: [form_id], references: [id], onDelete: Cascade)

  @@unique([tenant_id, form_id, party_kind])
  @@index([tenant_id, form_id])
  @@map("nvocc_booking_form_parties")
}

model NvoccContainerRequest {
  id                      String                      @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id               String                      @db.Uuid
  job_id                  String                      @db.Uuid
  nvocc_job_detail_id     String                      @db.Uuid
  request_number          String                      @db.VarChar(40)
  status                  NvoccContainerRequestStatus @default(DRAFT)
  line_agent              String?                     @db.VarChar(200)
  agent_reference_no      String?                     @db.VarChar(100)
  delivery_release_terminal String?                   @db.VarChar(200)
  created_date            DateTime?                   @db.Timestamptz
  request_date            DateTime?                   @db.Timestamptz
  expiry_date             DateTime?                   @db.Timestamptz
  dpw_reference_no        String?                     @db.VarChar(100)
  remarks                 String?                     @db.Text
  vessel_name             String?                     @db.VarChar(200)
  in_voyage_number        String?                     @db.VarChar(50)
  out_voyage_number       String?                     @db.VarChar(50)
  rotation                String?                     @db.VarChar(50)
  eta                     DateTime?                   @db.Timestamptz
  load_cut_off_date       DateTime?                   @db.Timestamptz
  instruction_type        String?                     @db.VarChar(100)
  stuffing_location       String?                     @db.VarChar(200)
  port_cfs                String?                     @db.VarChar(200)
  receive_to_port_location String?                    @db.VarChar(200)
  move_type               String?                     @db.VarChar(50)
  destination_port        String?                     @db.VarChar(100)
  next_port_of_discharge  String?                     @db.VarChar(100)
  iso_code                String?                     @db.VarChar(30)
  imco_code               String?                     @db.VarChar(50)
  category                String?                     @db.VarChar(50)
  container_count         Int                         @default(1)
  is_oog                  Boolean                     @default(false)
  is_dry                  Boolean                     @default(true)
  temperature             String?                     @db.VarChar(30)
  ventilation             String?                     @db.VarChar(30)
  consignee_name          String?                     @db.VarChar(200)
  haulier_name            String?                     @db.VarChar(200)
  portal_visible_at       DateTime?                   @db.Timestamptz
  issued_at               DateTime?                   @db.Timestamptz
  issued_by               String?                     @db.Uuid
  allocated_at            DateTime?                   @db.Timestamptz
  allocated_by            String?                     @db.Uuid
  created_at              DateTime                    @default(now()) @db.Timestamptz
  updated_at              DateTime                    @updatedAt @db.Timestamptz
  created_by              String?                     @db.Uuid
  updated_by              String?                     @db.Uuid
  deleted_at              DateTime?                   @db.Timestamptz

  nvocc_job_detail NvoccJobDetail @relation(fields: [nvocc_job_detail_id], references: [id], onDelete: Cascade)
  lines            NvoccContainerRequestLine[]

  @@unique([tenant_id, request_number])
  @@index([tenant_id, job_id])
  @@index([tenant_id, status])
  @@map("nvocc_container_requests")
}

model NvoccContainerRequestLine {
  id                   String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id            String    @db.Uuid
  container_request_id String    @db.Uuid
  line_no              Int       @default(1)
  container_number     String?   @db.VarChar(20)
  container_type_id    String?   @db.Uuid
  seal_number          String?   @db.VarChar(30)
  picked_at            DateTime? @db.Timestamptz
  created_at           DateTime  @default(now()) @db.Timestamptz
  updated_at           DateTime  @updatedAt @db.Timestamptz

  container_request NvoccContainerRequest @relation(fields: [container_request_id], references: [id], onDelete: Cascade)

  @@unique([tenant_id, container_number])
  @@index([tenant_id, container_request_id])
  @@map("nvocc_container_request_lines")
}

model TenantContainerNumberSequence {
  id         String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id  String   @unique @db.Uuid
  prefix     String   @default("KF") @db.VarChar(10)
  next_value Int      @default(1)
  updated_at DateTime @updatedAt @db.Timestamptz

  @@map("tenant_container_number_sequences")
}

model AirPalletType {
  id                 String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id          String    @db.Uuid
  code               String    @db.VarChar(30)
  name               String    @db.VarChar(100)
  iata_codes         String[]  @db.Text
  base_length_m      Decimal?  @db.Decimal(10, 3)
  base_width_m       Decimal?  @db.Decimal(10, 3)
  height_m           Decimal?  @db.Decimal(10, 3)
  usable_volume_m3   Decimal?  @db.Decimal(10, 3)
  inside_length_m    Decimal?  @db.Decimal(10, 3)
  inside_width_m     Decimal?  @db.Decimal(10, 3)
  inside_height_m    Decimal?  @db.Decimal(10, 3)
  aircraft_types     String[]  @db.Text
  is_active          Boolean   @default(true)
  created_at         DateTime  @default(now()) @db.Timestamptz
  updated_at         DateTime  @updatedAt @db.Timestamptz
  created_by         String?   @db.Uuid
  updated_by         String?   @db.Uuid
  deleted_at         DateTime? @db.Timestamptz

  air_booking_forms AirBookingForm[]

  @@unique([tenant_id, code])
  @@index([tenant_id, deleted_at])
  @@map("air_pallet_types")
}

model AirBookingForm {
  id                 String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id          String    @db.Uuid
  job_id             String    @unique @db.Uuid
  air_job_detail_id  String    @unique @db.Uuid
  air_pallet_type_id String    @db.Uuid
  pieces             Int?
  gross_weight_kg    Decimal?  @db.Decimal(12, 3)
  chargeable_weight_kg Decimal? @db.Decimal(12, 3)
  commodity          String?   @db.VarChar(500)
  special_handling   String?   @db.Text
  notes              String?   @db.Text
  created_at         DateTime  @default(now()) @db.Timestamptz
  updated_at         DateTime  @updatedAt @db.Timestamptz
  created_by         String?   @db.Uuid
  updated_by         String?   @db.Uuid
  deleted_at         DateTime? @db.Timestamptz

  air_job_detail  AirJobDetail  @relation(fields: [air_job_detail_id], references: [id], onDelete: Cascade)
  air_pallet_type AirPalletType @relation(fields: [air_pallet_type_id], references: [id])

  @@index([tenant_id])
  @@map("air_booking_forms")
}
`,
);

fs.writeFileSync(schemaPath, schema);
console.log("schema written");

const migDir = path.join(
  "prisma",
  "migrations",
  "20260916100000_nvocc_workflow_alignment",
);
fs.mkdirSync(migDir, { recursive: true });

const sql = `-- NVOCC workflow alignment
DO $$ BEGIN
  CREATE TYPE "NvoccWorkflowStage" AS ENUM (
    'QUOTE_REQUESTED','CS_TRIAGED','QUOTE_SENT','CUSTOMER_ACCEPTED','BOOKING_FORM_COMPLETE',
    'INVOICE_SENT','CRO_ISSUED','CONTAINER_ALLOCATED','PICKED','LOADING','PORT_TOKEN',
    'DRAFT_BL_ISSUED','PAYMENT_RECEIVED','ORIGINAL_BL_ISSUED','CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE "NvoccContainerRequestStatus" AS ENUM ('DRAFT','ISSUED','ALLOCATED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "NvoccBookingPartyKind" AS ENUM ('SHIPPER','CONSIGNEE','NOTIFY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PartyEntityKind" AS ENUM ('COMPANY','INDIVIDUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CRO';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CONTAINER_REQUEST';
ALTER TYPE "PortalDocumentType" ADD VALUE IF NOT EXISTS 'CRO';
ALTER TYPE "ContainerStatus" ADD VALUE IF NOT EXISTS 'PICKED';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_20HC';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_40REEFER_HC';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_PLATFORM_20';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_PLATFORM_40';
ALTER TYPE "ContainerSize" ADD VALUE IF NOT EXISTS 'SIZE_CHASSIS';

ALTER TABLE "container_types"
  ADD COLUMN IF NOT EXISTS "volume_cft" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "inside_length_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "inside_width_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "inside_height_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "door_width_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "door_height_m" DECIMAL(10,3),
  ADD COLUMN IF NOT EXISTS "tare_kg" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "max_cargo_kg" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "category" VARCHAR(40);

ALTER TABLE "nvocc_bookings"
  ADD COLUMN IF NOT EXISTS "workflow_stage" "NvoccWorkflowStage" NOT NULL DEFAULT 'QUOTE_REQUESTED',
  ADD COLUMN IF NOT EXISTS "stage_changed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "stage_changed_by" UUID,
  ADD COLUMN IF NOT EXISTS "stage_override_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "invoice_id" UUID;

ALTER TABLE "nvocc_job_details"
  ADD COLUMN IF NOT EXISTS "workflow_stage" "NvoccWorkflowStage" NOT NULL DEFAULT 'BOOKING_FORM_COMPLETE',
  ADD COLUMN IF NOT EXISTS "stage_changed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "stage_changed_by" UUID,
  ADD COLUMN IF NOT EXISTS "stage_override_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "port_gate_token" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "port_token_obtained_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "draft_bl_requested_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "draft_bl_issued_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "payment_confirmed_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "payment_confirmed_by" UUID;

CREATE TABLE IF NOT EXISTS "nvocc_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "booking_id" UUID NOT NULL UNIQUE,
  "date_of_request" DATE,
  "voyage_ref" VARCHAR(50),
  "gross_weight_kg" DECIMAL(12,3),
  "pol" VARCHAR(100),
  "pod" VARCHAR(100),
  "shipper_owned_container" BOOLEAN NOT NULL DEFAULT false,
  "is_dg" BOOLEAN NOT NULL DEFAULT false,
  "teu_count" DECIMAL(8,2),
  "commodity" VARCHAR(500),
  "hs_code" VARCHAR(20),
  "final_use" VARCHAR(200),
  "activity_sector" VARCHAR(200),
  "insurance_details" TEXT,
  "lc_bank_details" TEXT,
  "attach_commercial_invoice" BOOLEAN NOT NULL DEFAULT false,
  "attach_correspondence" BOOLEAN NOT NULL DEFAULT false,
  "attach_cod_form" BOOLEAN NOT NULL DEFAULT false,
  "attach_licence" BOOLEAN NOT NULL DEFAULT false,
  "booking_agent_line" VARCHAR(100),
  "agent_requester_name" VARCHAR(200),
  "sq_bl_booking_reference" VARCHAR(200),
  "request_details" TEXT,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "nvocc_booking_forms_tenant_id_idx" ON "nvocc_booking_forms"("tenant_id");
ALTER TABLE "nvocc_booking_forms" DROP CONSTRAINT IF EXISTS "nvocc_booking_forms_booking_id_fkey";
ALTER TABLE "nvocc_booking_forms" ADD CONSTRAINT "nvocc_booking_forms_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "nvocc_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "nvocc_booking_form_parties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "party_kind" "NvoccBookingPartyKind" NOT NULL,
  "full_name" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "entity_kind" "PartyEntityKind",
  "other_details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "nvocc_booking_form_parties_tenant_id_form_id_party_kind_key" ON "nvocc_booking_form_parties"("tenant_id","form_id","party_kind");
CREATE INDEX IF NOT EXISTS "nvocc_booking_form_parties_tenant_id_form_id_idx" ON "nvocc_booking_form_parties"("tenant_id","form_id");
ALTER TABLE "nvocc_booking_form_parties" DROP CONSTRAINT IF EXISTS "nvocc_booking_form_parties_form_id_fkey";
ALTER TABLE "nvocc_booking_form_parties" ADD CONSTRAINT "nvocc_booking_form_parties_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "nvocc_booking_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "nvocc_container_requests" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "nvocc_job_detail_id" UUID NOT NULL,
  "request_number" VARCHAR(40) NOT NULL,
  "status" "NvoccContainerRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "line_agent" VARCHAR(200),
  "agent_reference_no" VARCHAR(100),
  "delivery_release_terminal" VARCHAR(200),
  "created_date" TIMESTAMPTZ,
  "request_date" TIMESTAMPTZ,
  "expiry_date" TIMESTAMPTZ,
  "dpw_reference_no" VARCHAR(100),
  "remarks" TEXT,
  "vessel_name" VARCHAR(200),
  "in_voyage_number" VARCHAR(50),
  "out_voyage_number" VARCHAR(50),
  "rotation" VARCHAR(50),
  "eta" TIMESTAMPTZ,
  "load_cut_off_date" TIMESTAMPTZ,
  "instruction_type" VARCHAR(100),
  "stuffing_location" VARCHAR(200),
  "port_cfs" VARCHAR(200),
  "receive_to_port_location" VARCHAR(200),
  "move_type" VARCHAR(50),
  "destination_port" VARCHAR(100),
  "next_port_of_discharge" VARCHAR(100),
  "iso_code" VARCHAR(30),
  "imco_code" VARCHAR(50),
  "category" VARCHAR(50),
  "container_count" INTEGER NOT NULL DEFAULT 1,
  "is_oog" BOOLEAN NOT NULL DEFAULT false,
  "is_dry" BOOLEAN NOT NULL DEFAULT true,
  "temperature" VARCHAR(30),
  "ventilation" VARCHAR(30),
  "consignee_name" VARCHAR(200),
  "haulier_name" VARCHAR(200),
  "portal_visible_at" TIMESTAMPTZ,
  "issued_at" TIMESTAMPTZ,
  "issued_by" UUID,
  "allocated_at" TIMESTAMPTZ,
  "allocated_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "nvocc_container_requests_tenant_id_request_number_key" ON "nvocc_container_requests"("tenant_id","request_number");
CREATE INDEX IF NOT EXISTS "nvocc_container_requests_tenant_id_job_id_idx" ON "nvocc_container_requests"("tenant_id","job_id");
ALTER TABLE "nvocc_container_requests" DROP CONSTRAINT IF EXISTS "nvocc_container_requests_nvocc_job_detail_id_fkey";
ALTER TABLE "nvocc_container_requests" ADD CONSTRAINT "nvocc_container_requests_nvocc_job_detail_id_fkey" FOREIGN KEY ("nvocc_job_detail_id") REFERENCES "nvocc_job_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "nvocc_container_request_lines" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "container_request_id" UUID NOT NULL,
  "line_no" INTEGER NOT NULL DEFAULT 1,
  "container_number" VARCHAR(20),
  "container_type_id" UUID,
  "seal_number" VARCHAR(30),
  "picked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "nvocc_container_request_lines_tenant_id_container_number_key" ON "nvocc_container_request_lines"("tenant_id","container_number");
CREATE INDEX IF NOT EXISTS "nvocc_container_request_lines_tenant_id_container_request_id_idx" ON "nvocc_container_request_lines"("tenant_id","container_request_id");
ALTER TABLE "nvocc_container_request_lines" DROP CONSTRAINT IF EXISTS "nvocc_container_request_lines_container_request_id_fkey";
ALTER TABLE "nvocc_container_request_lines" ADD CONSTRAINT "nvocc_container_request_lines_container_request_id_fkey" FOREIGN KEY ("container_request_id") REFERENCES "nvocc_container_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "tenant_container_number_sequences" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL UNIQUE,
  "prefix" VARCHAR(10) NOT NULL DEFAULT 'KF',
  "next_value" INTEGER NOT NULL DEFAULT 1,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "air_pallet_types" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "code" VARCHAR(30) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "iata_codes" TEXT[],
  "base_length_m" DECIMAL(10,3),
  "base_width_m" DECIMAL(10,3),
  "height_m" DECIMAL(10,3),
  "usable_volume_m3" DECIMAL(10,3),
  "inside_length_m" DECIMAL(10,3),
  "inside_width_m" DECIMAL(10,3),
  "inside_height_m" DECIMAL(10,3),
  "aircraft_types" TEXT[],
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "air_pallet_types_tenant_id_code_key" ON "air_pallet_types"("tenant_id","code");
CREATE INDEX IF NOT EXISTS "air_pallet_types_tenant_id_deleted_at_idx" ON "air_pallet_types"("tenant_id","deleted_at");

CREATE TABLE IF NOT EXISTS "air_booking_forms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL,
  "job_id" UUID NOT NULL UNIQUE,
  "air_job_detail_id" UUID NOT NULL UNIQUE,
  "air_pallet_type_id" UUID NOT NULL,
  "pieces" INTEGER,
  "gross_weight_kg" DECIMAL(12,3),
  "chargeable_weight_kg" DECIMAL(12,3),
  "commodity" VARCHAR(500),
  "special_handling" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" UUID,
  "updated_by" UUID,
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "air_booking_forms_tenant_id_idx" ON "air_booking_forms"("tenant_id");
ALTER TABLE "air_booking_forms" DROP CONSTRAINT IF EXISTS "air_booking_forms_air_job_detail_id_fkey";
ALTER TABLE "air_booking_forms" ADD CONSTRAINT "air_booking_forms_air_job_detail_id_fkey" FOREIGN KEY ("air_job_detail_id") REFERENCES "air_job_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "air_booking_forms" DROP CONSTRAINT IF EXISTS "air_booking_forms_air_pallet_type_id_fkey";
ALTER TABLE "air_booking_forms" ADD CONSTRAINT "air_booking_forms_air_pallet_type_id_fkey" FOREIGN KEY ("air_pallet_type_id") REFERENCES "air_pallet_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

SELECT enable_rls_for_table('nvocc_booking_forms');
SELECT enable_rls_for_table('nvocc_booking_form_parties');
SELECT enable_rls_for_table('nvocc_container_requests');
SELECT enable_rls_for_table('nvocc_container_request_lines');
SELECT enable_rls_for_table('tenant_container_number_sequences');
SELECT enable_rls_for_table('air_pallet_types');
SELECT enable_rls_for_table('air_booking_forms');
`;

fs.writeFileSync(path.join(migDir, "migration.sql"), sql);
console.log("migration written", migDir);
