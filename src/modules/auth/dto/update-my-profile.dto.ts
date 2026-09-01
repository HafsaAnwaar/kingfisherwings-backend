import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import {
  CountryCodeField,
  IsPhoneForCountry,
} from "../../../common/validators/country-aware.validators";

/**
 * Self-service profile fields any signed-in user can change after login.
 * Country is optional — set, change, or send null to clear.
 */
export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    example: "AE",
    description:
      "Optional preferred country (ISO 3166-1 alpha-2). Omit to leave unchanged; send null to clear.",
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @CountryCodeField()
  preferred_country_code?: string | null;

  @ApiPropertyOptional({ example: "+971501234567" })
  @IsOptional()
  @IsPhoneForCountry({ countryField: "preferred_country_code" })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;

  @ApiPropertyOptional({ example: "en" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}
