import {
  MODULE_PERMISSION_TREE,
  type PermissionModuleNode,
} from "./module-permission-tree";

/** Product module keys (admin matrix tree top-level). */
export const ALL_PRODUCT_MODULE_KEYS: readonly string[] =
  MODULE_PERMISSION_TREE.map((m) => m.key);

export function defaultEnabledModules(): string[] {
  return [...ALL_PRODUCT_MODULE_KEYS];
}

export function isValidProductModuleKey(key: string): boolean {
  return ALL_PRODUCT_MODULE_KEYS.includes(key);
}

export function normalizeEnabledModules(
  raw: string[] | null | undefined,
): string[] {
  if (!raw || raw.length === 0) return defaultEnabledModules();
  const valid = raw.filter(isValidProductModuleKey);
  // Always keep admin so Tenant Admin can manage users
  if (!valid.includes("admin")) valid.push("admin");
  return [...new Set(valid)];
}

export function filterPermissionTree(
  enabledModules: string[] | null | undefined,
): PermissionModuleNode[] {
  const enabled = new Set(normalizeEnabledModules(enabledModules));
  return MODULE_PERMISSION_TREE.filter((m) => enabled.has(m.key));
}

/**
 * Map classic permission module segment (before first '.') to product module key.
 */
const CLASSIC_MODULE_TO_PRODUCT: Record<string, string> = {
  jobs: "operations",
  quotations: "sales",
  crm: "sales",
  parties: "sales",
  invoices: "finance",
  "credit-notes": "finance",
  "debit-notes": "finance",
  "purchase-invoices": "finance",
  "payment-requests": "finance",
  "payment-proofs": "finance",
  gl: "finance",
  payments: "finance",
  cheques: "finance",
  reports: "operations", // catalog also filtered by family at list time
  masters: "masters",
  ports: "masters",
  airports: "masters",
  airlines: "masters",
  vessels: "masters",
  users: "admin",
  roles: "admin",
  tenants: "admin",
  organization: "admin",
  companies: "admin",
  hr: "hr",
  wms: "wms",
  transport: "transport",
  nvocc: "nvocc",
  documentation: "documentation",
  awb: "operations",
  "awb-stock": "operations",
  search: "operations",
  tools: "operations",
  notifications: "admin",
  track: "operations",
};

/**
 * Resolve which product module a permission code belongs to.
 * Matrix: `operations_air_export.see` → operations
 * Classic: `jobs.view` → operations
 */
export function productModuleForPermissionCode(code: string): string | null {
  const [mod] = code.split(".");
  if (!mod) return null;

  // Matrix codes: {treeKey}_{submodule}
  for (const key of ALL_PRODUCT_MODULE_KEYS) {
    if (mod === key || mod.startsWith(`${key}_`)) {
      return key;
    }
  }

  return CLASSIC_MODULE_TO_PRODUCT[mod] ?? null;
}

export function isPermissionCodeEnabled(
  code: string,
  enabledModules: string[] | null | undefined,
): boolean {
  const enabled = new Set(normalizeEnabledModules(enabledModules));
  const product = productModuleForPermissionCode(code);
  if (!product) return true; // unknown codes: allow (fail open for custom)
  return enabled.has(product);
}

export function filterPermissionCodes(
  codes: Iterable<string>,
  enabledModules: string[] | null | undefined,
): string[] {
  return [...codes].filter((c) =>
    isPermissionCodeEnabled(c, enabledModules),
  );
}

/** Matrix grant module key (tree key) must be enabled. */
export function assertMatrixModuleEnabled(
  moduleKey: string,
  enabledModules: string[] | null | undefined,
): void {
  const enabled = new Set(normalizeEnabledModules(enabledModules));
  if (!enabled.has(moduleKey)) {
    throw new Error(`MODULE_DISABLED:${moduleKey}`);
  }
}
