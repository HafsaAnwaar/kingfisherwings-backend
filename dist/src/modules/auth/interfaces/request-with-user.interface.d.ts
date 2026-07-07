import { Request } from 'express';
import { CurrentUser } from '../../users/interfaces/current-user.interface';
import { CurrentSuperAdmin } from './current-super-admin.interface';
export type { CurrentUser as AuthenticatedUser } from '../../users/interfaces/current-user.interface';
export type { CurrentSuperAdmin } from './current-super-admin.interface';
export type RequestPrincipal = CurrentUser | CurrentSuperAdmin;
export interface RequestWithUser extends Request {
    user: RequestPrincipal;
}
export declare function isSuperAdmin(principal: RequestPrincipal): principal is CurrentSuperAdmin;
