import { PERMISSION_CONSTANTS as USERS_PERMISSION_CONSTANTS } from '../../modules/users/constants/permission.constants';
import { MASTERS_PERMISSION_CONSTANTS } from '../../modules/masters/constants/masters-permission.constants';
import { PARTIES_PERMISSION_CONSTANTS } from '../../modules/parties/constants/parties-permission.constants';
import { QUOTATIONS_PERMISSION_CONSTANTS } from '../../modules/quotations/constants/quotations-permission.constants';
import { JOBS_PERMISSION_CONSTANTS } from '../../modules/jobs/constants/jobs-permission.constants';
import { AWB_STOCK_PERMISSION_CONSTANTS } from '../../modules/awb-stock/constants/awb-stock-permission.constants';
import { SEARCH_PERMISSION_CONSTANTS } from '../../modules/search/constants/search-permission.constants';
import { INVOICES_PERMISSION_CONSTANTS } from '../../modules/invoices/constants/invoices-permission.constants';
import { GL_PERMISSION_CONSTANTS } from '../../modules/gl/constants/gl-permission.constants';
import { PORTAL_PERMISSION_CONSTANTS } from '../../modules/portal/constants/portal-permission.constants';
import { VENDOR_PERMISSION_CONSTANTS } from '../../modules/vendor/constants/vendor-permission.constants';
import { CRM_PERMISSION_CONSTANTS } from '../../modules/crm/constants/crm-permission.constants';
import { HR_PERMISSION_CONSTANTS } from '../../modules/hr/constants/hr-permission.constants';
import { WMS_PERMISSION_CONSTANTS } from '../../modules/wms/constants/wms-permission.constants';
import { TRANSPORT_PERMISSION_CONSTANTS } from '../../modules/transport/constants/transport-permission.constants';
import { NVOCC_PERMISSION_CONSTANTS } from '../../modules/nvocc/constants/nvocc-permission.constants';
import { NOTIFICATIONS_PERMISSION_CONSTANTS } from '../../modules/notifications/constants/notifications-permission.constants';

export interface PermissionCatalogEntry {
  module: string;
  action: string;
  description: string;
}

/**
 * The full set of permission codes that exist in this system, across
 * all modules. New modules append their own action list here as they're
 * built (see USERS_PERMISSION_CONSTANTS.ACTIONS for the pattern).
 *
 * TenantsService.create() seeds a tenant-scoped Permission row for
 * every entry here when a new tenant is created, since Permission is
 * tenant-scoped (@@unique([tenant_id, module, action])) rather than
 * global — each tenant gets its own copy of the catalog.
 */
export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
  ...Object.values(USERS_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: USERS_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${USERS_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(MASTERS_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: MASTERS_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${MASTERS_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(PARTIES_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: PARTIES_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${PARTIES_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(QUOTATIONS_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: QUOTATIONS_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${QUOTATIONS_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(JOBS_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: JOBS_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${JOBS_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(AWB_STOCK_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: AWB_STOCK_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${AWB_STOCK_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(SEARCH_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: SEARCH_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${SEARCH_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(INVOICES_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: INVOICES_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${INVOICES_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(GL_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: GL_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${GL_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(PORTAL_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: PORTAL_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${PORTAL_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(VENDOR_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: VENDOR_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${VENDOR_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(CRM_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: CRM_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${CRM_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(HR_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: HR_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${HR_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(WMS_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: WMS_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${WMS_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(TRANSPORT_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: TRANSPORT_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${TRANSPORT_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(NVOCC_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: NVOCC_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${NVOCC_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
  ...Object.values(NOTIFICATIONS_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
    module: NOTIFICATIONS_PERMISSION_CONSTANTS.MODULE,
    action,
    description: `${NOTIFICATIONS_PERMISSION_CONSTANTS.MODULE}.${action}`,
  })),
];
