import { QUOTATIONS_PERMISSIONS } from "../../modules/quotations/constants/quotations-permission.constants";
import { CRM_PERMISSIONS } from "../../modules/crm/constants/crm-permission.constants";
import { PARTIES_PERMISSIONS } from "../../modules/parties/constants/parties-permission.constants";
import { INVOICES_PERMISSIONS } from "../../modules/invoices/constants/invoices-permission.constants";
import { GL_PERMISSIONS } from "../../modules/gl/constants/gl-permission.constants";
import { WMS_PERMISSIONS } from "../../modules/wms/constants/wms-permission.constants";
import { HR_PERMISSIONS } from "../../modules/hr/constants/hr-permission.constants";
import { JOBS_PERMISSIONS } from "../../modules/jobs/constants/jobs-permission.constants";
import { AWB_STOCK_PERMISSIONS } from "../../modules/awb-stock/constants/awb-stock-permission.constants";
import { MASTERS_PERMISSIONS } from "../../modules/masters/constants/masters-permission.constants";
import { USERS_PERMISSIONS } from "../../modules/users/constants/permission.constants";
import { DOCUMENTATION_PERMISSIONS } from "../../modules/documentation/constants/documentation-permission.constants";
import { TRANSPORT_PERMISSIONS } from "../../modules/transport/constants/transport-permission.constants";
import { NVOCC_PERMISSIONS } from "../../modules/nvocc/constants/nvocc-permission.constants";
import { PORTAL_PERMISSIONS } from "../../modules/portal/constants/portal-permission.constants";
import { SEARCH_PERMISSIONS } from "../../modules/search/constants/search-permission.constants";
import { NOTIFICATIONS_PERMISSIONS } from "../../modules/notifications/constants/notifications-permission.constants";
import { REPORTS_PERMISSIONS } from "../../modules/reports/constants/reports-permission.constants";
import type { MatrixAccess } from "./matrix-access";

type BridgeEntry = {
  read: string[];
  write: string[];
};

function node(
  module: string,
  submodule: string,
  read: string[],
  write: string[],
): [string, BridgeEntry] {
  return [`${module}.${submodule}`, { read, write }];
}

const OPS_READ = [
  JOBS_PERMISSIONS.VIEW,
  SEARCH_PERMISSIONS.VIEW,
  NOTIFICATIONS_PERMISSIONS.VIEW,
  AWB_STOCK_PERMISSIONS.VIEW,
];

const OPS_WRITE = [
  ...OPS_READ,
  JOBS_PERMISSIONS.CREATE,
  JOBS_PERMISSIONS.UPDATE,
  JOBS_PERMISSIONS.CLOSE,
  AWB_STOCK_PERMISSIONS.ALLOCATE,
  AWB_STOCK_PERMISSIONS.CREATE,
  AWB_STOCK_PERMISSIONS.UPDATE,
  AWB_STOCK_PERMISSIONS.VOID,
  REPORTS_PERMISSIONS.READ,
  REPORTS_PERMISSIONS.GENERATE,
];

/**
 * Maps permission-matrix module.submodule + access → classic permission codes
 * enforced by PermissionsGuard on most controllers.
 */
export const MATRIX_TO_CLASSIC_BRIDGE: Record<string, BridgeEntry> = Object.fromEntries([
  node(
    "sales",
    "quotations",
    [QUOTATIONS_PERMISSIONS.VIEW],
    [
      QUOTATIONS_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.CREATE,
      QUOTATIONS_PERMISSIONS.UPDATE,
      QUOTATIONS_PERMISSIONS.SUBMIT,
      QUOTATIONS_PERMISSIONS.SEND,
      QUOTATIONS_PERMISSIONS.CLOSE,
      QUOTATIONS_PERMISSIONS.NEGOTIATE,
      QUOTATIONS_PERMISSIONS.SERVICE_CATALOG_MANAGE,
    ],
  ),
  node(
    "sales",
    "crm",
    [CRM_PERMISSIONS.VIEW],
    Object.values(CRM_PERMISSIONS),
  ),
  node(
    "sales",
    "parties",
    [PARTIES_PERMISSIONS.VIEW],
    [
      PARTIES_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.CREATE,
      PARTIES_PERMISSIONS.UPDATE,
      PARTIES_PERMISSIONS.DELETE,
    ],
  ),
  node(
    "finance",
    "invoices",
    [INVOICES_PERMISSIONS.VIEW],
    Object.values(INVOICES_PERMISSIONS),
  ),
  node(
    "finance",
    "gl",
    [GL_PERMISSIONS.VIEW, GL_PERMISSIONS.VIEW_REPORTS, GL_PERMISSIONS.VIEW_AGING],
    Object.values(GL_PERMISSIONS),
  ),
  node(
    "finance",
    "payments",
    [GL_PERMISSIONS.VIEW, GL_PERMISSIONS.VIEW_AGING],
    [
      GL_PERMISSIONS.VIEW,
      GL_PERMISSIONS.VIEW_AGING,
      GL_PERMISSIONS.MANAGE_PAYMENTS,
      GL_PERMISSIONS.MANAGE_CHEQUES,
      GL_PERMISSIONS.CREATE,
      GL_PERMISSIONS.UPDATE,
      GL_PERMISSIONS.POST,
    ],
  ),
  node(
    "wms",
    "module",
    [WMS_PERMISSIONS.VIEW, WMS_PERMISSIONS.VIEW_REPORTS],
    Object.values(WMS_PERMISSIONS),
  ),
  node(
    "hr",
    "module",
    [HR_PERMISSIONS.VIEW, HR_PERMISSIONS.VIEW_SELF],
    Object.values(HR_PERMISSIONS),
  ),
  node(
    "masters",
    "ports",
    [MASTERS_PERMISSIONS.VIEW],
    [
      MASTERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.CREATE,
      MASTERS_PERMISSIONS.UPDATE,
    ],
  ),
  node(
    "masters",
    "airports",
    [MASTERS_PERMISSIONS.VIEW],
    [
      MASTERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.CREATE,
      MASTERS_PERMISSIONS.UPDATE,
    ],
  ),
  node(
    "masters",
    "other",
    [MASTERS_PERMISSIONS.VIEW],
    Object.values(MASTERS_PERMISSIONS),
  ),
  node(
    "admin",
    "users",
    [USERS_PERMISSIONS.VIEW],
    [
      USERS_PERMISSIONS.VIEW,
      USERS_PERMISSIONS.CREATE,
      USERS_PERMISSIONS.UPDATE,
      USERS_PERMISSIONS.CHANGE_STATUS,
      USERS_PERMISSIONS.BULK_ACTION,
      USERS_PERMISSIONS.RESET_PASSWORD,
      USERS_PERMISSIONS.FORCE_LOGOUT,
    ],
  ),
  node(
    "admin",
    "roles",
    [USERS_PERMISSIONS.VIEW],
    [
      USERS_PERMISSIONS.VIEW,
      USERS_PERMISSIONS.UPDATE,
      USERS_PERMISSIONS.CREATE,
    ],
  ),
  node(
    "documentation",
    "module",
    [DOCUMENTATION_PERMISSIONS.READ, DOCUMENTATION_PERMISSIONS.EDI_READ],
    Object.values(DOCUMENTATION_PERMISSIONS),
  ),
  node(
    "transport",
    "module",
    [TRANSPORT_PERMISSIONS.VIEW],
    Object.values(TRANSPORT_PERMISSIONS),
  ),
  node(
    "nvocc",
    "module",
    [NVOCC_PERMISSIONS.VIEW],
    Object.values(NVOCC_PERMISSIONS),
  ),
  node(
    "support",
    "customer_support",
    [
      PORTAL_PERMISSIONS.VIEW_USERS,
      PORTAL_PERMISSIONS.VIEW_PERMISSIONS,
      PORTAL_PERMISSIONS.VIEW_MESSAGES,
      PARTIES_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.VIEW,
    ],
    [
      PORTAL_PERMISSIONS.VIEW_USERS,
      PORTAL_PERMISSIONS.MANAGE_USERS,
      PORTAL_PERMISSIONS.VIEW_PERMISSIONS,
      PORTAL_PERMISSIONS.MANAGE_PERMISSIONS,
      PORTAL_PERMISSIONS.VIEW_MESSAGES,
      PORTAL_PERMISSIONS.MANAGE_DISPUTES,
      PARTIES_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.CREATE,
      JOBS_PERMISSIONS.UPDATE,
      JOBS_PERMISSIONS.CLOSE,
      QUOTATIONS_PERMISSIONS.VIEW,
    ],
  ),
  node(
    "support",
    "agent",
    [PARTIES_PERMISSIONS.VIEW, JOBS_PERMISSIONS.VIEW, QUOTATIONS_PERMISSIONS.VIEW],
    [
      PARTIES_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.CREATE,
      PARTIES_PERMISSIONS.UPDATE,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.UPDATE,
      QUOTATIONS_PERMISSIONS.VIEW,
    ],
  ),
  node(
    "support",
    "customer",
    [PARTIES_PERMISSIONS.VIEW],
    [PARTIES_PERMISSIONS.VIEW],
  ),
  node(
    "logistics",
    "driver",
    [MASTERS_PERMISSIONS.VIEW, TRANSPORT_PERMISSIONS.VIEW],
    [
      MASTERS_PERMISSIONS.VIEW,
      TRANSPORT_PERMISSIONS.VIEW,
      TRANSPORT_PERMISSIONS.MANAGE,
    ],
  ),
  // Operations job-type nodes share the same classic jobs pack
  ...[
    "air_export",
    "air_import",
    "sea_fcl_export",
    "sea_fcl_import",
    "sea_lcl_export",
    "sea_lcl_import",
    "land",
    "courier",
    "customs_clearance",
    "nvocc_export",
    "nvocc_import",
    "service_job",
    "warehouse",
  ].map((sub) => node("operations", sub, OPS_READ, OPS_WRITE)),
]);

/** Every classic code that matrix bridging may grant (for cleanup on replace). */
export const ALL_BRIDGED_CLASSIC_CODES: string[] = [
  ...new Set(
    Object.values(MATRIX_TO_CLASSIC_BRIDGE).flatMap((e) => [
      ...e.read,
      ...e.write,
    ]),
  ),
];

export function classicCodesForMatrixAccess(
  module: string,
  submodule: string,
  access: MatrixAccess,
): string[] {
  if (access === "none") return [];
  const entry = MATRIX_TO_CLASSIC_BRIDGE[`${module}.${submodule}`];
  if (!entry) return [];
  return access === "write" ? [...entry.write] : [...entry.read];
}
