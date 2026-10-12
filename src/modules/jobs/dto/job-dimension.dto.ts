import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  DimensionLengthUnit,
  DimensionPackageType,
  DimensionVolumeUnit,
  DimensionWeightUnit,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
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

export class UpsertJobDimensionLineDto {
  @ApiPropertyOptional({ description: "Omit to auto-assign next line_no" })
  @IsOptional()
  @IsInt()
  @Min(1)
  line_no?: number;

  @ApiPropertyOptional({ enum: DimensionLengthUnit, default: "CM" })
  @IsOptional()
  @IsEnum(DimensionLengthUnit)
  length_unit?: DimensionLengthUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  no_of_pcs?: number;

  @ApiPropertyOptional({ enum: DimensionPackageType, default: "PACKAGES" })
  @IsOptional()
  @IsEnum(DimensionPackageType)
  package_type?: DimensionPackageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  g_weight?: number;

  @ApiPropertyOptional({ enum: DimensionWeightUnit, default: "KG" })
  @IsOptional()
  @IsEnum(DimensionWeightUnit)
  g_weight_unit?: DimensionWeightUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  v_weight?: number;

  @ApiPropertyOptional({ enum: DimensionWeightUnit, default: "KG" })
  @IsOptional()
  @IsEnum(DimensionWeightUnit)
  v_weight_unit?: DimensionWeightUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  n_weight?: number;

  @ApiPropertyOptional({ enum: DimensionWeightUnit, default: "KG" })
  @IsOptional()
  @IsEnum(DimensionWeightUnit)
  n_weight_unit?: DimensionWeightUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_weight?: number;

  @ApiPropertyOptional({ enum: DimensionWeightUnit, default: "KG" })
  @IsOptional()
  @IsEnum(DimensionWeightUnit)
  total_weight_unit?: DimensionWeightUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ enum: DimensionVolumeUnit, default: "CBM" })
  @IsOptional()
  @IsEnum(DimensionVolumeUnit)
  volume_unit?: DimensionVolumeUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 12)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  dimension_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  cod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_inner_city?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  goods_value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  container_no?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commodity_description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description: "After save, sync this line into JobCargo",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  sync_to_cargo?: boolean;
}

export class UpdateJobDimensionLineDto extends PartialType(
  UpsertJobDimensionLineDto,
) {}

export class BulkDimensionItemDto extends UpsertJobDimensionLineDto {
  @ApiPropertyOptional({
    format: "uuid",
    description: "Existing line id for update; omit to create",
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({
    description: "Soft-delete this line when true (requires id)",
  })
  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}

export class BulkJobDimensionsDto {
  @ApiProperty({ type: [BulkDimensionItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkDimensionItemDto)
  lines!: BulkDimensionItemDto[];

  @ApiPropertyOptional({
    default: false,
    description: "Soft-delete all existing lines before applying",
  })
  @IsOptional()
  @IsBoolean()
  replace_all?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: "Sync all resulting lines to JobCargo after bulk save",
  })
  @IsOptional()
  @IsBoolean()
  sync_to_cargo?: boolean;
}

export class SyncDimensionsToCargoDto {
  @ApiPropertyOptional({
    description: "Only these dimension line ids (default: all active lines)",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  line_ids?: string[];

  @ApiPropertyOptional({
    default: false,
    description:
      "Soft-delete JobCargo rows previously synced from dims that are no longer present",
  })
  @IsOptional()
  @IsBoolean()
  prune_orphans?: boolean;
}

export class ConfirmDimensionUploadDto {
  @ApiProperty({ type: [UpsertJobDimensionLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpsertJobDimensionLineDto)
  lines!: UpsertJobDimensionLineDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  replace_all?: boolean;
}

export class PasteDimensionUploadDto {
  @ApiProperty({
    description:
      "Pasted EDI Format column text or CSV body (Fresa upload paste flow)",
  })
  @IsString()
  @Length(1, 500_000)
  content!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  replace_all?: boolean;
}
