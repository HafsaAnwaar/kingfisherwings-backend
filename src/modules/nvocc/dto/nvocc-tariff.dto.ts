import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { NvoccCargoType, NvoccTariffCommodityType, NvoccTariffStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateNvoccTariffDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  trade_lane: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pol_region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pod_region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional({ enum: NvoccTariffCommodityType })
  @IsOptional()
  @IsEnum(NvoccTariffCommodityType)
  commodity_type?: NvoccTariffCommodityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lcl_rate_cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lcl_rate_wm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lcl_minimum_charge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fcl_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  origin_thc?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dest_thc?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bl_fee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baf_surcharge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  caf_surcharge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pss_surcharge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gri_surcharge?: number;

  @ApiProperty()
  @IsDateString()
  rate_valid_from: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  rate_valid_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(3)
  currency_code: string;

  @ApiPropertyOptional({ enum: NvoccTariffStatus })
  @IsOptional()
  @IsEnum(NvoccTariffStatus)
  status?: NvoccTariffStatus;
}

export class UpdateNvoccTariffDto extends PartialType(CreateNvoccTariffDto) {}

export class NvoccTariffLookupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional({ enum: NvoccCargoType })
  @IsOptional()
  @IsEnum(NvoccCargoType)
  cargo_type?: NvoccCargoType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validity_date?: string;
}

export class NvoccTariffQueryDto {
  @ApiPropertyOptional({ enum: NvoccTariffStatus })
  @IsOptional()
  @IsEnum(NvoccTariffStatus)
  status?: NvoccTariffStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
