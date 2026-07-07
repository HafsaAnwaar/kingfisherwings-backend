"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MASTERS_PERMISSIONS = exports.MASTERS_PERMISSION_CONSTANTS = void 0;
exports.MASTERS_PERMISSION_CONSTANTS = {
    MODULE: 'masters',
    ACTIONS: {
        VIEW: 'view',
        CREATE: 'create',
        UPDATE: 'update',
        DELETE: 'delete',
    },
};
exports.MASTERS_PERMISSIONS = {
    VIEW: `${exports.MASTERS_PERMISSION_CONSTANTS.MODULE}.${exports.MASTERS_PERMISSION_CONSTANTS.ACTIONS.VIEW}`,
    CREATE: `${exports.MASTERS_PERMISSION_CONSTANTS.MODULE}.${exports.MASTERS_PERMISSION_CONSTANTS.ACTIONS.CREATE}`,
    UPDATE: `${exports.MASTERS_PERMISSION_CONSTANTS.MODULE}.${exports.MASTERS_PERMISSION_CONSTANTS.ACTIONS.UPDATE}`,
    DELETE: `${exports.MASTERS_PERMISSION_CONSTANTS.MODULE}.${exports.MASTERS_PERMISSION_CONSTANTS.ACTIONS.DELETE}`,
};
//# sourceMappingURL=masters-permission.constants.js.map