import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateJobCargoDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "House consignee for co-loading / split",
  })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 12)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marks_numbers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  packages?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional({ description: "Measurement in CBM" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  measurement?: number;
}

export class UpdateJobCargoDto extends PartialType(CreateJobCargoDto) {}

export class AssignCargoToContainerDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  cargo_id!: string;
}

export class ContainerSplitPortionDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  consignee_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  packages?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  measurement?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marks_numbers?: string;
}

export class SplitContainerDto {
  @ApiProperty({ type: [ContainerSplitPortionDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ContainerSplitPortionDto)
  portions!: ContainerSplitPortionDto[];
}
