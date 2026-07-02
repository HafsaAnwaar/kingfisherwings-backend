// src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { TenantStatus, UserStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { LoginMeta } from './interfaces/login-meta.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // =====================================================
  // LOGIN
  // =====================================================

  async login(
    dto: LoginDto,
    meta: LoginMeta,
  ) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        slug: dto.tenant_slug,
        deleted_at: null,
      },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const activeTenantStatuses: TenantStatus[] = [
      TenantStatus.ACTIVE,
      TenantStatus.TRIAL,
    ];

    if (
      !tenant.is_active ||
      !activeTenantStatuses.includes(tenant.status)
    ) {
      throw new ForbiddenException('This account is not active.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        tenant_id: tenant.id,
        email: dto.email,
        deleted_at: null,
      },
    });

    if (!user) {
      await this.recordLoginHistory({
        tenant_id: tenant.id,
        user_id: null,
        email: dto.email,
        meta,
        success: false,
        failure_reason: 'USER_NOT_FOUND',
      });

      throw new UnauthorizedException('Invalid credentials.');
    }

    // -----------------------------
    // Lockout Check
    // -----------------------------

    if (user.locked_until && user.locked_until > new Date()) {
      throw new ForbiddenException(
        'Account is temporarily locked due to failed login attempts.',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        `Account is ${user.status.toLowerCase()}. Contact your administrator.`,
      );
    }

    // -----------------------------
    // Password Check
    // -----------------------------

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!passwordValid) {
      await this.handleFailedLogin(user.id, user.failed_login_count);

      await this.recordLoginHistory({
        tenant_id: tenant.id,
        user_id: user.id,
        email: dto.email,
        meta,
        success: false,
        failure_reason: 'INVALID_PASSWORD',
      });

      throw new UnauthorizedException('Invalid credentials.');
    }

    // -----------------------------
    // Enforce Concurrent Session Limit
    // -----------------------------

    await this.enforceSessionLimit(user.id, user.max_concurrent_sessions);

    // -----------------------------
    // Issue Tokens
    // -----------------------------

    const jti = randomUUID();

    const { access_token, refresh_token, expires_in } =
      await this.issueTokens({
        userId: user.id,
        tenantId: tenant.id,
        email: user.email,
        role: user.role,
        jti,
      });

    const refreshTokenHash = await bcrypt.hash(
      refresh_token,
      BCRYPT_SALT_ROUNDS,
    );

    const refreshExpiryDays = dto.remember_me ? 30 : 7;

    await this.prisma.$transaction([
      this.prisma.session.create({
        data: {
          tenant_id: tenant.id,
          user_id: user.id,
          jti,
          refresh_token_hash: refreshTokenHash,
          ip_address: meta.ip_address,
          user_agent: meta.user_agent,
          browser: meta.browser,
          operating_system: meta.operating_system,
          remember_me: dto.remember_me ?? false,
          expires_at: new Date(
            Date.now() + refreshExpiryDays * 24 * 60 * 60 * 1000,
          ),
        },
      }),

      this.prisma.user.update({
        where: {
          id: user.id,
        },
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

    await this.recordLoginHistory({
      tenant_id: tenant.id,
      user_id: user.id,
      email: dto.email,
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
        user: this.sanitizeUser(user),
      },
    };
  }

  // =====================================================
  // REFRESH TOKEN (rotation + reuse detection)
  // =====================================================

  async refresh(dto: RefreshTokenDto) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refresh_token,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type.');
    }

    const session = await this.prisma.session.findUnique({
      where: {
        jti: payload.jti,
      },
    });

    if (
      !session ||
      !session.is_active ||
      session.revoked_at ||
      session.expires_at < new Date()
    ) {
      throw new UnauthorizedException('Session is no longer valid.');
    }

    const tokenMatches = await bcrypt.compare(
      dto.refresh_token,
      session.refresh_token_hash,
    );

    if (!tokenMatches) {
      // Reuse of a rotated-out refresh token — treat as compromise.
      await this.prisma.session.updateMany({
        where: {
          user_id: session.user_id,
          is_active: true,
        },
        data: {
          is_active: false,
          revoked_at: new Date(),
          revoked_reason: 'REUSE_DETECTED',
        },
      });

      throw new UnauthorizedException(
        'Refresh token reuse detected. All sessions revoked.',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: session.user_id,
        deleted_at: null,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is no longer active.');
    }

    const newJti = randomUUID();

    const { access_token, refresh_token, expires_in } =
      await this.issueTokens({
        userId: user.id,
        tenantId: session.tenant_id,
        email: user.email,
        role: user.role,
        jti: newJti,
      });

    const newRefreshTokenHash = await bcrypt.hash(
      refresh_token,
      BCRYPT_SALT_ROUNDS,
    );

    await this.prisma.$transaction([
      this.prisma.session.update({
        where: {
          jti: payload.jti,
        },
        data: {
          is_active: false,
          revoked_at: new Date(),
          revoked_reason: 'ROTATED',
        },
      }),

      this.prisma.session.create({
        data: {
          tenant_id: session.tenant_id,
          user_id: user.id,
          jti: newJti,
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
      data: {
        access_token,
        refresh_token,
        expires_in,
      },
    };
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout(userId: string, jti: string) {
    await this.prisma.session.updateMany({
      where: {
        user_id: userId,
        jti,
        is_active: true,
      },
      data: {
        is_active: false,
        revoked_at: new Date(),
        revoked_reason: 'LOGOUT',
      },
    });

    return {
      success: true,
      message: 'Logged out successfully.',
    };
  }

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  async me(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return {
      success: true,
      data: this.sanitizeUser(user),
    };
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const currentValid = await bcrypt.compare(
      dto.current_password,
      user.password_hash,
    );

    if (!currentValid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    const newPasswordHash = await bcrypt.hash(
      dto.new_password,
      BCRYPT_SALT_ROUNDS,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password_hash: newPasswordHash,
          password_changed_at: new Date(),
          must_change_password: false,
        },
      }),

      this.prisma.passwordHistory.create({
        data: {
          tenant_id: user.tenant_id,
          user_id: user.id,
          password_hash: user.password_hash,
          changed_by: userId,
          reason: 'USER_INITIATED',
        },
      }),

      // Revoke all existing sessions on password change.
      this.prisma.session.updateMany({
        where: {
          user_id: userId,
          is_active: true,
        },
        data: {
          is_active: false,
          revoked_at: new Date(),
          revoked_reason: 'PASSWORD_CHANGED',
        },
      }),
    ]);

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  }

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private async issueTokens(params: {
    userId: string;
    tenantId: string;
    email: string;
    role: JwtPayload['role'];
    jti: string;
  }) {
    const { userId, tenantId, email, role, jti } = params;

    const accessPayload: JwtPayload = {
      sub: userId,
      tenant_id: tenantId,
      email,
      role,
      jti,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      ...accessPayload,
      type: 'refresh',
    };

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

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

    return {
      access_token,
      refresh_token,
      expires_in: accessExpiresIn,
    };
  }

  private async handleFailedLogin(
    userId: string,
    currentFailedCount: number,
  ) {
    const nextCount = currentFailedCount + 1;

    const shouldLock = nextCount >= MAX_FAILED_ATTEMPTS;

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        failed_login_count: shouldLock ? 0 : nextCount,
        last_failed_login_at: new Date(),
        locked_until: shouldLock
          ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
          : undefined,
      },
    });
  }

  private async enforceSessionLimit(
    userId: string,
    maxConcurrentSessions: number,
  ) {
    const activeSessions = await this.prisma.session.findMany({
      where: {
        user_id: userId,
        is_active: true,
        revoked_at: null,
      },
      orderBy: {
        last_used_at: 'asc',
      },
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
      where: {
        id: {
          in: toRevoke,
        },
      },
      data: {
        is_active: false,
        revoked_at: new Date(),
        revoked_reason: 'SESSION_LIMIT_EXCEEDED',
      },
    });
  }

  private async recordLoginHistory(params: {
    tenant_id: string;
    user_id: string | null;
    email: string;
    meta: LoginMeta;
    success: boolean;
    failure_reason?: string;
  }) {
    const { tenant_id, user_id, email, meta, success, failure_reason } =
      params;

    await this.prisma.loginHistory.create({
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

  private sanitizeUser(user: Record<string, any>) {
    const {
      password_hash,
      two_factor_secret,
      two_factor_backup_codes,
      invite_token,
      password_reset_token,
      refresh_token_hash,
      ...safe
    } = user;

    return safe;
  }
}