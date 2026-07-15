import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SavedReportType } from '@prisma/client';

export class ReportPeriodQueryDto {
  @ApiPropertyOptional({ description: 'Period start (YYYY-MM-DD). Defaults to start of year or omit.' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ description: 'Period end / as-of date (YYYY-MM-DD). Defaults to today.' })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hide_zero?: boolean;
}

export class AsOfReportQueryDto {
  @ApiPropertyOptional({ description: 'As-of date (YYYY-MM-DD). Defaults to today.' })
  @IsOptional()
  @IsDateString()
  as_of?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hide_zero?: boolean;
}

export class VatReturnQueryDto {
  @ApiProperty({ description: 'VAT period start' })
  @IsDateString()
  from_date!: string;

  @ApiProperty({ description: 'VAT period end' })
  @IsDateString()
  to_date!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;
}

export class MisDashboardQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;
}

export class ProfitabilityQueryDto extends MisDashboardQueryDto {
  @ApiPropertyOptional({ enum: ['customer', 'job_type', 'branch', 'salesperson'] })
  @IsOptional()
  @IsString()
  group_by?: 'customer' | 'job_type' | 'branch' | 'salesperson';
}

export class CreateSavedReportDto {
  @ApiProperty({ example: 'Monthly P&L — June' })
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiProperty({ enum: SavedReportType })
  @IsEnum(SavedReportType)
  report_type!: SavedReportType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_shared?: boolean;
}

export class UpdateSavedReportDto extends PartialType(CreateSavedReportDto) {}

export class SavedReportQueryDto {
  @ApiPropertyOptional({ enum: SavedReportType })
  @IsOptional()
  @IsEnum(SavedReportType)
  report_type?: SavedReportType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  shared_only?: boolean;
}
