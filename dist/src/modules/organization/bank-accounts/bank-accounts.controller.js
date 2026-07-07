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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAccountsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const bank_accounts_service_1 = require("./bank-accounts.service");
const tenant_bank_account_dto_1 = require("../dto/tenant-bank-account.dto");
const master_query_dto_1 = require("../../masters/dto/master-query.dto");
const roles_guard_1 = require("../../users/guards/roles.guard");
const roles_decorator_1 = require("../../users/decorators/roles.decorator");
const current_user_decorator_1 = require("../../users/decorators/current-user.decorator");
let BankAccountsController = class BankAccountsController {
    constructor(service) {
        this.service = service;
    }
    findAll(tenantId, query) {
        return this.service.findAll(tenantId, query);
    }
    findOne(tenantId, id) {
        return this.service.findOne(tenantId, id);
    }
    create(tenantId, actorId, dto) {
        return this.service.create(tenantId, { ...dto }, actorId);
    }
    update(tenantId, actorId, id, dto) {
        return this.service.update(tenantId, id, { ...dto }, actorId);
    }
    async remove(tenantId, actorId, id) {
        await this.service.softDelete(tenantId, id, actorId);
    }
};
exports.BankAccountsController = BankAccountsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List this tenant's own bank accounts" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, master_query_dto_1.MasterQueryDto]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a bank account by id' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a bank account' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, tenant_bank_account_dto_1.CreateTenantBankAccountDto]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a bank account' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, tenant_bank_account_dto_1.UpdateTenantBankAccountDto]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a bank account' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BankAccountsController.prototype, "remove", null);
exports.BankAccountsController = BankAccountsController = __decorate([
    (0, swagger_1.ApiTags)('Organization — Bank Accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TENANT_ADMIN, client_1.UserRole.FINANCE_MANAGER),
    (0, common_1.Controller)('organization/bank-accounts'),
    __metadata("design:paramtypes", [bank_accounts_service_1.BankAccountsService])
], BankAccountsController);
//# sourceMappingURL=bank-accounts.controller.js.map