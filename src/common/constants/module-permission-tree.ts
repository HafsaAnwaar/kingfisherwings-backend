import { JobType } from "@prisma/client";
import type { MatrixAccess } from "./matrix-access";
import { normalizeMatrixGrantFlags } from "./matrix-access";

export const MODULE_ACCESS_LEVELS = ["see", "read", "write"] as const;
export type ModuleAccessLevel = (typeof MODULE_ACCESS_LEVELS)[number];

export interface PermissionSubmodule {
  key: string;
  label: string;
  jobType?: JobType;
  /** Hidden from admin matrix UI; still synced as a permission code. */
  hidden?: boolean;
}

export interface PermissionModuleNode {
  key: string;
  label: string;
  submodules: PermissionSubmodule[];
}

/**
 * Marker submodule: when granted (`operations_scope.see`), ops job-type
 * scoping is considered configured even if every job type is `none`.
 * Without it, zero ops codes ⇒ unrestricted (legacy soft fallback).
 */
export const OPERATIONS_SCOPE_SUBMODULE_KEY = "scope";

/** Admin-panel tree: module → submodule → see / read / write. */
export const MODULE_PERMISSION_TREE: PermissionModuleNode[] = [
  {
    key: "operations",
    label: "Operations",
    submodules: [
      {
        key: OPERATIONS_SCOPE_SUBMODULE_KEY,
        label: "Job-type scope",
        hidden: true,
      },
      { key: "air_export", label: "Air Export", jobType: "AIR_EXPORT" },
      { key: "air_import", label: "Air Import", jobType: "AIR_IMPORT" },
      {
        key: "sea_fcl_export",
        label: "Sea FCL Export",
        jobType: "SEA_FCL_EXPORT",
      },
      {
        key: "sea_fcl_import",
        label: "Sea FCL Import",
        jobType: "SEA_FCL_IMPORT",
      },
      {
        key: "sea_lcl_export",
        label: "Sea LCL Export",
        jobType: "SEA_LCL_EXPORT",
      },
      {
        key: "sea_lcl_import",
        label: "Sea LCL Import",
        jobType: "SEA_LCL_IMPORT",
      },
      { key: "land", label: "Land", jobType: "LAND" },
      { key: "road_freight", label: "Road Freight", jobType: "ROAD_FREIGHT" },
      { key: "courier", label: "Courier", jobType: "COURIER" },
      {
        key: "customs_clearance",
        label: "Customs Clearance",
        jobType: "CUSTOMS_CLEARANCE",
      },
      { key: "nvocc_export", label: "NVOCC Export", jobType: "NVOCC_EXPORT" },
      { key: "nvocc_import", label: "NVOCC Import", jobType: "NVOCC_IMPORT" },
      { key: "service_job", label: "Service Job", jobType: "SERVICE_JOB" },
      { key: "warehouse", label: "Warehouse jobs", jobType: "WAREHOUSE" },
    ],
  },
  {
    key: "sales",
    label: "Sales",
    submodules: [
      { key: "quotations", label: "Quotations" },
      { key: "crm", label: "CRM" },
    ],
  },
  {
    key: "parties",
    label: "Parties",
    submodules: [
      { key: "module", label: "Customers / Parties" },
    ],
  },
  {
    key: "vendor",
    label: "Vendor services",
    submodules: [
      { key: "users", label: "Vendor users" },
      { key: "permissions", label: "Vendor permissions" },
      { key: "disputes", label: "Vendor disputes" },
    ],
  },
  {
    key: "shipments",
    label: "Shipments",
    submodules: [{ key: "module", label: "Shipments" }],
  },
  {
    key: "finance",
    label: "Finance",
    submodules: [
      { key: "invoices", label: "Invoices" },
      { key: "gl", label: "General Ledger" },
      { key: "payments", label: "Payments" },
    ],
  },
  {
    key: "masters",
    label: "Masters",
    submodules: [
      { key: "ports", label: "Sea ports" },
      { key: "airports", label: "Airports" },
      { key: "other", label: "Other masters" },
    ],
  },
  {
    key: "admin",
    label: "Administration",
    submodules: [
      { key: "users", label: "Users" },
      { key: "roles", label: "Roles & permissions" },
    ],
  },
  {
    key: "hr",
    label: "HR",
    submodules: [{ key: "module", label: "HR" }],
  },
  {
    key: "wms",
    label: "WMS",
    submodules: [{ key: "module", label: "Warehouse" }],
  },
  {
    key: "transport",
    label: "Transport",
    submodules: [{ key: "module", label: "Transport" }],
  },
  {
    key: "nvocc",
    label: "NVOCC",
    submodules: [{ key: "module", label: "NVOCC" }],
  },
  {
    key: "documentation",
    label: "Documentation",
    submodules: [{ key: "module", label: "Documentation" }],
  },
  {
    key: "support",
    label: "Support",
    submodules: [
      { key: "customer_support", label: "Customer Support" },
      { key: "agent", label: "Agent" },
      { key: "customer", label: "Customer (external)" },
    ],
  },
  {
    key: "logistics",
    label: "Logistics",
    submodules: [{ key: "driver", label: "Driver" }],
  },
];

export function matrixPermissionModule(
  moduleKey: string,
  submoduleKey: string,
): string {
  return `${moduleKey}_${submoduleKey}`;
}

export function matrixPermissionCode(
  moduleKey: string,
  submoduleKey: string,
  level: ModuleAccessLevel,
): string {
  return `${matrixPermissionModule(moduleKey, submoduleKey)}.${level}`;
}

export function buildMatrixPermissionCatalog(): Array<{
  module: string;
  action: string;
  description: string;
}> {
  const entries: Array<{
    module: string;
    action: string;
    description: string;
  }> = [];
  for (const mod of MODULE_PERMISSION_TREE) {
    for (const sub of mod.submodules) {
      for (const level of MODULE_ACCESS_LEVELS) {
        entries.push({
          module: matrixPermissionModule(mod.key, sub.key),
          action: level,
          description: `${mod.label} / ${sub.label} — ${level}`,
        });
      }
    }
  }
  return entries;
}

export const MATRIX_PERMISSION_CATALOG = buildMatrixPermissionCatalog();

export const ALL_MATRIX_PERMISSION_CODES = MATRIX_PERMISSION_CATALOG.map(
  (e) => `${e.module}.${e.action}`,
);

const OPERATIONS_JOB_TYPES = MODULE_PERMISSION_TREE.find(
  (m) => m.key === "operations",
)!.submodules.filter((s) => s.jobType);

/** All operational services (JobType) with labels — enquiry wizard step 1. */
export function allOperationsServices(): {
  job_type: JobType;
  key: string;
  label: string;
}[] {
  return OPERATIONS_JOB_TYPES.map((s) => ({
    job_type: s.jobType!,
    key: s.key,
    label: s.label,
  }));
}

export function operationsSeeCode(jobType: JobType): string {
  const sub = OPERATIONS_JOB_TYPES.find((s) => s.jobType === jobType);
  if (!sub) return `operations_unknown.see`;
  return matrixPermissionCode("operations", sub.key, "see");
}

export function operationsReadCode(jobType: JobType): string {
  const sub = OPERATIONS_JOB_TYPES.find((s) => s.jobType === jobType);
  if (!sub) return `operations_unknown.read`;
  return matrixPermissionCode("operations", sub.key, "read");
}

export function operationsWriteCode(jobType: JobType): string {
  const sub = OPERATIONS_JOB_TYPES.find((s) => s.jobType === jobType);
  if (!sub) return `operations_unknown.write`;
  return matrixPermissionCode("operations", sub.key, "write");
}

export function hasAnyOperationsMatrix(permissions: string[]): boolean {
  return permissions.some((p) => p.startsWith("operations_"));
}

/** Job types the user may list. `null` means unrestricted (no matrix set). */
export function visibleJobTypes(
  permissions: string[],
): JobType[] | null {
  if (!hasAnyOperationsMatrix(permissions)) return null;

  const allowed: JobType[] = [];
  for (const sub of OPERATIONS_JOB_TYPES) {
    const jobType = sub.jobType!;
    if (
      permissions.includes(operationsSeeCode(jobType)) ||
      permissions.includes(operationsReadCode(jobType)) ||
      permissions.includes(operationsWriteCode(jobType))
    ) {
      allowed.push(jobType);
    }
  }
  return allowed;
}

export function canSeeJobType(
  permissions: string[],
  jobType: JobType,
): boolean {
  const allowed = visibleJobTypes(permissions);
  if (allowed === null) return true;
  return allowed.includes(jobType);
}

export function canWriteJobType(
  permissions: string[],
  jobType: JobType,
): boolean {
  if (!hasAnyOperationsMatrix(permissions)) return true;
  return permissions.includes(operationsWriteCode(jobType));
}

/**
 * Job types the user may create/write.
 * `null` = unrestricted (no ops matrix). Empty = matrix present but no write.
 */
export function writableJobTypes(
  permissions: string[],
): JobType[] | null {
  if (!hasAnyOperationsMatrix(permissions)) return null;
  const allowed: JobType[] = [];
  for (const sub of OPERATIONS_JOB_TYPES) {
    const jobType = sub.jobType!;
    if (permissions.includes(operationsWriteCode(jobType))) {
      allowed.push(jobType);
    }
  }
  return allowed;
}

export function isMatrixPermissionCode(code: string): boolean {
  return ALL_MATRIX_PERMISSION_CODES.includes(code);
}

export type MatrixGrantInput = {
  module: string;
  submodule: string;
  access?: MatrixAccess;
  see?: boolean;
  read?: boolean;
  write?: boolean;
};

export type JobTypeScopeInput = {
  visible_job_types?: JobType[] | null;
  writable_job_types?: JobType[] | null;
};

function grantAccessRank(g: MatrixGrantInput): number {
  const n = normalizeMatrixGrantFlags(g);
  if (n.write) return 2;
  if (n.read || n.see) return 1;
  return 0;
}

/**
 * Overlay FE `visible_job_types` / `writable_job_types` onto operations
 * submodule grants so scope persists in the permission matrix.
 *
 * - Writable ⇒ write; visible (not writable) ⇒ at least read.
 * - When `visible_job_types` is provided, job types outside the set are set to
 *   `none`, and `operations_scope.see` is granted so empty lists stay restricted
 *   (not the legacy unrestricted soft fallback).
 */
export function mergeJobTypeScopeIntoGrants(
  grants: MatrixGrantInput[],
  scope?: JobTypeScopeInput | null,
): MatrixGrantInput[] {
  if (!scope) return grants;

  const hasVisible =
    scope.visible_job_types !== undefined && scope.visible_job_types !== null;
  const hasWritable =
    scope.writable_job_types !== undefined && scope.writable_job_types !== null;
  if (!hasVisible && !hasWritable) return grants;

  const visible = new Set<JobType>(scope.visible_job_types ?? []);
  const writable = new Set<JobType>(scope.writable_job_types ?? []);
  for (const jt of writable) visible.add(jt);

  const keyOf = (module: string, submodule: string) => `${module}:${submodule}`;
  const map = new Map<string, MatrixGrantInput>();
  for (const g of grants) {
    map.set(keyOf(g.module, g.submodule), { ...g });
  }

  const upsertOps = (jobType: JobType, access: MatrixAccess) => {
    const sub = OPERATIONS_JOB_TYPES.find((s) => s.jobType === jobType);
    if (!sub) return;
    const k = keyOf("operations", sub.key);
    const existing = map.get(k);
    const desired = access === "write" ? 2 : access === "read" ? 1 : 0;
    if (existing && grantAccessRank(existing) >= desired) return;
    map.set(k, { module: "operations", submodule: sub.key, access });
  };

  if (hasVisible) {
    for (const sub of OPERATIONS_JOB_TYPES) {
      const jt = sub.jobType!;
      if (!visible.has(jt)) {
        map.set(keyOf("operations", sub.key), {
          module: "operations",
          submodule: sub.key,
          access: "none",
        });
      }
    }
    for (const jt of visible) {
      upsertOps(jt, writable.has(jt) ? "write" : "read");
    }
    // Marker so empty visible arrays remain scoped (not unrestricted).
    map.set(keyOf("operations", OPERATIONS_SCOPE_SUBMODULE_KEY), {
      module: "operations",
      submodule: OPERATIONS_SCOPE_SUBMODULE_KEY,
      access: "read",
    });
  } else if (hasWritable) {
    for (const jt of writable) {
      upsertOps(jt, "write");
    }
  }

  return Array.from(map.values());
}
