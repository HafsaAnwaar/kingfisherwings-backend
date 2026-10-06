/**
 * Builds absolute URLs into the ERP / portal frontends for Stripe
 * success/cancel redirects and emailed links. Never derived from request
 * input, so a caller cannot redirect payers to an arbitrary origin.
 */
function trimBase(url: string | undefined): string | undefined {
  const v = url?.trim();
  return v ? v.replace(/\/$/, "") : undefined;
}

/**
 * FRONTEND_URL, else the first CORS origin (both are frontend hosts).
 * APP_URL is deliberately not used: it is the API host, so payers would be
 * sent to a 404 after paying. The readiness report flags a missing value.
 */
export function staffFrontendUrl(): string {
  const firstCorsOrigin = process.env.CORS_ORIGINS?.split(",")[0];
  return (
    trimBase(process.env.FRONTEND_URL) ??
    trimBase(firstCorsOrigin) ??
    "http://localhost:5173"
  );
}

export function portalFrontendUrl(): string {
  return trimBase(process.env.PORTAL_FRONTEND_URL) ?? staffFrontendUrl();
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
