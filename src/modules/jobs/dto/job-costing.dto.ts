import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  JobChargeDrCr,
  JobChargePpCc,
  JobChargeProrateStatus,
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
    description:
      "Profit Share A/C — Chart of Accounts id (GET /jobs/:id/profit-share/accounts)",
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

/** OpenAPI response: charge header section on a costing grid line */
export class JobCostingChargeSectionResponseDto {
  @ApiPropertyOptional({ format: "uuid" })
  charge_code_id?: string | null;

  @ApiPropertyOptional()
  quantity?: number | null;

  @ApiPropertyOptional()
  remarks?: string | null;

  @ApiPropertyOptional({ enum: JobChargePpCc })
  pp_cc?: JobChargePpCc | null;

  @ApiPropertyOptional()
  ofd_type?: string | null;

  @ApiPropertyOptional()
  is_provisional?: boolean;

  @ApiPropertyOptional()
  is_profit_share?: boolean;
}

/** OpenAPI response: sale side */
export class JobCostingSaleSideResponseDto {
  @ApiPropertyOptional({ format: "uuid" })
  bill_to?: string | null;

  @ApiPropertyOptional()
  amount?: number | null;

  @ApiPropertyOptional()
  tax_amount?: number | null;

  @ApiPropertyOptional({ enum: JobChargeDrCr })
  dr_cr?: JobChargeDrCr | null;

  @ApiPropertyOptional()
  editable?: boolean | null;

  @ApiPropertyOptional()
  currency?: string | null;

  @ApiPropertyOptional()
  ex_rate?: number | null;

  @ApiPropertyOptional()
  fcy_amount?: number | null;

  @ApiPropertyOptional()
  taxable_amount?: number | null;

  @ApiPropertyOptional()
  remarks?: string | null;

  @ApiPropertyOptional()
  voucher_no?: string | null;

  @ApiPropertyOptional({ description: "Gross profit on this line when set" })
  gross_profit?: number | null;
}

/** OpenAPI response: cost side */
export class JobCostingCostSideResponseDto {
  @ApiPropertyOptional({ format: "uuid" })
  vendor?: string | null;

  @ApiPropertyOptional()
  amount?: number | null;

  @ApiPropertyOptional()
  tax_amount?: number | null;

  @ApiPropertyOptional({ enum: JobChargeDrCr })
  dr_cr?: JobChargeDrCr | null;

  @ApiPropertyOptional()
  editable?: boolean | null;

  @ApiPropertyOptional()
  currency?: string | null;

  @ApiPropertyOptional()
  ex_rate?: number | null;

  @ApiPropertyOptional()
  fcy_amount?: number | null;

  @ApiPropertyOptional()
  declaration_no?: string | null;

  @ApiPropertyOptional()
  declaration_date?: Date | string | null;

  @ApiPropertyOptional()
  reference_no?: string | null;

  @ApiPropertyOptional()
  date?: Date | string | null;

  @ApiPropertyOptional()
  remarks?: string | null;

  @ApiPropertyOptional()
  voucher_no?: string | null;
}

/** One costing grid row (Fresa charge + sale + cost) */
export class JobCostingGridLineDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiPropertyOptional()
  line_no?: number | null;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional({ description: "Unit of measure" })
  unit?: string | null;

  @ApiProperty({ type: JobCostingChargeSectionResponseDto })
  charge!: JobCostingChargeSectionResponseDto;

  @ApiPropertyOptional({ type: JobCostingSaleSideResponseDto, nullable: true })
  sale!: JobCostingSaleSideResponseDto | null;

  @ApiPropertyOptional({ type: JobCostingCostSideResponseDto, nullable: true })
  cost!: JobCostingCostSideResponseDto | null;

  @ApiPropertyOptional({ description: "Line GP amount" })
  gp?: number | null;

  @ApiPropertyOptional()
  freight?: boolean | null;

  @ApiProperty({
    enum: JobChargeProrateStatus,
    description: "NONE | PARTIAL | FULL | CANCELLED",
  })
  prorated_status!: JobChargeProrateStatus;

  @ApiPropertyOptional()
  history_count?: number;

  @ApiPropertyOptional()
  sale_voucher_no?: string | null;

  @ApiPropertyOptional()
  cost_voucher_no?: string | null;

  @ApiPropertyOptional()
  attachment_count?: number;
}

export class JobChargesListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: [JobCostingGridLineDto] })
  data!: JobCostingGridLineDto[];
}

export class ProfitShareCalculatorWeightsDto {
  @ApiPropertyOptional({ description: "Gross weight (job header)" })
  gross_weight?: number | null;

  @ApiPropertyOptional({
    description: "Net weight (rolled up from containers when available)",
  })
  net_weight?: number | null;

  @ApiPropertyOptional({ description: "Volume CBM (job header)" })
  volume_cbm?: number | null;

  @ApiPropertyOptional({ description: "Chargeable weight (job header)" })
  chargeable_weight?: number | null;

  @ApiPropertyOptional()
  pieces?: number | null;
}

export class ProfitShareDeclaredLineDto {
  @ApiProperty({ format: "uuid" })
  charge_id!: string;

  @ApiPropertyOptional()
  line_no?: number | null;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional()
  unit?: string | null;

  @ApiPropertyOptional({ enum: JobChargePpCc })
  pp_cc?: JobChargePpCc | null;

  @ApiProperty()
  amount!: number;

  @ApiPropertyOptional()
  tax_amount?: number | null;

  @ApiPropertyOptional({ enum: JobChargeDrCr })
  dr_cr?: JobChargeDrCr | null;

  @ApiPropertyOptional()
  currency?: string | null;
}

export class ProfitShareOurShareDto {
  @ApiProperty({ description: "Our profit share amount (declared GP before %)" })
  amount!: number;

  @ApiProperty({ example: "Our Profit Share" })
  label!: string;
}

export class ProfitSharePreviewDataDto {
  @ApiProperty({ format: "uuid" })
  charge_code_id!: string;

  @ApiProperty({ type: ProfitShareCalculatorWeightsDto })
  calculator!: ProfitShareCalculatorWeightsDto;

  @ApiProperty({
    type: [ProfitShareDeclaredLineDto],
    description: "Declared Sale lines feeding the calculator",
  })
  declared_sale_lines!: ProfitShareDeclaredLineDto[];

  @ApiProperty({
    type: [ProfitShareDeclaredLineDto],
    description: "Declared Cost lines feeding the calculator",
  })
  declared_cost_lines!: ProfitShareDeclaredLineDto[];

  @ApiProperty()
  declared_sale_total!: number;

  @ApiProperty()
  declared_cost_total!: number;

  @ApiProperty({ type: ProfitShareOurShareDto })
  our_profit_share!: ProfitShareOurShareDto;

  @ApiProperty({
    type: [String],
    description: "All shipment numbers linked to the job",
  })
  shipment_numbers!: string[];

  @ApiPropertyOptional({
    nullable: true,
    description: "Primary shipment number (first linked)",
  })
  shipment_no!: string | null;

  @ApiProperty({ description: "Declared sale total (BASE)" })
  sale!: { amount: number; currency: string };

  @ApiProperty({ description: "Declared cost total (BASE)" })
  cost!: { amount: number; currency: string };

  @ApiProperty()
  gp!: number;

  @ApiProperty()
  source_line_count!: number;

  @ApiProperty()
  note!: string;
}

export class ProfitSharePreviewResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: ProfitSharePreviewDataDto })
  data!: ProfitSharePreviewDataDto;
}

export class ProfitShareCalculatorResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: ProfitShareCalculatorWeightsDto })
  data!: ProfitShareCalculatorWeightsDto;
}

export class ProfitShareAccountItemDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  account_code!: string;

  @ApiProperty()
  account_name!: string;

  @ApiPropertyOptional()
  account_group?: string | null;

  @ApiPropertyOptional()
  account_type?: string | null;

  @ApiPropertyOptional()
  is_postable?: boolean;

  @ApiPropertyOptional()
  is_active?: boolean;
}

export class ProfitShareAccountsResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    type: [ProfitShareAccountItemDto],
    description:
      "Chart of Accounts rows for Profit Share A/C (use id as profit_share_account_id)",
  })
  data!: ProfitShareAccountItemDto[];
}

export class ProfitShareAccountsQueryDto {
  @ApiPropertyOptional({ description: "Search account code or name" })
  @IsOptional()
  @IsString()
  search?: string;
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
