"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_CATALOG = void 0;
const permission_constants_1 = require("../../modules/users/constants/permission.constants");
const masters_permission_constants_1 = require("../../modules/masters/constants/masters-permission.constants");
const parties_permission_constants_1 = require("../../modules/parties/constants/parties-permission.constants");
exports.ROLE_CATALOG = [
    {
        code: 'TENANT_ADMIN',
        name: 'Tenant Admin',
        permissions: [
            ...Object.values(permission_constants_1.USERS_PERMISSIONS),
            ...Object.values(masters_permission_constants_1.MASTERS_PERMISSIONS),
            ...Object.values(parties_permission_constants_1.PARTIES_PERMISSIONS),
        ],
    },
    {
        code: 'BRANCH_MANAGER',
        name: 'Branch Manager',
        permissions: [
            permission_constants_1.USERS_PERMISSIONS.VIEW,
            permission_constants_1.USERS_PERMISSIONS.CREATE,
            permission_constants_1.USERS_PERMISSIONS.UPDATE,
            permission_constants_1.USERS_PERMISSIONS.CHANGE_STATUS,
            permission_constants_1.USERS_PERMISSIONS.BULK_ACTION,
            masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW,
            masters_permission_constants_1.MASTERS_PERMISSIONS.CREATE,
            masters_permission_constants_1.MASTERS_PERMISSIONS.UPDATE,
            parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW,
            parties_permission_constants_1.PARTIES_PERMISSIONS.CREATE,
            parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE,
        ],
    },
    {
        code: 'OPERATIONS_MANAGER',
        name: 'Operations Staff',
        permissions: [permission_constants_1.USERS_PERMISSIONS.VIEW, permission_constants_1.USERS_PERMISSIONS.UPDATE, masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW, parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW],
    },
    {
        code: 'SALES_MANAGER',
        name: 'Sales',
        permissions: [
            permission_constants_1.USERS_PERMISSIONS.VIEW,
            permission_constants_1.USERS_PERMISSIONS.CREATE,
            masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW,
            parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW,
            parties_permission_constants_1.PARTIES_PERMISSIONS.CREATE,
            parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE,
        ],
    },
    {
        code: 'FINANCE_MANAGER',
        name: 'Finance',
        permissions: [
            permission_constants_1.USERS_PERMISSIONS.VIEW,
            masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW,
            parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW,
            parties_permission_constants_1.PARTIES_PERMISSIONS.MANAGE_CREDIT,
        ],
    },
    {
        code: 'DOCUMENTATION',
        name: 'Documentation',
        permissions: [permission_constants_1.USERS_PERMISSIONS.VIEW, masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW, parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW],
    },
    {
        code: 'CUSTOMER_SUPPORT',
        name: 'Customer Support',
        permissions: [permission_constants_1.USERS_PERMISSIONS.VIEW, masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW, parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW],
    },
    {
        code: 'WAREHOUSE_STAFF',
        name: 'Warehouse',
        permissions: [permission_constants_1.USERS_PERMISSIONS.VIEW, masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW, parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW],
    },
    {
        code: 'DRIVER',
        name: 'Driver',
        permissions: [masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW],
    },
    {
        code: 'READ_ONLY',
        name: 'Read Only',
        isDefault: true,
        permissions: [permission_constants_1.USERS_PERMISSIONS.VIEW, masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW, parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW],
    },
];
//# sourceMappingURL=role-catalog.js.map