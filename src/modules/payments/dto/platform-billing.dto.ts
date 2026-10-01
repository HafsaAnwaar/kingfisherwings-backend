import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import {
  BillingInterval,
  PaymentMethod,
  PlatformInvoiceStatus,
  SubscriptionPlan,
} from "@prisma/client";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";

export class PlatformInvoiceLineDto {
  @ApiProperty({ example: "Monthly Platform Fee" })
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantity?: number;

  @ApiProperty({ example: 499 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  unit_price!: number;
}

export class CreatePlatformInvoiceDto {
  @ApiProperty()
  @IsUUID()
  tenant_id!: string;

  @ApiPropertyOptional({
    description: "Defaults to the tenant's base currency.",
  })
  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/)
  currency_code?: string;

  @ApiProperty({ type: [PlatformInvoiceLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PlatformInvoiceLineDto)
  lines!: PlatformInvoiceLineDto[];

  @ApiPropertyOptional({
    description: "Flat discount in invoice currency.",
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional({
    description: "Tax percentage applied after discount.",
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(100)
  tax_rate?: number;

  @ApiPropertyOptional({ example: "2026-10-31" })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  period_start?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  period_end?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class UpdatePlatformInvoiceDto {
  @ApiPropertyOptional({ example: "2026-10-01" })
  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @ApiPropertyOptional({ type: [PlatformInvoiceLineDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PlatformInvoiceLineDto)
  lines?: PlatformInvoiceLineDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/)
  currency_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(100)
  tax_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  period_start?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  period_end?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class PlatformInvoiceQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  tenant_id?: string;

  @ApiPropertyOptional({ enum: PlatformInvoiceStatus })
  @IsOptional()
  @IsEnum(PlatformInvoiceStatus)
  status?: PlatformInvoiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class SendPlatformInvoiceDto {
  @ApiPropertyOptional({
    default: true,
    description:
      "false = finalize for portal delivery only (no email). The tenant sees it in the portal either way.",
  })
  @IsOptional()
  @IsBoolean()
  deliver_email?: boolean;

  @ApiPropertyOptional({
    description:
      "Override recipient; defaults to the tenant's contact + tenant admins.",
  })
  @IsOptional()
  @IsStrictEmail()
  to_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  include_payment_link?: boolean;
}

export class CancelPlatformInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class RecordPlatformManualPaymentDto {
  @ApiProperty({ example: 499 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({ example: "2026-09-30" })
  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

/** Multipart body for a tenant-submitted manual payment (with proof file). */
export class SubmitPlatformPaymentProofDto extends RecordPlatformManualPaymentDto {}

export class RejectPlatformPaymentDto {
  @ApiProperty()
  @IsString()
  @Length(3, 1000)
  reason!: string;
}

export class CreateBillingPlanDto {
  @ApiProperty({ example: "PRO_MONTHLY" })
  @Matches(/^[A-Z0-9_]{2,40}$/)
  code!: string;

  @ApiProperty({ example: "Professional (monthly)" })
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  subscription_plan!: SubscriptionPlan;

  @ApiProperty({ example: 499 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: "USD" })
  @Matches(/^[A-Za-z]{3}$/)
  currency_code!: string;

  @ApiPropertyOptional({
    enum: BillingInterval,
    default: BillingInterval.MONTH,
  })
  @IsOptional()
  @IsEnum(BillingInterval)
  interval?: BillingInterval;

  @ApiPropertyOptional({
    description: "Existing Stripe Price id; omit to create one.",
  })
  @IsOptional()
  @Matches(/^price_[A-Za-z0-9]+$/)
  stripe_price_id?: string;

  @ApiPropertyOptional({
    default: true,
    description: "Create Product/Price in Stripe when no price id is given.",
  })
  @IsOptional()
  @IsBoolean()
  sync_to_stripe?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_users?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_branches?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_storage_gb?: number;
}

export class UpdateBillingPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description:
      "Point the plan at a new Stripe Price (prices are immutable in Stripe).",
  })
  @IsOptional()
  @Matches(/^price_[A-Za-z0-9]+$/)
  stripe_price_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_users?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_branches?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_storage_gb?: number;
}

export class SubscribePlanDto {
  @ApiProperty()
  @IsUUID()
  plan_id!: string;
}
