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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const users_repository_1 = require("./users.repository");
const password_util_1 = require("../../common/utils/password.util");
const password_helper_1 = require("./helpers/password.helper");
const audit_helper_1 = require("./helpers/audit.helper");
const users_constants_1 = require("./constants/users.constants");
const password_constants_1 = require("./constants/password.constants");
const user_mapper_1 = require("./mappers/user.mapper");
const bulk_user_dto_1 = require("./dto/bulk-user.dto");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma, repository) {
        this.prisma = prisma;
        this.repository = repository;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async validateTenant(tenantId) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId, is_active: true, deleted_at: null },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant does not exist.');
        }
        if (tenant.subscription_ends && tenant.subscription_ends < new Date()) {
            throw new common_1.ForbiddenException('Tenant subscription has expired.');
        }
        return tenant;
    }
    async validateEmailAvailable(tx, tenantId, email, excludeId) {
        const taken = await this.repository.existsByEmail(tx, tenantId, email, excludeId);
        if (taken) {
            throw new common_1.ConflictException('Email already exists.');
        }
    }
    async validateUserLimit(tx, tenant) {
        const totalUsers = await this.repository.count(tx, tenant.id);
        if (totalUsers >= tenant.max_users) {
            throw new common_1.ForbiddenException('Maximum user limit reached for this tenant.');
        }
    }
    async validateBranch(tx, tenantId, branchId) {
        if (!branchId) {
            return null;
        }
        const branch = await tx.branch.findFirst({
            where: { id: branchId, tenant_id: tenantId, deleted_at: null },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found.');
        }
        return branch;
    }
    async validateDepartment(tx, tenantId, departmentId) {
        if (!departmentId) {
            return null;
        }
        const department = await tx.department.findFirst({
            where: { id: departmentId, tenant_id: tenantId, deleted_at: null },
        });
        if (!department) {
            throw new common_1.NotFoundException('Department not found.');
        }
        return department;
    }
    async validateRole(tx, tenantId, roleId) {
        const role = await tx.role.findFirst({
            where: { id: roleId, tenant_id: tenantId, deleted_at: null, is_active: true },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role ${roleId} not found.`);
        }
        return role;
    }
    async validatePermission(tx, tenantId, permissionId) {
        const permission = await tx.permission.findFirst({
            where: { id: permissionId, tenant_id: tenantId, deleted_at: null },
        });
        if (!permission) {
            throw new common_1.NotFoundException(`Permission ${permissionId} not found.`);
        }
        return permission;
    }
    async getExistingOrThrow(tx, tenantId, id) {
        const user = await this.repository.findById(tx, tenantId, id);
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        return user;
    }
    log(action, message) {
        this.logger.log(`[${action}] ${message}`);
    }
    logError(action, error) {
        this.logger.error(`[${action}]`, error instanceof Error ? error.stack : String(error));
    }
    async assignRoles(tx, tenantId, userId, roleIds, assignedBy) {
        for (const roleId of roleIds) {
            await this.validateRole(tx, tenantId, roleId);
            await tx.userRoleAssignment.upsert({
                where: { user_id_role_id: { user_id: userId, role_id: roleId } },
                create: { tenant_id: tenantId, user_id: userId, role_id: roleId, assigned_by: assignedBy },
                update: {},
            });
        }
    }
    async replaceRoles(tx, tenantId, userId, roleIds, assignedBy) {
        await tx.userRoleAssignment.deleteMany({ where: { tenant_id: tenantId, user_id: userId } });
        await this.assignRoles(tx, tenantId, userId, roleIds, assignedBy);
    }
    async assignPermissions(tx, tenantId, userId, permissionIds, grantedBy) {
        for (const permissionId of permissionIds) {
            await this.validatePermission(tx, tenantId, permissionId);
            await tx.userPermission.upsert({
                where: {
                    tenant_id_user_id_permission_id: {
                        tenant_id: tenantId,
                        user_id: userId,
                        permission_id: permissionId,
                    },
                },
                create: {
                    tenant_id: tenantId,
                    user_id: userId,
                    permission_id: permissionId,
                    granted: true,
                    created_by: grantedBy,
                },
                update: { granted: true },
            });
        }
    }
    async replacePermissions(tx, tenantId, userId, permissionIds, grantedBy) {
        await tx.userPermission.deleteMany({ where: { tenant_id: tenantId, user_id: userId } });
        await this.assignPermissions(tx, tenantId, userId, permissionIds, grantedBy);
    }
    async createUser(tenantId, dto, creator = {}) {
        const creatorLabel = creator.superAdminId
            ? `super admin ${creator.superAdminId}`
            : creator.userId
                ? `user ${creator.userId}`
                : 'system';
        this.log('CREATE_USER', `Creating user ${dto.email} for tenant ${tenantId} (by ${creatorLabel})`);
        const tenant = await this.validateTenant(tenantId);
        const temporaryPassword = password_util_1.PasswordUtil.generateTemporaryPassword(password_constants_1.PASSWORD_CONSTANTS.TEMP_PASSWORD_LENGTH);
        const passwordHash = await password_util_1.PasswordUtil.hash(temporaryPassword);
        const auditActorId = creator.userId ?? creator.superAdminId;
        try {
            const user = await this.prisma.runWithTenant(tenantId, async (tx) => {
                await this.validateUserLimit(tx, tenant);
                await this.validateEmailAvailable(tx, tenantId, dto.email);
                await this.validateBranch(tx, tenantId, dto.branch_id);
                await this.validateDepartment(tx, tenantId, dto.department_id);
                const createdUser = await tx.user.create({
                    data: {
                        tenant_id: tenantId,
                        email: dto.email.toLowerCase(),
                        password_hash: passwordHash,
                        password_changed_at: new Date(),
                        password_expires_at: password_helper_1.PasswordHelper.calculateExpiryDate(),
                        must_change_password: true,
                        first_name: dto.first_name,
                        last_name: dto.last_name,
                        phone: dto.phone,
                        avatar_url: dto.avatar_url,
                        role: dto.role,
                        status: dto.status ?? client_1.UserStatus.INVITED,
                        branch_id: dto.branch_id,
                        department_id: dto.department_id,
                        is_salesperson: dto.is_salesperson ?? false,
                        is_cs_rep: dto.is_cs_rep ?? false,
                        is_operations: dto.is_operations ?? false,
                        is_finance: dto.is_finance ?? false,
                        can_see_sales: dto.can_see_sales ?? false,
                        can_see_cost: dto.can_see_cost ?? false,
                        can_see_gp: dto.can_see_gp ?? false,
                        can_see_invoices: dto.can_see_invoices ?? false,
                        can_see_payments: dto.can_see_payments ?? false,
                        can_see_bank_balances: dto.can_see_bank_balances ?? false,
                        can_see_ar_ap: dto.can_see_ar_ap ?? false,
                        can_see_mgmt_reports: dto.can_see_mgmt_reports ?? false,
                        can_see_job_pnl: dto.can_see_job_pnl ?? false,
                        office_hours_start: dto.office_hours_start,
                        office_hours_end: dto.office_hours_end,
                        office_hours_timezone: dto.office_hours_timezone,
                        allowed_ips: dto.allowed_ips ?? [],
                        allowed_mac_addresses: dto.allowed_mac_addresses ?? [],
                        max_concurrent_sessions: dto.max_concurrent_sessions ?? users_constants_1.USERS_CONSTANTS.DEFAULT_MAX_CONCURRENT_SESSIONS,
                        two_factor_enabled: false,
                        created_by_user_id: creator.userId,
                        created_by_super_admin_id: creator.superAdminId,
                        updated_by: auditActorId,
                    },
                });
                await tx.passwordHistory.create({
                    data: {
                        tenant_id: tenantId,
                        user_id: createdUser.id,
                        password_hash: passwordHash,
                        changed_by: auditActorId,
                        reason: 'INITIAL_PASSWORD',
                    },
                });
                const defaultRole = await tx.role.findFirst({
                    where: {
                        tenant_id: tenantId,
                        code: users_constants_1.USERS_CONSTANTS.DEFAULT_ROLE_CODE,
                        is_active: true,
                        deleted_at: null,
                    },
                });
                if (defaultRole) {
                    await tx.userRoleAssignment.create({
                        data: {
                            tenant_id: tenantId,
                            user_id: createdUser.id,
                            role_id: defaultRole.id,
                            assigned_by: auditActorId,
                        },
                    });
                }
                if (dto.role_ids?.length) {
                    await this.assignRoles(tx, tenantId, createdUser.id, dto.role_ids, auditActorId);
                }
                if (dto.permission_ids?.length) {
                    await this.assignPermissions(tx, tenantId, createdUser.id, dto.permission_ids, auditActorId);
                }
                return createdUser;
            });
            this.log('CREATE_USER', `User ${user.email} created successfully.`);
            return {
                user,
                temporaryPassword,
            };
        }
        catch (error) {
            this.logError('CREATE_USER', error);
            throw error;
        }
    }
    async findAll(tenantId, query) {
        await this.validateTenant(tenantId);
        const filters = {
            page: query.page,
            limit: Math.min(query.limit, users_constants_1.USERS_CONSTANTS.MAX_LIMIT),
            search: query.search,
            role: query.role,
            status: query.status,
            branchId: query.branch_id,
            departmentId: query.department_id,
            sortBy: query.sortBy,
            order: query.order,
        };
        const result = await this.prisma.runWithTenant(tenantId, (tx) => this.repository.findMany(tx, tenantId, filters));
        return user_mapper_1.UserMapper.toPaginated(result);
    }
    async findOne(tenantId, id) {
        await this.validateTenant(tenantId);
        const user = await this.prisma.runWithTenant(tenantId, (tx) => this.getExistingOrThrow(tx, tenantId, id));
        return user_mapper_1.UserMapper.toResponse(user);
    }
    async updateUser(tenantId, id, dto, updatedBy) {
        this.log('UPDATE_USER', `Updating user ${id} for tenant ${tenantId}`);
        await this.validateTenant(tenantId);
        try {
            const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
                await this.getExistingOrThrow(tx, tenantId, id);
                if (dto.email) {
                    await this.validateEmailAvailable(tx, tenantId, dto.email, id);
                }
                await this.validateBranch(tx, tenantId, dto.branch_id);
                await this.validateDepartment(tx, tenantId, dto.department_id);
                const { role_ids, permission_ids, email, ...rest } = dto;
                const user = await tx.user.update({
                    where: { id },
                    data: {
                        ...rest,
                        ...(email ? { email: email.toLowerCase() } : {}),
                        ...audit_helper_1.AuditHelper.buildUpdateAudit(updatedBy),
                    },
                });
                if (role_ids) {
                    await this.replaceRoles(tx, tenantId, id, role_ids, updatedBy);
                }
                if (permission_ids) {
                    await this.replacePermissions(tx, tenantId, id, permission_ids, updatedBy);
                }
                return user;
            });
            this.log('UPDATE_USER', `User ${id} updated successfully.`);
            return user_mapper_1.UserMapper.toResponse(updated);
        }
        catch (error) {
            this.logError('UPDATE_USER', error);
            throw error;
        }
    }
    async updateStatus(tenantId, id, dto, updatedBy) {
        this.log('UPDATE_STATUS', `Setting user ${id} status to ${dto.status}`);
        await this.validateTenant(tenantId);
        const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
            await this.getExistingOrThrow(tx, tenantId, id);
            return this.repository.updateStatus(tx, id, dto.status, updatedBy);
        });
        return user_mapper_1.UserMapper.toResponse(updated);
    }
    async bulkAction(tenantId, dto, actorId) {
        this.log('BULK_ACTION', `Applying ${dto.action} to ${dto.ids.length} user(s)`);
        await this.validateTenant(tenantId);
        const affected = await this.prisma.runWithTenant(tenantId, async (tx) => {
            const existing = await this.repository.findByIds(tx, tenantId, dto.ids);
            if (existing.length === 0) {
                throw new common_1.NotFoundException('None of the specified users were found.');
            }
            const eligibleIds = existing.map((user) => user.id);
            switch (dto.action) {
                case bulk_user_dto_1.BulkUserAction.ACTIVATE: {
                    const result = await this.repository.bulkUpdateStatus(tx, tenantId, eligibleIds, client_1.UserStatus.ACTIVE, actorId);
                    return result.count;
                }
                case bulk_user_dto_1.BulkUserAction.DEACTIVATE: {
                    const result = await this.repository.bulkUpdateStatus(tx, tenantId, eligibleIds, client_1.UserStatus.INACTIVE, actorId);
                    return result.count;
                }
                case bulk_user_dto_1.BulkUserAction.SUSPEND: {
                    const result = await this.repository.bulkUpdateStatus(tx, tenantId, eligibleIds, client_1.UserStatus.SUSPENDED, actorId);
                    return result.count;
                }
                case bulk_user_dto_1.BulkUserAction.DELETE: {
                    const result = await this.repository.bulkSoftDelete(tx, tenantId, eligibleIds, actorId);
                    return result.count;
                }
                case bulk_user_dto_1.BulkUserAction.RESTORE: {
                    const result = await tx.user.updateMany({
                        where: { id: { in: eligibleIds }, tenant_id: tenantId, deleted_at: { not: null } },
                        data: { deleted_at: null, updated_by: actorId },
                    });
                    return result.count;
                }
                default:
                    throw new common_1.BadRequestException(`Unsupported bulk action: ${dto.action}`);
            }
        });
        this.log('BULK_ACTION', `${dto.action} affected ${affected} of ${dto.ids.length} requested`);
        return { requested: dto.ids.length, affected };
    }
    async softDeleteUser(tenantId, id, deletedBy) {
        this.log('DELETE_USER', `Soft-deleting user ${id}`);
        await this.validateTenant(tenantId);
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            await this.getExistingOrThrow(tx, tenantId, id);
            return this.repository.softDelete(tx, id, deletedBy);
        });
    }
    async restoreUser(tenantId, id, restoredBy) {
        this.log('RESTORE_USER', `Restoring user ${id}`);
        await this.validateTenant(tenantId);
        const restored = await this.prisma.runWithTenant(tenantId, async (tx) => {
            const user = await this.repository.findByIdIncludingDeleted(tx, tenantId, id);
            if (!user) {
                throw new common_1.NotFoundException('User not found.');
            }
            if (!user.deleted_at) {
                throw new common_1.BadRequestException('User is not deleted.');
            }
            return this.repository.restore(tx, id, restoredBy);
        });
        return user_mapper_1.UserMapper.toResponse(restored);
    }
    async forceLogout(tenantId, targetUserId) {
        this.log('FORCE_LOGOUT', `Force-logging-out user ${targetUserId}`);
        await this.validateTenant(tenantId);
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            await this.getExistingOrThrow(tx, tenantId, targetUserId);
        });
        await this.prisma.session.updateMany({
            where: { user_id: targetUserId, tenant_id: tenantId, is_active: true },
            data: { is_active: false, revoked_at: new Date(), revoked_reason: 'FORCE_LOGOUT_BY_ADMIN' },
        });
    }
    async changePassword(tenantId, userId, dto) {
        this.log('CHANGE_PASSWORD', `User ${userId} changing their own password`);
        await this.validateTenant(tenantId);
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            const user = await this.getExistingOrThrow(tx, tenantId, userId);
            const currentValid = await password_util_1.PasswordUtil.verify(user.password_hash, dto.current_password);
            if (!currentValid) {
                throw new common_1.UnauthorizedException('Current password is incorrect.');
            }
            password_helper_1.PasswordHelper.assertStrength(dto.new_password);
            const history = await this.repository.getPasswordHistory(tx, tenantId, userId, password_constants_1.PASSWORD_CONSTANTS.HISTORY_LIMIT);
            await password_helper_1.PasswordHelper.assertNotReused(dto.new_password, history);
            const passwordHash = await password_util_1.PasswordUtil.hash(dto.new_password);
            await this.repository.updatePassword(tx, userId, passwordHash, {
                updatedBy: userId,
                mustChangePassword: false,
                passwordExpiresAt: password_helper_1.PasswordHelper.calculateExpiryDate(),
            });
            await tx.passwordHistory.create({
                data: {
                    tenant_id: tenantId,
                    user_id: userId,
                    password_hash: passwordHash,
                    changed_by: userId,
                    reason: 'SELF_SERVICE_CHANGE',
                },
            });
        });
        this.log('CHANGE_PASSWORD', `Password changed for user ${userId}`);
    }
    async adminResetPassword(tenantId, targetUserId, dto, adminId) {
        this.log('ADMIN_RESET_PASSWORD', `Admin ${adminId} resetting password for ${targetUserId}`);
        await this.validateTenant(tenantId);
        const temporaryPassword = password_util_1.PasswordUtil.generateTemporaryPassword(password_constants_1.PASSWORD_CONSTANTS.TEMP_PASSWORD_LENGTH);
        const passwordHash = await password_util_1.PasswordUtil.hash(temporaryPassword);
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            await this.getExistingOrThrow(tx, tenantId, targetUserId);
            await this.repository.updatePassword(tx, targetUserId, passwordHash, {
                updatedBy: adminId,
                mustChangePassword: dto.require_password_change ?? true,
                passwordExpiresAt: password_helper_1.PasswordHelper.calculateExpiryDate(),
            });
            await tx.passwordHistory.create({
                data: {
                    tenant_id: tenantId,
                    user_id: targetUserId,
                    password_hash: passwordHash,
                    changed_by: adminId,
                    reason: 'ADMIN_RESET',
                },
            });
        });
        this.log('ADMIN_RESET_PASSWORD', `Password reset for ${targetUserId} by ${adminId}`);
        return { temporaryPassword };
    }
    async requestPasswordReset(tenantId, email) {
        await this.validateTenant(tenantId);
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const user = await this.repository.findByEmail(tx, tenantId, email);
            if (!user) {
                return null;
            }
            const token = password_helper_1.PasswordHelper.generateResetToken();
            const expiresAt = password_helper_1.PasswordHelper.resetTokenExpiry();
            await this.repository.setPasswordResetToken(tx, user.id, token, expiresAt);
            this.log('REQUEST_PASSWORD_RESET', `Reset token issued for user ${user.id}`);
            return { token };
        });
    }
    async resetPassword(tenantId, dto) {
        const user = await this.repository.findByPasswordResetToken(this.prisma, dto.token);
        if (!user || user.tenant_id !== tenantId) {
            throw new common_1.BadRequestException('Invalid or expired reset token.');
        }
        if (!user.password_reset_expires || user.password_reset_expires < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token.');
        }
        password_helper_1.PasswordHelper.assertStrength(dto.new_password);
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            const history = await this.repository.getPasswordHistory(tx, tenantId, user.id, password_constants_1.PASSWORD_CONSTANTS.HISTORY_LIMIT);
            await password_helper_1.PasswordHelper.assertNotReused(dto.new_password, history);
            const passwordHash = await password_util_1.PasswordUtil.hash(dto.new_password);
            await this.repository.updatePassword(tx, user.id, passwordHash, {
                mustChangePassword: false,
                passwordExpiresAt: password_helper_1.PasswordHelper.calculateExpiryDate(),
            });
            await tx.passwordHistory.create({
                data: {
                    tenant_id: tenantId,
                    user_id: user.id,
                    password_hash: passwordHash,
                    reason: 'FORGOT_PASSWORD_RESET',
                },
            });
        });
        this.log('RESET_PASSWORD', `Password reset via token for user ${user.id}`);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map