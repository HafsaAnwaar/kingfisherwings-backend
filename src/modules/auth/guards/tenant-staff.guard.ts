import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_SUPER_ADMIN_KEY } from '../../../common/decorators/allow-super-admin.decorator';
import { SKIP_STAFF_JWT_KEY } from '../../../common/decorators/skip-staff-jwt.decorator';
import { isSuperAdminPrincipal } from '../../../common/utils/principal.util';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Blocks SuperAdmin tokens from tenant ERP routes. Platform admins may
 * only reach handlers explicitly marked @AllowSuperAdmin() (e.g. /tenants,
 * session management, POST /users with tenant_id).
 */
@Injectable()
export class TenantStaffGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const skipStaffJwt = this.reflector.getAllAndOverride<boolean>(SKIP_STAFF_JWT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipStaffJwt) {
      return true;
    }

    const allowSuperAdmin = this.reflector.getAllAndOverride<boolean>(ALLOW_SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<{ user?: unknown }>();
    const principal = request.user;

    if (!principal || !isSuperAdminPrincipal(principal)) {
      return true;
    }

    if (allowSuperAdmin) {
      return true;
    }

    throw new ForbiddenException(
      'Platform admin tokens cannot access tenant ERP APIs. Use /tenants for platform operations.',
    );
  }
}
