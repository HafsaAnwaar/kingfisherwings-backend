import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { JobType, NvoccCargoType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class CreateNvoccBookingDto {
  @ApiProperty()
  @IsUUID()
  voyage_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  enquiry_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  notify_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  agent_pol_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  agent_pod_id?: string;

  @ApiProperty({ enum: NvoccCargoType })
  @IsEnum(NvoccCargoType)
  cargo_type: NvoccCargoType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  container_count?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cbm_allocated?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_dg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dg_un_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dg_class?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dg_packing_group?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marks_numbers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  incoterms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  freight_terms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  other_charges_terms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shipper_ref?: string;

  @ApiPropertyOptional({ enum: JobType, default: "NVOCC_EXPORT" })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiPropertyOptional({
    description: "Auto-apply matching NVOCC tariff charge lines",
  })
  @IsOptional()
  @IsBoolean()
  apply_tariff?: boolean;
}

export class UpdateNvoccBookingDto extends PartialType(CreateNvoccBookingDto) {}

export class NvoccBookingQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  voyage_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ enum: NvoccCargoType })
  @IsOptional()
  @IsEnum(NvoccCargoType)
  cargo_type?: NvoccCargoType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  booking_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class SendCutoffReminderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  to_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

export class ConvertNvoccBookingToJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  department_id?: string;
}
