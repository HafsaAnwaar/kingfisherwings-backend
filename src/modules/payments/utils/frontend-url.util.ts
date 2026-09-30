/**
 * Builds absolute URLs into the ERP / portal frontends for Stripe
 * success/cancel redirects and emailed links. Never derived from request
 * input, so a caller cannot redirect payers to an arbitrary origin.
 */
function trimBase(url: string | undefined): string | undefined {
  const v = url?.trim();
  return v ? v.replace(/\/$/, "") : undefined;
}

export function staffFrontendUrl(): string {
  return (
    trimBase(process.env.FRONTEND_URL) ??
    trimBase(process.env.APP_URL) ??
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
