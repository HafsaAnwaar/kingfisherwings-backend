import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID, randomBytes } from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

import { Prisma, TenantStatus, UserStatus, User, Tenant } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { TwoFactorCrypto } from '../../common/utils/two-factor-crypto.util';
import { EmailService } from '../../shared/email/email.service';

import { UsersService } from '../users/users.service';
import { UserMapper } from '../users/mappers/user.mapper';
import { UsersHelper } from '../users/helpers/users.helper';
import { PasswordHelper } from '../users/helpers/password.helper';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { TenantChangePasswordDto } from './dto/tenant-change-password.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import {
  AcceptInviteDto,
  DisableTwoFactorDto,
  InviteUserDto,
  TotpVerifyDto,
} from './dto/invite-2fa.dto';
import { LoginDto } from './dto/login.dto';
import { TenantLoginDto } from './dto/tenant-login.dto';
import { SuperAdminSignupDto } from './dto/super-admin-signup.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { LoginMeta } from './interfaces/login-meta.interface';
import { JwtPayload, UserJwtPayload, SuperAdminJwtPayload } from './interfaces/jwt-payload.interface';
import { RequestPrincipal, isSuperAdmin } from './interfaces/request-with-user.interface';
import { SessionCacheService } from './session-cache.service';
import { generateInviteToken, hashInviteToken } from '../../common/utils/invite-token.util';

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
    private readonly emailService: EmailService,
    private readonly sessionCache: SessionCacheService,
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

      if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.INVITED) {
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

      this.assertLoginRestrictions(user, meta);
      await this.assertTwoFactorIfRequired(tx, user, dto);

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

    return this.prisma.runWithTenant(tenant.id, async (tx) => {
      const owner = await tx.user.findFirst({
        where: {
          tenant_id: tenant.id,
          role: 'TENANT_ADMIN',
          deleted_at: null,
        },
        orderBy: { created_at: 'asc' },
      });

      if (owner?.locked_until && owner.locked_until > new Date()) {
        throw new ForbiddenException('Account is temporarily locked due to failed login attempts.');
      }

      const passwordValid = await PasswordUtil.verify(tenant.password_hash, dto.password);

      if (!passwordValid) {
        if (owner) {
          await this.handleFailedUserLogin(tx, owner.id, owner.failed_login_count);
        }

        await this.recordLoginHistory(tx, {
          tenant_id: tenant.id,
          user_id: owner?.id ?? null,
          email: tenant.email ?? tenant.slug,
          meta,
          success: false,
          failure_reason: 'INVALID_TENANT_PASSWORD',
        });

        throw new UnauthorizedException('Invalid credentials.');
      }

      if (!owner) {
        throw new NotFoundException(
          'This tenant has no admin user provisioned. Contact platform support.',
        );
      }

      if (owner.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException(`Tenant admin account is ${owner.status.toLowerCase()}.`);
      }

      this.assertLoginRestrictions(owner, meta);
      await this.assertTwoFactorIfRequired(tx, owner, dto);

      return this.completeUserLogin(tx, tenant, owner, dto, meta);
    });
  }

  // =====================================================
  // SUPER ADMIN LOGIN
  // =====================================================

  // =====================================================
  // SUPER ADMIN SIGNUP
  // =====================================================
  // SUPER ADMIN SIGNUP
  //
  // Self-registration for platform owners. Keep this endpoint off
  // public UIs/docs; callers who know the path can still bootstrap.
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

    const tenantForRefresh = await this.prisma.tenant.findUnique({ where: { id: session.tenant_id } });

    if (!tenantForRefresh) {
      throw new UnauthorizedException('Account is no longer active.');
    }

    this.assertTenantActive(tenantForRefresh);

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
      await this.sessionCache.invalidateSuperAdminSession(principal.sessionId);
    } else {
      await this.prisma.session.updateMany({
        where: { user_id: principal.id, jti: principal.sessionId, is_active: true },
        data: { is_active: false, revoked_at: new Date(), revoked_reason: 'LOGOUT' },
      });
      await this.sessionCache.invalidateStaffSession(principal.sessionId);
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

  /**
   * Signed-in user updates optional preferred country / phone / locale.
   * Organization country for the whole tenant is PATCH /organization (tenant admin)
   * or PATCH /tenants/:id (SuperAdmin) — also optional.
   */
  async updateMyProfile(principal: RequestPrincipal, dto: UpdateMyProfileDto) {
    if (isSuperAdmin(principal)) {
      throw new BadRequestException(
        'SuperAdmin has no preferred country on the platform account. Set country on each tenant via PATCH /tenants/:id (optional).',
      );
    }

    const updated = await this.usersService.updateUser(
      principal.tenantId,
      principal.id,
      {
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.avatar_url !== undefined ? { avatar_url: dto.avatar_url } : {}),
        ...(dto.preferred_country_code !== undefined
          ? { preferred_country_code: dto.preferred_country_code }
          : {}),
      },
      principal.id,
    );

    if (dto.locale !== undefined) {
      await this.prisma.runWithTenant(principal.tenantId, (tx) =>
        tx.user.update({
          where: { id: principal.id },
          data: { locale: dto.locale },
        }),
      );
    }

    return { success: true, message: 'Profile updated.', data: updated };
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
  // CHANGE TENANT PASSWORD
  //
  // Changes Tenant.password_hash (the POST /auth/tenant-login
  // credential) — a different field from the acting user's own
  // password. Restricted to TENANT_ADMIN by the controller's
  // @Roles(UserRole.TENANT_ADMIN) guard, since this credential grants
  // owner-level access to the whole tenant.
  // =====================================================

  async changeTenantPassword(tenantId: string, dto: TenantChangePasswordDto) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    const currentValid = await PasswordUtil.verify(tenant.password_hash, dto.current_password);

    if (!currentValid) {
      throw new UnauthorizedException('Current tenant password is incorrect.');
    }

    const newPasswordHash = await PasswordUtil.hash(dto.new_password);

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { password_hash: newPasswordHash },
    });

    return {
      success: true,
      message: 'Tenant password changed successfully.',
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
    if (user.single_device_login) {
      await this.enforceSingleDeviceLogin(user.id, user.single_device_policy);
    } else {
      await this.enforceSessionLimit(user.id, user.max_concurrent_sessions);
    }

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
          // A successful login is exactly the "first use" a temporary
          // password exists for — INVITED means "hasn't logged in yet",
          // not "should never be able to."
          status: UserStatus.ACTIVE,
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
        // The frontend should redirect straight to a change-password
        // screen when this is true, before letting the user do
        // anything else — the token IS fully valid either way (see
        // note on scope in AuthService docs), this is a UX signal, not
        // an access restriction enforced server-side yet.
        must_change_password: user.must_change_password,
        user: UserMapper.toResponse({ ...user, status: UserStatus.ACTIVE }),
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

  /**
   * Premium Single Device Login (Auth spec Phase 7): when enabled on a
   * user, a new login while any session is already active either
   * rejects the new login outright (REJECT_NEW) or silently terminates
   * the existing session(s) and lets the new one through
   * (TERMINATE_OLDEST — "oldest" is moot with a single-device cap, but
   * named to match the general enforceSessionLimit policy).
   */
  private async enforceSingleDeviceLogin(
    userId: string,
    policy: 'TERMINATE_OLDEST' | 'REJECT_NEW',
  ): Promise<void> {
    const activeSessions = await this.prisma.session.findMany({
      where: { user_id: userId, is_active: true, revoked_at: null },
    });

    if (activeSessions.length === 0) {
      return;
    }

    if (policy === 'REJECT_NEW') {
      throw new ForbiddenException(
        'This account is restricted to a single device. Log out of your other session first.',
      );
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

  // ============================================================
  // SESSION MANAGEMENT (Auth spec Phase 7)
  // ============================================================

  /** Lists the calling user's own active sessions. Sessions carry no RLS (see migration note) — scoped here by user_id at the application layer. */
  async listSessions(userId: string) {
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

  /** Revokes one of the calling user's own sessions by Session.id (not jti — the id is what's shown in listSessions, jti is the bearer secret). */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { is_active: false, revoked_at: new Date(), revoked_reason: 'REVOKED_BY_USER' },
    });

    return { success: true, message: 'Session revoked.' };
  }

  /** Logs out every device — revokes all of the calling user's active sessions, including the one making this request. */
  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: { user_id: userId, is_active: true },
      data: { is_active: false, revoked_at: new Date(), revoked_reason: 'LOGOUT_ALL' },
    });

    return { success: true, message: 'Logged out of all devices.' };
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

  // =====================================================
  // LOGIN RESTRICTIONS + 2FA + INVITES (Week 1)
  // =====================================================

  private assertLoginRestrictions(user: User, meta: LoginMeta) {
    if (!UsersHelper.isWithinOfficeHours(user)) {
      throw new ForbiddenException('Login is only allowed during configured office hours.');
    }
    if (!UsersHelper.isIpAllowed(user, meta.ip_address)) {
      throw new ForbiddenException('Your IP address is not allowed for this account.');
    }
    if (!UsersHelper.isMacAllowed(user, meta.mac_address)) {
      throw new ForbiddenException('Your device MAC address is not allowed for this account.');
    }
  }

  private twoFactorEncryptionKey(): string {
    const key = this.configService.get<string>('TWO_FACTOR_ENCRYPTION_KEY');
    if (!key) {
      throw new Error('TWO_FACTOR_ENCRYPTION_KEY must be configured.');
    }
    return key;
  }

  /** Backup codes are stored hashed (argon2); find the matching entry by verifying each. */
  private async findBackupCodeIndex(hashedCodes: string[], candidate: string): Promise<number> {
    for (let i = 0; i < hashedCodes.length; i++) {
      try {
        if (await PasswordUtil.verify(hashedCodes[i], candidate)) {
          return i;
        }
      } catch {
        // Not an argon2 hash (e.g. a pre-encryption-fix legacy value) — no match.
      }
    }
    return -1;
  }

  /** Returns null instead of throwing on a legacy/corrupt (pre-encryption) stored value. */
  private safeDecryptTwoFactorSecret(encrypted: string): string | null {
    try {
      return TwoFactorCrypto.decrypt(encrypted, this.twoFactorEncryptionKey());
    } catch {
      return null;
    }
  }

  private async assertTwoFactorIfRequired(
    tx: Prisma.TransactionClient,
    user: User,
    dto: { totp_code?: string; backup_code?: string },
  ) {
    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return;
    }

    if (dto.totp_code) {
      const secret = this.safeDecryptTwoFactorSecret(user.two_factor_secret);
      const ok = secret
        ? speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: dto.totp_code,
            window: 1,
          })
        : false;
      if (!ok) {
        throw new UnauthorizedException('Invalid two-factor authentication code.');
      }
      return;
    }

    if (dto.backup_code) {
      const codes = user.two_factor_backup_codes ?? [];
      const idx = await this.findBackupCodeIndex(codes, dto.backup_code);
      if (idx < 0) {
        throw new UnauthorizedException('Invalid backup code.');
      }
      const remaining = codes.filter((_, i) => i !== idx);
      await tx.user.update({
        where: { id: user.id },
        data: { two_factor_backup_codes: remaining },
      });
      return;
    }

    throw new UnauthorizedException({
      message: 'Two-factor authentication required.',
      code: 'REQUIRES_2FA',
    });
  }

  async inviteUser(tenantId: string, actorId: string, dto: InviteUserDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: dto.user_id, tenant_id: tenantId, deleted_at: null },
      });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const { token, hash } = generateInviteToken();
      const expiresAt = PasswordHelper.inviteTokenExpiry();
      await tx.user.update({
        where: { id: user.id },
        data: {
          invite_token: hash,
          invite_expires_at: expiresAt,
          status: UserStatus.INVITED,
          updated_by: actorId,
        },
      });


      const to = dto.email ?? user.email;
      const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
      await this.emailService.send({
        tenantId,
        eventType: 'USER_INVITE',
        to,
        subject: 'You are invited to FreightSaas',
        body: `You have been invited. Open ${appUrl}/accept-invite?token=${token} and set your password. This link expires at ${expiresAt.toISOString()}.`,
        createdBy: actorId,
      });

      return {
        success: true,
        message: 'Invite sent.',
        data: { user_id: user.id, email: to, expires_at: expiresAt },
      };
    });
  }

  async acceptInvite(dto: AcceptInviteDto) {
    PasswordHelper.assertStrength(dto.password);

    const user = await this.prisma.user.findFirst({
      where: { invite_token: hashInviteToken(dto.token), deleted_at: null },
    });
    if (!user || !user.invite_expires_at || user.invite_expires_at < new Date()) {
      throw new BadRequestException('Invite token is invalid or expired.');
    }

    const passwordHash = await PasswordUtil.hash(dto.password);

    const updated = await this.prisma.runWithTenant(user.tenant_id, (tx) =>
      tx.user.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          password_changed_at: new Date(),
          password_expires_at: PasswordHelper.calculateExpiryDate(),
          must_change_password: false,
          status: UserStatus.ACTIVE,
          invite_token: null,
          invite_expires_at: null,
          email_verified: true,
          first_name: dto.first_name ?? user.first_name,
          last_name: dto.last_name ?? user.last_name,
        },
      }),
    );

    return {
      success: true,
      message: 'Invite accepted. You can now log in.',
      data: UserMapper.toResponse(updated),
    };
  }

  async setupTwoFactor(tenantId: string, userId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId, tenant_id: tenantId, deleted_at: null } });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const secret = speakeasy.generateSecret({
        name: `FreightSaas (${user.email})`,
        length: 20,
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          two_factor_secret: TwoFactorCrypto.encrypt(secret.base32, this.twoFactorEncryptionKey()),
        },
      });

      const otpauth = secret.otpauth_url ?? '';
      const qr_data_url = await QRCode.toDataURL(otpauth);

      return {
        success: true,
        data: {
          secret: secret.base32,
          otpauth_url: otpauth,
          qr_data_url,
          message: 'Scan the QR code, then POST /auth/2fa/enable with a TOTP code to activate.',
        },
      };
    });
  }

  async enableTwoFactor(tenantId: string, userId: string, dto: TotpVerifyDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId, tenant_id: tenantId, deleted_at: null } });
      if (!user?.two_factor_secret) {
        throw new BadRequestException('Call POST /auth/2fa/setup first.');
      }

      const secret = this.safeDecryptTwoFactorSecret(user.two_factor_secret);
      const ok = secret
        ? speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: dto.code,
            window: 1,
          })
        : false;
      if (!ok) {
        throw new BadRequestException('Invalid TOTP code.');
      }

      const backupCodes = PasswordHelper.generateBackupCodes();
      const hashedBackupCodes = await Promise.all(backupCodes.map((code) => PasswordUtil.hash(code)));
      await tx.user.update({
        where: { id: userId },
        data: { two_factor_enabled: true, two_factor_backup_codes: hashedBackupCodes },
      });

      return {
        success: true,
        message: 'Two-factor authentication enabled.',
        data: { backup_codes: backupCodes },
      };
    });
  }

  async disableTwoFactor(tenantId: string, userId: string, dto: DisableTwoFactorDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId, tenant_id: tenantId, deleted_at: null } });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const passwordValid = await PasswordUtil.verify(user.password_hash, dto.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid password.');
      }

      if (user.two_factor_enabled) {
        if (!dto.code) {
          throw new UnauthorizedException('Two-factor code required to disable 2FA.');
        }
        const decryptedSecret = user.two_factor_secret
          ? this.safeDecryptTwoFactorSecret(user.two_factor_secret)
          : null;
        const totpOk = decryptedSecret
          ? speakeasy.totp.verify({
              secret: decryptedSecret,
              encoding: 'base32',
              token: dto.code,
              window: 1,
            })
          : false;
        if (!totpOk) {
          const codes = user.two_factor_backup_codes ?? [];
          const idx = await this.findBackupCodeIndex(codes, dto.code);
          if (idx < 0) {
            throw new UnauthorizedException('Invalid two-factor or backup code.');
          }
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          two_factor_enabled: false,
          two_factor_secret: null,
          two_factor_backup_codes: [],
        },
      });

      return { success: true, message: 'Two-factor authentication disabled.' };
    });
  }
}
