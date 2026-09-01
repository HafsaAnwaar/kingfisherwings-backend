import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
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
} from "class-validator";
import { Type } from "class-transformer";
import {
  BankReconciliationStatus,
  ChequeStatus,
  ChequeType,
  PaymentDirection,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

export class PaymentAllocationInputDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  invoice_id!: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0.0001)
  amount!: number;
}

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentDirection })
  @IsEnum(PaymentDirection)
  direction!: PaymentDirection;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  party_id!: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0.0001)
  amount!: number;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  exchange_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  payment_date?: string;

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
  bank_account_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  gl_account_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  reference_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiPropertyOptional({ type: [PaymentAllocationInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationInputDto)
  allocations?: PaymentAllocationInputDto[];

  @ApiPropertyOptional({
    description: "Optional cheque details when payment_method=CHEQUE",
  })
  @IsOptional()
  @IsString()
  cheque_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cheque_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cheque_due_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cheque_bank_name?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_pdc?: boolean;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}

export class PaymentQueryDto {
  @ApiPropertyOptional({ enum: PaymentDirection })
  @IsOptional()
  @IsEnum(PaymentDirection)
  direction?: PaymentDirection;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

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

export class CreateChequeDto {
  @ApiProperty({ example: "CHK-1001" })
  @IsString()
  @Length(1, 50)
  cheque_number!: string;

  @ApiProperty({ enum: ChequeType })
  @IsEnum(ChequeType)
  cheque_type!: ChequeType;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  party_id!: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.0001)
  amount!: number;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiProperty()
  @IsDateString()
  cheque_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_pdc?: boolean;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  bank_account_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bank_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateChequeDto extends PartialType(CreateChequeDto) {}

export class ChequeQueryDto {
  @ApiPropertyOptional({ enum: ChequeType })
  @IsOptional()
  @IsEnum(ChequeType)
  cheque_type?: ChequeType;

  @ApiPropertyOptional({ enum: ChequeStatus })
  @IsOptional()
  @IsEnum(ChequeStatus)
  status?: ChequeStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_pdc?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_before?: string;
}

export class BounceChequeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}

export class AgingQueryDto {
  @ApiPropertyOptional({ description: "As-of date (default today)" })
  @IsOptional()
  @IsDateString()
  as_of?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;
}

export class CreateBankReconciliationDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  gl_account_id!: string;

  @ApiProperty()
  @IsDateString()
  statement_date!: string;

  @ApiProperty({ example: 125000.5 })
  @IsNumber()
  statement_balance!: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  bank_account_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateBankReconciliationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  statement_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  statement_balance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BankReconciliationQueryDto {
  @ApiPropertyOptional({ enum: BankReconciliationStatus })
  @IsOptional()
  @IsEnum(BankReconciliationStatus)
  status?: BankReconciliationStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  gl_account_id?: string;
}

export class CreateBankReconciliationLineDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  voucher_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  voucher_line_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  account_id?: string;

  @ApiProperty()
  @IsDateString()
  txn_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

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

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_matched?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  statement_ref?: string;
}

export class UpdateBankReconciliationLineDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_matched?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statement_ref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateBankTransferDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  from_account_id!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  to_account_id!: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0.0001)
  amount!: number;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  exchange_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  transfer_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference_number?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;
}
