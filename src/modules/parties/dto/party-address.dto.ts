import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import {
  CountryCodeField,
  IsPhoneForCountry,
  IsPostalCodeForCountry,
} from "../../../common/validators/country-aware.validators";

export class CreatePartyAddressDto {
  @ApiProperty({
    example: "Warehouse",
    description: "Free-text label, e.g. Billing / Delivery / Warehouse.",
  })
  @IsString()
  @Length(1, 50)
  label!: string;

  @ApiProperty({ example: "Plot 45, Jebel Ali Free Zone" })
  @IsString()
  address_line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address_line2?: string;

  @ApiPropertyOptional({ example: "Dubai" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: "00000" })
  @IsOptional()
  @IsPostalCodeForCountry()
  postal_code?: string;

  @ApiPropertyOptional({
    example: "AE",
    description:
      "Optional. When set, postal_code is validated for this country; when omitted, loose postal rules apply.",
  })
  @IsOptional()
  @CountryCodeField()
  country_code?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdatePartyAddressDto extends PartialType(CreatePartyAddressDto) {}
