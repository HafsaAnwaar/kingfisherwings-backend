/**
 * User Module Constants
 * ---------------------------------------
 * Centralized business constants used throughout
 * the Users module.
 */

export const USER_MODULE = 'USERS';

export const USER_CODE_PREFIX = 'USR';

export const USER_CODE_LENGTH = 6;

export const SYSTEM_USER = 'SYSTEM';

export const DEFAULT_LANGUAGE = 'en';

export const DEFAULT_TIMEZONE = 'UTC';

export const DEFAULT_CURRENCY = 'USD';

export const DEFAULT_PAGE = 1;

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;

export const DEFAULT_SORT_FIELD = 'created_at';

export const DEFAULT_SORT_ORDER = 'desc';

export const USER_SEARCH_FIELDS = [
  'employee_code',
  'first_name',
  'last_name',
  'full_name',
  'email',
  'mobile',
] as const;

export const USER_SELECT_FIELDS = {
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
} as const;

export const USER_SORT_FIELDS = [
  'employee_code',
  'first_name',
  'last_name',
  'email',
  'created_at',
  'updated_at',
  'last_login_at',
] as const;