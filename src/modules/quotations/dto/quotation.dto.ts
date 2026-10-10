import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
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
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from "class-validator";
import { JobType, QuotationSource } from "@prisma/client";
import { CargoPackageDto } from "../../../common/dto/cargo-package.dto";

const INCOTERMS = [
  "EXW",
  "FCA",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
];

export class CreateQuotationDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  job_type!: JobType;

  @ApiProperty({ format: "uuid", description: "Customer/prospect Party." })
  @IsUUID()
  customer_id!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description:
      "The quoted carrier — a Party of type AIRLINE/SHIPPING_LINE/TRUCKER.",
  })
  @IsOptional()
  @IsUUID()
  carrier_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  por_port_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  pof_port_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  place_of_receipt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  place_of_delivery?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voyage_number?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  quotation_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customer_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ description: "PP / CC / etc." })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  freight_payment_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marks_numbers?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  source_enquiry_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional({ enum: INCOTERMS })
  @IsOptional()
  @IsEnum(INCOTERMS)
  incoterm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(4, 12)
  hs_code?: string;

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

  @ApiPropertyOptional({
    description:
      "Ignored when packages or metre dimensions are sent — CBM is Length(m)×Width(m)×Height(m)×pieces.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume_cbm?: number;

  @ApiPropertyOptional({ example: 1.2, description: "Length in metres (auto CBM)" })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  length_m?: number;

  @ApiPropertyOptional({ example: 0.8 })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  width_m?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  height_m?: number;

  @ApiPropertyOptional({ type: [CargoPackageDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CargoPackageDto)
  packages?: CargoPackageDto[];

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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_dg?: boolean;

  @ApiPropertyOptional({ example: "9" })
  @IsOptional()
  @IsString()
  dg_class?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_requirements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carrier_preference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  transit_time_days?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  routing_notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internal_notes?: string;

  @ApiPropertyOptional({ description: "Fresa quotation T&Cs on customer PDF" })
  @IsOptional()
  @IsString()
  terms_and_conditions?: string;

  @ApiPropertyOptional({ example: "2026-08-01" })
  @IsOptional()
  @IsDateString()
  valid_from?: string;

  @ApiPropertyOptional({ example: "2026-08-31" })
  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional({ enum: QuotationSource })
  @IsOptional()
  @IsEnum(QuotationSource)
  source?: QuotationSource;
}

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {}
