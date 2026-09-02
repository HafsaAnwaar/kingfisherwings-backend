import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { JobType, ServicePricingBasis } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";

export class ServiceCatalogQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(200)
  limit = 50;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  portal_visible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  active_only?: boolean;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;
}

export class CreateServiceCatalogItemDto {
  @ApiProperty({ example: "AIR_FREIGHT" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Air Freight" })
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiProperty({ enum: ServicePricingBasis, default: ServicePricingBasis.FLAT })
  @IsEnum(ServicePricingBasis)
  pricing_basis: ServicePricingBasis = ServicePricingBasis.FLAT;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  unit_price!: number;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_charge?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_portal_visible?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}

export class UpdateServiceCatalogItemDto extends PartialType(
  CreateServiceCatalogItemDto,
) {}
