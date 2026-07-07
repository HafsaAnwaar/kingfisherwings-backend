import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsPhoneNumber, IsString, IsUrl, Length, Max, Min } from 'class-validator';

/**
 * Fields a tenant's own admin may edit about their organization.
 * Deliberately excludes: code, slug, domain, password_hash,
 * subscription_plan, status, trial/subscription dates, max_users,
 * max_branches, max_storage_gb, is_active, country_code — those stay
 * SuperAdmin-only via POST/PATCH /tenants.
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  language?: string;

  @ApiPropertyOptional({ example: 'AED' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  base_currency?: string;

  @ApiPropertyOptional({ example: 'Asia/Dubai' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 12, description: 'Month the financial year starts (1=Jan).' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  financial_year_start?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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
