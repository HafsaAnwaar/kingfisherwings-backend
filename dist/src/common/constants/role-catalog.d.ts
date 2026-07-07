export interface RoleCatalogEntry {
    code: string;
    name: string;
    isDefault?: boolean;
    permissions: string[];
}
export declare const ROLE_CATALOG: RoleCatalogEntry[];
