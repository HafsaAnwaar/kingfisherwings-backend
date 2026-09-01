import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { NvoccVoyageStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class CreateNvoccVoyageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shipping_line_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pol_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pod_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  transshipment_port_id?: string;

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
  si_cutoff?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vgm_cutoff?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cy_cutoff?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cargo_cutoff?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  slot_allocation_containers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lcl_capacity_cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mbl_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nvocc_freight_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  carrier_cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  agent_pol_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  agent_pod_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateNvoccVoyageDto extends PartialType(CreateNvoccVoyageDto) {
  @ApiPropertyOptional({ enum: NvoccVoyageStatus })
  @IsOptional()
  @IsEnum(NvoccVoyageStatus)
  voyage_status?: NvoccVoyageStatus;
}

export class NvoccVoyageQueryDto {
  @ApiPropertyOptional({ enum: NvoccVoyageStatus })
  @IsOptional()
  @IsEnum(NvoccVoyageStatus)
  voyage_status?: NvoccVoyageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pol_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pod_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class CopyNvoccVoyageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;
}
