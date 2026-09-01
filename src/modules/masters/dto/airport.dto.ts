import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";
import {
  IsCountryCode,
  IsIata3Code,
  IsIcao4Code,
} from "../../../common/validators/input-format.validators";

export class CreateAirportDto {
  @ApiProperty({ example: "DXB", description: "IATA code" })
  @IsIata3Code()
  iata_code!: string;

  @ApiPropertyOptional({ example: "OMDB", description: "ICAO code" })
  @IsOptional()
  @IsIcao4Code()
  icao_code?: string;

  @ApiProperty({ example: "Dubai International Airport" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "Dubai" })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @ApiProperty({ example: "AE" })
  @IsCountryCode()
  country_code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ example: "Asia/Dubai" })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z_+\-/]+$/, {
    message: "timezone must look like Asia/Dubai",
  })
  @Length(3, 64)
  timezone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAirportDto extends PartialType(CreateAirportDto) {}
