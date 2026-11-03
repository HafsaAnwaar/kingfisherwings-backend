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

/** Customer portal login — use in emails instead of deep record URLs. */
export function portalLoginUrl(): string {
  return (
    trimBase(process.env.PORTAL_LOGIN_URL) ?? `${portalFrontendUrl()}/login`
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
