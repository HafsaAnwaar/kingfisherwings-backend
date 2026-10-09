import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
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
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { BlDocumentStatus, JobType, ShipmentStatus } from "@prisma/client";

export class CreateShipmentChargeDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  unit_price!: number;

  @ApiPropertyOptional({ default: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_cost?: boolean;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

export class CreateShipmentDto {
  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  job_type!: JobType;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  customer_id!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  quotation_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  enquiry_id?: string;

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
  department_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  notify_party_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  delivery_agent_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  carrier_agent_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  atd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  ata?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  onboard_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyage_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  chargeable_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  volume_cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pieces?: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  container_count?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  container_numbers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seal_numbers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  incoterms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_dg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dg_class?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hbl_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  hbl_date?: string;

  @ApiPropertyOptional({ enum: BlDocumentStatus })
  @IsOptional()
  @IsEnum(BlDocumentStatus)
  bl_status?: BlDocumentStatus;

  @ApiPropertyOptional({ type: [CreateShipmentChargeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentChargeDto)
  charges?: CreateShipmentChargeDto[];
}

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {}

export class ShipmentQueryDto {
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
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ShipmentStatus })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  quotation_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class ChangeShipmentStatusDto {
  @ApiProperty({ enum: ShipmentStatus })
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class GenerateJobFromShipmentDto {
  @ApiProperty({
    enum: ["HOUSE", "DIRECT"],
    description:
      "HOUSE = attach as house under optional master_job_id; DIRECT = standalone/master job",
  })
  @IsEnum(["HOUSE", "DIRECT"] as const)
  mode!: "HOUSE" | "DIRECT";

  @ApiPropertyOptional({
    format: "uuid",
    description: "Required when mode=HOUSE to attach under an existing master job",
  })
  @IsOptional()
  @IsUUID()
  master_job_id?: string;
}

export class CopyShipmentDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  copy_parties?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  copy_containers?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  copy_sale?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  copy_cost?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  copy_vessel?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  volume_cbm?: number;
}

export class GetShipmentChargesDto {
  @ApiPropertyOptional({
    description: "Pull revenue lines from linked quotation",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  from_quotation?: boolean;

  @ApiPropertyOptional({
    description: "Pull party standard charges for customer",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  from_party_standard?: boolean;
}

export class CopyShipmentChargesDto {
  @ApiPropertyOptional({
    format: "uuid",
    description: "Copy from another shipment",
  })
  @IsOptional()
  @IsUUID()
  from_shipment_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Copy from a job's charge lines",
  })
  @IsOptional()
  @IsUUID()
  from_job_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Copy from quotation line items",
  })
  @IsOptional()
  @IsUUID()
  from_quotation_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  copy_sale?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  copy_cost?: boolean;
}
