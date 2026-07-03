import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  Matches,
} from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { USERS_CONSTANTS } from '../constants/users.constants';

const OFFICE_HOURS_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateUserDto {
  // =====================================================
  // TARGET TENANT (super admin callers only — ignored/overridden by the
  // caller's own tenantId for regular tenant-scoped users)
  // =====================================================

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Required only when a super admin is creating this user. Ignored for tenant-scoped callers.',
  })
  @IsOptional()
  @IsUUID()
  tenant_id?: string;

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  @ApiProperty({ example: 'ahmed@kingfisherwings.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  @Length(2, 100)
  first_name!: string;

  @ApiProperty({ example: 'Khan' })
  @IsString()
  @Length(2, 100)
  last_name!: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar_url?: string;

  // =====================================================
  // ORGANIZATION
  // =====================================================

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  // =====================================================
  // SYSTEM ROLE (legacy enum — see RBAC migration note on User.role)
  // =====================================================

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.INVITED })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  // =====================================================
  // BUSINESS FLAGS
  // =====================================================

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_salesperson?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_cs_rep?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_operations?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_finance?: boolean;

  // =====================================================
  // VISIBILITY
  // =====================================================

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_sales?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_cost?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_gp?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_invoices?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_payments?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_bank_balances?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_ar_ap?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_mgmt_reports?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  can_see_job_pnl?: boolean;

  // =====================================================
  // SECURITY
  // =====================================================

  @ApiPropertyOptional({ type: [String], description: 'Empty array = unrestricted.' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowed_ips?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Empty array = unrestricted.' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowed_mac_addresses?: string[];

  @ApiPropertyOptional({ example: '09:00', description: '24h "HH:mm" format.' })
  @IsOptional()
  @Matches(OFFICE_HOURS_REGEX, { message: 'office_hours_start must be in "HH:mm" 24h format.' })
  office_hours_start?: string;

  @ApiPropertyOptional({ example: '18:00', description: '24h "HH:mm" format.' })
  @IsOptional()
  @Matches(OFFICE_HOURS_REGEX, { message: 'office_hours_end must be in "HH:mm" 24h format.' })
  office_hours_end?: string;

  @ApiPropertyOptional({ example: 'Asia/Dubai' })
  @IsOptional()
  @IsTimeZone()
  office_hours_timezone?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  two_factor_enabled?: boolean;

  @ApiPropertyOptional({
    default: USERS_CONSTANTS.DEFAULT_MAX_CONCURRENT_SESSIONS,
    minimum: 1,
    maximum: USERS_CONSTANTS.MAX_CONCURRENT_SESSIONS_CEILING,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(USERS_CONSTANTS.MAX_CONCURRENT_SESSIONS_CEILING)
  max_concurrent_sessions?: number;

  // =====================================================
  // RBAC
  // =====================================================

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  role_ids?: string[];

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  permission_ids?: string[];
}
