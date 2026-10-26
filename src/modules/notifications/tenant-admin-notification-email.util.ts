/**
 * In-process dedupe so staff-activity emails and Tenant Admin notification
 * copies do not double-send for the same entity within a short window.
 */

const DEDUPE_TTL_MS = 90_000;
const recentKeys = new Map<string, number>();

function prune(now: number) {
  for (const [k, ts] of recentKeys) {
    if (now - ts > DEDUPE_TTL_MS) recentKeys.delete(k);
  }
}

export function tenantAdminNotificationEmailsEnabled(): boolean {
  return process.env.TENANT_ADMIN_NOTIFICATION_EMAILS !== "false";
}

export function adminEmailDedupeKey(
  tenantId: string,
  entityId: string | null | undefined,
  title?: string,
): string {
  const minute = Math.floor(Date.now() / 60_000);
  // Prefer entity-level dedupe so staff-activity + notification copy collapse.
  if (entityId) {
    return `${tenantId}:${entityId}:${minute}`;
  }
  return `${tenantId}:none:${(title ?? "").slice(0, 80)}:${minute}`;
}

/** Returns true if this key was already claimed (caller should skip email). */
export function claimAdminEmailDedupe(key: string): boolean {
  const now = Date.now();
  prune(now);
  if (recentKeys.has(key)) return true;
  recentKeys.set(key, now);
  return false;
}

/** True if another path already emailed for this key (does not claim). */
export function wasAdminEmailSent(key: string): boolean {
  const now = Date.now();
  prune(now);
  return recentKeys.has(key);
}
