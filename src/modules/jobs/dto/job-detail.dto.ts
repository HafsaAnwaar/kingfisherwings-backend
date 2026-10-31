import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobStatus } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  Allow,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";

function emptyToUndef({ value }: { value: unknown }) {
  if (value === "" || value === null) return null;
  return value;
}

function numOrNull({ value }: { value: unknown }) {
  if (value === "" || value === null || value === undefined) return value === undefined ? undefined : null;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}

function pickNestedNameCode(
  value: unknown,
  nameKey: string,
  codeKey: string,
  obj: Record<string, unknown>,
): { name?: string | null; code?: string | null } {
  const nested =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  const name =
    (typeof obj[nameKey] === "string" ? (obj[nameKey] as string) : null) ??
    (nested && typeof nested.name === "string" ? nested.name : null) ??
    (nested && typeof nested.label === "string" ? nested.label : null);
  const code =
    (typeof obj[codeKey] === "string" ? (obj[codeKey] as string) : null) ??
    (nested && typeof nested.code === "string" ? nested.code : null);
  return { name, code };
}

/** PATCH /jobs|shipments/:id/detail/show_all — edit header fields by name/code. */
export class PatchShowAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(numOrNull)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pieces?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(numOrNull)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  gross_weight?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(numOrNull)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume_cbm?: number | null;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @Transform(emptyToUndef)
  @ValidateIf((_, v) => v != null && v !== "")
  @IsDateString()
  etd?: string | null;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @Transform(emptyToUndef)
  @ValidateIf((_, v) => v != null && v !== "")
  @IsDateString()
  eta?: string | null;

  @ApiPropertyOptional({
    format: "date",
    description: "Job date (jobs) or shipment_date (shipments)",
  })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const v = value ?? (obj as { shipment_date?: unknown }).shipment_date;
    return v === "" ? null : v;
  })
  @ValidateIf((_, v) => v != null && v !== "")
  @IsDateString()
  job_date?: string | null;

  /** Alias accepted from shipment show_all payloads. */
  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @Allow()
  shipment_date?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mbl_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hbl_number?: string | null;

  /** Alias — prefers writing MBL when set. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bl_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rotation_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  container_number?: string | null;

  @ApiPropertyOptional({
    description: "Primary JobContainer status (EMPTY, PICKED, …)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  container_status?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string | null;

  /** Alias for vessel_name */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyage_number?: string | null;

  @ApiPropertyOptional({ description: "Shipping line code" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  line_code?: string | null;

  @ApiPropertyOptional({ description: "Alias for line_code" })
  @IsOptional()
  @Allow()
  line_no?: string | number | null;

  @ApiPropertyOptional({ description: "EDI / CSDP company code" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  company_code?: string | null;

  @ApiPropertyOptional({ description: "Origin port name (preferred)" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { name } = pickNestedNameCode(
      (obj as { origin_port?: unknown }).origin_port,
      "origin_port_name",
      "origin_port_code",
      obj as Record<string, unknown>,
    );
    return value ?? name;
  })
  @IsString()
  @MaxLength(200)
  origin_port_name?: string | null;

  @ApiPropertyOptional({ description: "Origin port UN/LOCODE" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { code } = pickNestedNameCode(
      (obj as { origin_port?: unknown }).origin_port,
      "origin_port_name",
      "origin_port_code",
      obj as Record<string, unknown>,
    );
    return value ?? code;
  })
  @IsString()
  @MaxLength(10)
  origin_port_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string | null;

  @ApiPropertyOptional({ description: "Destination port name (preferred)" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { name } = pickNestedNameCode(
      (obj as { dest_port?: unknown; destination_port?: unknown }).dest_port ??
        (obj as { destination_port?: unknown }).destination_port,
      "dest_port_name",
      "dest_port_code",
      obj as Record<string, unknown>,
    );
    return value ?? name;
  })
  @IsString()
  @MaxLength(200)
  dest_port_name?: string | null;

  @ApiPropertyOptional({ description: "Destination port UN/LOCODE" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { code } = pickNestedNameCode(
      (obj as { dest_port?: unknown; destination_port?: unknown }).dest_port ??
        (obj as { destination_port?: unknown }).destination_port,
      "dest_port_name",
      "dest_port_code",
      obj as Record<string, unknown>,
    );
    return value ?? code;
  })
  @IsString()
  @MaxLength(10)
  dest_port_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { name } = pickNestedNameCode(
      (obj as { shipper?: unknown }).shipper,
      "shipper_name",
      "shipper_code",
      obj as Record<string, unknown>,
    );
    return value ?? name;
  })
  @IsString()
  @MaxLength(300)
  shipper_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shipper_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipper_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { name } = pickNestedNameCode(
      (obj as { consignee?: unknown }).consignee,
      "consignee_name",
      "consignee_code",
      obj as Record<string, unknown>,
    );
    return value ?? name;
  })
  @IsString()
  @MaxLength(300)
  consignee_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  consignee_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  consignee_id?: string | null;

  @ApiPropertyOptional({
    description: "Billing party (jobs) / customer (shipments)",
  })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { name } = pickNestedNameCode(
      (obj as { billing_party?: unknown }).billing_party,
      "billing_party_name",
      "billing_party_code",
      obj as Record<string, unknown>,
    );
    return value ?? name;
  })
  @IsString()
  @MaxLength(300)
  billing_party_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  billing_party_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  billing_party_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { name } = pickNestedNameCode(
      (obj as { agent?: unknown }).agent,
      "agent_name",
      "agent_code",
      obj as Record<string, unknown>,
    );
    return value ?? name;
  })
  @IsString()
  @MaxLength(300)
  agent_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  agent_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  agent_id?: string | null;

  @ApiPropertyOptional({ description: "Carrier party name (shipments / routing)" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { name } = pickNestedNameCode(
      (obj as { carrier?: unknown }).carrier,
      "carrier_name",
      "carrier_code",
      obj as Record<string, unknown>,
    );
    return value ?? name;
  })
  @IsString()
  @MaxLength(300)
  carrier_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  carrier_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  carrier_id?: string | null;

  @ApiPropertyOptional({ description: "Customer name (shipments)" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const { name } = pickNestedNameCode(
      (obj as { customer?: unknown }).customer,
      "customer_name",
      "customer_code",
      obj as Record<string, unknown>,
    );
    return value ?? name;
  })
  @IsString()
  @MaxLength(300)
  customer_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customer_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  customer_id?: string | null;

  /**
   * FE often PATCHes the full show_all GET payload (ids, status, labels, …).
   * Keep these whitelisted so forbidNonWhitelisted does not 400 the save.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  id?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  job_number?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  shipment_number?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  status?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  job_type?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  branch_id?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  department_id?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  company_id?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  salesperson_id?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  ops_user_id?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  created_from_quote_id?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  parent_job_id?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  tracking_token?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  origin_port?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  dest_port?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  destination_port?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  shipper?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  consignee?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  billing_party?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  agent?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  carrier?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  customer?: unknown;
}

export class ChangeJobStatusDto {
  @ApiProperty({
    description:
      "Catalog code (system JobStatus or tenant custom status). Custom codes map via maps_to_system_status.",
    example: "IN_PROGRESS",
  })
  @IsString()
  @MaxLength(40)
  status!: string;

  @ApiPropertyOptional({ description: "Audit reason for the status change" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ReopenJobDto {
  @ApiPropertyOptional({
    enum: JobStatus,
    description: "Target status after reopen (default IN_PROGRESS)",
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class StopJobDto {
  @ApiProperty({ description: "Reason for putting the job on hold" })
  @IsString()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({
    format: "date-time",
    description: "Optional expected release / resume datetime",
  })
  @IsOptional()
  @IsDateString()
  expected_release_at?: string;
}

/** PATCH /jobs/:id/hold — update hold reason / expected release while ON_HOLD. */
export class UpdateHoldDto {
  @ApiPropertyOptional({ description: "Updated hold reason" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: "Alias for reason (FE may send hold_reason)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hold_reason?: string;

  @ApiPropertyOptional({
    format: "date-time",
    description: "Expected release / resume datetime (null to clear)",
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString()
  expected_release_at?: string | null;

  @ApiPropertyOptional({
    format: "date-time",
    description: "When the job was put on hold (editable)",
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString()
  held_at?: string | null;
}

export class ResumeJobDto {
  @ApiProperty({ description: "Reason for resuming the job from hold" })
  @IsString()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({
    enum: JobStatus,
    description: "Target status after resume (default IN_PROGRESS)",
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    description:
      "When true (default), clears expected_release_at. Set false to keep it.",
  })
  @IsOptional()
  @IsBoolean()
  clear_expected_release?: boolean;
}
