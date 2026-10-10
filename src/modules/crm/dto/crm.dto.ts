import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  BudgetPeriodType,
  CallOutcome,
  CallPurpose,
  CallType,
  EnquiryStatus,
  FollowUpStatus,
  JobType,
  LeadPriority,
  LeadSource,
  LeadStatus,
} from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  @Length(2, 300)
  company_name!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  contact_name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsStrictEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  potential_volume?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service_requirements?: string;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  assigned_salesperson_id?: string;

  @ApiPropertyOptional({ enum: LeadPriority })
  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lost_reason?: string;
}

export class LeadQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  assigned_salesperson_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class ConvertLeadDto {
  @ApiPropertyOptional({ example: "CUST-1001" })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  party_code?: string;
}

export class CreateCallLogDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  lead_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiProperty()
  @IsDateString()
  date_time!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  contact_person!: string;

  @ApiProperty({ enum: CallType })
  @IsEnum(CallType)
  call_type!: CallType;

  @ApiProperty({ enum: CallPurpose })
  @IsEnum(CallPurpose)
  purpose!: CallPurpose;

  @ApiProperty()
  @IsString()
  @Length(3, 4000)
  discussion_summary!: string;

  @ApiProperty({ enum: CallOutcome })
  @IsEnum(CallOutcome)
  outcome!: CallOutcome;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  next_action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  next_followup_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gps_latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gps_longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration_minutes?: number;
}

export class CallLogQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  lead_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

export class CreateFollowUpDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  lead_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  enquiry_id?: string;

  @ApiProperty()
  @IsDateString()
  due_date!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  subject!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  owner_id?: string;
}

export class FollowUpQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: FollowUpStatus })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  team?: boolean;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  owner_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class PatchFollowUpDto {
  @ApiPropertyOptional({ enum: FollowUpStatus })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class EnquiryChargeLineDto {
  @ApiPropertyOptional({ format: "uuid", description: "Client / party for charge" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiProperty({ example: "Ocean freight" })
  @IsString()
  @MaxLength(300)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unit_price?: number;

  @ApiProperty({ description: "Line amount" })
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_cost?: boolean;
}

/** Fresa 5-step enquiry wizard — all steps submitted on final create (or draft PATCH). */
export class CreateEnquiryDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  lead_id?: string;

  @ApiPropertyOptional({ format: "uuid", description: "Customer" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  sales_coordinator_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  price_coordinator_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiProperty({
    enum: JobType,
    description:
      "Service selected in wizard step 1. Full list: GET /crm/enquiries/wizard → data.services",
  })
  @IsEnum(JobType)
  service_type!: JobType;

  @ApiPropertyOptional({ example: "2026-10-09" })
  @IsOptional()
  @IsDateString()
  enquiry_date?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipper_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consignee_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customer_address?: string;

  @ApiPropertyOptional({ format: "uuid", description: "POL" })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: "uuid", description: "POD" })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional({ format: "uuid", description: "POR (port of receipt)" })
  @IsOptional()
  @IsUUID()
  por_port_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional({ description: "Payable at (place / party note)" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  payable_at?: string;

  @ApiPropertyOptional({ description: "Dispatch at" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dispatch_at?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  carrier_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyage_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unit_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional({ description: "Volume / chargeable weight" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  chargeable_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  net_weight?: number;

  @ApiPropertyOptional({ example: "KG" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  weight_unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume_cbm?: number;

  @ApiPropertyOptional({ example: "CBM" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  cbm_unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pieces?: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  container_count?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 10)
  incoterms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_requirements?: string;

  @ApiPropertyOptional({
    description: "Snapshot of selected standard charges at enquiry create",
  })
  @IsOptional()
  @IsObject()
  standard_charges_snapshot?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: [EnquiryChargeLineDto],
    description: "Step 4 charge details (client / department / amount)",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnquiryChargeLineDto)
  charges?: EnquiryChargeLineDto[];

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;
}

export class UpdateEnquiryDto extends PartialType(CreateEnquiryDto) {
  @ApiPropertyOptional({ enum: EnquiryStatus })
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;
}

export class CancelEnquiryDto {
  @ApiProperty({ example: "Customer withdrew interest" })
  @IsString()
  @Length(2, 500)
  cancel_reason!: string;
}

export class EnquiryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EnquiryStatus })
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateBudgetDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  salesperson_id!: string;

  @ApiProperty({ enum: BudgetPeriodType })
  @IsEnum(BudgetPeriodType)
  period_type!: BudgetPeriodType;

  @ApiProperty()
  @IsDateString()
  period_start!: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  target_amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  target_volume?: number;
}

export class CreateSubscriberDto {
  @ApiProperty()
  @IsStrictEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 300)
  subject!: string;

  @ApiProperty()
  @IsString()
  @Length(5, 20000)
  body!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filter_party_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  filter_country?: string;
}

export class CreateCampaignTemplateDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 300)
  subject!: string;

  @ApiProperty()
  @IsString()
  @Length(5, 20000)
  body!: string;
}

export class DashboardQueryDto {
  @ApiPropertyOptional({
    enum: ["7d", "30d", "mtd", "custom"],
    example: "30d",
  })
  @IsOptional()
  @IsIn(["7d", "30d", "mtd", "custom"])
  period?: "7d" | "30d" | "mtd" | "custom";

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;
}
