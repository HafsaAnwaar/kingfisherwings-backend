import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ArrayUnique,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsTimeZone,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { UserRole, UserStatus, SingleDevicePolicy } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';
import { USERS_CONSTANTS } from '../constants/users.constants';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';
import { CountryCodeField, IsPhoneForCountry } from '../../../common/validators/country-aware.validators';

const OFFICE_HOURS_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * All fields optional. Deliberately excludes password — use
 * ChangePasswordDto / AdminResetPasswordDto for password changes.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsStrictEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(2, 100)
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(2, 100)
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneForCountry({ countryField: 'preferred_country_code' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'AE',
    description: 'Optional preferred country. Change anytime after login. Send null to clear.',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @CountryCodeField()
  preferred_country_code?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_salesperson?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_cs_rep?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_operations?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_finance?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_sales?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_cost?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_gp?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_invoices?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_payments?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_bank_balances?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_ar_ap?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_mgmt_reports?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  can_see_job_pnl?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowed_ips?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowed_mac_addresses?: string[];

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @Matches(OFFICE_HOURS_REGEX, { message: 'office_hours_start must be in "HH:mm" 24h format.' })
  office_hours_start?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @Matches(OFFICE_HOURS_REGEX, { message: 'office_hours_end must be in "HH:mm" 24h format.' })
  office_hours_end?: string;

  @ApiPropertyOptional({ example: 'Asia/Dubai' })
  @IsOptional()
  @IsTimeZone()
  office_hours_timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  two_factor_enabled?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: USERS_CONSTANTS.MAX_CONCURRENT_SESSIONS_CEILING })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(USERS_CONSTANTS.MAX_CONCURRENT_SESSIONS_CEILING)
  max_concurrent_sessions?: number;

  @ApiPropertyOptional({ description: 'Premium Single Device Login — restrict this user to one active session.' })
  @IsOptional()
  @IsBoolean()
  single_device_login?: boolean;

  @ApiPropertyOptional({ enum: SingleDevicePolicy, description: 'Behavior when single_device_login is enabled and a new login occurs.' })
  @IsOptional()
  @IsEnum(SingleDevicePolicy)
  single_device_policy?: SingleDevicePolicy;

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
