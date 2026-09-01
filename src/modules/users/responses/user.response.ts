import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * Explicit outward-facing shape for a single user. Built field-by-field
 * in UserMapper.toResponse — never constructed by spreading a Prisma
 * User, so a new sensitive column added to the schema cannot leak here
 * by accident.
 */
export class UserResponse {
  @ApiProperty() id!: string;
  @ApiProperty() tenant_id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() first_name!: string;
  @ApiProperty() last_name!: string;
  @ApiProperty() full_name!: string;

  @ApiPropertyOptional() phone?: string;
  @ApiPropertyOptional({
    description:
      "Optional preferred country (ISO 3166-1 alpha-2). Not required.",
  })
  preferred_country_code?: string;
  @ApiPropertyOptional() avatar_url?: string;

  @ApiProperty({ enum: UserRole }) role!: UserRole;
  @ApiProperty({ enum: UserStatus }) status!: UserStatus;

  @ApiPropertyOptional() branch_id?: string;
  @ApiPropertyOptional() department_id?: string;

  @ApiProperty() is_salesperson!: boolean;
  @ApiProperty() is_cs_rep!: boolean;
  @ApiProperty() is_operations!: boolean;
  @ApiProperty() is_finance!: boolean;

  @ApiProperty() can_see_sales!: boolean;
  @ApiProperty() can_see_cost!: boolean;
  @ApiProperty() can_see_gp!: boolean;
  @ApiProperty() can_see_invoices!: boolean;
  @ApiProperty() can_see_payments!: boolean;
  @ApiProperty() can_see_bank_balances!: boolean;
  @ApiProperty() can_see_ar_ap!: boolean;
  @ApiProperty() can_see_mgmt_reports!: boolean;
  @ApiProperty() can_see_job_pnl!: boolean;

  @ApiProperty() two_factor_enabled!: boolean;
  @ApiProperty() email_verified!: boolean;
  @ApiProperty() must_change_password!: boolean;

  @ApiPropertyOptional() last_login_at?: Date;
  @ApiPropertyOptional() locked_until?: Date;

  @ApiProperty() created_at!: Date;
  @ApiPropertyOptional() created_by_user_id?: string;
  @ApiPropertyOptional() created_by_tenant_id?: string;
  @ApiPropertyOptional() created_by_super_admin_id?: string;
  @ApiProperty() updated_at!: Date;
}
