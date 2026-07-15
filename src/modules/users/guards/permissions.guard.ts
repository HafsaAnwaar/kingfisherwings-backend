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
import { isSuperAdminPrincipal } from '../../../common/utils/principal.util';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

/**
 * Requires ALL permissions declared via @RequirePermissions(...).
 * SuperAdmin bypasses. Routes marked @Public() are skipped so public
 * endpoints under a controller-level PermissionsGuard work without a token.
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

    if (isSuperAdminPrincipal(user)) {
      return true;
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
