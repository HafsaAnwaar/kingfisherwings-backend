import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

export class CreateAirPalletTypeDto {
  @ApiProperty({ example: "LD3" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "LD3 Container" })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({ example: ["AKE", "AVE"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  iata_codes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  base_length_m?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  base_width_m?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  height_m?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  usable_volume_m3?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  inside_length_m?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  inside_width_m?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  inside_height_m?: number;

  @ApiPropertyOptional({ example: ["A300", "A330", "B747-400"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aircraft_types?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAirPalletTypeDto extends PartialType(CreateAirPalletTypeDto) {}
