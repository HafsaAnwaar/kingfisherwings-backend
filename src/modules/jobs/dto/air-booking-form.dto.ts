import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class UpsertAirBookingFormDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  air_pallet_type_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  chargeable_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_handling?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
