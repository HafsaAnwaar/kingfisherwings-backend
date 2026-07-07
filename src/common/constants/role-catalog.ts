import { USERS_PERMISSIONS } from '../../modules/users/constants/permission.constants';
import { MASTERS_PERMISSIONS } from '../../modules/masters/constants/masters-permission.constants';
import { PARTIES_PERMISSIONS } from '../../modules/parties/constants/parties-permission.constants';

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
    code: 'TENANT_ADMIN',
    name: 'Tenant Admin',
    permissions: [
      ...Object.values(USERS_PERMISSIONS),
      ...Object.values(MASTERS_PERMISSIONS),
      ...Object.values(PARTIES_PERMISSIONS),
    ],
  },
  {
    code: 'BRANCH_MANAGER',
    name: 'Branch Manager',
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
    ],
  },
  {
    code: 'OPERATIONS_MANAGER',
    name: 'Operations Staff',
    permissions: [USERS_PERMISSIONS.VIEW, USERS_PERMISSIONS.UPDATE, MASTERS_PERMISSIONS.VIEW, PARTIES_PERMISSIONS.VIEW],
  },
  {
    code: 'SALES_MANAGER',
    name: 'Sales',
    permissions: [
      USERS_PERMISSIONS.VIEW,
      USERS_PERMISSIONS.CREATE,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.CREATE,
      PARTIES_PERMISSIONS.UPDATE,
    ],
  },
  {
    code: 'FINANCE_MANAGER',
    name: 'Finance',
    permissions: [
      USERS_PERMISSIONS.VIEW,
      MASTERS_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.VIEW,
      PARTIES_PERMISSIONS.MANAGE_CREDIT,
    ],
  },
  {
    code: 'DOCUMENTATION',
    name: 'Documentation',
    permissions: [USERS_PERMISSIONS.VIEW, MASTERS_PERMISSIONS.VIEW, PARTIES_PERMISSIONS.VIEW],
  },
  {
    code: 'CUSTOMER_SUPPORT',
    name: 'Customer Support',
    permissions: [USERS_PERMISSIONS.VIEW, MASTERS_PERMISSIONS.VIEW, PARTIES_PERMISSIONS.VIEW],
  },
  {
    code: 'WAREHOUSE_STAFF',
    name: 'Warehouse',
    permissions: [USERS_PERMISSIONS.VIEW, MASTERS_PERMISSIONS.VIEW, PARTIES_PERMISSIONS.VIEW],
  },
  {
    code: 'DRIVER',
    name: 'Driver',
    permissions: [MASTERS_PERMISSIONS.VIEW],
  },
  {
    code: 'READ_ONLY',
    name: 'Read Only',
    isDefault: true,
    permissions: [USERS_PERMISSIONS.VIEW, MASTERS_PERMISSIONS.VIEW, PARTIES_PERMISSIONS.VIEW],
  },
];
