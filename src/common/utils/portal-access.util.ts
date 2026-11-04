import { UserRole } from "@prisma/client";

/** Only tenant admin may set Party.portal_access via party create/update. */
export function canGrantPortalAccess(
  role?: UserRole | string | null,
): boolean {
  return role === UserRole.TENANT_ADMIN;
}
