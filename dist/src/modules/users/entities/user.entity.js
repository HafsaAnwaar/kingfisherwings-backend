"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class UserEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, tenant_id: { required: true, type: () => String }, email: { required: true, type: () => String }, first_name: { required: true, type: () => String }, last_name: { required: true, type: () => String }, phone: { required: false, type: () => String }, avatar_url: { required: false, type: () => String }, role: { required: true, type: () => Object }, status: { required: true, type: () => Object }, branch_id: { required: false, type: () => String }, department_id: { required: false, type: () => String }, is_salesperson: { required: true, type: () => Boolean }, is_cs_rep: { required: true, type: () => Boolean }, is_operations: { required: true, type: () => Boolean }, is_finance: { required: true, type: () => Boolean }, can_see_sales: { required: true, type: () => Boolean }, can_see_cost: { required: true, type: () => Boolean }, can_see_gp: { required: true, type: () => Boolean }, can_see_invoices: { required: true, type: () => Boolean }, can_see_payments: { required: true, type: () => Boolean }, can_see_bank_balances: { required: true, type: () => Boolean }, can_see_ar_ap: { required: true, type: () => Boolean }, can_see_mgmt_reports: { required: true, type: () => Boolean }, can_see_job_pnl: { required: true, type: () => Boolean }, allowed_ips: { required: true, type: () => [String] }, allowed_mac_addresses: { required: true, type: () => [String] }, office_hours_start: { required: false, type: () => String }, office_hours_end: { required: false, type: () => String }, office_hours_timezone: { required: false, type: () => String }, max_concurrent_sessions: { required: true, type: () => Number }, two_factor_enabled: { required: true, type: () => Boolean }, email_verified: { required: true, type: () => Boolean }, email_verified_at: { required: false, type: () => Date }, must_change_password: { required: true, type: () => Boolean }, password_changed_at: { required: false, type: () => Date }, password_expires_at: { required: false, type: () => Date }, last_login_at: { required: false, type: () => Date }, last_login_ip: { required: false, type: () => String }, last_activity_at: { required: false, type: () => Date }, failed_login_count: { required: true, type: () => Number }, locked_until: { required: false, type: () => Date }, created_at: { required: true, type: () => Date }, updated_at: { required: true, type: () => Date }, deleted_at: { required: false, type: () => Date }, password_hash: { required: true, type: () => String }, refresh_token_hash: { required: false, type: () => String }, password_reset_token: { required: false, type: () => String }, password_reset_expires: { required: false, type: () => Date }, invite_token: { required: false, type: () => String }, invite_expires_at: { required: false, type: () => Date }, two_factor_secret: { required: false, type: () => String }, two_factor_backup_codes: { required: false, type: () => [String] } };
    }
}
exports.UserEntity = UserEntity;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "tenant_id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "first_name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "last_name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "phone", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "avatar_url", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "role", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "branch_id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "department_id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "is_salesperson", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "is_cs_rep", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "is_operations", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "is_finance", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_sales", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_cost", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_gp", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_invoices", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_payments", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_bank_balances", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_ar_ap", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_mgmt_reports", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "can_see_job_pnl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], UserEntity.prototype, "allowed_ips", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], UserEntity.prototype, "allowed_mac_addresses", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "office_hours_start", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "office_hours_end", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "office_hours_timezone", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UserEntity.prototype, "max_concurrent_sessions", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "two_factor_enabled", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "email_verified", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "email_verified_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "must_change_password", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "password_changed_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "password_expires_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "last_login_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserEntity.prototype, "last_login_ip", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "last_activity_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UserEntity.prototype, "failed_login_count", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "locked_until", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "updated_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "deleted_at", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserEntity.prototype, "password_hash", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserEntity.prototype, "refresh_token_hash", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserEntity.prototype, "password_reset_token", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "password_reset_expires", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserEntity.prototype, "invite_token", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Date)
], UserEntity.prototype, "invite_expires_at", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserEntity.prototype, "two_factor_secret", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Array)
], UserEntity.prototype, "two_factor_backup_codes", void 0);
//# sourceMappingURL=user.entity.js.map