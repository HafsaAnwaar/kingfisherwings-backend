/**
 * Builds absolute URLs into the ERP / portal frontends for Stripe
 * success/cancel redirects and emailed links. Never derived from request
 * input, so a caller cannot redirect payers to an arbitrary origin.
 *
 * Production staff/portal host (no trailing slash). Used whenever
 * FRONTEND_URL is missing or is a placeholder like YOUR_FRONTEND_URL.
 */
export const DEFAULT_FRONTEND_ORIGIN =
  "https://freightnest.kingfishertec.com";

function isPlaceholderFrontend(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("your_frontend") ||
    lower.includes("your-frontend") ||
    lower.includes("yourfrontend") ||
    lower.includes("your_new_service") ||
    lower.includes("placeholder") ||
    lower.includes("example.test") ||
    lower.includes("example.com") ||
    /\/\/localhost(:\d+)?(\/|$)/i.test(lower)
  );
}

function trimBase(url: string | undefined): string | undefined {
  const v = url?.trim();
  if (!v) return undefined;
  const cleaned = v.replace(/\/$/, "");
  if (isPlaceholderFrontend(cleaned)) return undefined;
  return cleaned;
}

/**
 * Staff ERP frontend origin.
 * FRONTEND_URL → first CORS origin → https://freightnest.kingfishertec.com
 * APP_URL is deliberately not used: it is the API host.
 */
export function staffFrontendUrl(): string {
  const firstCorsOrigin = process.env.CORS_ORIGINS?.split(",")[0];
  return (
    trimBase(process.env.FRONTEND_URL) ??
    trimBase(firstCorsOrigin) ??
    DEFAULT_FRONTEND_ORIGIN
  );
}

/** Staff login page (create-user / credentials / activity emails). */
export function staffLoginUrl(): string {
  return (
    trimBase(process.env.STAFF_LOGIN_URL) ?? `${staffFrontendUrl()}/login`
  );
}

export function portalFrontendUrl(): string {
  return (
    trimBase(process.env.PORTAL_FRONTEND_URL) ??
    trimBase(process.env.PORTAL_APP_URL) ??
    staffFrontendUrl()
  );
}

/**
 * Customer portal login page.
 * Default path `/portal/login` (WordPress + FE contract). Override with PORTAL_LOGIN_URL.
 */
export function portalLoginUrl(): string {
  return (
    trimBase(process.env.PORTAL_LOGIN_URL) ??
    `${portalFrontendUrl()}/portal/login`
  );
}

export function vendorFrontendUrl(): string {
  return (
    trimBase(process.env.VENDOR_APP_URL) ??
    trimBase(process.env.VENDOR_FRONTEND_URL) ??
    staffFrontendUrl()
  );
}

/** Vendor portal login — use in emails instead of deep record URLs. */
export function vendorLoginUrl(): string {
  return (
    trimBase(process.env.VENDOR_LOGIN_URL) ??
    `${vendorFrontendUrl()}/vendor/login`
  );
}

/** Public shipment track page (FE). */
export function publicTrackUrl(): string {
  return (
    trimBase(process.env.PUBLIC_TRACK_URL) ?? `${staffFrontendUrl()}/track`
  );
}

/** Public payment-link landing page (customer may not have a portal login). */
export function paymentLinkUrl(token: string): string {
  const base =
    trimBase(process.env.PAYMENT_LINK_BASE_URL) ?? `${portalFrontendUrl()}/pay`;
  return `${base}/${encodeURIComponent(token)}`;
}

export function withQuery(url: string, params: Record<string, string>): string {
  const qs = Object.entries(params)
    // {CHECKOUT_SESSION_ID} is a Stripe template placeholder — keep braces.
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${v === "{CHECKOUT_SESSION_ID}" ? v : encodeURIComponent(v)}`,
    )
    .join("&");
  return `${url}${url.includes("?") ? "&" : "?"}${qs}`;
}

/**
 * Append `tenant_slug` for WordPress / branded website entry.
 * FE login pages must prefill + lock the workspace field when this query is present.
 */
export function withTenantSlug(url: string, slug: string): string {
  const cleaned = String(slug ?? "").trim().toLowerCase();
  if (!cleaned) return url;
  return withQuery(url, { tenant_slug: cleaned });
}

export function staffLoginUrlForTenant(slug: string): string {
  return withTenantSlug(staffLoginUrl(), slug);
}

export function portalLoginUrlForTenant(slug: string): string {
  return withTenantSlug(portalLoginUrl(), slug);
}

export function vendorLoginUrlForTenant(slug: string): string {
  return withTenantSlug(vendorLoginUrl(), slug);
}

export function publicTrackUrlForTenant(slug?: string | null): string {
  const base = publicTrackUrl();
  const cleaned = String(slug ?? "").trim().toLowerCase();
  return cleaned ? withTenantSlug(base, cleaned) : base;
}

/** Copy-paste URLs for WordPress PORTALS (link mode — no API sign-in). */
export function websitePortalLinksForTenant(slug: string): {
  tenant_slug: string;
  employee_login_url: string;
  customer_login_url: string;
  vendor_login_url: string;
  tracking_url: string;
} {
  const tenant_slug = String(slug ?? "").trim().toLowerCase();
  return {
    tenant_slug,
    employee_login_url: staffLoginUrlForTenant(tenant_slug),
    customer_login_url: portalLoginUrlForTenant(tenant_slug),
    vendor_login_url: vendorLoginUrlForTenant(tenant_slug),
    tracking_url: publicTrackUrlForTenant(tenant_slug),
  };
}
