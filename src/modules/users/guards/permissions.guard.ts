import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedRequest } from '../interfaces/current-user.interface';
import { ALLOW_SUPER_ADMIN_KEY } from '../../../common/decorators/allow-super-admin.decorator';
import { isSuperAdminPrincipal } from '../../../common/utils/principal.util';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

/**
 * Requires ALL permissions declared via @RequirePermissions(...).
 * SuperAdmin is allowed only on @AllowSuperAdmin() routes. Routes marked
 * @Public() are skipped so public endpoints under a controller-level
 * PermissionsGuard work without a token.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const allowSuperAdmin = this.reflector.getAllAndOverride<boolean>(ALLOW_SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSuperAdminPrincipal(user) && allowSuperAdmin) {
      return true;
    }

    if (isSuperAdminPrincipal(user)) {
      throw new ForbiddenException(
        'Platform admin tokens cannot access tenant ERP APIs. Use /tenants for platform operations.',
      );
    }

    const grantedPermissions = new Set(user.permissions ?? []);

    const missing = requiredPermissions.filter(
      (permission) => !grantedPermissions.has(permission),
    );

    if (missing.length > 0) {
      throw new ForbiddenException(
        `Missing required permission(s): ${missing.join(', ')}.`,
      );
    }

    return true;
  }
}
