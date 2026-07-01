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

/**
 * Requires ALL permissions declared via @RequirePermissions(...) to be
 * present in request.user.permissions. Requires request.user to be
 * populated by the Auth module's JwtAuthGuard, which must run first in
 * the guard chain. Fails closed if absent.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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
