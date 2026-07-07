"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../entities/user.entity");
const user_response_1 = require("../responses/user.response");
const user_summary_response_1 = require("../responses/user-summary.response");
const paginated_users_response_1 = require("../responses/paginated-users.response");
const users_helper_1 = require("../helpers/users.helper");
class UserMapper {
    static toEntity(user) {
        return (0, class_transformer_1.plainToInstance)(user_entity_1.UserEntity, user, {
            excludeExtraneousValues: true,
        });
    }
    static toEntities(users) {
        return users.map((user) => this.toEntity(user));
    }
    static toResponse(user) {
        const response = new user_response_1.UserResponse();
        response.id = user.id;
        response.tenant_id = user.tenant_id;
        response.email = user.email;
        response.first_name = user.first_name;
        response.last_name = user.last_name;
        response.full_name = users_helper_1.UsersHelper.buildFullName(user.first_name, user.last_name);
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
    static toResponses(users) {
        return users.map((user) => this.toResponse(user));
    }
    static toSummary(user) {
        const summary = new user_summary_response_1.UserSummaryResponse();
        summary.id = user.id;
        summary.full_name = users_helper_1.UsersHelper.buildFullName(user.first_name, user.last_name);
        summary.email = user.email;
        summary.role = user.role;
        summary.status = user.status;
        summary.avatar_url = user.avatar_url ?? undefined;
        summary.branch_id = user.branch_id ?? undefined;
        return summary;
    }
    static toSummaries(users) {
        return users.map((user) => this.toSummary(user));
    }
    static toPaginated(result) {
        const paginated = new paginated_users_response_1.PaginatedUsersResponse();
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
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map