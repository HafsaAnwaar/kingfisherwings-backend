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
exports.UpdateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const create_user_dto_1 = require("./create-user.dto");
const users_constants_1 = require("../constants/users.constants");
const OFFICE_HOURS_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
class UpdateUserDto extends (0, swagger_1.PartialType)(create_user_dto_1.CreateUserDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: false, type: () => String }, first_name: { required: false, type: () => String, minLength: 2, maxLength: 100 }, last_name: { required: false, type: () => String, minLength: 2, maxLength: 100 }, phone: { required: false, type: () => String }, avatar_url: { required: false, type: () => String }, branch_id: { required: false, type: () => String }, department_id: { required: false, type: () => String }, role: { required: false, type: () => Object }, status: { required: false, type: () => Object }, is_salesperson: { required: false, type: () => Boolean }, is_cs_rep: { required: false, type: () => Boolean }, is_operations: { required: false, type: () => Boolean }, is_finance: { required: false, type: () => Boolean }, can_see_sales: { required: false, type: () => Boolean }, can_see_cost: { required: false, type: () => Boolean }, can_see_gp: { required: false, type: () => Boolean }, can_see_invoices: { required: false, type: () => Boolean }, can_see_payments: { required: false, type: () => Boolean }, can_see_bank_balances: { required: false, type: () => Boolean }, can_see_ar_ap: { required: false, type: () => Boolean }, can_see_mgmt_reports: { required: false, type: () => Boolean }, can_see_job_pnl: { required: false, type: () => Boolean }, allowed_ips: { required: false, type: () => [String] }, allowed_mac_addresses: { required: false, type: () => [String] }, office_hours_start: { required: false, type: () => String, pattern: "OFFICE_HOURS_REGEX" }, office_hours_end: { required: false, type: () => String, pattern: "OFFICE_HOURS_REGEX" }, office_hours_timezone: { required: false, type: () => String }, two_factor_enabled: { required: false, type: () => Boolean }, max_concurrent_sessions: { required: false, type: () => Number, minimum: 1, maximum: users_constants_1.USERS_CONSTANTS.MAX_CONCURRENT_SESSIONS_CEILING }, single_device_login: { required: false, type: () => Boolean }, single_device_policy: { required: false, type: () => Object }, role_ids: { required: false, type: () => [String] }, permission_ids: { required: false, type: () => [String] } };
    }
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatar_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "branch_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "department_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.UserRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.UserStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserStatus),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "is_salesperson", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "is_cs_rep", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "is_operations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "is_finance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_sales", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_cost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_gp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_invoices", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_payments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_bank_balances", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_ar_ap", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_mgmt_reports", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "can_see_job_pnl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "allowed_ips", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "allowed_mac_addresses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '09:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(OFFICE_HOURS_REGEX, { message: 'office_hours_start must be in "HH:mm" 24h format.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "office_hours_start", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '18:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(OFFICE_HOURS_REGEX, { message: 'office_hours_end must be in "HH:mm" 24h format.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "office_hours_end", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Asia/Dubai' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsTimeZone)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "office_hours_timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "two_factor_enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: users_constants_1.USERS_CONSTANTS.MAX_CONCURRENT_SESSIONS_CEILING }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(users_constants_1.USERS_CONSTANTS.MAX_CONCURRENT_SESSIONS_CEILING),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "max_concurrent_sessions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Premium Single Device Login — restrict this user to one active session.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "single_device_login", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SingleDevicePolicy, description: 'Behavior when single_device_login is enabled and a new login occurs.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SingleDevicePolicy),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "single_device_policy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "role_ids", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "permission_ids", void 0);
//# sourceMappingURL=update-user.dto.js.map