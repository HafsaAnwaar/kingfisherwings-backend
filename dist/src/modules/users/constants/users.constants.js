"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USERS_CONSTANTS = exports.USER_EVENTS = exports.USER_AVATAR_DIRECTORY = exports.USER_DEFAULT_SORT_ORDER = exports.USER_DEFAULT_SORT_FIELD = exports.PASSWORD_EXPIRY_DAYS = exports.EMAIL_VERIFICATION_EXPIRY_HOURS = exports.PASSWORD_RESET_EXPIRY_MINUTES = exports.INVITE_TOKEN_EXPIRY_HOURS = exports.PASSWORD_MAX_LENGTH = exports.PASSWORD_MIN_LENGTH = exports.ACCOUNT_LOCK_DURATION_MINUTES = exports.ACCOUNT_LOCK_THRESHOLD = exports.DEFAULT_MAX_CONCURRENT_SESSIONS = exports.PASSWORD_HISTORY_LIMIT = exports.USER_MAX_LIMIT = exports.USER_DEFAULT_LIMIT = exports.USER_DEFAULT_PAGE = exports.USER_CACHE_PREFIX = exports.USERS_MODULE = exports.USER_SORT_FIELDS = exports.USER_SELECT_FIELDS = exports.USER_SEARCH_FIELDS = exports.DEFAULT_SORT_ORDER = exports.DEFAULT_SORT_FIELD = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.DEFAULT_PAGE = exports.DEFAULT_CURRENCY = exports.DEFAULT_TIMEZONE = exports.DEFAULT_LANGUAGE = exports.SYSTEM_USER = exports.USER_CODE_LENGTH = exports.USER_CODE_PREFIX = void 0;
exports.USER_CODE_PREFIX = 'USR';
exports.USER_CODE_LENGTH = 6;
exports.SYSTEM_USER = 'SYSTEM';
exports.DEFAULT_LANGUAGE = 'en';
exports.DEFAULT_TIMEZONE = 'UTC';
exports.DEFAULT_CURRENCY = 'USD';
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_SORT_FIELD = 'created_at';
exports.DEFAULT_SORT_ORDER = 'desc';
exports.USER_SEARCH_FIELDS = [
    'employee_code',
    'first_name',
    'last_name',
    'full_name',
    'email',
    'mobile',
];
exports.USER_SELECT_FIELDS = {
    id: true,
    tenant_id: true,
    employee_code: true,
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
};
exports.USER_SORT_FIELDS = [
    'employee_code',
    'first_name',
    'last_name',
    'email',
    'created_at',
    'updated_at',
    'last_login_at',
];
exports.USERS_MODULE = 'USERS';
exports.USER_CACHE_PREFIX = 'users';
exports.USER_DEFAULT_PAGE = 1;
exports.USER_DEFAULT_LIMIT = 20;
exports.USER_MAX_LIMIT = 100;
exports.PASSWORD_HISTORY_LIMIT = 5;
exports.DEFAULT_MAX_CONCURRENT_SESSIONS = 3;
exports.ACCOUNT_LOCK_THRESHOLD = 5;
exports.ACCOUNT_LOCK_DURATION_MINUTES = 30;
exports.PASSWORD_MIN_LENGTH = 12;
exports.PASSWORD_MAX_LENGTH = 128;
exports.INVITE_TOKEN_EXPIRY_HOURS = 48;
exports.PASSWORD_RESET_EXPIRY_MINUTES = 30;
exports.EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
exports.PASSWORD_EXPIRY_DAYS = 90;
exports.USER_DEFAULT_SORT_FIELD = 'created_at';
exports.USER_DEFAULT_SORT_ORDER = 'desc';
exports.USER_AVATAR_DIRECTORY = 'avatars';
exports.USER_EVENTS = {
    CREATED: 'user.created',
    UPDATED: 'user.updated',
    DELETED: 'user.deleted',
    RESTORED: 'user.restored',
    PASSWORD_CHANGED: 'user.password.changed',
    STATUS_CHANGED: 'user.status.changed',
};
exports.USERS_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_SORT: 'created_at',
    DEFAULT_ORDER: 'desc',
    SORTABLE_FIELDS: [
        'created_at',
        'updated_at',
        'first_name',
        'last_name',
        'email',
        'last_login_at',
        'status',
        'role',
    ],
    DEFAULT_ROLE_CODE: 'READ_ONLY',
    DEFAULT_MAX_CONCURRENT_SESSIONS: 3,
    MAX_CONCURRENT_SESSIONS_CEILING: 20,
};
//# sourceMappingURL=users.constants.js.map