import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { Prisma, TenantStatus, UserStatus, User, Tenant } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';

import { UsersService } from '../users/users.service';
import { UserMapper } from '../users/mappers/user.mapper';
import { ChangePasswordDto } from '../users/dto/change-password.dto';

import { LoginDto } from './dto/login.dto';
import { TenantLoginDto } from './dto/tenant-login.dto';
import { SuperAdminSignupDto } from './dto/super-admin-signup.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { LoginMeta } from './interfaces/login-meta.interface';
import { JwtPayload, UserJwtPayload, SuperAdminJwtPayload } from './interfaces/jwt-payload.interface';
import { RequestPrincipal, isSuperAdmin } from './interfaces/request-with-user.interface';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const OWNER_ROLE_CODE = 'TENANT_ADMIN';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  // =====================================================
  // USER LOGIN (tenant_slug + email + password)
  // =====================================================

  async login(dto: LoginDto, meta: LoginMeta) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: dto.tenant_slug, deleted_at: null },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials.');
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

        throw new UnauthorizedException('Invalid credentials.');
      }

      if (user.locked_until && user.locked_until > new Date()) {
        throw new ForbiddenException('Account is temporarily locked due to failed login attempts.');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException(`Account is ${user.status.toLowerCase()}. Contact your administrator.`);
      }

      const passwordValid = await PasswordUtil.verify(user.password_hash, dto.password);

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

        throw new UnauthorizedException('Invalid credentials.');
      }

      return this.completeUserLogin(tx, tenant, user, dto, meta);
    });
  }

  // =====================================================
  // TENANT LOGIN (tenant_slug + the tenant's own password)
  //
  // Authenticates against Tenant.password_hash directly, then issues a
  // token for that tenant's auto-provisioned TENANT_ADMIN owner user —
  // reusing the exact same session/JWT/RBAC machinery as a regular user
  // login, so every existing guard and endpoint works unchanged. The
  // owner user's own password_hash is never checked for this flow.
  // =====================================================

  async tenantLogin(dto: TenantLoginDto, meta: LoginMeta) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: dto.tenant_slug, deleted_at: null },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    this.assertTenantActive(tenant);

    const passwordValid = await PasswordUtil.verify(tenant.password_hash, dto.password);

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

        throw new UnauthorizedException('Invalid credentials.');
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
        // Should never happen — TenantsService.create() always provisions
        // the owner user atomically with the tenant.
        throw new NotFoundException(
          'This tenant has no admin user provisioned. Contact platform support.',
        );
      }

      if (owner.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException(`Tenant admin account is ${owner.status.toLowerCase()}.`);
      }

      return this.completeUserLogin(tx, tenant, owner, dto, meta);
    });
  }

  // =====================================================
  // SUPER ADMIN LOGIN
  // =====================================================

  // =====================================================
  // SUPER ADMIN SIGNUP
  //
  // Public self-registration for the platform owner. Unlike Tenant and
  // User creation (which always require an existing higher-privileged
  // actor), SuperAdmin is the root of the trust chain, so it has to be
  // able to bootstrap itself. Auto-logs in on success, same as signup
  // flows typically do, so the caller doesn't need a second round trip.
  // =====================================================

  async superAdminSignup(dto: SuperAdminSignupDto, meta: LoginMeta) {
    const existing = await this.prisma.superAdmin.findFirst({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ForbiddenException('An account with this email already exists.');
    }

    const passwordHash = await PasswordUtil.hash(dto.password);

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

  async superAdminLogin(dto: SuperAdminLoginDto, meta: LoginMeta) {
    const superAdmin = await this.prisma.superAdmin.findFirst({
      where: { email: dto.email.toLowerCase(), deleted_at: null },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (superAdmin.locked_until && superAdmin.locked_until > new Date()) {
      throw new ForbiddenException('Account is temporarily locked due to failed login attempts.');
    }

    if (!superAdmin.is_active) {
      throw new ForbiddenException('Account is inactive.');
    }

    const passwordValid = await PasswordUtil.verify(superAdmin.password_hash, dto.password);

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

      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.completeSuperAdminLogin(superAdmin, meta);
  }

  private async completeSuperAdminLogin(
    superAdmin: { id: string; email: string; first_name: string; last_name: string },
    meta: LoginMeta,
  ) {
    const sessionId = randomUUID();

    const { access_token, refresh_token, expires_in } = await this.issueSuperAdminTokens(
      superAdmin.id,
      superAdmin.email,
      sessionId,
    );

    const refreshTokenHash = await PasswordUtil.hash(refresh_token);

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

  // =====================================================
  // REFRESH (handles user, tenant-owner, and super-admin tokens alike)
  // =====================================================

  async refresh(dto: RefreshTokenDto) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type.');
    }

    if (payload.principal === 'super_admin') {
      return this.refreshSuperAdmin(payload, dto.refresh_token);
    }

    return this.refreshUser(payload, dto.refresh_token);
  }

  private async refreshUser(payload: UserJwtPayload, presentedToken: string) {
    const session = await this.prisma.session.findUnique({ where: { jti: payload.sessionId } });

    if (!session || !session.is_active || session.revoked_at || session.expires_at < new Date()) {
      throw new UnauthorizedException('Session is no longer valid.');
    }

    const tokenMatches = await PasswordUtil.verify(session.refresh_token_hash, presentedToken);

    if (!tokenMatches) {
      await this.prisma.session.updateMany({
        where: { user_id: session.user_id, is_active: true },
        data: { is_active: false, revoked_at: new Date(), revoked_reason: 'REUSE_DETECTED' },
      });

      throw new UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
    }

    const user = await this.prisma.runWithTenant(session.tenant_id, (tx) =>
      tx.user.findFirst({ where: { id: session.user_id, deleted_at: null } }),
    );

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is no longer active.');
    }

    const { roleId, permissions } = await this.resolveRbac(session.tenant_id, user.id);
    const newSessionId = randomUUID();

    const { access_token, refresh_token, expires_in } = await this.issueUserTokens({
      user,
      tenantId: session.tenant_id,
      roleId,
      permissions,
      sessionId: newSessionId,
    });

    const newRefreshTokenHash = await PasswordUtil.hash(refresh_token);

    // Sessions are excluded from RLS (see migration note), so these run
    // directly on the base client — no tenant context needed here.
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

  private async refreshSuperAdmin(payload: SuperAdminJwtPayload, presentedToken: string) {
    const session = await this.prisma.superAdminSession.findUnique({
      where: { jti: payload.sessionId },
    });

    if (!session || !session.is_active || session.revoked_at || session.expires_at < new Date()) {
      throw new UnauthorizedException('Session is no longer valid.');
    }

    const tokenMatches = await PasswordUtil.verify(session.refresh_token_hash, presentedToken);

    if (!tokenMatches) {
      await this.prisma.superAdminSession.updateMany({
        where: { super_admin_id: session.super_admin_id, is_active: true },
        data: { is_active: false, revoked_at: new Date(), revoked_reason: 'REUSE_DETECTED' },
      });

      throw new UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
    }

    const superAdmin = await this.prisma.superAdmin.findFirst({
      where: { id: session.super_admin_id, deleted_at: null, is_active: true },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Account is no longer active.');
    }

    const newSessionId = randomUUID();

    const { access_token, refresh_token, expires_in } = await this.issueSuperAdminTokens(
      superAdmin.id,
      superAdmin.email,
      newSessionId,
    );

    const newRefreshTokenHash = await PasswordUtil.hash(refresh_token);

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

  // =====================================================
  // LOGOUT (unified — branches on principal type)
  // =====================================================

  async logout(principal: RequestPrincipal) {
    if (isSuperAdmin(principal)) {
      await this.prisma.superAdminSession.updateMany({
        where: { super_admin_id: principal.id, jti: principal.sessionId, is_active: true },
        data: { is_active: false, revoked_at: new Date(), revoked_reason: 'LOGOUT' },
      });
    } else {
      await this.prisma.session.updateMany({
        where: { user_id: principal.id, jti: principal.sessionId, is_active: true },
        data: { is_active: false, revoked_at: new Date(), revoked_reason: 'LOGOUT' },
      });
    }

    return { success: true, message: 'Logged out successfully.' };
  }

  // =====================================================
  // GET CURRENT PRINCIPAL (unified)
  // =====================================================

  async me(principal: RequestPrincipal) {
    if (isSuperAdmin(principal)) {
      const superAdmin = await this.prisma.superAdmin.findFirst({
        where: { id: principal.id, deleted_at: null },
      });

      if (!superAdmin) {
        throw new UnauthorizedException('Account not found.');
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

  // =====================================================
  // CHANGE PASSWORD (regular users only, for now)
  // =====================================================

  async changePassword(tenantId: string, userId: string, dto: ChangePasswordDto) {
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

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private assertTenantActive(tenant: Tenant): void {
    const activeTenantStatuses: TenantStatus[] = [TenantStatus.ACTIVE, TenantStatus.TRIAL];

    if (!tenant.is_active || !activeTenantStatuses.includes(tenant.status)) {
      throw new ForbiddenException('This account is not active.');
    }
  }

  /**
   * Shared tail end of login() and tenantLogin() once credentials are
   * verified: session-limit enforcement, RBAC resolution, token
   * issuance, session persistence, and login history.
   */
  private async completeUserLogin(
    tx: Prisma.TransactionClient,
    tenant: Tenant,
    user: User,
    dto: { remember_me?: boolean; device_name?: string },
    meta: LoginMeta,
  ) {
    await this.enforceSessionLimit(user.id, user.max_concurrent_sessions);

    const { roleId, permissions } = await this.resolveRbac(tenant.id, user.id, tx);
    const sessionId = randomUUID();

    const { access_token, refresh_token, expires_in } = await this.issueUserTokens({
      user,
      tenantId: tenant.id,
      roleId,
      permissions,
      sessionId,
    });

    const refreshTokenHash = await PasswordUtil.hash(refresh_token);
    const refreshExpiryDays = dto.remember_me ? 30 : 7;

    // Sessions are excluded from RLS (see migration note) — safe on the
    // base client. `users` is RLS-protected, so that update goes
    // through `tx`, which already has app.tenant_id set for this tenant.
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
        user: UserMapper.toResponse(user),
      },
    };
  }

  /**
   * Resolves the effective RBAC claims to embed in the token: the
   * user's primary role assignment (first UserRoleAssignment found)
   * and the union of permissions granted via any assigned role plus
   * direct UserPermission grants.
   */
  private async resolveRbac(
    tenantId: string,
    userId: string,
    existingTx?: Prisma.TransactionClient,
  ): Promise<{ roleId: string | null; permissions: string[] }> {
    const run = existingTx
      ? (fn: (tx: Prisma.TransactionClient) => Promise<{ roleId: string | null; permissions: string[] }>) =>
          fn(existingTx)
      : (fn: (tx: Prisma.TransactionClient) => Promise<{ roleId: string | null; permissions: string[] }>) =>
          this.prisma.runWithTenant(tenantId, fn);

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

      const activeAssignments = roleAssignments.filter(
        (assignment) => assignment.role.is_active && !assignment.role.deleted_at,
      );

      const codes = new Set<string>();

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

  private async issueUserTokens(params: {
    user: User;
    tenantId: string;
    roleId: string | null;
    permissions: string[];
    sessionId: string;
  }) {
    const { user, tenantId, roleId, permissions, sessionId } = params;

    const basePayload = {
      principal: 'user' as const,
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

  private async issueSuperAdminTokens(superAdminId: string, email: string, sessionId: string) {
    const basePayload = { principal: 'super_admin' as const, sub: superAdminId, email, sessionId };

    return this.signTokenPair({ ...basePayload, type: 'access' }, { ...basePayload, type: 'refresh' });
  }

  private async signTokenPair(accessPayload: JwtPayload, refreshPayload: JwtPayload) {
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { access_token, refresh_token, expires_in: accessExpiresIn };
  }

  private async handleFailedUserLogin(
    tx: Prisma.TransactionClient,
    userId: string,
    currentFailedCount: number,
  ) {
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

  private async enforceSessionLimit(userId: string, maxConcurrentSessions: number) {
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

  private async recordLoginHistory(
    tx: Prisma.TransactionClient,
    params: {
      tenant_id: string;
      user_id: string | null;
      email: string;
      meta: LoginMeta;
      success: boolean;
      failure_reason?: string;
    },
  ) {
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
}
