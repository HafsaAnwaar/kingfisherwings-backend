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
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
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

export class CreateEnquiryDto {
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
  salesperson_id?: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  service_type!: JobType;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 10)
  incoterms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_requirements?: string;

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

export class EnquiryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EnquiryStatus })
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;
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
