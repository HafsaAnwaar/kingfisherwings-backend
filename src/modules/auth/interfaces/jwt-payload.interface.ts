import { UserRole } from '@prisma/client';

/**
 * Payload for a regular User (staff, or the tenant's auto-created
 * TENANT_ADMIN owner via POST /auth/tenant-login). Field names match
 * CurrentUser (modules/users/interfaces/current-user.interface.ts) so
 * JwtStrategy can hand this straight to request.user with no renaming.
 */
export interface UserJwtPayload {
  principal: 'user';

  sub: string; // user id
  tenantId: string;
  branchId: string | null;
  roleId: string | null;
  role: UserRole;

  /** = Session.jti */
  sessionId: string;

  email: string;
  permissions: string[];

  type: 'access' | 'refresh';
}

/**
 * Payload for a SuperAdmin — platform owner, not tied to any tenant.
 */
export interface SuperAdminJwtPayload {
  principal: 'super_admin';

  sub: string; // super admin id
  email: string;

  /** = SuperAdminSession.jti */
  sessionId: string;

  type: 'access' | 'refresh';
}

export type JwtPayload = UserJwtPayload | SuperAdminJwtPayload;
