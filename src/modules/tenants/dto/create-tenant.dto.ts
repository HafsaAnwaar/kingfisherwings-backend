// src/modules/tenants/dto/create-tenant.dto.ts

import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsInt,
  IsDateString,
  IsEnum,
  Length,
  Matches,
  Min,
  Max,
  ValidateIf,
} from "class-validator";

import { SubscriptionPlan, TenantStatus } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsStrongPassword } from "../../users/validators/password.validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";
import {
  CountryCodeField,
  IsCountryDefaultCurrency,
  IsKnownCurrencyCode,
  IsPhoneForCountry,
  IsTaxIdForCountry,
  IsTimezoneForCountry,
  NormalizeCurrencyCode,
} from "../../../common/validators/country-aware.validators";

export class CreateTenantDto {
  // ==========================
  // Identity
  // ==========================

  @IsString()
  @Length(3, 20)
  code!: string;

  @IsString()
  @Length(3, 200)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(3, 200)
  display_name?: string;

  @ApiProperty({
    example: "kingfisher-wings",
    description:
      "URL-safe tenant identifier (lowercase letters, digits, hyphens)",
    pattern: "^[a-z0-9-]+$",
  })
  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;

  // ==========================
  // Security — this tenant's own login credential
  // (see POST /auth/tenant-login). Also becomes the initial password
  // for the auto-provisioned TENANT_ADMIN owner user.
  // ==========================

  @IsString()
  @IsStrongPassword()
  password!: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  admin_first_name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  admin_last_name?: string;

  // ==========================
  // Branding
  // ==========================

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsString()
  primary_color?: string;

  // ==========================
  // Localization
  // ==========================

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @NormalizeCurrencyCode()
  @IsKnownCurrencyCode()
  @IsCountryDefaultCurrency({ mustMatchCountryDefault: false })
  base_currency?: string;

  @IsOptional()
  @IsTimezoneForCountry()
  timezone?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @CountryCodeField()
  country_code?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  financial_year_start?: number;

  // ==========================
  // Registration
  // ==========================

  @IsOptional()
  @IsTaxIdForCountry()
  vat_number?: string;

  @IsOptional()
  @IsString()
  cr_number?: string;

  // ==========================
  // Contact
  // ==========================

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsPhoneForCountry()
  phone?: string;

  @IsStrictEmail()
  email!: string;

  // ==========================
  // Company (spec: SuperAdmin registers the company alongside the
  // tenant). Optional — if omitted, a default Company is still
  // created automatically, reusing the tenant's own code/name.
  // ==========================

  @IsOptional()
  @IsString()
  @Length(2, 20)
  company_code?: string;

  @IsOptional()
  @IsString()
  @Length(2, 300)
  company_name?: string;

  @IsOptional()
  @IsString()
  company_legal_name?: string;

  @IsOptional()
  @IsString()
  company_registration_number?: string;

  // ==========================
  // Subscription
  // ==========================

  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscription_plan?: SubscriptionPlan;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsDateString()
  trial_ends?: Date;

  @IsOptional()
  @IsDateString()
  subscription_ends?: Date;

  // ==========================
  // Limits
  // ==========================

  @IsOptional()
  @IsInt()
  @Min(1)
  max_users?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_branches?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_storage_gb?: number;

  // ==========================
  // Status
  // ==========================

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
