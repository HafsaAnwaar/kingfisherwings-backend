import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsPhoneNumber,
  IsTimeZone,
  Length,
  Max,
  Min,
  ArrayUnique,
} from 'class-validator';

import {
  UserRole,
  UserStatus,
} from '@prisma/client';

export class CreateUserDto {

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 100)
  first_name: string;

  @IsString()
  @Length(2, 100)
  last_name: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  // =====================================================
  // ORGANIZATION
  // =====================================================

  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  // =====================================================
  // SYSTEM ROLE
  // =====================================================

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  // =====================================================
  // BUSINESS FLAGS
  // =====================================================

  @IsOptional()
  @IsBoolean()
  is_salesperson?: boolean;

  @IsOptional()
  @IsBoolean()
  is_cs_rep?: boolean;

  @IsOptional()
  @IsBoolean()
  is_operations?: boolean;

  @IsOptional()
  @IsBoolean()
  is_finance?: boolean;

  // =====================================================
  // VISIBILITY
  // =====================================================

  @IsOptional()
  @IsBoolean()
  can_see_sales?: boolean;

  @IsOptional()
  @IsBoolean()
  can_see_cost?: boolean;

  @IsOptional()
  @IsBoolean()
  can_see_gp?: boolean;

  @IsOptional()
  @IsBoolean()
  can_see_invoices?: boolean;

  @IsOptional()
  @IsBoolean()
  can_see_payments?: boolean;

  @IsOptional()
  @IsBoolean()
  can_see_bank_balances?: boolean;

  @IsOptional()
  @IsBoolean()
  can_see_ar_ap?: boolean;

  @IsOptional()
  @IsBoolean()
  can_see_mgmt_reports?: boolean;

  @IsOptional()
  @IsBoolean()
  can_see_job_pnl?: boolean;

  // =====================================================
  // SECURITY
  // =====================================================

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowed_ips?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowed_mac_addresses?: string[];

  @IsOptional()
  @IsString()
  office_hours_start?: string;

  @IsOptional()
  @IsString()
  office_hours_end?: string;

  @IsOptional()
  @IsTimeZone()
  office_hours_timezone?: string;

  @IsOptional()
  @IsBoolean()
  two_factor_enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  max_concurrent_sessions?: number;

  // =====================================================
  // RBAC
  // =====================================================

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  role_ids?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  permission_ids?: string[];
}