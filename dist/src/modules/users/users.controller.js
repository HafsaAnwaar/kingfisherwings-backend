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
exports.UsersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const roles_guard_1 = require("./guards/roles.guard");
const permissions_guard_1 = require("./guards/permissions.guard");
const permissions_decorator_1 = require("./decorators/permissions.decorator");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const principal_util_1 = require("../../common/utils/principal.util");
const permission_constants_1 = require("./constants/permission.constants");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const query_user_dto_1 = require("./dto/query-user.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const bulk_user_dto_1 = require("./dto/bulk-user.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const admin_reset_password_dto_1 = require("./dto/admin-reset-password.dto");
const user_response_1 = require("./responses/user.response");
const paginated_users_response_1 = require("./responses/paginated-users.response");
const user_mapper_1 = require("./mappers/user.mapper");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(tenantId, query) {
        return this.usersService.findAll(tenantId, query);
    }
    async findOne(tenantId, id) {
        return this.usersService.findOne(tenantId, id);
    }
    async create(principal, dto) {
        let tenantId;
        let creator;
        if ((0, principal_util_1.isSuperAdminPrincipal)(principal)) {
            const superAdmin = principal;
            if (!dto.tenant_id) {
                throw new common_1.BadRequestException('tenant_id is required in the request body when a super admin creates a user.');
            }
            tenantId = dto.tenant_id;
            creator = { superAdminId: superAdmin.id };
        }
        else {
            const user = principal;
            tenantId = user.tenantId;
            creator = { userId: user.id };
        }
        const result = await this.usersService.createUser(tenantId, dto, creator);
        return {
            user: user_mapper_1.UserMapper.toResponse(result.user),
            temporaryPassword: result.temporaryPassword,
        };
    }
    async update(tenantId, actorId, id, dto) {
        return this.usersService.updateUser(tenantId, id, dto, actorId);
    }
    async updateStatus(tenantId, actorId, id, dto) {
        return this.usersService.updateStatus(tenantId, id, dto, actorId);
    }
    async bulkAction(tenantId, actorId, dto) {
        return this.usersService.bulkAction(tenantId, dto, actorId);
    }
    async remove(tenantId, actorId, id) {
        await this.usersService.softDeleteUser(tenantId, id, actorId);
    }
    async restore(tenantId, actorId, id) {
        return this.usersService.restoreUser(tenantId, id, actorId);
    }
    async changeOwnPassword(currentUser, dto) {
        if (!currentUser) {
            throw new common_1.UnauthorizedException('Authentication required.');
        }
        await this.usersService.changePassword(currentUser.tenantId, currentUser.id, dto);
    }
    async adminResetPassword(tenantId, actorId, id, dto) {
        return this.usersService.adminResetPassword(tenantId, id, dto, actorId);
    }
    async forceLogout(tenantId, id) {
        await this.usersService.forceLogout(tenantId, id);
        return { success: true, message: 'User logged out of all devices.' };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List users for the current tenant (paginated, filterable).' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: paginated_users_response_1.PaginatedUsersResponse }),
    openapi.ApiResponse({ status: 200, type: require("./responses/paginated-users.response").PaginatedUsersResponse }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_user_dto_1.QueryUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single user by id.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: user_response_1.UserResponse }),
    openapi.ApiResponse({ status: 200, type: require("./responses/user.response").UserResponse }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a user. Returns a system-generated temporary password.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, type: user_response_1.UserResponse }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update a user.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: user_response_1.UserResponse }),
    openapi.ApiResponse({ status: 200, type: require("./responses/user.response").UserResponse }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.CHANGE_STATUS),
    (0, swagger_1.ApiOperation)({ summary: 'Change a user\'s status (activate, suspend, etc).' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: user_response_1.UserResponse }),
    openapi.ApiResponse({ status: 200, type: require("./responses/user.response").UserResponse }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_status_dto_1.UpdateStatusDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.BULK_ACTION),
    (0, swagger_1.ApiOperation)({ summary: 'Apply an action (activate/deactivate/suspend/delete/restore) to multiple users.' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, bulk_user_dto_1.BulkUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "bulkAction", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a user.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.RESTORE),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft-deleted user.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: user_response_1.UserResponse }),
    openapi.ApiResponse({ status: 201, type: require("./responses/user.response").UserResponse }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)('me/change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticated user changes their own password.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changeOwnPassword", null);
__decorate([
    (0, common_1.Post)(':id/admin-reset-password'),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.RESET_PASSWORD),
    (0, swagger_1.ApiOperation)({ summary: "Admin resets a target user's password to a new temporary password." }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, admin_reset_password_dto_1.AdminResetPasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "adminResetPassword", null);
__decorate([
    (0, common_1.Post)(':id/force-logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)(permission_constants_1.USERS_PERMISSIONS.FORCE_LOGOUT),
    (0, swagger_1.ApiOperation)({ summary: "Force-logout: revoke a target user's active sessions on all devices." }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "forceLogout", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map