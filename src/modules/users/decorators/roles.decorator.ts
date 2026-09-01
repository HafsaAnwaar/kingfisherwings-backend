import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export const ROLES_KEY = "roles";

/**
 * Declares which legacy `role` enum values may access a route. Enforced
 * by RolesGuard. Prefer @RequirePermissions for new endpoints — this
 * remains for coarse-grained checks until permission migration is complete
 * (see User.role: "Temporary, will be removed after RBAC").
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
