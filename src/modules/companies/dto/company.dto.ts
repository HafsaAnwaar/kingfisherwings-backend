import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";
import {
  CountryCodeField,
  IsPhoneForCountry,
  IsTaxIdForCountry,
} from "../../../common/validators/country-aware.validators";

export class CreateCompanyDto {
  @ApiProperty({ example: "OCE-DXB" })
  @IsString()
  @Length(2, 20)
  code!: string;

  @ApiProperty({ example: "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC" })
  @IsString()
  @Length(2, 300)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  legal_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registration_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTaxIdForCountry()
  vat_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "AE" })
  @IsOptional()
  @CountryCodeField()
  country_code?: string;

  @ApiPropertyOptional({ example: "+971501234567" })
  @IsOptional()
  @IsPhoneForCountry()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsStrictEmail()
  email?: string;

  @ApiPropertyOptional({
    default: false,
    description: "Only one company per tenant can be default.",
  })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: "UAE WPS employer MOL / EDR ID" })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  wps_employer_mol_id?: string;

  @ApiPropertyOptional({ description: "UAE WPS agent / bank routing code" })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  wps_agent_routing_code?: string;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
