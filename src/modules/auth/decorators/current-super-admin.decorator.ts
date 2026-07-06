import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestWithUser, isSuperAdmin, CurrentSuperAdmin } from '../interfaces/request-with-user.interface';

export const CurrentSuperAdminUser = createParamDecorator(
  (field: keyof CurrentSuperAdmin | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const principal = request.user;

    if (!principal || !isSuperAdmin(principal)) {
      throw new ForbiddenException('Super admin authentication required.');
    }

    return field ? principal[field] : principal;
  },
);
