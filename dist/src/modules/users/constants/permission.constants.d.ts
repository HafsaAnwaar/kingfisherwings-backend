export declare const PERMISSION_CONSTANTS: {
    readonly CODE_REGEX: RegExp;
    readonly MODULE: "users";
    readonly ACTIONS: {
        readonly VIEW: "view";
        readonly CREATE: "create";
        readonly UPDATE: "update";
        readonly DELETE: "delete";
        readonly RESTORE: "restore";
        readonly CHANGE_STATUS: "change_status";
        readonly BULK_ACTION: "bulk_action";
        readonly RESET_PASSWORD: "reset_password";
        readonly MANAGE_2FA: "manage_2fa";
        readonly FORCE_LOGOUT: "force_logout";
    };
};
export declare const USERS_PERMISSIONS: {
    readonly VIEW: "users.view";
    readonly CREATE: "users.create";
    readonly UPDATE: "users.update";
    readonly DELETE: "users.delete";
    readonly RESTORE: "users.restore";
    readonly CHANGE_STATUS: "users.change_status";
    readonly BULK_ACTION: "users.bulk_action";
    readonly RESET_PASSWORD: "users.reset_password";
    readonly MANAGE_2FA: "users.manage_2fa";
    readonly FORCE_LOGOUT: "users.force_logout";
};
