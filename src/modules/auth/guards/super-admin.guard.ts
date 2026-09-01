import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import {
  RequestWithUser,
  isSuperAdmin,
} from "../interfaces/request-with-user.interface";

/**
 * Requires request.user to be a SuperAdmin (set by JwtStrategy for a
 * super_admin-typed token). Runs after the global JwtAuthGuard, which
 * already rejects unauthenticated requests — this guard rejects
 * *authenticated-but-wrong-principal* requests (e.g. a regular tenant
 * user's token hitting a platform-admin-only route).
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const principal = request.user;

    if (!principal) {
      throw new UnauthorizedException("Authentication required.");
    }

    if (!isSuperAdmin(principal)) {
      throw new ForbiddenException(
        "This action requires a platform super admin account.",
      );
    }

    return true;
  }
}
