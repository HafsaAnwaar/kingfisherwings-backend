import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";
import {
  IsCountryCode,
  IsImoNumber,
} from "../../../common/validators/input-format.validators";

export class CreateVesselDto {
  @ApiProperty({ example: "MSC GULSUN" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "9839430" })
  @IsOptional()
  @IsImoNumber()
  imo_number?: string;

  @ApiPropertyOptional({ example: "PA" })
  @IsOptional()
  @IsCountryCode()
  flag_country?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipping_line_id?: string;

  @ApiPropertyOptional({ example: "Container Ship" })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vessel_type?: string;

  @ApiPropertyOptional({ example: 2019 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year_built?: number;

  @ApiPropertyOptional({ description: "Gross tonnage" })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  gross_tonnage?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateVesselDto extends PartialType(CreateVesselDto) {}
