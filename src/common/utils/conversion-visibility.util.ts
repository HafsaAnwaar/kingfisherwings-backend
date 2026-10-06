import { UserRole } from "@prisma/client";
import { departmentsForRole } from "../workflow/workflow-dept";

/**
 * Visibility for quotations/jobs before a customer has any CONVERTED quote:
 * Sales (and admin/finance) see them; pure Operations does not.
 */
export function isSalesSideActor(opts: {
  role?: UserRole | string | null;
  permissions?: string[] | null;
}): boolean {
  const role = opts.role as UserRole | undefined;
  if (role === UserRole.TENANT_ADMIN || role === UserRole.BRANCH_MANAGER) {
    return true;
  }
  if (role === UserRole.FINANCE_MANAGER || role === UserRole.ACCOUNTANT) {
    return true;
  }
  if (role) {
    const depts = departmentsForRole(role);
    if (depts.includes("SALES") || depts.includes("ADMIN")) return true;
    if (depts.includes("ACCOUNTS") || depts.includes("MGMT")) return true;
  }

  const perms = new Set(opts.permissions ?? []);
  if (perms.has("sales_quotations.write")) return true;
  if (perms.has("sales_quotations.read") && !isOpsOnly(opts)) return true;
  // Classic create/update implies sales
  if (perms.has("quotations.create") || perms.has("quotations.update")) {
    return true;
  }
  return false;
}

export function isOpsOnlyActor(opts: {
  role?: UserRole | string | null;
  permissions?: string[] | null;
}): boolean {
  if (isSalesSideActor(opts)) return false;
  return isOpsOnly(opts);
}

function isOpsOnly(opts: {
  role?: UserRole | string | null;
  permissions?: string[] | null;
}): boolean {
  const role = opts.role as UserRole | undefined;
  if (role) {
    const depts = departmentsForRole(role);
    if (depts.includes("OPS") && !depts.includes("SALES")) return true;
  }
  const perms = new Set(opts.permissions ?? []);
  const hasOps = [...perms].some(
    (p) => p.startsWith("operations_") || p === "jobs.view" || p === "jobs.update",
  );
  const hasSalesWrite =
    perms.has("sales_quotations.write") ||
    perms.has("quotations.create") ||
    perms.has("quotations.update");
  return hasOps && !hasSalesWrite;
}
