import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
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
  ValidateNested,
} from 'class-validator';
import { InvoiceStatus, InvoiceType } from '@prisma/client';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';

export class CreateInvoiceLineDto {
  @ApiProperty({ example: 'Ocean Freight' })
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  unit_price!: number;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_taxable?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sort_order?: number;
}

export class UpdateInvoiceLineDto extends PartialType(CreateInvoiceLineDto) {}

export class CreateInvoiceDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  party_id!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiPropertyOptional({ default: 5, description: 'UAE VAT default 5%' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vat_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  invoice_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lpo_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internal_notes?: string;

  @ApiPropertyOptional({ type: [CreateInvoiceLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines?: CreateInvoiceLineDto[];
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}

export class CreateCreditNoteDto {
  @ApiProperty({ format: 'uuid', description: 'Original customer invoice being credited' })
  @IsUUID()
  credited_invoice_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ type: [CreateInvoiceLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines?: CreateInvoiceLineDto[];
}

export class CreatePurchaseInvoiceDto extends CreateInvoiceDto {
  @ApiProperty({ format: 'uuid', description: 'Vendor/supplier party' })
  @IsUUID()
  party_id!: string;
}

export class SendInvoiceEmailDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsStrictEmail()
  to_email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  message?: string;
}

export class InvoiceQueryDto {
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
  @Max(200)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ enum: InvoiceType })
  @IsOptional()
  @IsEnum(InvoiceType)
  invoice_type?: InvoiceType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
