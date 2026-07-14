import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AccountGroup,
  AccountSubType,
  AccountType,
  VoucherStatus,
  VoucherType,
} from '@prisma/client';

export class CreateChartOfAccountDto {
  @ApiProperty({ example: '1100' })
  @IsString()
  @Length(1, 30)
  account_code!: string;

  @ApiProperty({ example: 'Trade Receivables' })
  @IsString()
  @Length(1, 200)
  account_name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  account_name_ar?: string;

  @ApiProperty({ enum: AccountGroup })
  @IsEnum(AccountGroup)
  account_group!: AccountGroup;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  account_type!: AccountType;

  @ApiPropertyOptional({ enum: AccountSubType, default: AccountSubType.GENERAL })
  @IsOptional()
  @IsEnum(AccountSubType)
  account_sub_type?: AccountSubType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_header?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_postable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_bank_account?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_cash_account?: boolean;

  @ApiPropertyOptional({ example: 'AED' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  opening_balance?: number;

  @ApiPropertyOptional({ enum: ['DEBIT', 'CREDIT'], default: 'DEBIT' })
  @IsOptional()
  @IsString()
  opening_balance_type?: 'DEBIT' | 'CREDIT';

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allow_manual_entry?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateChartOfAccountDto extends PartialType(CreateChartOfAccountDto) {}

export class ChartOfAccountQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AccountGroup })
  @IsOptional()
  @IsEnum(AccountGroup)
  account_group?: AccountGroup;

  @ApiPropertyOptional({ enum: AccountType })
  @IsOptional()
  @IsEnum(AccountType)
  account_type?: AccountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_postable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;
}

export class CreateVoucherLineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  account_id!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  debit_amount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  credit_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  narration?: string;

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
  @Length(1, 50)
  cost_center?: string;
}

export class UpdateVoucherLineDto extends PartialType(CreateVoucherLineDto) {}

export class CreateVoucherDto {
  @ApiProperty({ enum: VoucherType })
  @IsEnum(VoucherType)
  voucher_type!: VoucherType;

  @ApiPropertyOptional({ example: 'AED' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  voucher_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  reference_number?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  invoice_id?: string;

  @ApiPropertyOptional({ type: [CreateVoucherLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVoucherLineDto)
  lines?: CreateVoucherLineDto[];
}

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}

export class VoucherQueryDto {
  @ApiPropertyOptional({ enum: VoucherType })
  @IsOptional()
  @IsEnum(VoucherType)
  voucher_type?: VoucherType;

  @ApiPropertyOptional({ enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

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
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class LedgerQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class TrialBalanceQueryDto {
  @ApiPropertyOptional({ description: 'Inclusive period start (defaults to open)' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ description: 'Inclusive period end (defaults to today)' })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({ description: 'Hide zero-balance accounts', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hide_zero?: boolean;
}
