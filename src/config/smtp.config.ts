import { registerAs } from "@nestjs/config";

function trimEnv(key: string): string | undefined {
  const v = process.env[key];
  if (v == null) return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

/**
 * Gmail App Passwords are often pasted with spaces — strip whitespace only.
 * Do not strip other characters (Hostinger mailbox passwords may include symbols).
 */
function normalizeSmtpPass(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/\s+/g, "").trim() || undefined;
}

function buildFromAddress(fromEmail: string, fromName: string): string {
  const explicit = trimEnv("SMTP_FROM");
  if (explicit) {
    return explicit.replace(/^["']|["']$/g, "");
  }
  return `${fromName} <${fromEmail}>`;
}

function resolvePort(raw: string | undefined, secure: boolean): number {
  const n = parseInt(raw ?? "", 10);
  if (Number.isFinite(n) && n > 0) return n;
  return secure ? 465 : 587;
}

export type EmailProvider = "smtp" | "gmail_api" | "resend";

/**
 * Resolve delivery provider.
 * Render free tier blocks SMTP ports 25/465/587 — use gmail_api or resend (HTTPS).
 * Prefer HTTPS providers when their credentials are present (even if EMAIL_PROVIDER=auto).
 */
export function resolveEmailProvider(): EmailProvider {
  const forced = (trimEnv("EMAIL_PROVIDER") ?? "auto").toLowerCase();
  if (forced === "smtp" || forced === "gmail_api" || forced === "resend") {
    return forced;
  }

  const hasGmailOauth =
    !!trimEnv("GMAIL_CLIENT_ID") &&
    !!trimEnv("GMAIL_CLIENT_SECRET") &&
    !!trimEnv("GMAIL_REFRESH_TOKEN");
  if (hasGmailOauth) return "gmail_api";

  if (trimEnv("RESEND_API_KEY")) return "resend";

  // On Render, defaulting to SMTP almost always fails on free tier.
  // Prefer resend/gmail if partially configured was already handled above.
  return "smtp";
}

function isHostingerHost(host: string): boolean {
  return (
    /(^|\.)hostinger\.com$/i.test(host) ||
    /(^|\.)titan\.email$/i.test(host) ||
    /^mail\./i.test(host)
  );
}

/**
 * Normalize SMTP_* for Nodemailer. Rejects common misconfig where
 * SMTP_HOST is set to the mailbox address (causes queryA EBADNAME).
 * Fixes Hostinger 465 without SSL and Gmail port/secure mismatches.
 */
export function resolveSmtpSettings() {
  let host = trimEnv("SMTP_HOST") ?? "localhost";
  const user = trimEnv("SMTP_USER");
  const pass = normalizeSmtpPass(trimEnv("SMTP_PASS") ?? trimEnv("SMTP_pass"));
  const fromName = trimEnv("SMTP_FROM_NAME") ?? "KingFisher Wings";
  const fromEmail =
    trimEnv("SMTP_FROM_EMAIL") ?? user ?? "kingfisherwings@gmail.com";

  if (host.includes("@")) {
    console.warn(
      `[smtp] SMTP_HOST looks like an email (${host}). Using smtp.hostinger.com instead.`,
    );
    host = "smtp.hostinger.com";
  }

  const isGmail =
    /(^|\.)gmail\.com$/i.test(host) ||
    /(^|\.)googlemail\.com$/i.test(host) ||
    host === "smtp.gmail.com";

  const isHostinger = isHostingerHost(host);

  if (isGmail) {
    host = "smtp.gmail.com";
  }

  let port = resolvePort(trimEnv("SMTP_PORT"), false);
  let secure = trimEnv("SMTP_SECURE") === "true";

  if (port === 25) {
    console.warn(
      "[smtp] SMTP_PORT=25 is blocked on most hosts (incl. Render). Switching to 587 + STARTTLS.",
    );
    port = 587;
    secure = false;
  }

  // Port/secure consistency (any provider)
  if (port === 465 && !secure) {
    console.warn(
      `[smtp] SMTP_PORT=465 requires SSL. Forcing SMTP_SECURE=true (host=${host}).`,
    );
    secure = true;
  }
  if (port === 587 && secure) {
    console.warn(
      `[smtp] SMTP_PORT=587 uses STARTTLS. Forcing SMTP_SECURE=false (host=${host}).`,
    );
    secure = false;
  }

  if (isGmail) {
    if (secure && port === 587) {
      port = 465;
    }
    if (!secure && port === 465) {
      secure = true;
    }
    if (!secure && port !== 465) {
      port = 587;
      secure = false;
    }
  }

  if (isHostinger && port !== 465 && port !== 587) {
    console.warn(
      `[smtp] Unusual Hostinger port ${port}; prefer 465 (SSL) or 587 (STARTTLS).`,
    );
  }

  // Longer defaults: PDF+mail under load often exceeds 20s greeting on slow SMTP.
  const connectionTimeout = parseInt(
    trimEnv("SMTP_CONNECTION_TIMEOUT_MS") ?? "45000",
    10,
  );
  const greetingTimeout = parseInt(
    trimEnv("SMTP_GREETING_TIMEOUT_MS") ?? "45000",
    10,
  );
  const socketTimeout = parseInt(
    trimEnv("SMTP_SOCKET_TIMEOUT_MS") ?? "90000",
    10,
  );

  const provider = resolveEmailProvider();
  const onRender = Boolean(
    trimEnv("RENDER") || trimEnv("RENDER_EXTERNAL_URL") || trimEnv("RENDER_SERVICE_ID"),
  );

  return {
    provider,
    host,
    port,
    secure,
    user,
    pass,
    from: buildFromAddress(fromEmail, fromName),
    fromName,
    fromEmail,
    vendorNotifyEmail: trimEnv("VENDOR_NOTIFY_EMAIL"),
    isGmail,
    isHostinger,
    onRender,
    connectionTimeout: Number.isFinite(connectionTimeout)
      ? connectionTimeout
      : 45000,
    greetingTimeout: Number.isFinite(greetingTimeout) ? greetingTimeout : 45000,
    socketTimeout: Number.isFinite(socketTimeout) ? socketTimeout : 90000,
    family: 4 as const,
    gmailClientId: trimEnv("GMAIL_CLIENT_ID"),
    gmailClientSecret: trimEnv("GMAIL_CLIENT_SECRET"),
    gmailRefreshToken: trimEnv("GMAIL_REFRESH_TOKEN"),
    gmailUser:
      trimEnv("GMAIL_USER") ??
      trimEnv("SMTP_USER") ??
      trimEnv("SMTP_FROM_EMAIL"),
    resendApiKey: trimEnv("RESEND_API_KEY"),
    resendFrom: trimEnv("RESEND_FROM") ?? buildFromAddress(fromEmail, fromName),
  };
}

export type SmtpSettings = ReturnType<typeof resolveSmtpSettings>;

export default registerAs("smtp", () => resolveSmtpSettings());
