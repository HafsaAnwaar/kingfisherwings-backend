import { USERS_PERMISSIONS } from "../../modules/users/constants/permission.constants";
import { MASTERS_PERMISSIONS } from "../../modules/masters/constants/masters-permission.constants";
import { PARTIES_PERMISSIONS } from "../../modules/parties/constants/parties-permission.constants";
import { QUOTATIONS_PERMISSIONS } from "../../modules/quotations/constants/quotations-permission.constants";
import { JOBS_PERMISSIONS } from "../../modules/jobs/constants/jobs-permission.constants";
import { AWB_STOCK_PERMISSIONS } from "../../modules/awb-stock/constants/awb-stock-permission.constants";
import { SEARCH_PERMISSIONS } from "../../modules/search/constants/search-permission.constants";
import { INVOICES_PERMISSIONS } from "../../modules/invoices/constants/invoices-permission.constants";
import { GL_PERMISSIONS } from "../../modules/gl/constants/gl-permission.constants";
import { PORTAL_PERMISSIONS } from "../../modules/portal/constants/portal-permission.constants";
import { VENDOR_PERMISSIONS } from "../../modules/vendor/constants/vendor-permission.constants";
import { CRM_PERMISSIONS } from "../../modules/crm/constants/crm-permission.constants";
import { HR_PERMISSIONS } from "../../modules/hr/constants/hr-permission.constants";
import { WMS_PERMISSIONS } from "../../modules/wms/constants/wms-permission.constants";
import { TRANSPORT_PERMISSIONS } from "../../modules/transport/constants/transport-permission.constants";
import { NVOCC_PERMISSIONS } from "../../modules/nvocc/constants/nvocc-permission.constants";
import { NOTIFICATIONS_PERMISSIONS } from "../../modules/notifications/constants/notifications-permission.constants";
import { DOCUMENTATION_PERMISSIONS } from "../../modules/documentation/constants/documentation-permission.constants";

export interface RoleCatalogEntry {
  /** Matches a UserRole enum value — kept 1:1 so User.role and the Role row it's assigned agree. */
  code: string;
  name: string;
  isDefault?: boolean;
  permissions: string[];
}

/**
 * The 11 named roles from the Auth spec, minus SUPER_ADMIN (that's the
 * separate SuperAdmin table/principal, never a tenant-scoped Role row).
 * TenantsService.create() seeds all 10 of these for every new tenant.
 *
 * Permission subsets are necessarily narrow right now — only the Users
 * module has permissions in the catalog, since no other domain module
 * (customers, shipments, invoices, etc.) is built yet. Each role gets
 * what's plausible for that job function today; as new modules add
 * their own permissions to PERMISSION_CATALOG, these subsets should
 * grow alongside them.
 */
export const ROLE_CATALOG: RoleCatalogEntry[] = [
  {
    code: "TENANT_ADMIN",
    name: "Tenant Admin",
    permissions: [
      ...Object.values(USERS_PERMISSIONS),
      ...Object.values(MASTERS_PERMISSIONS),
      ...Object.values(PARTIES_PERMISSIONS),
      ...Object.values(QUOTATIONS_PERMISSIONS),
      ...Object.values(JOBS_PERMISSIONS),
      ...Object.values(AWB_STOCK_PERMISSIONS),
      ...Object.values(SEARCH_PERMISSIONS),
      ...Object.values(INVOICES_PERMISSIONS),
      ...Object.values(GL_PERMISSIONS),
      ...Object.values(PORTAL_PERMISSIONS),
      ...Object.values(VENDOR_PERMISSIONS),
      ...Object.values(CRM_PERMISSIONS),
      ...Object.values(HR_PERMISSIONS),
      ...Object.values(WMS_PERMISSIONS),
      ...Object.values(TRANSPORT_PERMISSIONS),
      ...Object.values(NVOCC_PERMISSIONS),
      ...Object.values(DOCUMENTATION_PERMISSIONS),
      ...Object.values(NOTIFICATIONS_PERMISSIONS),
    ],
  },
  {
    code: "BRANCH_MANAGER",
    name: "Branch Manager",
    permissions: [
      USERS_PERMISSIONS.VIEW,
      USERS_PERMISSIONS.CREATE,
      USERS_PERMISSIONS.UPDATE,
      USERS_PERMISSIONS.CHANGE_STATUS,
      USERS_PERMISSIONS.BULK_ACTION,
      MASTERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.CREATE,
      MASTERS_PERMISSIONS.UPDATE,
      PARTIES_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.CREATE,
      PARTIES_PERMISSIONS.UPDATE,
      PORTAL_PERMISSIONS.VIEW_USERS,
      PORTAL_PERMISSIONS.MANAGE_USERS,
      PORTAL_PERMISSIONS.VIEW_PERMISSIONS,
      PORTAL_PERMISSIONS.MANAGE_PERMISSIONS,
      PORTAL_PERMISSIONS.VIEW_MESSAGES,
      PORTAL_PERMISSIONS.MANAGE_DISPUTES,
      PORTAL_PERMISSIONS.MANAGE_CREDIT,
      QUOTATIONS_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.APPROVE,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.CREATE,
      JOBS_PERMISSIONS.UPDATE,
      JOBS_PERMISSIONS.CLOSE,
      JOBS_PERMISSIONS.VIEW_GP,
      AWB_STOCK_PERMISSIONS.VIEW,
      AWB_STOCK_PERMISSIONS.ALLOCATE,
      SEARCH_PERMISSIONS.VIEW,
      NOTIFICATIONS_PERMISSIONS.VIEW,
      HR_PERMISSIONS.VIEW,
      HR_PERMISSIONS.APPROVE_LEAVE,
      WMS_PERMISSIONS.VIEW,
      WMS_PERMISSIONS.VIEW_REPORTS,
      WMS_PERMISSIONS.MANAGE_GRN,
      WMS_PERMISSIONS.MANAGE_GDO,
      WMS_PERMISSIONS.MANAGE_STOCK,
      WMS_PERMISSIONS.MANAGE_TRANSFERS,
      TRANSPORT_PERMISSIONS.VIEW,
      TRANSPORT_PERMISSIONS.MANAGE,
      NVOCC_PERMISSIONS.VIEW,
      NVOCC_PERMISSIONS.MANAGE,
    ],
  },
  {
    code: "HR_MANAGER",
    name: "HR Manager",
    permissions: [
      ...Object.values(HR_PERMISSIONS),
      NOTIFICATIONS_PERMISSIONS.VIEW,
      USERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.VIEW,
    ],
  },
  {
    code: "OPERATIONS_MANAGER",
    name: "Operations Staff",
    permissions: [
      USERS_PERMISSIONS.VIEW,
      USERS_PERMISSIONS.UPDATE,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.CREATE,
      JOBS_PERMISSIONS.UPDATE,
      JOBS_PERMISSIONS.CLOSE,
      AWB_STOCK_PERMISSIONS.VIEW,
      AWB_STOCK_PERMISSIONS.ALLOCATE,
      AWB_STOCK_PERMISSIONS.VOID,
      SEARCH_PERMISSIONS.VIEW,
      NOTIFICATIONS_PERMISSIONS.VIEW,
      WMS_PERMISSIONS.VIEW,
      WMS_PERMISSIONS.VIEW_REPORTS,
      WMS_PERMISSIONS.MANAGE_ASN,
      WMS_PERMISSIONS.MANAGE_GRN,
      WMS_PERMISSIONS.MANAGE_GDO,
      WMS_PERMISSIONS.MANAGE_STOCK,
      WMS_PERMISSIONS.MANAGE_TRANSFERS,
      WMS_PERMISSIONS.MANAGE_STORAGE,
      TRANSPORT_PERMISSIONS.VIEW,
      TRANSPORT_PERMISSIONS.MANAGE,
      NVOCC_PERMISSIONS.VIEW,
      NVOCC_PERMISSIONS.MANAGE,
    ],
  },
  {
    code: "SALES_MANAGER",
    name: "Sales",
    permissions: [
      USERS_PERMISSIONS.VIEW,
      USERS_PERMISSIONS.CREATE,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.CREATE,
      PARTIES_PERMISSIONS.UPDATE,
      PORTAL_PERMISSIONS.VIEW_USERS,
      PORTAL_PERMISSIONS.MANAGE_USERS,
      PORTAL_PERMISSIONS.VIEW_PERMISSIONS,
      PORTAL_PERMISSIONS.MANAGE_PERMISSIONS,
      PORTAL_PERMISSIONS.VIEW_MESSAGES,
      ...Object.values(CRM_PERMISSIONS),
      QUOTATIONS_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.CREATE,
      QUOTATIONS_PERMISSIONS.UPDATE,
      QUOTATIONS_PERMISSIONS.SUBMIT,
      QUOTATIONS_PERMISSIONS.SEND,
      QUOTATIONS_PERMISSIONS.CLOSE,
      JOBS_PERMISSIONS.VIEW,
      SEARCH_PERMISSIONS.VIEW,
      NOTIFICATIONS_PERMISSIONS.VIEW,
      NVOCC_PERMISSIONS.VIEW,
      NVOCC_PERMISSIONS.MANAGE,
    ],
  },
  {
    code: "SALES_EXECUTIVE",
    name: "Sales Executive",
    permissions: [
      USERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.CREATE,
      PARTIES_PERMISSIONS.UPDATE,
      ...Object.values(CRM_PERMISSIONS),
      QUOTATIONS_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.CREATE,
      QUOTATIONS_PERMISSIONS.UPDATE,
      QUOTATIONS_PERMISSIONS.SUBMIT,
      QUOTATIONS_PERMISSIONS.SEND,
      JOBS_PERMISSIONS.VIEW,
      SEARCH_PERMISSIONS.VIEW,
      NOTIFICATIONS_PERMISSIONS.VIEW,
    ],
  },
  {
    code: "FINANCE_MANAGER",
    name: "Finance",
    permissions: [
      USERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.MANAGE_CREDIT,
      PORTAL_PERMISSIONS.VIEW_MESSAGES,
      PORTAL_PERMISSIONS.MANAGE_DISPUTES,
      PORTAL_PERMISSIONS.MANAGE_CREDIT,
      VENDOR_PERMISSIONS.VIEW_USERS,
      VENDOR_PERMISSIONS.MANAGE_USERS,
      VENDOR_PERMISSIONS.VIEW_PERMISSIONS,
      VENDOR_PERMISSIONS.MANAGE_PERMISSIONS,
      VENDOR_PERMISSIONS.MANAGE_DISPUTES,
      QUOTATIONS_PERMISSIONS.VIEW,
      ...Object.values(INVOICES_PERMISSIONS),
      ...Object.values(GL_PERMISSIONS),
      HR_PERMISSIONS.VIEW,
      HR_PERMISSIONS.MANAGE_PAYROLL,
      WMS_PERMISSIONS.VIEW,
      WMS_PERMISSIONS.MANAGE_STORAGE,
      WMS_PERMISSIONS.VIEW_REPORTS,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.VIEW_GP,
      SEARCH_PERMISSIONS.VIEW,
      NOTIFICATIONS_PERMISSIONS.VIEW,
    ],
  },
  {
    code: "DOCUMENTATION",
    name: "Documentation",
    permissions: [
      USERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.CREATE,
      JOBS_PERMISSIONS.UPDATE,
      JOBS_PERMISSIONS.CLOSE,
      AWB_STOCK_PERMISSIONS.VIEW,
      AWB_STOCK_PERMISSIONS.ALLOCATE,
      SEARCH_PERMISSIONS.VIEW,
      NOTIFICATIONS_PERMISSIONS.VIEW,
      TRANSPORT_PERMISSIONS.VIEW,
      TRANSPORT_PERMISSIONS.MANAGE,
      NVOCC_PERMISSIONS.VIEW,
      NVOCC_PERMISSIONS.MANAGE,
      DOCUMENTATION_PERMISSIONS.READ,
      DOCUMENTATION_PERMISSIONS.MANAGE,
      DOCUMENTATION_PERMISSIONS.EDI_READ,
      DOCUMENTATION_PERMISSIONS.EDI_SUBMIT,
      DOCUMENTATION_PERMISSIONS.UPLOAD,
      DOCUMENTATION_PERMISSIONS.MPCI,
      INVOICES_PERMISSIONS.VIEW,
      GL_PERMISSIONS.VIEW,
    ],
  },
  {
    code: "CUSTOMER_SUPPORT",
    name: "Customer Support",
    permissions: [
      USERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      PORTAL_PERMISSIONS.VIEW_USERS,
      PORTAL_PERMISSIONS.MANAGE_USERS,
      PORTAL_PERMISSIONS.VIEW_PERMISSIONS,
      PORTAL_PERMISSIONS.MANAGE_PERMISSIONS,
      PORTAL_PERMISSIONS.VIEW_MESSAGES,
      PORTAL_PERMISSIONS.MANAGE_DISPUTES,
      QUOTATIONS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.CREATE,
      JOBS_PERMISSIONS.UPDATE,
      JOBS_PERMISSIONS.CLOSE,
      SEARCH_PERMISSIONS.VIEW,
      NOTIFICATIONS_PERMISSIONS.VIEW,
    ],
  },
  {
    code: "WAREHOUSE_STAFF",
    name: "Warehouse",
    permissions: [
      USERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.CREATE,
      JOBS_PERMISSIONS.UPDATE,
      JOBS_PERMISSIONS.CLOSE,
      NOTIFICATIONS_PERMISSIONS.VIEW,
      ...Object.values(WMS_PERMISSIONS),
    ],
  },
  {
    code: "DRIVER",
    name: "Driver",
    permissions: [MASTERS_PERMISSIONS.VIEW],
  },
  {
    code: "READ_ONLY",
    name: "Read Only",
    isDefault: true,
    permissions: [
      USERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      QUOTATIONS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.VIEW,
      JOBS_PERMISSIONS.CREATE,
      JOBS_PERMISSIONS.UPDATE,
      JOBS_PERMISSIONS.CLOSE,
      SEARCH_PERMISSIONS.VIEW,
    ],
  },
];
