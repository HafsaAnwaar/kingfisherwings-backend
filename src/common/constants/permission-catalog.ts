import { PERMISSION_CONSTANTS as USERS_PERMISSION_CONSTANTS } from '../../modules/users/constants/permission.constants';
import { MASTERS_PERMISSION_CONSTANTS } from '../../modules/masters/constants/masters-permission.constants';

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
];
