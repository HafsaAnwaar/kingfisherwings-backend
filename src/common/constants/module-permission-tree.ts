import { JobType } from "@prisma/client";

export const MODULE_ACCESS_LEVELS = ["see", "read", "write"] as const;
export type ModuleAccessLevel = (typeof MODULE_ACCESS_LEVELS)[number];

export interface PermissionSubmodule {
  key: string;
  label: string;
  jobType?: JobType;
}

export interface PermissionModuleNode {
  key: string;
  label: string;
  submodules: PermissionSubmodule[];
}

/** Admin-panel tree: module → submodule → see / read / write. */
export const MODULE_PERMISSION_TREE: PermissionModuleNode[] = [
  {
    key: "operations",
    label: "Operations",
    submodules: [
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
      { key: "parties", label: "Customers / Parties" },
    ],
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

export function isMatrixPermissionCode(code: string): boolean {
  return ALL_MATRIX_PERMISSION_CODES.includes(code);
}
