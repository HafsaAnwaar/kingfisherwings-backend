export interface TenantContextStore {
    tenantId: string | null;
}
export declare class TenantContextStorage {
    private readonly storage;
    run<T>(tenantId: string | null, callback: () => T): T;
    getTenantId(): string | null;
}
