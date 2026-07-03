import { plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';
import { UserResponse } from '../responses/user.response';
import { UserSummaryResponse } from '../responses/user-summary.response';
import { PaginatedUsersResponse } from '../responses/paginated-users.response';
import { UsersHelper } from '../helpers/users.helper';

export class UserMapper {
  static toEntity(user: User): UserEntity {
    return plainToInstance(UserEntity, user, {
      excludeExtraneousValues: true,
    });
  }

  static toEntities(users: User[]): UserEntity[] {
    return users.map((user) => this.toEntity(user));
  }

  /**
   * Explicit field-by-field mapping (not a spread) so a newly added
   * sensitive column on the Prisma model never leaks into the API
   * response by default.
   */
  static toResponse(user: User): UserResponse {
    const response = new UserResponse();

    response.id = user.id;
    response.tenant_id = user.tenant_id;
    response.email = user.email;
    response.first_name = user.first_name;
    response.last_name = user.last_name;
    response.full_name = UsersHelper.buildFullName(user.first_name, user.last_name);
    response.phone = user.phone ?? undefined;
    response.avatar_url = user.avatar_url ?? undefined;
    response.role = user.role;
    response.status = user.status;
    response.branch_id = user.branch_id ?? undefined;
    response.department_id = user.department_id ?? undefined;
    response.is_salesperson = user.is_salesperson;
    response.is_cs_rep = user.is_cs_rep;
    response.is_operations = user.is_operations;
    response.is_finance = user.is_finance;
    response.can_see_sales = user.can_see_sales;
    response.can_see_cost = user.can_see_cost;
    response.can_see_gp = user.can_see_gp;
    response.can_see_invoices = user.can_see_invoices;
    response.can_see_payments = user.can_see_payments;
    response.can_see_bank_balances = user.can_see_bank_balances;
    response.can_see_ar_ap = user.can_see_ar_ap;
    response.can_see_mgmt_reports = user.can_see_mgmt_reports;
    response.can_see_job_pnl = user.can_see_job_pnl;
    response.two_factor_enabled = user.two_factor_enabled;
    response.email_verified = user.email_verified;
    response.must_change_password = user.must_change_password;
    response.last_login_at = user.last_login_at ?? undefined;
    response.locked_until = user.locked_until ?? undefined;
    response.created_at = user.created_at;
    response.updated_at = user.updated_at;
    response.created_by_user_id = user.created_by_user_id ?? undefined;
    response.created_by_tenant_id = user.created_by_tenant_id ?? undefined;
    response.created_by_super_admin_id = user.created_by_super_admin_id ?? undefined;

    return response;
  }

  static toResponses(users: User[]): UserResponse[] {
    return users.map((user) => this.toResponse(user));
  }

  static toSummary(user: User): UserSummaryResponse {
    const summary = new UserSummaryResponse();

    summary.id = user.id;
    summary.full_name = UsersHelper.buildFullName(user.first_name, user.last_name);
    summary.email = user.email;
    summary.role = user.role;
    summary.status = user.status;
    summary.avatar_url = user.avatar_url ?? undefined;
    summary.branch_id = user.branch_id ?? undefined;

    return summary;
  }

  static toSummaries(users: User[]): UserSummaryResponse[] {
    return users.map((user) => this.toSummary(user));
  }

  static toPaginated(result: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }): PaginatedUsersResponse {
    const paginated = new PaginatedUsersResponse();

    paginated.data = this.toResponses(result.users);
    paginated.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };

    return paginated;
  }
}
