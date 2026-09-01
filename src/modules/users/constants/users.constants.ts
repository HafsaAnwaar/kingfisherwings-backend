/**
 * User Module Constants
 * ---------------------------------------
 * Centralized business constants used throughout
 * the Users module.
 */

export const USER_CODE_PREFIX = "USR";

export const USER_CODE_LENGTH = 6;

export const SYSTEM_USER = "SYSTEM";

export const DEFAULT_LANGUAGE = "en";

export const DEFAULT_TIMEZONE = "UTC";

export const DEFAULT_CURRENCY = "USD";

export const DEFAULT_PAGE = 1;

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;

export const DEFAULT_SORT_FIELD = "created_at";

export const DEFAULT_SORT_ORDER = "desc";

export const USER_SEARCH_FIELDS = [
  "first_name",
  "last_name",
  "full_name",
  "email",
  "mobile",
] as const;

export const USER_SELECT_FIELDS = {
  id: true,
  tenant_id: true,
  first_name: true,
  last_name: true,
  full_name: true,
  email: true,
  mobile: true,
  role: true,
  status: true,
  department_id: true,
  branch_id: true,
  created_at: true,
  updated_at: true,
} as const;

export const USER_SORT_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "created_at",
  "updated_at",
  "last_login_at",
] as const;

// src/modules/users/constants/users.constants.ts

export const USERS_MODULE = "USERS";

export const USER_CACHE_PREFIX = "users";

export const USER_DEFAULT_PAGE = 1;

export const USER_DEFAULT_LIMIT = 20;

export const USER_MAX_LIMIT = 100;

export const PASSWORD_HISTORY_LIMIT = 5;

export const DEFAULT_MAX_CONCURRENT_SESSIONS = 3;

export const ACCOUNT_LOCK_THRESHOLD = 5;

export const ACCOUNT_LOCK_DURATION_MINUTES = 30;

export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_MAX_LENGTH = 128;

export const INVITE_TOKEN_EXPIRY_HOURS = 48;

export const PASSWORD_RESET_EXPIRY_MINUTES = 30;

export const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

export const PASSWORD_EXPIRY_DAYS = 90;

export const USER_DEFAULT_SORT_FIELD = "created_at";

export const USER_DEFAULT_SORT_ORDER = "desc";

export const USER_AVATAR_DIRECTORY = "avatars";

export const USER_EVENTS = {
  CREATED: "user.created",
  UPDATED: "user.updated",
  DELETED: "user.deleted",
  RESTORED: "user.restored",
  PASSWORD_CHANGED: "user.password.changed",
  STATUS_CHANGED: "user.status.changed",
} as const;

export const USERS_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  DEFAULT_SORT: "created_at",
  DEFAULT_ORDER: "desc" as const,

  SORTABLE_FIELDS: [
    "created_at",
    "updated_at",
    "first_name",
    "last_name",
    "email",
    "last_login_at",
    "status",
    "role",
  ] as const,

  DEFAULT_ROLE_CODE: "READ_ONLY",

  DEFAULT_MAX_CONCURRENT_SESSIONS: 3,
  MAX_CONCURRENT_SESSIONS_CEILING: 20,
} as const;
