import { PartialType } from '@nestjs/swagger';
import {
  IsArray,
  ArrayUnique,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

import {
  UserRole,
  UserStatus,
} from '@prisma/client';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(2,100)
  first_name?: string;

  @IsOptional()
  @Length(2,100)
  last_name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

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
  @IsString()
  office_hours_timezone?: string;

  @IsOptional()
  @IsBoolean()
  two_factor_enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  max_concurrent_sessions?: number;

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