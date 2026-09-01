import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";

/**
 * Declares the permission codes required to access a route. Enforced by
 * PermissionsGuard, which requires ALL listed codes to be present in
 * request.user.permissions.
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
