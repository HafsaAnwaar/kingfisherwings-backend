import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  JobChargeDrCr,
  JobChargePpCc,
  VoucherType,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class ChargeSectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  line_no?: number;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  charge_code_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ example: "Ocean Freight" })
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ enum: JobChargePpCc })
  @IsOptional()
  @IsEnum(JobChargePpCc)
  pp_cc?: JobChargePpCc;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  ofd_type?: string;
}

export class SaleSectionDto {
  @ApiPropertyOptional({ format: "uuid", description: "Bill-to party" })
  @IsOptional()
  @IsUUID()
  bill_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  qty?: number;

  @ApiPropertyOptional({ enum: JobChargeDrCr })
  @IsOptional()
  @IsEnum(JobChargeDrCr)
  dr_cr?: JobChargeDrCr;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ example: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  fcy_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tax_group_code?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ex_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxable_amount?: number;

  @ApiPropertyOptional({ description: "Computed if omitted" })
  @IsOptional()
  @IsNumber()
  gross_profit?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  editable?: boolean;
}

export class CostSectionDto {
  @ApiPropertyOptional({ format: "uuid", description: "Vendor party" })
  @IsOptional()
  @IsUUID()
  vendor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  declaration_no?: string;

  @ApiPropertyOptional({ enum: JobChargeDrCr })
  @IsOptional()
  @IsEnum(JobChargeDrCr)
  dr_cr?: JobChargeDrCr;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  declaration_date?: string;

  @ApiPropertyOptional({ example: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  fcy_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ex_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  editable?: boolean;
}

export class CompositeJobChargeDto {
  @ApiProperty({ type: ChargeSectionDto })
  @ValidateNested()
  @Type(() => ChargeSectionDto)
  charge!: ChargeSectionDto;

  @ApiPropertyOptional({ type: SaleSectionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SaleSectionDto)
  sale?: SaleSectionDto;

  @ApiPropertyOptional({ type: CostSectionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CostSectionDto)
  cost?: CostSectionDto;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_provisional?: boolean;
}

export class GetJobChargesFromShipmentDto {
  @ApiProperty({ enum: ["SHIPMENT"], default: "SHIPMENT" })
  @IsString()
  type!: "SHIPMENT";

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  shipment_id!: string;

  @ApiPropertyOptional({
    type: [String],
    description: "Omit to preview all; on confirm, selected ids",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  charge_ids?: string[];

  @ApiPropertyOptional({
    default: false,
    description: "When false, returns preview only",
  })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}

export class ProfitSharePreviewDto {
  @ApiProperty({
    format: "uuid",
    description: "Profit-share calculation charge code",
  })
  @IsUUID()
  charge_code_id!: string;
}

export class ProfitShareAddDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  charge_code_id!: string;

  @ApiProperty({ description: "Profit share percentage 0-100" })
  @IsNumber()
  @Min(0)
  @Max(100)
  profit_share_percent!: number;

  @ApiProperty({
    format: "uuid",
    description: "Agent party (Carrier / Agent / Supplier)",
  })
  @IsUUID()
  profit_share_agent_id!: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "GL / party account for profit share A/C",
  })
  @IsOptional()
  @IsUUID()
  profit_share_account_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class GenerateJobVoucherDto {
  @ApiProperty({ enum: VoucherType })
  @IsEnum(VoucherType)
  voucher_type!: VoucherType;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  charge_ids!: string[];

  @ApiPropertyOptional({ enum: ["SALE", "COST"], default: "SALE" })
  @IsOptional()
  @IsEnum(["SALE", "COST"] as const)
  side?: "SALE" | "COST";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiPropertyOptional({ example: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({
    default: false,
    description: "When true, post the draft voucher immediately (balanced GL).",
  })
  @IsOptional()
  @IsBoolean()
  auto_post?: boolean;
}

export class JobInvoiceFromChargesDto {
  @ApiPropertyOptional({
    type: [String],
    description: "Selected charge ids (default: all eligible)",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  charge_ids?: string[];
}

export type CostingVisibilityAudience = "STAFF" | "CUSTOMER" | "VENDOR";
