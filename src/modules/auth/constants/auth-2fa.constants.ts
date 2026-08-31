/**
 * TOTP 2FA is implemented (service, DTOs, guard) but **unlinked** from the
 * live API until product completion. Flip this to `true` to:
 * - register POST /auth/2fa/setup|enable|disable
 * - restore login TOTP/backup-code checks
 * - restore MandatoryAdminTwoFactorGuard
 */
export const AUTH_2FA_LINKED = true;
