export declare enum BulkUserAction {
    ACTIVATE = "ACTIVATE",
    DEACTIVATE = "DEACTIVATE",
    SUSPEND = "SUSPEND",
    DELETE = "DELETE",
    RESTORE = "RESTORE"
}
export declare class BulkUserDto {
    ids: string[];
    action: BulkUserAction;
}
