"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_CATALOG = void 0;
const permission_constants_1 = require("../../modules/users/constants/permission.constants");
const masters_permission_constants_1 = require("../../modules/masters/constants/masters-permission.constants");
const parties_permission_constants_1 = require("../../modules/parties/constants/parties-permission.constants");
exports.PERMISSION_CATALOG = [
    ...Object.values(permission_constants_1.PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
        module: permission_constants_1.PERMISSION_CONSTANTS.MODULE,
        action,
        description: `${permission_constants_1.PERMISSION_CONSTANTS.MODULE}.${action}`,
    })),
    ...Object.values(masters_permission_constants_1.MASTERS_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
        module: masters_permission_constants_1.MASTERS_PERMISSION_CONSTANTS.MODULE,
        action,
        description: `${masters_permission_constants_1.MASTERS_PERMISSION_CONSTANTS.MODULE}.${action}`,
    })),
    ...Object.values(parties_permission_constants_1.PARTIES_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
        module: parties_permission_constants_1.PARTIES_PERMISSION_CONSTANTS.MODULE,
        action,
        description: `${parties_permission_constants_1.PARTIES_PERMISSION_CONSTANTS.MODULE}.${action}`,
    })),
];
//# sourceMappingURL=permission-catalog.js.map