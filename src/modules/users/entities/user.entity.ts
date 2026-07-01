import { Exclude, Expose } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

/**
 * Internal representation of a User with sensitive fields stripped via
 * class-transformer. Used as the intermediate shape between the Prisma
 * model and outward-facing responses (see mappers/user.mapper.ts).
 */
export class UserEntity {
  @Expose()
  id!: string;

  @Expose()
  tenant_id!: string;

  @Expose()
  email!: string;

  @Expose()
  first_name!: string;

  @Expose()
  last_name!: string;

  @Expose()
  phone?: string;

  @Expose()
  avatar_url?: string;

  @Expose()
  role!: UserRole;

  @Expose()
  status!: UserStatus;

  @Expose()
  branch_id?: string;

  @Expose()
  department_id?: string;

  @Expose()
  is_salesperson!: boolean;

  @Expose()
  is_cs_rep!: boolean;

  @Expose()
  is_operations!: boolean;

  @Expose()
  is_finance!: boolean;

  @Expose()
  can_see_sales!: boolean;

  @Expose()
  can_see_cost!: boolean;

  @Expose()
  can_see_gp!: boolean;

  @Expose()
  can_see_invoices!: boolean;

  @Expose()
  can_see_payments!: boolean;

  @Expose()
  can_see_bank_balances!: boolean;

  @Expose()
  can_see_ar_ap!: boolean;

  @Expose()
  can_see_mgmt_reports!: boolean;

  @Expose()
  can_see_job_pnl!: boolean;

  @Expose()
  allowed_ips!: string[];

  @Expose()
  allowed_mac_addresses!: string[];

  @Expose()
  office_hours_start?: string;

  @Expose()
  office_hours_end?: string;

  @Expose()
  office_hours_timezone?: string;

  @Expose()
  max_concurrent_sessions!: number;

  @Expose()
  two_factor_enabled!: boolean;

  @Expose()
  email_verified!: boolean;

  @Expose()
  email_verified_at?: Date;

  @Expose()
  must_change_password!: boolean;

  @Expose()
  password_changed_at?: Date;

  @Expose()
  password_expires_at?: Date;

  @Expose()
  last_login_at?: Date;

  @Expose()
  last_login_ip?: string;

  @Expose()
  last_activity_at?: Date;

  @Expose()
  failed_login_count!: number;

  @Expose()
  locked_until?: Date;

  @Expose()
  created_at!: Date;

  @Expose()
  updated_at!: Date;

  @Expose()
  deleted_at?: Date;

  // ================================
  // Never serialized outward
  // ================================

  @Exclude()
  password_hash!: string;

  @Exclude()
  refresh_token_hash?: string;

  @Exclude()
  password_reset_token?: string;

  @Exclude()
  password_reset_expires?: Date;

  @Exclude()
  invite_token?: string;

  @Exclude()
  invite_expires_at?: Date;

  @Exclude()
  two_factor_secret?: string;

  @Exclude()
  two_factor_backup_codes?: string[];
}
