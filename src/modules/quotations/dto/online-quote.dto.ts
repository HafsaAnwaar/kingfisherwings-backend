import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { JobType } from '@prisma/client';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';

export class CreateOnlineQuoteDto {
  @ApiProperty({ example: 'kingfisher', description: 'Tenant slug — identifies which company receives the enquiry.' })
  @IsString()
  @Length(2, 100)
  tenant_slug!: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  job_type!: JobType;

  @ApiPropertyOptional({ format: 'uuid', description: 'Existing customer Party. If omitted, contact_email + contact_name are required.' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ example: 'john@acme.com' })
  @IsOptional()
  @IsStrictEmail()
  contact_email?: string;

  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  contact_name?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  chargeable_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume_cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pieces?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_requirements?: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @Length(3, 3)
  currency_code!: string;
}
