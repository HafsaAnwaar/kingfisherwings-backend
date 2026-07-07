export declare const PASSWORD_CONSTANTS: {
    readonly MIN_LENGTH: 8;
    readonly MAX_LENGTH: 128;
    readonly STRENGTH_REGEX: RegExp;
    readonly TEMP_PASSWORD_LENGTH: 14;
    readonly HISTORY_LIMIT: 5;
    readonly EXPIRY_DAYS: 90;
    readonly EXPIRY_WARNING_DAYS: 7;
    readonly RESET_TOKEN_BYTES: 32;
    readonly RESET_TOKEN_TTL_MINUTES: 60;
    readonly INVITE_TOKEN_BYTES: 32;
    readonly INVITE_TOKEN_TTL_HOURS: 72;
    readonly MAX_FAILED_LOGIN_ATTEMPTS: 5;
    readonly LOCKOUT_DURATION_MINUTES: 30;
    readonly TWO_FACTOR_BACKUP_CODE_COUNT: 10;
    readonly TWO_FACTOR_BACKUP_CODE_LENGTH: 10;
    readonly ARGON2: {
        readonly MEMORY_COST: 65536;
        readonly TIME_COST: 3;
        readonly PARALLELISM: 1;
    };
};
