import { ReportFamily } from "@prisma/client";
import { normalizeEnabledModules } from "../../../common/constants/tenant-enabled-modules";

/**
 * Map FRESA report families to product module keys + permission signals.
 */
export const REPORT_FAMILY_MODULE_KEYS: Record<string, string[]> = {
  quotation: ["sales"],
  ops_list: ["operations"],
  sea_docs: ["operations"],
  air_docs: ["operations"],
  commercial: ["finance"],
  finance: ["finance"],
  wms: ["wms"],
  other: ["operations", "sales"],
};

/** Classic / matrix codes that unlock a family (any match). */
export const REPORT_FAMILY_PERMISSION_HINTS: Record<string, string[]> = {
  quotation: [
    "quotations.view",
    "sales_quotations.see",
    "sales_quotations.read",
    "sales_quotations.write",
    "reports.read",
  ],
  ops_list: [
    "jobs.view",
    "reports.read",
  ],
  sea_docs: ["jobs.view", "reports.read"],
  air_docs: ["jobs.view", "reports.read"],
  commercial: [
    "invoices.view",
    "finance_invoices.see",
    "finance_invoices.read",
    "finance_invoices.write",
    "reports.read",
  ],
  finance: [
    "gl.view",
    "finance_gl.see",
    "finance_gl.read",
    "finance_gl.write",
    "finance_payments.see",
    "reports.read",
  ],
  wms: [
    "wms.view",
    "wms_module.see",
    "wms_module.read",
    "wms_module.write",
    "reports.read",
  ],
  other: [
    "jobs.view",
    "quotations.view",
    "sales_quotations.see",
    "reports.read",
  ],
};

function hasOpsMatrixSee(permissions: Set<string> | string[]): boolean {
  const set = permissions instanceof Set ? permissions : new Set(permissions);
  for (const p of set) {
    if (p.startsWith("operations_") && p.endsWith(".see")) return true;
    if (p.startsWith("operations_") && p.endsWith(".read")) return true;
    if (p.startsWith("operations_") && p.endsWith(".write")) return true;
  }
  return false;
}

export function canAccessReportFamily(
  family: string | ReportFamily,
  opts: {
    enabledModules: string[] | null | undefined;
    permissions: string[] | Set<string>;
  },
): boolean {
  const fam = String(family);
  const moduleKeys = REPORT_FAMILY_MODULE_KEYS[fam];
  if (!moduleKeys) return true;

  const enabled = new Set(normalizeEnabledModules(opts.enabledModules));
  if (!moduleKeys.some((k) => enabled.has(k))) return false;

  const perms =
    opts.permissions instanceof Set
      ? opts.permissions
      : new Set(opts.permissions);

  if (perms.has("reports.manage")) return true;

  const hints = REPORT_FAMILY_PERMISSION_HINTS[fam] ?? ["reports.read"];
  for (const h of hints) {
    if (perms.has(h)) return true;
  }

  // Ops families: any operations_* matrix grant
  if (
    (fam === "ops_list" || fam === "sea_docs" || fam === "air_docs") &&
    hasOpsMatrixSee(perms)
  ) {
    return true;
  }

  return false;
}
