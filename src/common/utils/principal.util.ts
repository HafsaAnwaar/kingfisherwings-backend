/**
 * True if `principal` (whatever was attached to request.user by
 * JwtStrategy) is a SuperAdmin rather than a regular User.
 *
 * Deliberately structural rather than importing CurrentSuperAdmin from
 * the Auth module: the Users module cannot depend on Auth (Auth already
 * depends on Users), and Auth's own CurrentSuperAdmin type is
 * equivalent to "no tenantId" in practice. CurrentUser always has a
 * required tenantId; CurrentSuperAdmin never has one at all.
 */
export function isSuperAdminPrincipal(principal: unknown): boolean {
  return (
    !!principal &&
    typeof principal === "object" &&
    !("tenantId" in (principal as Record<string, unknown>))
  );
}
