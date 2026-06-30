/**
 * Password Policy
 */

export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_HISTORY_COUNT = 5;

export const PASSWORD_EXPIRY_DAYS = 90;

export const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 30;

export const TEMP_PASSWORD_EXPIRY_HOURS = 24;

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^()_\-+=])[A-Za-z\d@$!%*?#&^()_\-+=]{12,128}$/;

export const PASSWORD_ERROR_MESSAGE =
  'Password must contain uppercase, lowercase, number and special character.';