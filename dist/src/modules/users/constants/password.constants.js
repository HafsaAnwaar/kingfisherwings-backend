"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_CONSTANTS = void 0;
exports.PASSWORD_CONSTANTS = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    STRENGTH_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
    TEMP_PASSWORD_LENGTH: 14,
    HISTORY_LIMIT: 5,
    EXPIRY_DAYS: 90,
    EXPIRY_WARNING_DAYS: 7,
    RESET_TOKEN_BYTES: 32,
    RESET_TOKEN_TTL_MINUTES: 60,
    INVITE_TOKEN_BYTES: 32,
    INVITE_TOKEN_TTL_HOURS: 72,
    MAX_FAILED_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 30,
    TWO_FACTOR_BACKUP_CODE_COUNT: 10,
    TWO_FACTOR_BACKUP_CODE_LENGTH: 10,
    ARGON2: {
        MEMORY_COST: 65536,
        TIME_COST: 3,
        PARALLELISM: 1,
    },
};
//# sourceMappingURL=password.constants.js.map