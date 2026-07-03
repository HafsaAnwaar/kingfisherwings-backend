import { Request } from 'express';
import { CurrentUser } from '../../users/interfaces/current-user.interface';
import { CurrentSuperAdmin } from './current-super-admin.interface';

export type { CurrentUser as AuthenticatedUser } from '../../users/interfaces/current-user.interface';
export type { CurrentSuperAdmin } from './current-super-admin.interface';

export type RequestPrincipal = CurrentUser | CurrentSuperAdmin;

export interface RequestWithUser extends Request {
  user: RequestPrincipal;
}

import { isSuperAdminPrincipal } from '../../../common/utils/principal.util';

/** True if the request principal is a SuperAdmin — CurrentUser always has tenantId, CurrentSuperAdmin never does. */
export function isSuperAdmin(principal: RequestPrincipal): principal is CurrentSuperAdmin {
  return isSuperAdminPrincipal(principal);
}
