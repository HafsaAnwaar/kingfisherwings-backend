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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const password_util_1 = require("../../common/utils/password.util");
const users_service_1 = require("../users/users.service");
const user_mapper_1 = require("../users/mappers/user.mapper");
const request_with_user_interface_1 = require("./interfaces/request-with-user.interface");
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const OWNER_ROLE_CODE = 'TENANT_ADMIN';
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, usersService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
    }
    async login(dto, meta) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug: dto.tenant_slug, deleted_at: null },
        });
        if (!tenant) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        this.assertTenantActive(tenant);
        return this.prisma.runWithTenant(tenant.id, async (tx) => {
            const user = await tx.user.findFirst({
                where: { tenant_id: tenant.id, email: dto.email.toLowerCase(), deleted_at: null },
            });
            if (!user) {
                await this.recordLoginHistory(tx, {
                    tenant_id: tenant.id,
                    user_id: null,
                    email: dto.email,
                    meta,
                    success: false,
                    failure_reason: 'USER_NOT_FOUND',
                });
                throw new common_1.UnauthorizedException('Invalid credentials.');
            }
            if (user.locked_until && user.locked_until > new Date()) {
                throw new common_1.ForbiddenException('Account is temporarily locked due to failed login attempts.');
            }
            if (user.status !== client_1.UserStatus.ACTIVE && user.status !== client_1.UserStatus.INVITED) {
                throw new common_1.ForbiddenException(`Account is ${user.status.toLowerCase()}. Contact your administrator.`);
            }
            const passwordValid = await password_util_1.PasswordUtil.verify(user.password_hash, dto.password);
            if (!passwordValid) {
                await this.handleFailedUserLogin(tx, user.id, user.failed_login_count);
                await this.recordLoginHistory(tx, {
                    tenant_id: tenant.id,
                    user_id: user.id,
                    email: dto.email,
                    meta,
                    success: false,
                    failure_reason: 'INVALID_PASSWORD',
                });
                throw new common_1.UnauthorizedException('Invalid credentials.');
            }
            return this.completeUserLogin(tx, tenant, user, dto, meta);
        });
    }
    async tenantLogin(dto, meta) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug: dto.tenant_slug, deleted_at: null },
        });
        if (!tenant) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        this.assertTenantActive(tenant);
        const passwordValid = await password_util_1.PasswordUtil.verify(tenant.password_hash, dto.password);
        return this.prisma.runWithTenant(tenant.id, async (tx) => {
            if (!passwordValid) {
                await this.recordLoginHistory(tx, {
                    tenant_id: tenant.id,
                    user_id: null,
                    email: tenant.email ?? tenant.slug,
                    meta,
                    success: false,
                    failure_reason: 'INVALID_TENANT_PASSWORD',
                });
                throw new common_1.UnauthorizedException('Invalid credentials.');
            }
            const owner = await tx.user.findFirst({
                where: {
                    tenant_id: tenant.id,
                    role: 'TENANT_ADMIN',
                    deleted_at: null,
                },
                orderBy: { created_at: 'asc' },
            });
            if (!owner) {
                throw new common_1.NotFoundException('This tenant has no admin user provisioned. Contact platform support.');
            }
            if (owner.status !== client_1.UserStatus.ACTIVE) {
                throw new common_1.ForbiddenException(`Tenant admin account is ${owner.status.toLowerCase()}.`);
            }
            return this.completeUserLogin(tx, tenant, owner, dto, meta);
        });
    }
    async superAdminSignup(dto, meta) {
        const existing = await this.prisma.superAdmin.findFirst({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ForbiddenException('An account with this email already exists.');
        }
        const passwordHash = await password_util_1.PasswordUtil.hash(dto.password);
        const superAdmin = await this.prisma.superAdmin.create({
            data: {
                email: dto.email.toLowerCase(),
                password_hash: passwordHash,
                first_name: dto.first_name,
                last_name: dto.last_name,
            },
        });
        return this.completeSuperAdminLogin(superAdmin, meta);
    }
    async superAdminLogin(dto, meta) {
        const superAdmin = await this.prisma.superAdmin.findFirst({
            where: { email: dto.email.toLowerCase(), deleted_at: null },
        });
        if (!superAdmin) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        if (superAdmin.locked_until && superAdmin.locked_until > new Date()) {
            throw new common_1.ForbiddenException('Account is temporarily locked due to failed login attempts.');
        }
        if (!superAdmin.is_active) {
            throw new common_1.ForbiddenException('Account is inactive.');
        }
        const passwordValid = await password_util_1.PasswordUtil.verify(superAdmin.password_hash, dto.password);
        if (!passwordValid) {
            const nextCount = superAdmin.failed_login_count + 1;
            const shouldLock = nextCount >= MAX_FAILED_ATTEMPTS;
            await this.prisma.superAdmin.update({
                where: { id: superAdmin.id },
                data: {
                    failed_login_count: shouldLock ? 0 : nextCount,
                    locked_until: shouldLock
                        ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                        : undefined,
                },
            });
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        return this.completeSuperAdminLogin(superAdmin, meta);
    }
    async completeSuperAdminLogin(superAdmin, meta) {
        const sessionId = (0, crypto_1.randomUUID)();
        const { access_token, refresh_token, expires_in } = await this.issueSuperAdminTokens(superAdmin.id, superAdmin.email, sessionId);
        const refreshTokenHash = await password_util_1.PasswordUtil.hash(refresh_token);
        await this.prisma.$transaction([
            this.prisma.superAdminSession.create({
                data: {
                    super_admin_id: superAdmin.id,
                    jti: sessionId,
                    refresh_token_hash: refreshTokenHash,
                    ip_address: meta.ip_address,
                    user_agent: meta.user_agent,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            }),
            this.prisma.superAdmin.update({
                where: { id: superAdmin.id },
                data: {
                    failed_login_count: 0,
                    locked_until: null,
                    last_login_at: new Date(),
                    last_login_ip: meta.ip_address,
                },
            }),
        ]);
        return {
            success: true,
            message: 'Login successful.',
            data: {
                access_token,
                refresh_token,
                expires_in,
                super_admin: {
                    id: superAdmin.id,
                    email: superAdmin.email,
                    first_name: superAdmin.first_name,
                    last_name: superAdmin.last_name,
                },
            },
        };
    }
    async refresh(dto) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(dto.refresh_token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type.');
        }
        if (payload.principal === 'super_admin') {
            return this.refreshSuperAdmin(payload, dto.refresh_token);
        }
        return this.refreshUser(payload, dto.refresh_token);
    }
    async refreshUser(payload, presentedToken) {
        const session = await this.prisma.session.findUnique({ where: { jti: payload.sessionId } });
        if (!session || !session.is_active || session.revoked_at || session.expires_at < new Date()) {
            throw new common_1.UnauthorizedException('Session is no longer valid.');
        }
        const tokenMatches = await password_util_1.PasswordUtil.verify(session.refresh_token_hash, presentedToken);
        if (!tokenMatches) {
            await this.prisma.session.updateMany({
                where: { user_id: session.user_id, is_active: true },
                data: { is_active: false, revoked_at: new Date(), revoked_reason: 'REUSE_DETECTED' },
            });
            throw new common_1.UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
        }
        const user = await this.prisma.runWithTenant(session.tenant_id, (tx) => tx.user.findFirst({ where: { id: session.user_id, deleted_at: null } }));
        if (!user || user.status !== client_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is no longer active.');
        }
        const { roleId, permissions } = await this.resolveRbac(session.tenant_id, user.id);
        const newSessionId = (0, crypto_1.randomUUID)();
        const { access_token, refresh_token, expires_in } = await this.issueUserTokens({
            user,
            tenantId: session.tenant_id,
            roleId,
            permissions,
            sessionId: newSessionId,
        });
        const newRefreshTokenHash = await password_util_1.PasswordUtil.hash(refresh_token);
        await this.prisma.$transaction([
            this.prisma.session.update({
                where: { jti: payload.sessionId },
                data: { is_active: false, revoked_at: new Date(), revoked_reason: 'ROTATED' },
            }),
            this.prisma.session.create({
                data: {
                    tenant_id: session.tenant_id,
                    user_id: user.id,
                    jti: newSessionId,
                    refresh_token_hash: newRefreshTokenHash,
                    ip_address: session.ip_address,
                    user_agent: session.user_agent,
                    device_name: session.device_name,
                    browser: session.browser,
                    operating_system: session.operating_system,
                    remember_me: session.remember_me,
                    expires_at: session.expires_at,
                },
            }),
        ]);
        return {
            success: true,
            message: 'Token refreshed successfully.',
            data: { access_token, refresh_token, expires_in },
        };
    }
    async refreshSuperAdmin(payload, presentedToken) {
        const session = await this.prisma.superAdminSession.findUnique({
            where: { jti: payload.sessionId },
        });
        if (!session || !session.is_active || session.revoked_at || session.expires_at < new Date()) {
            throw new common_1.UnauthorizedException('Session is no longer valid.');
        }
        const tokenMatches = await password_util_1.PasswordUtil.verify(session.refresh_token_hash, presentedToken);
        if (!tokenMatches) {
            await this.prisma.superAdminSession.updateMany({
                where: { super_admin_id: session.super_admin_id, is_active: true },
                data: { is_active: false, revoked_at: new Date(), revoked_reason: 'REUSE_DETECTED' },
            });
            throw new common_1.UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
        }
        const superAdmin = await this.prisma.superAdmin.findFirst({
            where: { id: session.super_admin_id, deleted_at: null, is_active: true },
        });
        if (!superAdmin) {
            throw new common_1.UnauthorizedException('Account is no longer active.');
        }
        const newSessionId = (0, crypto_1.randomUUID)();
        const { access_token, refresh_token, expires_in } = await this.issueSuperAdminTokens(superAdmin.id, superAdmin.email, newSessionId);
        const newRefreshTokenHash = await password_util_1.PasswordUtil.hash(refresh_token);
        await this.prisma.$transaction([
            this.prisma.superAdminSession.update({
                where: { jti: payload.sessionId },
                data: { is_active: false, revoked_at: new Date(), revoked_reason: 'ROTATED' },
            }),
            this.prisma.superAdminSession.create({
                data: {
                    super_admin_id: superAdmin.id,
                    jti: newSessionId,
                    refresh_token_hash: newRefreshTokenHash,
                    ip_address: session.ip_address,
                    user_agent: session.user_agent,
                    expires_at: session.expires_at,
                },
            }),
        ]);
        return {
            success: true,
            message: 'Token refreshed successfully.',
            data: { access_token, refresh_token, expires_in },
        };
    }
    async logout(principal) {
        if ((0, request_with_user_interface_1.isSuperAdmin)(principal)) {
            await this.prisma.superAdminSession.updateMany({
                where: { super_admin_id: principal.id, jti: principal.sessionId, is_active: true },
                data: { is_active: false, revoked_at: new Date(), revoked_reason: 'LOGOUT' },
            });
        }
        else {
            await this.prisma.session.updateMany({
                where: { user_id: principal.id, jti: principal.sessionId, is_active: true },
                data: { is_active: false, revoked_at: new Date(), revoked_reason: 'LOGOUT' },
            });
        }
        return { success: true, message: 'Logged out successfully.' };
    }
    async me(principal) {
        if ((0, request_with_user_interface_1.isSuperAdmin)(principal)) {
            const superAdmin = await this.prisma.superAdmin.findFirst({
                where: { id: principal.id, deleted_at: null },
            });
            if (!superAdmin) {
                throw new common_1.UnauthorizedException('Account not found.');
            }
            return {
                success: true,
                data: {
                    id: superAdmin.id,
                    email: superAdmin.email,
                    first_name: superAdmin.first_name,
                    last_name: superAdmin.last_name,
                },
            };
        }
        const response = await this.usersService.findOne(principal.tenantId, principal.id);
        return { success: true, data: response };
    }
    async changePassword(tenantId, userId, dto) {
        await this.usersService.changePassword(tenantId, userId, dto);
        await this.prisma.session.updateMany({
            where: { user_id: userId, is_active: true },
            data: { is_active: false, revoked_at: new Date(), revoked_reason: 'PASSWORD_CHANGED' },
        });
        return {
            success: true,
            message: 'Password changed successfully. Please log in again.',
        };
    }
    async changeTenantPassword(tenantId, dto) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId, deleted_at: null },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found.');
        }
        const currentValid = await password_util_1.PasswordUtil.verify(tenant.password_hash, dto.current_password);
        if (!currentValid) {
            throw new common_1.UnauthorizedException('Current tenant password is incorrect.');
        }
        const newPasswordHash = await password_util_1.PasswordUtil.hash(dto.new_password);
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { password_hash: newPasswordHash },
        });
        return {
            success: true,
            message: 'Tenant password changed successfully.',
        };
    }
    assertTenantActive(tenant) {
        const activeTenantStatuses = [client_1.TenantStatus.ACTIVE, client_1.TenantStatus.TRIAL];
        if (!tenant.is_active || !activeTenantStatuses.includes(tenant.status)) {
            throw new common_1.ForbiddenException('This account is not active.');
        }
    }
    async completeUserLogin(tx, tenant, user, dto, meta) {
        if (user.single_device_login) {
            await this.enforceSingleDeviceLogin(user.id, user.single_device_policy);
        }
        else {
            await this.enforceSessionLimit(user.id, user.max_concurrent_sessions);
        }
        const { roleId, permissions } = await this.resolveRbac(tenant.id, user.id, tx);
        const sessionId = (0, crypto_1.randomUUID)();
        const { access_token, refresh_token, expires_in } = await this.issueUserTokens({
            user,
            tenantId: tenant.id,
            roleId,
            permissions,
            sessionId,
        });
        const refreshTokenHash = await password_util_1.PasswordUtil.hash(refresh_token);
        const refreshExpiryDays = dto.remember_me ? 30 : 7;
        await Promise.all([
            this.prisma.session.create({
                data: {
                    tenant_id: tenant.id,
                    user_id: user.id,
                    jti: sessionId,
                    refresh_token_hash: refreshTokenHash,
                    ip_address: meta.ip_address,
                    user_agent: meta.user_agent,
                    device_name: dto.device_name,
                    browser: meta.browser,
                    operating_system: meta.operating_system,
                    remember_me: dto.remember_me ?? false,
                    expires_at: new Date(Date.now() + refreshExpiryDays * 24 * 60 * 60 * 1000),
                },
            }),
            tx.user.update({
                where: { id: user.id },
                data: {
                    status: client_1.UserStatus.ACTIVE,
                    failed_login_count: 0,
                    locked_until: null,
                    last_login_at: new Date(),
                    last_login_ip: meta.ip_address,
                    last_login_device: meta.device_name,
                    last_login_browser: meta.browser,
                    last_activity_at: new Date(),
                },
            }),
        ]);
        await this.recordLoginHistory(tx, {
            tenant_id: tenant.id,
            user_id: user.id,
            email: user.email,
            meta,
            success: true,
        });
        return {
            success: true,
            message: 'Login successful.',
            data: {
                access_token,
                refresh_token,
                expires_in,
                must_change_password: user.must_change_password,
                user: user_mapper_1.UserMapper.toResponse({ ...user, status: client_1.UserStatus.ACTIVE }),
            },
        };
    }
    async resolveRbac(tenantId, userId, existingTx) {
        const run = existingTx
            ? (fn) => fn(existingTx)
            : (fn) => this.prisma.runWithTenant(tenantId, fn);
        return run(async (tx) => {
            const roleAssignments = await tx.userRoleAssignment.findMany({
                where: { tenant_id: tenantId, user_id: userId },
                orderBy: { assigned_at: 'asc' },
                include: {
                    role: {
                        include: { role_permissions: { include: { permission: true } } },
                    },
                },
            });
            const directGrants = await tx.userPermission.findMany({
                where: { tenant_id: tenantId, user_id: userId, granted: true },
                include: { permission: true },
            });
            const activeAssignments = roleAssignments.filter((assignment) => assignment.role.is_active && !assignment.role.deleted_at);
            const codes = new Set();
            for (const assignment of activeAssignments) {
                for (const rolePermission of assignment.role.role_permissions) {
                    codes.add(`${rolePermission.permission.module}.${rolePermission.permission.action}`);
                }
            }
            for (const grant of directGrants) {
                codes.add(`${grant.permission.module}.${grant.permission.action}`);
            }
            return {
                roleId: activeAssignments[0]?.role_id ?? null,
                permissions: Array.from(codes),
            };
        });
    }
    async issueUserTokens(params) {
        const { user, tenantId, roleId, permissions, sessionId } = params;
        const basePayload = {
            principal: 'user',
            sub: user.id,
            tenantId,
            branchId: user.branch_id,
            roleId,
            role: user.role,
            sessionId,
            email: user.email,
            permissions,
        };
        return this.signTokenPair({ ...basePayload, type: 'access' }, { ...basePayload, type: 'refresh' });
    }
    async issueSuperAdminTokens(superAdminId, email, sessionId) {
        const basePayload = { principal: 'super_admin', sub: superAdminId, email, sessionId };
        return this.signTokenPair({ ...basePayload, type: 'access' }, { ...basePayload, type: 'refresh' });
    }
    async signTokenPair(accessPayload, refreshPayload) {
        const accessExpiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN') ?? '15m';
        const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d';
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(accessPayload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: refreshExpiresIn,
            }),
        ]);
        return { access_token, refresh_token, expires_in: accessExpiresIn };
    }
    async handleFailedUserLogin(tx, userId, currentFailedCount) {
        const nextCount = currentFailedCount + 1;
        const shouldLock = nextCount >= MAX_FAILED_ATTEMPTS;
        await tx.user.update({
            where: { id: userId },
            data: {
                failed_login_count: shouldLock ? 0 : nextCount,
                last_failed_login_at: new Date(),
                locked_until: shouldLock
                    ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                    : undefined,
            },
        });
    }
    async enforceSessionLimit(userId, maxConcurrentSessions) {
        const activeSessions = await this.prisma.session.findMany({
            where: { user_id: userId, is_active: true, revoked_at: null },
            orderBy: { last_used_at: 'asc' },
        });
        if (activeSessions.length < maxConcurrentSessions) {
            return;
        }
        const excess = activeSessions.length - maxConcurrentSessions + 1;
        const toRevoke = activeSessions.slice(0, excess).map((s) => s.id);
        if (toRevoke.length === 0) {
            return;
        }
        await this.prisma.session.updateMany({
            where: { id: { in: toRevoke } },
            data: { is_active: false, revoked_at: new Date(), revoked_reason: 'SESSION_LIMIT_EXCEEDED' },
        });
    }
    async enforceSingleDeviceLogin(userId, policy) {
        const activeSessions = await this.prisma.session.findMany({
            where: { user_id: userId, is_active: true, revoked_at: null },
        });
        if (activeSessions.length === 0) {
            return;
        }
        if (policy === 'REJECT_NEW') {
            throw new common_1.ForbiddenException('This account is restricted to a single device. Log out of your other session first.');
        }
        await this.prisma.session.updateMany({
            where: { id: { in: activeSessions.map((s) => s.id) } },
            data: {
                is_active: false,
                revoked_at: new Date(),
                revoked_reason: 'SINGLE_DEVICE_LOGIN_NEW_SESSION',
            },
        });
    }
    async listSessions(userId) {
        const sessions = await this.prisma.session.findMany({
            where: { user_id: userId, is_active: true, revoked_at: null },
            orderBy: { last_used_at: 'desc' },
            select: {
                id: true,
                jti: true,
                device_name: true,
                browser: true,
                operating_system: true,
                ip_address: true,
                remember_me: true,
                last_used_at: true,
                expires_at: true,
                created_at: true,
            },
        });
        return { success: true, data: sessions };
    }
    async revokeSession(userId, sessionId) {
        const session = await this.prisma.session.findFirst({
            where: { id: sessionId, user_id: userId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found.');
        }
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { is_active: false, revoked_at: new Date(), revoked_reason: 'REVOKED_BY_USER' },
        });
        return { success: true, message: 'Session revoked.' };
    }
    async logoutAll(userId) {
        await this.prisma.session.updateMany({
            where: { user_id: userId, is_active: true },
            data: { is_active: false, revoked_at: new Date(), revoked_reason: 'LOGOUT_ALL' },
        });
        return { success: true, message: 'Logged out of all devices.' };
    }
    async recordLoginHistory(tx, params) {
        const { tenant_id, user_id, email, meta, success, failure_reason } = params;
        await tx.loginHistory.create({
            data: {
                tenant_id,
                user_id,
                email,
                ip_address: meta.ip_address,
                user_agent: meta.user_agent,
                browser: meta.browser,
                operating_system: meta.operating_system,
                device: meta.device_name,
                success,
                failure_reason,
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map