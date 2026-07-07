"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = isSuperAdmin;
const principal_util_1 = require("../../../common/utils/principal.util");
function isSuperAdmin(principal) {
    return (0, principal_util_1.isSuperAdminPrincipal)(principal);
}
//# sourceMappingURL=request-with-user.interface.js.map