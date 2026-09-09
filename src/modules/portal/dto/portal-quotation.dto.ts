import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { CargoPackageDto } from "../../../common/dto/cargo-package.dto";
import { JobType, QuotationStatus } from "@prisma/client";

export { CargoPackageDto as PortalCargoPackageDto };

export class PortalQuotationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: QuotationStatus })
  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

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

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = "desc";
}

export class PortalCustomerLineDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiPropertyOptional({ example: "OCEAN_FREIGHT" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: 1150 })
  @IsNumber()
  @Min(0)
  unit_price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiPropertyOptional({
    enum: ["CATALOG", "TARIFF", "CUSTOMER_PROPOSED"],
    default: "CUSTOMER_PROPOSED",
  })
  @IsOptional()
  @IsIn(["CATALOG", "TARIFF", "CUSTOMER_PROPOSED"])
  source?: "CATALOG" | "TARIFF" | "CUSTOMER_PROPOSED";
}

export class PortalEstimateSnapshotDto {
  @ApiPropertyOptional({ example: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ example: 1150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_total?: number;

  @ApiPropertyOptional({ example: "2026-09-09T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  captured_at?: string;
}

export class PortalQuotationRequestDto {
  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  job_type!: JobType;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
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

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_requirements?: string;

  @ApiPropertyOptional({ example: "2026-08-31" })
  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  container_count?: number;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({
    type: [CargoPackageDto],
    description: "Optional cargo packages for structured costing",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CargoPackageDto)
  packages?: CargoPackageDto[];

  @ApiPropertyOptional({
    example: ["OCEAN_FREIGHT", "THC"],
    description: "Optional portal service catalog codes to materialize as draft lines",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  service_codes?: string[];

  @ApiPropertyOptional({
    type: [PortalCustomerLineDto],
    description:
      "Optional customer-proposed charge lines (sale rates only). Materialized as draft quotation revenue lines.",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortalCustomerLineDto)
  customer_lines?: PortalCustomerLineDto[];

  @ApiPropertyOptional({ type: PortalEstimateSnapshotDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PortalEstimateSnapshotDto)
  estimate_snapshot?: PortalEstimateSnapshotDto;
}

export class PortalQuotationEstimateDto extends PortalQuotationRequestDto {
  @ApiProperty({ type: [CargoPackageDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CargoPackageDto)
  packages!: CargoPackageDto[];

  @ApiProperty({ example: ["AIR_FREIGHT", "CUSTOMS_CLEARANCE"] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  service_codes!: string[];

  @ApiPropertyOptional({
    type: [PortalCustomerLineDto],
    description:
      "Optional customer unit prices overlay; when set, estimate uses these prices (read-only).",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortalCustomerLineDto)
  customer_lines?: PortalCustomerLineDto[];
}

export class PortalCostingOptionsDto {
  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  job_type!: JobType;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

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

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  container_count?: number;

  @ApiPropertyOptional({ type: [CargoPackageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CargoPackageDto)
  packages?: CargoPackageDto[];

  @ApiPropertyOptional({
    example: ["OCEAN_FREIGHT", "THC"],
    description: "When omitted, returns all portal-visible catalog items for job_type",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  service_codes?: string[];
}

export class PortalQuotationAcceptDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class PortalQuotationCounterOfferDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  message!: string;

  @ApiProperty({
    description:
      "Customer counter-offer total shown on the quotation to both parties.",
  })
  @IsNumber()
  @Min(0)
  proposed_total!: number;

  @ApiPropertyOptional({
    description: "Optional line-level breakdown of the counter-offer.",
    type: "array",
    items: {
      type: "object",
      properties: {
        description: { type: "string" },
        quantity: { type: "number" },
        unit_price: { type: "number" },
        amount: { type: "number" },
      },
    },
  })
  @IsOptional()
  @IsArray()
  proposed_lines?: Array<{
    description: string;
    quantity?: number;
    unit_price?: number;
    amount?: number;
  }>;
}

const PORTAL_LOSS_REASONS = [
  "Competitor Rate",
  "No Space",
  "Cargo Type",
  "No Longer Required",
  "Booked Elsewhere",
  "Price Too High",
  "Other",
] as const;

export class PortalQuotationRejectDto {
  @ApiProperty({ enum: PORTAL_LOSS_REASONS })
  @IsIn([...PORTAL_LOSS_REASONS])
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
