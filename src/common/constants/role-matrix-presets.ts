import { UserRole } from "@prisma/client";
import {
  MODULE_PERMISSION_TREE,
} from "./module-permission-tree";
import type { MatrixAccess } from "./matrix-access";

export type RoleMatrixGrant = {
  module: string;
  submodule: string;
  access: MatrixAccess;
};

function allNodes(access: MatrixAccess): RoleMatrixGrant[] {
  const grants: RoleMatrixGrant[] = [];
  for (const mod of MODULE_PERMISSION_TREE) {
    for (const sub of mod.submodules) {
      grants.push({ module: mod.key, submodule: sub.key, access });
    }
  }
  return grants;
}

function setAccess(
  grants: RoleMatrixGrant[],
  module: string,
  submodule: string | "*",
  access: MatrixAccess,
): void {
  for (const g of grants) {
    if (g.module !== module) continue;
    if (submodule !== "*" && g.submodule !== submodule) continue;
    g.access = access;
  }
}

function baseNone(): RoleMatrixGrant[] {
  return allNodes("none");
}

/**
 * Default matrix grants for each staff role card in the create-user wizard.
 * Clients may override via `permission_grants` on POST/PATCH /users.
 */
export function getRoleMatrixPreset(role: UserRole): RoleMatrixGrant[] {
  const grants = baseNone();

  switch (role) {
    case UserRole.TENANT_ADMIN:
      return allNodes("write");

    case UserRole.BRANCH_MANAGER:
      setAccess(grants, "operations", "*", "write");
      setAccess(grants, "sales", "*", "write");
      setAccess(grants, "finance", "*", "read");
      setAccess(grants, "masters", "*", "write");
      setAccess(grants, "admin", "users", "write");
      setAccess(grants, "hr", "module", "read");
      setAccess(grants, "wms", "module", "write");
      setAccess(grants, "transport", "module", "write");
      setAccess(grants, "nvocc", "module", "write");
      setAccess(grants, "documentation", "module", "read");
      setAccess(grants, "support", "customer_support", "write");
      break;

    case UserRole.FINANCE_MANAGER:
    case UserRole.ACCOUNTANT:
      setAccess(grants, "finance", "*", "write");
      setAccess(grants, "sales", "parties", "read");
      setAccess(grants, "sales", "quotations", "read");
      setAccess(grants, "operations", "*", "read");
      setAccess(grants, "masters", "*", "read");
      setAccess(grants, "wms", "module", "read");
      setAccess(grants, "hr", "module", "read");
      break;

    case UserRole.SALES_MANAGER:
      setAccess(grants, "sales", "*", "write");
      setAccess(grants, "operations", "*", "read");
      setAccess(grants, "masters", "*", "read");
      setAccess(grants, "support", "customer_support", "write");
      setAccess(grants, "nvocc", "module", "write");
      break;

    case UserRole.SALES_EXECUTIVE:
      setAccess(grants, "sales", "*", "write");
      setAccess(grants, "operations", "*", "read");
      setAccess(grants, "masters", "*", "read");
      break;

    case UserRole.OPERATIONS_MANAGER:
    case UserRole.OPERATIONS_EXECUTIVE:
      setAccess(grants, "operations", "*", "write");
      setAccess(grants, "sales", "parties", "read");
      setAccess(grants, "sales", "quotations", "read");
      setAccess(grants, "masters", "*", "read");
      setAccess(grants, "wms", "module", "write");
      setAccess(grants, "transport", "module", "write");
      setAccess(grants, "nvocc", "module", "write");
      setAccess(grants, "documentation", "module", "read");
      break;

    case UserRole.WAREHOUSE_STAFF:
      setAccess(grants, "wms", "module", "write");
      setAccess(grants, "operations", "warehouse", "write");
      setAccess(grants, "masters", "*", "read");
      setAccess(grants, "sales", "parties", "read");
      setAccess(grants, "operations", "*", "read");
      break;

    case UserRole.DRIVER:
      setAccess(grants, "logistics", "driver", "write");
      setAccess(grants, "transport", "module", "read");
      setAccess(grants, "masters", "*", "read");
      break;

    case UserRole.DOCUMENTATION:
      setAccess(grants, "documentation", "module", "write");
      setAccess(grants, "operations", "*", "write");
      setAccess(grants, "transport", "module", "write");
      setAccess(grants, "nvocc", "module", "write");
      setAccess(grants, "masters", "*", "read");
      setAccess(grants, "finance", "invoices", "read");
      setAccess(grants, "finance", "gl", "read");
      break;

    case UserRole.CUSTOMER_SUPPORT:
      setAccess(grants, "support", "customer_support", "write");
      setAccess(grants, "sales", "parties", "read");
      setAccess(grants, "sales", "quotations", "read");
      setAccess(grants, "operations", "*", "write");
      setAccess(grants, "masters", "*", "read");
      break;

    case UserRole.HR_MANAGER:
      setAccess(grants, "hr", "module", "write");
      setAccess(grants, "admin", "users", "read");
      setAccess(grants, "masters", "*", "read");
      break;

    case UserRole.CUSTOMER:
      setAccess(grants, "support", "customer", "read");
      break;

    case UserRole.AGENT:
      setAccess(grants, "support", "agent", "write");
      setAccess(grants, "sales", "*", "read");
      setAccess(grants, "operations", "*", "read");
      break;

    case UserRole.READ_ONLY:
      return allNodes("read");

    default:
      break;
  }

  return grants;
}

export function mergePermissionGrants(
  preset: RoleMatrixGrant[],
  overrides: RoleMatrixGrant[] | undefined,
  mode: "merge_with_preset" | "replace",
): RoleMatrixGrant[] {
  if (mode === "replace") {
    const base = baseNone();
    if (!overrides?.length) return base;
    const map = new Map(base.map((g) => [`${g.module}.${g.submodule}`, g]));
    for (const o of overrides) {
      const key = `${o.module}.${o.submodule}`;
      const existing = map.get(key);
      if (existing) existing.access = o.access;
    }
    return [...map.values()];
  }

  const map = new Map(preset.map((g) => [`${g.module}.${g.submodule}`, { ...g }]));
  for (const o of overrides ?? []) {
    const key = `${o.module}.${o.submodule}`;
    const existing = map.get(key);
    if (existing) existing.access = o.access;
    else map.set(key, { ...o });
  }
  return [...map.values()];
}

export function listRolePresetPayloads(): Array<{
  code: string;
  name: string;
  default_grants: RoleMatrixGrant[];
}> {
  const names: Partial<Record<UserRole, string>> = {
    [UserRole.TENANT_ADMIN]: "Tenant Admin",
    [UserRole.BRANCH_MANAGER]: "Branch Manager",
    [UserRole.FINANCE_MANAGER]: "Finance Manager",
    [UserRole.ACCOUNTANT]: "Accountant",
    [UserRole.SALES_MANAGER]: "Sales Manager",
    [UserRole.SALES_EXECUTIVE]: "Sales Executive",
    [UserRole.OPERATIONS_MANAGER]: "Operations Manager",
    [UserRole.OPERATIONS_EXECUTIVE]: "Operations Executive",
    [UserRole.WAREHOUSE_STAFF]: "Warehouse Staff",
    [UserRole.DRIVER]: "Driver",
    [UserRole.DOCUMENTATION]: "Documentation",
    [UserRole.CUSTOMER_SUPPORT]: "Customer Support",
    [UserRole.HR_MANAGER]: "HR Manager",
    [UserRole.CUSTOMER]: "Customer",
    [UserRole.AGENT]: "Agent",
    [UserRole.READ_ONLY]: "Read Only",
  };

  return (Object.keys(names) as UserRole[]).map((code) => ({
    code,
    name: names[code]!,
    default_grants: getRoleMatrixPreset(code),
  }));
}
