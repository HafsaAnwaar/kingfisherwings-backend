// src/modules/tenants/dto/create-tenant.dto.ts

import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsBoolean,
  IsInt,
  IsDateString,
  IsEnum,
  Length,
  Matches,
  Min,
  Max,
} from 'class-validator';

import { SubscriptionPlan, TenantStatus } from '@prisma/client';
import { IsStrongPassword } from '../../users/validators/password.validator';

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

  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;

  // ==========================
  // Security
  // ==========================

  @IsString()
  @IsStrongPassword()
  password!: string;



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
  @IsString()
  base_currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
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
  @IsString()
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
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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