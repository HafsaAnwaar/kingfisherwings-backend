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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersRepository = class UsersRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tx, data) {
        return tx.user.create({ data });
    }
    async findById(tx, tenantId, id) {
        return tx.user.findFirst({
            where: { id, tenant_id: tenantId, deleted_at: null },
        });
    }
    async findByIdIncludingDeleted(tx, tenantId, id) {
        return tx.user.findFirst({
            where: { id, tenant_id: tenantId },
        });
    }
    async findByIdWithRelations(tx, tenantId, id) {
        return tx.user.findFirst({
            where: { id, tenant_id: tenantId, deleted_at: null },
            include: {
                tenant: {
                    select: { id: true, name: true, code: true },
                },
            },
        });
    }
    async findByEmail(tx, tenantId, email) {
        return tx.user.findFirst({
            where: {
                tenant_id: tenantId,
                email: email.toLowerCase(),
                deleted_at: null,
            },
        });
    }
    async findByEmailIncludingDeleted(tx, tenantId, email) {
        return tx.user.findFirst({
            where: {
                tenant_id: tenantId,
                email: email.toLowerCase(),
            },
        });
    }
    async findByInviteToken(tx, token) {
        return tx.user.findFirst({
            where: { invite_token: token, deleted_at: null },
        });
    }
    async findByPasswordResetToken(tx, token) {
        return tx.user.findFirst({
            where: { password_reset_token: token, deleted_at: null },
        });
    }
    async findByIds(tx, tenantId, ids) {
        return tx.user.findMany({
            where: {
                tenant_id: tenantId,
                id: { in: ids },
                deleted_at: null,
            },
        });
    }
    async findMany(tx, tenantId, options) {
        const { page, limit, search, role, status, branchId, departmentId, sortBy = 'created_at', order = 'desc', } = options;
        const where = {
            tenant_id: tenantId,
            deleted_at: null,
        };
        if (search) {
            where.OR = [
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.role = role;
        }
        if (status) {
            where.status = status;
        }
        if (branchId) {
            where.branch_id = branchId;
        }
        if (departmentId) {
            where.department_id = departmentId;
        }
        const [users, total] = await Promise.all([
            tx.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: order },
            }),
            tx.user.count({ where }),
        ]);
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async exists(tx, tenantId, id) {
        const count = await tx.user.count({
            where: { id, tenant_id: tenantId, deleted_at: null },
        });
        return count > 0;
    }
    async existsByEmail(tx, tenantId, email, excludeId) {
        const count = await tx.user.count({
            where: {
                tenant_id: tenantId,
                email: email.toLowerCase(),
                deleted_at: null,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        });
        return count > 0;
    }
    async count(tx, tenantId) {
        return tx.user.count({
            where: { tenant_id: tenantId, deleted_at: null },
        });
    }
    async countActive(tx, tenantId) {
        return tx.user.count({
            where: { tenant_id: tenantId, deleted_at: null, status: client_1.UserStatus.ACTIVE },
        });
    }
    async countByRole(tx, tenantId, role) {
        return tx.user.count({
            where: {
                tenant_id: tenantId,
                role: role,
                deleted_at: null,
            },
        });
    }
    async countByStatus(tx, tenantId, status) {
        return tx.user.count({
            where: { tenant_id: tenantId, status, deleted_at: null },
        });
    }
    async update(tx, id, data) {
        return tx.user.update({ where: { id }, data });
    }
    async updateStatus(tx, id, status, updatedBy) {
        return tx.user.update({
            where: { id },
            data: { status, updated_by: updatedBy },
        });
    }
    async bulkUpdateStatus(tx, tenantId, ids, status, updatedBy) {
        return tx.user.updateMany({
            where: { id: { in: ids }, tenant_id: tenantId, deleted_at: null },
            data: { status, updated_by: updatedBy },
        });
    }
    async updatePassword(tx, id, passwordHash, options = {}) {
        return tx.user.update({
            where: { id },
            data: {
                password_hash: passwordHash,
                password_changed_at: new Date(),
                password_expires_at: options.passwordExpiresAt ?? null,
                must_change_password: options.mustChangePassword ?? false,
                password_reset_token: null,
                password_reset_expires: null,
                updated_by: options.updatedBy,
            },
        });
    }
    async setPasswordResetToken(tx, id, token, expiresAt) {
        return tx.user.update({
            where: { id },
            data: {
                password_reset_token: token,
                password_reset_expires: expiresAt,
            },
        });
    }
    async clearPasswordResetToken(tx, id) {
        return tx.user.update({
            where: { id },
            data: {
                password_reset_token: null,
                password_reset_expires: null,
            },
        });
    }
    async getPasswordHistory(tx, tenantId, userId, limit) {
        return tx.passwordHistory.findMany({
            where: { tenant_id: tenantId, user_id: userId },
            orderBy: { changed_at: 'desc' },
            take: limit,
        });
    }
    async setInviteToken(tx, id, token, expiresAt) {
        return tx.user.update({
            where: { id },
            data: {
                invite_token: token,
                invite_expires_at: expiresAt,
            },
        });
    }
    async clearInviteToken(tx, id) {
        return tx.user.update({
            where: { id },
            data: {
                invite_token: null,
                invite_expires_at: null,
            },
        });
    }
    async verifyEmail(tx, id) {
        return tx.user.update({
            where: { id },
            data: {
                email_verified: true,
                email_verified_at: new Date(),
            },
        });
    }
    async enableTwoFactor(tx, id, secret, backupCodes) {
        return tx.user.update({
            where: { id },
            data: {
                two_factor_enabled: true,
                two_factor_secret: secret,
                two_factor_backup_codes: backupCodes,
            },
        });
    }
    async disableTwoFactor(tx, id) {
        return tx.user.update({
            where: { id },
            data: {
                two_factor_enabled: false,
                two_factor_secret: null,
                two_factor_backup_codes: [],
            },
        });
    }
    async replaceTwoFactorBackupCodes(tx, id, backupCodes) {
        return tx.user.update({
            where: { id },
            data: { two_factor_backup_codes: backupCodes },
        });
    }
    async updateRefreshTokenHash(tx, id, hash) {
        return tx.user.update({
            where: { id },
            data: { refresh_token_hash: hash },
        });
    }
    async updateLoginInformation(tx, userId, ip, device, browser, location) {
        return tx.user.update({
            where: { id: userId },
            data: {
                last_login_at: new Date(),
                last_login_ip: ip,
                last_login_device: device,
                last_login_browser: browser,
                last_login_location: location,
                last_activity_at: new Date(),
                failed_login_count: 0,
            },
        });
    }
    async touchActivity(tx, userId) {
        return tx.user.update({
            where: { id: userId },
            data: { last_activity_at: new Date() },
        });
    }
    async incrementFailedLogin(tx, userId) {
        return tx.user.update({
            where: { id: userId },
            data: {
                failed_login_count: { increment: 1 },
                last_failed_login_at: new Date(),
            },
        });
    }
    async resetFailedLogin(tx, userId) {
        return tx.user.update({
            where: { id: userId },
            data: { failed_login_count: 0 },
        });
    }
    async lockAccount(tx, userId, until) {
        return tx.user.update({
            where: { id: userId },
            data: { locked_until: until, status: client_1.UserStatus.LOCKED },
        });
    }
    async unlockAccount(tx, userId) {
        return tx.user.update({
            where: { id: userId },
            data: {
                locked_until: null,
                failed_login_count: 0,
                status: client_1.UserStatus.ACTIVE,
            },
        });
    }
    async softDelete(tx, id, deletedBy) {
        return tx.user.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_by: deletedBy,
            },
        });
    }
    async bulkSoftDelete(tx, tenantId, ids, deletedBy) {
        return tx.user.updateMany({
            where: { id: { in: ids }, tenant_id: tenantId, deleted_at: null },
            data: { deleted_at: new Date(), updated_by: deletedBy },
        });
    }
    async restore(tx, id, restoredBy) {
        return tx.user.update({
            where: { id },
            data: {
                deleted_at: null,
                updated_by: restoredBy,
            },
        });
    }
    async delete(tx, id) {
        return tx.user.delete({ where: { id } });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map