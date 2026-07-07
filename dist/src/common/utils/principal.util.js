"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdminPrincipal = isSuperAdminPrincipal;
function isSuperAdminPrincipal(principal) {
    return (!!principal &&
        typeof principal === 'object' &&
        !('tenantId' in principal));
}
//# sourceMappingURL=principal.util.js.map