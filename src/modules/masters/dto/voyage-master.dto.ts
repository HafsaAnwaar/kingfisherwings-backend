import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  Length,
  MaxLength,
  Min,
} from "class-validator";

export class CreateVoyageMasterDto {
  @ApiProperty({ example: "VSL-2026-001" })
  @IsString()
  @Length(1, 50)
  voyage_code!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipping_line_id?: string;

  @ApiPropertyOptional({ example: "2026-04-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional({ example: "2026-04-15T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateVoyageMasterDto extends PartialType(CreateVoyageMasterDto) {}
