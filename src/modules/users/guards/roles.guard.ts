import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/current-user.interface';
import { isSuperAdminPrincipal } from '../../../common/utils/principal.util';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

/**
 * Requires request.user to be populated by the Auth module's
 * JwtAuthGuard, which must run before this guard in the guard chain.
 * Fails closed if absent. SuperAdmin bypasses role checks.
 * Routes marked @Public() are skipped so public widgets work under
 * controller-level @UseGuards(RolesGuard, ...).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
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

    const authorized = requiredRoles.includes(user.role);

    if (!authorized) {
      throw new ForbiddenException(
        `Requires one of the following roles: ${requiredRoles.join(', ')}.`,
      );
    }

    return true;
  }
}
