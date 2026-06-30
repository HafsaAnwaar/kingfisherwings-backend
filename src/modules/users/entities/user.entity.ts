import {
  Exclude,
  Expose,
} from 'class-transformer';

export class UserEntity {

  @Expose()
  id: string;

  @Expose()
  tenant_id: string;

  @Expose()
  email: string;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  phone?: string;

  @Expose()
  avatar_url?: string;

  @Expose()
  role: string;

  @Expose()
  status: string;

  @Expose()
  branch_id?: string;

  @Expose()
  department_id?: string;

  @Expose()
  is_salesperson: boolean;

  @Expose()
  is_cs_rep: boolean;

  @Expose()
  is_operations: boolean;

  @Expose()
  is_finance: boolean;

  @Expose()
  can_see_sales: boolean;

  @Expose()
  can_see_cost: boolean;

  @Expose()
  can_see_gp: boolean;

  @Expose()
  can_see_invoices: boolean;

  @Expose()
  can_see_payments: boolean;

  @Expose()
  can_see_bank_balances: boolean;

  @Expose()
  can_see_ar_ap: boolean;

  @Expose()
  can_see_mgmt_reports: boolean;

  @Expose()
  can_see_job_pnl: boolean;

  @Expose()
  last_login_at?: Date;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Exclude()
  password_hash: string;

  @Exclude()
  refresh_token_hash?: string;

  @Exclude()
 password_reset_token?: string;

  @Exclude()
 invite_token?: string;

  @Exclude()
 two_factor_secret?: string;

  @Exclude()
 two_factor_backup_codes?: string[];
}