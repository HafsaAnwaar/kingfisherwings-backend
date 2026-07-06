/**
 * Builds the audit-field slices for write operations so every mutation
 * across the module stamps created_by / updated_by / deleted_at the
 * same way.
 */
export class AuditHelper {
  /**
   * Generic fallback for models with a simple loose `created_by`/
   * `updated_by` pair. User no longer uses this for creation — it has
   * three typed, FK-enforced creator columns instead (see
   * created_by_user_id / created_by_tenant_id / created_by_super_admin_id
   * on the User model) — but this remains available for future modules
   * that don't need that distinction.
   */
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
