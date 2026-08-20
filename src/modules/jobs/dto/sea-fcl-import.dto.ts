import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { CustomsClearanceStatus, DepositType } from '@prisma/client';
import { IsCurrencyCode } from '../../../common/validators/input-format.validators';

const CUSTOMS_STATUSES = ['PENDING', 'FILED', 'QUERY', 'CLEARED', 'RELEASED'] as const;

export class UpsertContainerFreeDaysDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  container_id!: string;

  @ApiPropertyOptional({ default: 7 })
  @IsOptional()
  @IsInt()
  @Min(0)
  free_days_allowed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  last_free_day_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  demurrage_start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  detention_start_date?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  demurrage_rate_per_day?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  detention_rate_per_day?: number;
}

export class CreateJobDepositDto {
  @ApiProperty({ enum: DepositType })
  @IsEnum(DepositType)
  deposit_type!: DepositType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  deposit_amount!: number;

  @ApiPropertyOptional({ default: 'AED' })
  @IsOptional()
  @IsCurrencyCode()
  currency_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deposit_receipt_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deposit_expiry_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateJobDepositDto extends PartialType(CreateJobDepositDto) {}

export class CreatePartDeliveryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  container_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiProperty()
  @IsDateString()
  delivery_date!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  packages_delivered!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateProofOfDeliveryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  container_id?: string;

  @ApiProperty()
  @IsDateString()
  actual_delivery_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  delivered_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  received_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signature_image_path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateDamageReportDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  container_id?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 5000)
  damage_description!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  photo_urls?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  survey_report_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  reported_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  damage_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity_short?: number;

  @ApiPropertyOptional({ type: [String], description: 'Email addresses to notify after report is saved' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEmail({}, { each: true })
  notify_to?: string[];
}

export class ReturnContainerDto {
  @ApiPropertyOptional({ description: 'Defaults to now' })
  @IsOptional()
  @IsDateString()
  returned_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  return_condition?: string;
}

export class LinkTranshipmentDto {
  @ApiProperty({ format: 'uuid', description: 'Outbound SEA_FCL_EXPORT job id' })
  @IsUUID()
  export_job_id!: string;
}

export class UpdateCustomsStatusDto {
  @ApiProperty({ enum: CUSTOMS_STATUSES })
  @IsIn(CUSTOMS_STATUSES)
  customs_status!: (typeof CUSTOMS_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  customs_clearance_date?: string;
}

export class CalculateCfsStorageDto {
  @ApiPropertyOptional({ description: 'As-of date for accrual; defaults to today' })
  @IsOptional()
  @IsDateString()
  as_of_date?: string;
}
