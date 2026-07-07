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
exports.QueryUserDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const users_constants_1 = require("../constants/users.constants");
class QueryUserDto {
    constructor() {
        this.page = users_constants_1.USERS_CONSTANTS.DEFAULT_PAGE;
        this.limit = users_constants_1.USERS_CONSTANTS.DEFAULT_LIMIT;
        this.sortBy = users_constants_1.USERS_CONSTANTS.DEFAULT_SORT;
        this.order = users_constants_1.USERS_CONSTANTS.DEFAULT_ORDER;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: true, type: () => Number, default: users_constants_1.USERS_CONSTANTS.DEFAULT_PAGE, minimum: 1 }, limit: { required: true, type: () => Number, default: users_constants_1.USERS_CONSTANTS.DEFAULT_LIMIT, minimum: 1 }, search: { required: false, type: () => String }, role: { required: false, type: () => Object }, status: { required: false, type: () => Object }, sortBy: { required: true, type: () => String, default: users_constants_1.USERS_CONSTANTS.DEFAULT_SORT, enum: users_constants_1.USERS_CONSTANTS.SORTABLE_FIELDS }, order: { required: true, type: () => Object, default: users_constants_1.USERS_CONSTANTS.DEFAULT_ORDER, enum: ['asc', 'desc'] }, branch_id: { required: false, type: () => String }, department_id: { required: false, type: () => String } };
    }
}
exports.QueryUserDto = QueryUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: users_constants_1.USERS_CONSTANTS.DEFAULT_PAGE, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryUserDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: users_constants_1.USERS_CONSTANTS.DEFAULT_LIMIT, minimum: 1, maximum: users_constants_1.USERS_CONSTANTS.MAX_LIMIT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryUserDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Matches first name, last name, email, or phone.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUserDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.UserRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    __metadata("design:type", String)
], QueryUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.UserStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserStatus),
    __metadata("design:type", String)
], QueryUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: users_constants_1.USERS_CONSTANTS.SORTABLE_FIELDS, default: users_constants_1.USERS_CONSTANTS.DEFAULT_SORT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(users_constants_1.USERS_CONSTANTS.SORTABLE_FIELDS),
    __metadata("design:type", String)
], QueryUserDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['asc', 'desc'], default: users_constants_1.USERS_CONSTANTS.DEFAULT_ORDER }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], QueryUserDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryUserDto.prototype, "branch_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryUserDto.prototype, "department_id", void 0);
//# sourceMappingURL=query-user.dto.js.map