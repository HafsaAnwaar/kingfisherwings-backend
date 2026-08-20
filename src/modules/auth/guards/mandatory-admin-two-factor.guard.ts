import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ALLOW_SUPER_ADMIN_KEY } from '../../../common/decorators/allow-super-admin.decorator';
import { SKIP_STAFF_JWT_KEY } from '../../../common/decorators/skip-staff-jwt.decorator';
import { isSuperAdminPrincipal } from '../../../common/utils/principal.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { isSuperAdmin, RequestPrincipal } from '../interfaces/request-with-user.interface';
import { AUTH_2FA_LINKED } from '../constants/auth-2fa.constants';

const TWO_FA_SETUP_PATHS = ['/auth/2fa/setup', '/auth/2fa/enable', '/auth/super-admin/2fa/setup', '/auth/super-admin/2fa/enable'];

/**
 * Unlinked until product completion (`AUTH_2FA_LINKED`). When linked and
 * ADMIN_2FA_REQUIRED is true, tenant admins and super admins must
 * enable 2FA before using ERP routes (setup endpoints remain reachable).
 */
@Injectable()
export class MandatoryAdminTwoFactorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sessionCache: SessionCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!AUTH_2FA_LINKED || !this.isAdminTwoFactorRequired()) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const skipStaffJwt = this.reflector.getAllAndOverride<boolean>(SKIP_STAFF_JWT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipStaffJwt) return true;

    const request = context.switchToHttp().getRequest<{ user?: unknown; route?: { path?: string }; url?: string }>();
    const path = request.route?.path ?? request.url ?? '';
    if (TWO_FA_SETUP_PATHS.some((p) => path.includes(p))) {
      return true;
    }
    if (path.includes('/auth/me') || path.includes('/auth/logout')) {
      return true;
    }

    const principal = request.user as RequestPrincipal | undefined;
    if (!principal) return true;

    if (isSuperAdminPrincipal(principal) && isSuperAdmin(principal)) {
      const superAdmin = principal;
      const cached = await this.sessionCache.getSuperAdminSession(superAdmin.sessionId);
      if (cached?.twoFactorEnabled) return true;

      const row = await this.prisma.superAdmin.findFirst({
        where: { id: superAdmin.id, deleted_at: null },
        select: { two_factor_enabled: true },
      });
      if (row?.two_factor_enabled) {
        await this.sessionCache.setSuperAdminSession(superAdmin.sessionId, {
          superAdminId: superAdmin.id,
          twoFactorEnabled: true,
        });
        return true;
      }

      const allowSuperAdmin = this.reflector.getAllAndOverride<boolean>(ALLOW_SUPER_ADMIN_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (allowSuperAdmin && path.includes('/tenants')) {
        throw new ForbiddenException({
          message: 'Enable two-factor authentication before using platform admin APIs.',
          code: 'REQUIRES_2FA_SETUP',
        });
      }
      throw new ForbiddenException({
        message: 'Enable two-factor authentication before using platform admin APIs.',
        code: 'REQUIRES_2FA_SETUP',
      });
    }

    const staff = principal as { id: string; tenantId: string; role: string; sessionId: string };
    if (staff.role !== UserRole.TENANT_ADMIN) {
      return true;
    }

    const cached = await this.sessionCache.getStaffSession(staff.sessionId);
    if (cached?.twoFactorEnabled) return true;

    const user = await this.prisma.user.findFirst({
      where: { id: staff.id, tenant_id: staff.tenantId, deleted_at: null },
      select: { two_factor_enabled: true, role: true },
    });
    if (user?.two_factor_enabled) {
      await this.sessionCache.setStaffSession(staff.sessionId, {
        userId: staff.id,
        tenantId: staff.tenantId,
        role: staff.role,
        twoFactorEnabled: true,
      });
      return true;
    }

    throw new ForbiddenException({
      message: 'Tenant administrators must enable two-factor authentication before using the ERP.',
      code: 'REQUIRES_2FA_SETUP',
    });
  }

  private isAdminTwoFactorRequired(): boolean {
    const flag = this.config.get<string>('ADMIN_2FA_REQUIRED');
    if (flag === 'true') return true;
    if (flag === 'false') return false;
    return (this.config.get<string>('NODE_ENV') ?? 'development') === 'production';
  }
}
