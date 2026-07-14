import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl, Length, Max, Min, ValidateIf } from 'class-validator';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';
import {
  CountryCodeField,
  IsKnownCurrencyCode,
  IsPhoneForCountry,
  IsTaxIdForCountry,
  IsTimezoneForCountry,
  NormalizeCurrencyCode,
} from '../../../common/validators/country-aware.validators';

/**
 * Fields a tenant's own admin may edit about their organization after login.
 * country_code is optional — set, change, or clear (null) anytime.
 * SuperAdmin-only fields (code, slug, subscription, limits) stay on POST/PATCH /tenants.
 */
export class UpdateOrganizationProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  display_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({ example: '#0A66C2' })
  @IsOptional()
  @IsString()
  primary_color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'AE',
    description: 'Optional. Changing country updates phone/tax validation rules. Send null to clear.',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @CountryCodeField()
  country_code?: string | null;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsPhoneForCountry()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsStrictEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  language?: string;

  @ApiPropertyOptional({ example: 'AED' })
  @IsOptional()
  @NormalizeCurrencyCode()
  @IsKnownCurrencyCode()
  base_currency?: string;

  @ApiPropertyOptional({ example: 'Asia/Dubai' })
  @IsOptional()
  @IsTimezoneForCountry()
  timezone?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 12, description: 'Month the financial year starts (1=Jan).' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  financial_year_start?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTaxIdForCountry()
  vat_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cr_number?: string;

  @ApiPropertyOptional({ example: 'CGA-12345', description: 'IATA cargo agent code.' })
  @IsOptional()
  @IsString()
  iata_cargo_agent_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customs_license_no?: string;
}
