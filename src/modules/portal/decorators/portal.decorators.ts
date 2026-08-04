import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentPortalUser } from '../interfaces/portal-auth.interfaces';

export const IS_PORTAL_ROUTE_KEY = 'isPortalRoute';

/** Marks a handler/controller as a portal route (used with PortalAuthGuard). */
export const PortalRoute = () => SetMetadata(IS_PORTAL_ROUTE_KEY, true);

export const CurrentPortalUserDecorator = createParamDecorator(
  (field: keyof CurrentPortalUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ portalUser?: CurrentPortalUser }>();
    const user = request.portalUser;
    return field ? user?.[field] : user;
  },
);

/** Alias matching staff @CurrentUser naming for portal controllers. */
export const CurrentPortal = CurrentPortalUserDecorator;
