/**
 * Shared rate limit for login / forgot / reset / set-password style auth
 * across staff ERP, customer portal, and vendor portal.
 * 3 attempts per minute, tracked per user (tenant + email) via AppThrottlerGuard.
 */
export const AUTH_THROTTLE = {
  default: { limit: 3, ttl: 60_000 },
} as const;
