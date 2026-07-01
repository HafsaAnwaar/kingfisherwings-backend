/**
 * Builds the audit-field slices for write operations so every mutation
 * across the module stamps created_by / updated_by / deleted_at the
 * same way.
 */
export class AuditHelper {
  static buildCreateAudit(actorId?: string) {
    return {
      created_by: actorId,
      updated_by: actorId,
    };
  }

  static buildUpdateAudit(actorId?: string) {
    return {
      updated_by: actorId,
    };
  }

  static buildDeleteAudit(actorId?: string) {
    return {
      deleted_at: new Date(),
      updated_by: actorId,
    };
  }

  static buildRestoreAudit(actorId?: string) {
    return {
      deleted_at: null,
      updated_by: actorId,
    };
  }
}
