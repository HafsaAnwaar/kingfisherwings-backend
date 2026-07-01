/**
 * Centralized password policy. Referenced by validators, helpers,
 * and the service layer so the policy is defined in exactly one place.
 */
export const PASSWORD_CONSTANTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,

  // At least one lowercase, one uppercase, one digit, one special character.
  STRENGTH_REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,

  TEMP_PASSWORD_LENGTH: 14,

  // How many previous password hashes to check to block reuse.
  HISTORY_LIMIT: 5,

  // Days until a password must be changed again. Null-able business rule;
  // 0 disables expiry enforcement.
  EXPIRY_DAYS: 90,

  // Days before expiry to start warning the user (surfaced by the client).
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
} as const;
