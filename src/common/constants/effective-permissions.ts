import { Prisma } from "@prisma/client";
import { ALL_BRIDGED_CLASSIC_CODES } from "./matrix-to-classic-bridge";
import { MODULE_ACCESS_LEVELS } from "./module-permission-tree";
import { filterPermissionCodes } from "./tenant-enabled-modules";

/**
 * Effective permission codes for JWT / matrix display.
 * When the user has any direct matrix (see/read/write) grants, classic
 * codes that belong to the matrix→classic bridge are taken only from
 * direct grants — role packs cannot override Read vs Write choices.
 * SuperAdmin-disabled tenant modules are stripped from the result.
 */
export async function collectEffectivePermissionCodes(
  tx: Prisma.TransactionClient,
  tenantId: string,
  userId: string,
  enabledModules?: string[] | null,
): Promise<Set<string>> {
  const roleAssignments = await tx.userRoleAssignment.findMany({
    where: { tenant_id: tenantId, user_id: userId },
    include: {
      role: {
        include: { role_permissions: { include: { permission: true } } },
      },
    },
  });
  const direct = await tx.userPermission.findMany({
    where: { tenant_id: tenantId, user_id: userId, granted: true },
    include: { permission: true },
  });

  const matrixLevelSet = new Set<string>(MODULE_ACCESS_LEVELS);
  const hasMatrixDirect = direct.some(
    (g) =>
      matrixLevelSet.has(g.permission.action) &&
      g.permission.module.includes("_"),
  );
  const bridgedSet = new Set(ALL_BRIDGED_CLASSIC_CODES);

  const codes = new Set<string>();
  for (const assignment of roleAssignments) {
    if (!assignment.role.is_active || assignment.role.deleted_at) continue;
    for (const rp of assignment.role.role_permissions) {
      const code = `${rp.permission.module}.${rp.permission.action}`;
      if (hasMatrixDirect && bridgedSet.has(code)) continue;
      codes.add(code);
    }
  }
  for (const grant of direct) {
    codes.add(`${grant.permission.module}.${grant.permission.action}`);
  }

  let modules = enabledModules;
  if (modules === undefined) {
    const tenant = await tx.tenant.findFirst({
      where: { id: tenantId },
      select: { enabled_modules: true },
    });
    modules = tenant?.enabled_modules ?? [];
  }

  return new Set(filterPermissionCodes(codes, modules));
}
