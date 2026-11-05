import { ForbiddenException } from "@nestjs/common";
import { JobType, Prisma, UserRole } from "@prisma/client";
import {
  allOperationsServices,
  canWriteJobType,
  visibleJobTypes,
  writableJobTypes,
} from "../constants/module-permission-tree";
import { getRoleMatrixPreset } from "../constants/role-matrix-presets";
import { departmentsForRole } from "../workflow/workflow-dept";

const OPERATIONS_SCOPE_PREFIX = "operations_scope.";

/**
 * Tenant admin, branch manager, and super admin see every job department.
 * `admin_users.write` / `admin_roles.write` is the same signal when the
 * JWT role claim is missing or is not one of those enums.
 * Staff stay scoped to operations grants (job type), not creator.
 */
export function seesAllJobDepartments(
  role?: string | null,
  permissions?: string[] | null,
): boolean {
  if (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.TENANT_ADMIN ||
    role === UserRole.BRANCH_MANAGER
  ) {
    return true;
  }
  if (role && departmentsForRole(role as UserRole).includes("ADMIN")) {
    return true;
  }
  const perms = permissions ?? [];
  return (
    perms.includes("admin_users.write") || perms.includes("admin_roles.write")
  );
}

/** Job types the role preset already covers (see or write). */
function presetVisibleJobTypes(role?: string | null): JobType[] {
  if (!role || !Object.values(UserRole).includes(role as UserRole)) return [];
  const byKey = new Map(
    allOperationsServices().map((s) => [s.key, s.job_type]),
  );
  const types: JobType[] = [];
  for (const grant of getRoleMatrixPreset(role as UserRole)) {
    if (grant.module !== "operations" || grant.access === "none") continue;
    const jobType = byKey.get(grant.submodule);
    if (jobType && !types.includes(jobType)) types.push(jobType);
  }
  return types;
}

/**
 * Job types this user may list.
 * `null` = every department (admin, or no operations matrix at all).
 *
 * An `operations_scope` marker with no job-type rows used to resolve to
 * `{ in: [] }` and show 0 jobs. For a role whose preset already covers
 * departments, that falls back to the preset so the marker alone cannot
 * zero the list. An explicit job-type grant still wins and is not widened.
 */
export function visibleJobTypesForActor(
  permissions: string[] | null | undefined,
  role?: string | null,
): JobType[] | null {
  const perms = permissions ?? [];
  if (seesAllJobDepartments(role, perms)) return null;

  const fromMatrix = visibleJobTypes(perms);
  if (fromMatrix === null) return null;
  if (fromMatrix.length > 0) return fromMatrix;

  const explicitScope = perms.some((p) => p.startsWith(OPERATIONS_SCOPE_PREFIX));
  if (!explicitScope) return fromMatrix;

  const preset = presetVisibleJobTypes(role);
  return preset.length > 0 ? preset : fromMatrix;
}

/**
 * Decide the job types a user may list from their saved direct grants.
 * `null` = every department.
 *
 * A saved `operations_scope` grant means the direct job-type rows are the
 * department list. The role pack is not added on top. If that grant exists
 * but no job type was stored, the role preset is used so the list is not
 * empty for an operations or sales role.
 * With no scope marker and no direct job-type rows, the role preset is the
 * department. A known role whose preset has no job types sees none.
 */
export function visibleJobTypesFromStoredGrants(
  directCodes: string[] | null | undefined,
  role?: string | null,
): JobType[] | null {
  const codes = directCodes ?? [];
  if (seesAllJobDepartments(role, codes)) return null;

  const hasScope = codes.some((p) => p.startsWith(OPERATIONS_SCOPE_PREFIX));
  const directTypes = visibleJobTypes(codes);

  if (hasScope) {
    if (directTypes && directTypes.length > 0) return directTypes;
    const preset = presetVisibleJobTypes(role);
    return preset.length > 0 ? preset : [];
  }

  if (directTypes && directTypes.length > 0) return directTypes;

  const preset = presetVisibleJobTypes(role);
  if (preset.length > 0) return preset;
  if (role && Object.values(UserRole).includes(role as UserRole)) return [];
  return directTypes;
}

/**
 * Job types this user may list, read from direct grants inside the caller's
 * tenant transaction. Does not open another transaction.
 */
export async function resolveVisibleJobTypes(
  tx: Prisma.TransactionClient,
  tenantId: string,
  userId: string | null | undefined,
  roleHint?: string | null,
): Promise<JobType[] | null> {
  if (!userId) return visibleJobTypesForActor([], roleHint);

  const [user, direct] = await Promise.all([
    tx.user.findFirst({
      where: { id: userId, tenant_id: tenantId, deleted_at: null },
      select: { role: true },
    }),
    tx.userPermission.findMany({
      where: { tenant_id: tenantId, user_id: userId, granted: true },
      select: { permission: { select: { module: true, action: true } } },
    }),
  ]);

  const role = user?.role ?? roleHint ?? null;
  const codes = direct.map(
    (row) => `${row.permission.module}.${row.permission.action}`,
  );
  return visibleJobTypesFromStoredGrants(codes, role);
}

/** `undefined` = do not filter. `{ in: [] }` = none. */
export function jobTypeFilterFromVisible(
  allowed: JobType[] | null,
  requested?: string | null,
): JobType | { in: JobType[] } | undefined {
  if (requested) {
    const jobType = requested as JobType;
    if (allowed && !allowed.includes(jobType)) return { in: [] };
    return jobType;
  }
  if (allowed === null) return undefined;
  return { in: allowed };
}

/**
 * Shared Prisma `where` for GET /jobs and GET /jobs/dashboard-counts.
 * Only tenant, not-deleted, optional branch, and the resolved job-type scope.
 * Never adds created_by, ops_user_id, salesperson_id, or org department_id.
 */
export function buildVisibleJobsBaseWhere(
  tenantId: string,
  visible: JobType[] | null,
  opts?: { branch_id?: string | null; job_type?: string | null },
): Prisma.JobWhereInput {
  const jobTypeFilter = jobTypeFilterFromVisible(visible, opts?.job_type);
  return {
    tenant_id: tenantId,
    deleted_at: null,
    ...(opts?.branch_id ? { branch_id: opts.branch_id } : {}),
    ...(jobTypeFilter ? { job_type: jobTypeFilter } : {}),
  };
}

export function jobTypeInFilterFromVisible(
  allowed: JobType[] | null,
): { in: JobType[] } | undefined {
  if (allowed === null) return undefined;
  return { in: allowed };
}

/**
 * Prisma job_type filter shared by the job list and the job-count API.
 * `undefined` = do not filter (admin / unrestricted). `{ in: [] }` = none.
 */
export function jobTypeFilterForActor(
  permissions: string[] | null | undefined,
  role?: string | null,
  requested?: string | null,
): JobType | { in: JobType[] } | undefined {
  const allowed = visibleJobTypesForActor(permissions, role);
  if (requested) {
    const jobType = requested as JobType;
    if (allowed && !allowed.includes(jobType)) return { in: [] };
    return jobType;
  }
  if (allowed === null) return undefined;
  return { in: allowed };
}

export function canSeeJobTypeForActor(
  permissions: string[] | null | undefined,
  jobType: JobType,
  role?: string | null,
): boolean {
  const allowed = visibleJobTypesForActor(permissions, role);
  if (allowed === null) return true;
  return allowed.includes(jobType);
}

export function canWriteJobTypeForActor(
  permissions: string[] | null | undefined,
  jobType: JobType,
  role?: string | null,
): boolean {
  const perms = permissions ?? [];
  if (seesAllJobDepartments(role, perms)) return true;
  return canWriteJobType(perms, jobType);
}

export type JobTypeAccessMode = "see" | "write";

/**
 * Prisma `where` fragment for job_type scoping from the ops permission matrix.
 * Returns `{}` when unrestricted (no ops matrix / legacy role-only users).
 */
export function jobTypeWhere(
  permissions: string[] | null | undefined,
  field: "job_type" = "job_type",
  role?: string | null,
): Record<string, unknown> {
  const allowed = visibleJobTypesForActor(permissions, role);
  if (allowed === null) return {};
  if (allowed.length === 0) {
    // Matrix present but nothing granted — match nothing
    return { [field]: { in: [] as JobType[] } };
  }
  return { [field]: { in: allowed } };
}

/** Same as jobTypeWhere but typed for Prisma Job/Quotation/Shipment filters. */
export function jobTypeInFilter(
  permissions: string[] | null | undefined,
  role?: string | null,
): { in: JobType[] } | undefined {
  const allowed = visibleJobTypesForActor(permissions, role);
  if (allowed === null) return undefined;
  return { in: allowed };
}

/**
 * Invoice list/get filter via linked job.job_type.
 * Manual invoices (no job) stay visible — finance can create/edit them outside ops modes.
 */
export function invoiceJobTypeScope(
  permissions: string[] | null | undefined,
  role?: string | null,
): Prisma.InvoiceWhereInput | undefined {
  const allowed = visibleJobTypesForActor(permissions, role);
  if (allowed === null) return undefined;
  if (allowed.length === 0) {
    // Matrix present but no job types granted — still allow job-less (manual) invoices.
    return { job_id: null };
  }
  return {
    OR: [
      { job_id: null },
      { job: { is: { job_type: { in: allowed }, deleted_at: null } } },
    ],
  };
}

export function assertJobTypeAccess(
  permissions: string[] | null | undefined,
  jobType: JobType | string | null | undefined,
  mode: JobTypeAccessMode = "see",
  role?: string | null,
): void {
  if (!jobType) return;
  const perms = permissions ?? [];
  if (seesAllJobDepartments(role, perms)) return;
  const jt = jobType as JobType;
  const ok =
    mode === "write"
      ? canWriteJobType(perms, jt)
      : canSeeJobTypeForActor(perms, jt, role);
  if (!ok) {
    throw new ForbiddenException(
      mode === "write"
        ? `You do not have write access for ${jt}.`
        : `You do not have access to ${jt} records.`,
    );
  }
}

export function jobTypeAccessSummary(permissions: string[] | null | undefined): {
  visible_job_types: JobType[] | null;
  /** Job types allowed on create-job pickers (`operations_*.write`). */
  writable_job_types: JobType[] | null;
  unrestricted_ops: boolean;
} {
  const perms = permissions ?? [];
  const visible = visibleJobTypes(perms);
  const writable = writableJobTypes(perms);
  return {
    visible_job_types: visible,
    writable_job_types: writable,
    unrestricted_ops: visible === null,
  };
}
