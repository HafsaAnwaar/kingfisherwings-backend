"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USERS_PERMISSIONS = exports.PERMISSION_CONSTANTS = void 0;
exports.PERMISSION_CONSTANTS = {
    CODE_REGEX: /^[a-z][a-z0-9_]{1,49}\.[a-z][a-z0-9_]{1,49}$/,
    MODULE: 'users',
    ACTIONS: {
        VIEW: 'view',
        CREATE: 'create',
        UPDATE: 'update',
        DELETE: 'delete',
        RESTORE: 'restore',
        CHANGE_STATUS: 'change_status',
        BULK_ACTION: 'bulk_action',
        RESET_PASSWORD: 'reset_password',
        MANAGE_2FA: 'manage_2fa',
        FORCE_LOGOUT: 'force_logout',
    },
};
exports.USERS_PERMISSIONS = {
    VIEW: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.VIEW}`,
    CREATE: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.CREATE}`,
    UPDATE: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.UPDATE}`,
    DELETE: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.DELETE}`,
    RESTORE: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.RESTORE}`,
    CHANGE_STATUS: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.CHANGE_STATUS}`,
    BULK_ACTION: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.BULK_ACTION}`,
    RESET_PASSWORD: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.RESET_PASSWORD}`,
    MANAGE_2FA: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.MANAGE_2FA}`,
    FORCE_LOGOUT: `${exports.PERMISSION_CONSTANTS.MODULE}.${exports.PERMISSION_CONSTANTS.ACTIONS.FORCE_LOGOUT}`,
};
//# sourceMappingURL=permission.constants.js.map