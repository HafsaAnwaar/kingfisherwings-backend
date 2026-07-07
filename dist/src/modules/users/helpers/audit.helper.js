"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditHelper = void 0;
class AuditHelper {
    static buildCreateAudit(actorId) {
        return {
            created_by: actorId,
            updated_by: actorId,
        };
    }
    static buildUpdateAudit(actorId) {
        return {
            updated_by: actorId,
        };
    }
    static buildDeleteAudit(actorId) {
        return {
            deleted_at: new Date(),
            updated_by: actorId,
        };
    }
    static buildRestoreAudit(actorId) {
        return {
            deleted_at: null,
            updated_by: actorId,
        };
    }
}
exports.AuditHelper = AuditHelper;
//# sourceMappingURL=audit.helper.js.map