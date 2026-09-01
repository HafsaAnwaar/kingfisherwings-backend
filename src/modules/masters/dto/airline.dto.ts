import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from "class-validator";
import {
  IsCountryCode,
  IsIata2Code,
  IsIcao3Code,
  IsAwbPrefix,
} from "../../../common/validators/input-format.validators";

export class CreateAirlineDto {
  @ApiProperty({ example: "EK", description: "IATA 2-letter code" })
  @IsIata2Code()
  iata_code!: string;

  @ApiPropertyOptional({ example: "UAE", description: "ICAO 3-letter code" })
  @IsOptional()
  @IsIcao3Code()
  icao_code?: string;

  @ApiPropertyOptional({ example: "176", description: "3-digit AWB prefix" })
  @IsOptional()
  @IsAwbPrefix()
  prefix_code?: string;

  @ApiProperty({ example: "Emirates" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "AE" })
  @IsOptional()
  @IsCountryCode()
  country_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAirlineDto extends PartialType(CreateAirlineDto) {}
