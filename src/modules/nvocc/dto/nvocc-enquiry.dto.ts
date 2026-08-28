import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { NvoccCargoType, NvoccEnquiryStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateNvoccEnquiryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  voyage_id?: string;

  @ApiPropertyOptional({ enum: NvoccCargoType })
  @IsOptional()
  @IsEnum(NvoccCargoType)
  cargo_type?: NvoccCargoType;

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
  cbm?: number;

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
  @Type(() => Number)
  @IsNumber()
  rate_quoted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  rate_validity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  follow_up_date?: string;
}

export class UpdateNvoccEnquiryDto extends PartialType(CreateNvoccEnquiryDto) {
  @ApiPropertyOptional({ enum: NvoccEnquiryStatus })
  @IsOptional()
  @IsEnum(NvoccEnquiryStatus)
  enquiry_status?: NvoccEnquiryStatus;
}

export class NvoccEnquiryQueryDto {
  @ApiPropertyOptional({ enum: NvoccEnquiryStatus })
  @IsOptional()
  @IsEnum(NvoccEnquiryStatus)
  enquiry_status?: NvoccEnquiryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  voyage_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_to?: string;
}

export class SendNvoccRateDto {
  @ApiProperty()
  @IsString()
  to_email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cc_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

export class MarkNvoccEnquiryLostDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  loss_reason: string;
}
