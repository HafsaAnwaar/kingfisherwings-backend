"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTenantContextQuery = setTenantContextQuery;
const client_1 = require("@prisma/client");
function setTenantContextQuery(tenantId) {
    return client_1.Prisma.sql `SELECT set_tenant_context(${tenantId}::uuid)`;
}
//# sourceMappingURL=rls.util.js.map