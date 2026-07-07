export declare class AuditHelper {
    static buildCreateAudit(actorId?: string): {
        created_by: string | undefined;
        updated_by: string | undefined;
    };
    static buildUpdateAudit(actorId?: string): {
        updated_by: string | undefined;
    };
    static buildDeleteAudit(actorId?: string): {
        deleted_at: Date;
        updated_by: string | undefined;
    };
    static buildRestoreAudit(actorId?: string): {
        deleted_at: null;
        updated_by: string | undefined;
    };
}
