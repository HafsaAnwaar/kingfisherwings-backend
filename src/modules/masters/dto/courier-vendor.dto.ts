import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";
import {
  CountryCodeField,
  IsPhoneForCountry,
} from "../../../common/validators/country-aware.validators";

export class CreateCourierVendorDto {
  @ApiProperty({ example: "DHL Express" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: "DHL" })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiPropertyOptional({ example: "AE" })
  @IsOptional()
  @CountryCodeField()
  country_code?: string;

  @ApiPropertyOptional({ example: "+97140000000" })
  @IsOptional()
  @IsPhoneForCountry()
  phone?: string;

  @ApiPropertyOptional({ example: "ops@dhl.example" })
  @IsOptional()
  @IsStrictEmail()
  email?: string;

  @ApiPropertyOptional({
    example: "https://www.dhl.com/en/express/tracking.html?AWB={tracking}",
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  tracking_url_template?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCourierVendorDto extends PartialType(
  CreateCourierVendorDto,
) {}
