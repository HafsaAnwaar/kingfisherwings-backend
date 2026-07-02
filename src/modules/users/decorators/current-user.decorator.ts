import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, CurrentUser as CurrentUserType } from '../interfaces/current-user.interface';

/**
 * Extracts `request.user` (populated by the Auth module's JwtAuthGuard).
 * Usage: `@CurrentUser() user: CurrentUserType` or
 * `@CurrentUser('tenantId') tenantId: string` for a single field.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof CurrentUserType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    return field ? user?.[field] : user;
  },
);
