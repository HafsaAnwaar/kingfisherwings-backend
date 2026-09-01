import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsTimeZone,
  Length,
  Max,
  Min,
  ArrayUnique,
  Matches,
  ValidateIf,
} from "class-validator";
import { UserRole, UserStatus } from "@prisma/client";
import { USERS_CONSTANTS } from "../constants/users.constants";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";
import {
  CountryCodeField,
  IsPhoneForCountry,
} from "../../../common/validators/country-aware.validators";

const OFFICE_HOURS_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateUserDto {
  // =====================================================
  // TARGET TENANT (super admin callers only — ignored/overridden by the
  // caller's own tenantId for regular tenant-scoped users)
  // =====================================================

  @ApiPropertyOptional({
    format: "uuid",
    description:
      "Required only when a super admin is creating this user. Ignored for tenant-scoped callers.",
  })
  @IsOptional()
  @IsUUID()
  tenant_id?: string;

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  @ApiProperty({ example: "ahmed@kingfisherwings.com" })
  @IsStrictEmail()
  email!: string;

  @ApiProperty({ example: "Ahmed" })
  @IsString()
  @Length(2, 100)
  first_name!: string;

  @ApiProperty({ example: "Khan" })
  @IsString()
  @Length(2, 100)
  last_name!: string;

  @ApiPropertyOptional({ example: "+971501234567" })
  @IsOptional()
  @IsPhoneForCountry({ countryField: "preferred_country_code" })
  phone?: string;

  @ApiPropertyOptional({
    example: "AE",
    description:
      "Optional. User can set/change preferred country anytime after login. Send null to clear.",
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

  // =====================================================
  // ORGANIZATION
  // =====================================================

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  // =====================================================
  // SYSTEM ROLE (legacy enum — see RBAC migration note on User.role)
  // =====================================================

  @ApiProperty({
    enum: UserRole,
    description:
      "Staff role within the tenant. SUPER_ADMIN is rejected — it is not a tenant user role.",
  })
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

  @ApiPropertyOptional({
    type: [String],
    description: "Empty array = unrestricted.",
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowed_ips?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: "Empty array = unrestricted.",
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowed_mac_addresses?: string[];

  @ApiPropertyOptional({ example: "09:00", description: '24h "HH:mm" format.' })
  @IsOptional()
  @Matches(OFFICE_HOURS_REGEX, {
    message: 'office_hours_start must be in "HH:mm" 24h format.',
  })
  office_hours_start?: string;

  @ApiPropertyOptional({ example: "18:00", description: '24h "HH:mm" format.' })
  @IsOptional()
  @Matches(OFFICE_HOURS_REGEX, {
    message: 'office_hours_end must be in "HH:mm" 24h format.',
  })
  office_hours_end?: string;

  @ApiPropertyOptional({ example: "Asia/Dubai" })
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

  @ApiPropertyOptional({ type: [String], format: "uuid" })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  role_ids?: string[];

  @ApiPropertyOptional({ type: [String], format: "uuid" })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  permission_ids?: string[];
}
