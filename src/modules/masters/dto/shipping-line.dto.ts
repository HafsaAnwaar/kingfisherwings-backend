import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from "class-validator";
import { IsCountryCode } from "../../../common/validators/input-format.validators";

export class CreateShippingLineDto {
  @ApiProperty({
    example: "MAEU",
    description: "SCAC code (2–10 alphanumeric)",
  })
  @IsString()
  @Matches(/^[A-Z0-9]{2,10}$/, {
    message: "scac_code must be 2–10 uppercase alphanumeric characters",
  })
  scac_code!: string;

  @ApiProperty({ example: "Maersk Line" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "Maersk" })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  short_name?: string;

  @ApiPropertyOptional({ example: "DK" })
  @IsOptional()
  @IsCountryCode()
  country_code?: string;

  @ApiPropertyOptional({ example: "https://www.maersk.com" })
  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: "website must be a valid URL with protocol (https://...)" },
  )
  website?: string;

  @ApiPropertyOptional({ description: "Container tracking URL template." })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  tracking_url?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateShippingLineDto extends PartialType(CreateShippingLineDto) {}
