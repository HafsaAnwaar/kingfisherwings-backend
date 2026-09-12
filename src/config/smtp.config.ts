import { registerAs } from "@nestjs/config";

function trimEnv(key: string): string | undefined {
  const v = process.env[key];
  if (v == null) return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

/** Gmail App Passwords are often pasted with spaces — strip them. */
function normalizeSmtpPass(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/\s+/g, "").trim() || undefined;
}

function buildFromAddress(fromEmail: string, fromName: string): string {
  const explicit = trimEnv("SMTP_FROM");
  if (explicit) {
    // Strip wrapping quotes if dotenv left them
    return explicit.replace(/^["']|["']$/g, "");
  }
  return `${fromName} <${fromEmail}>`;
}

function resolvePort(raw: string | undefined, secure: boolean): number {
  const n = parseInt(raw ?? "", 10);
  if (Number.isFinite(n) && n > 0) return n;
  return secure ? 465 : 587;
}

/**
 * Normalize SMTP_* for Nodemailer. Rejects common misconfig where
 * SMTP_HOST is set to the mailbox address (causes queryA EBADNAME).
 */
export function resolveSmtpSettings() {
  let host = trimEnv("SMTP_HOST") ?? "localhost";
  const user = trimEnv("SMTP_USER");
  const pass = normalizeSmtpPass(trimEnv("SMTP_PASS") ?? trimEnv("SMTP_pass"));
  const fromName = trimEnv("SMTP_FROM_NAME") ?? "KingFisher Wings";
  const fromEmail =
    trimEnv("SMTP_FROM_EMAIL") ?? user ?? "kingfisherwings@gmail.com";

  // Common mistake: putting the Gmail address in SMTP_HOST
  if (host.includes("@")) {
    console.warn(
      `[smtp] SMTP_HOST looks like an email (${host}). Using smtp.gmail.com instead.`,
    );
    host = "smtp.gmail.com";
  }

  const isGmail =
    /(^|\.)gmail\.com$/i.test(host) ||
    /(^|\.)googlemail\.com$/i.test(host) ||
    host === "smtp.gmail.com";

  if (isGmail) {
    host = "smtp.gmail.com";
  }

  // Port 25 is blocked on most cloud hosts (Render). Prefer submission ports.
  let port = resolvePort(trimEnv("SMTP_PORT"), false);
  let secure = trimEnv("SMTP_SECURE") === "true";

  if (port === 25) {
    console.warn(
      "[smtp] SMTP_PORT=25 is blocked on most hosts (incl. Render). Switching to 587 + STARTTLS.",
    );
    port = 587;
    secure = false;
  }

  if (isGmail) {
    // Gmail: 587 + STARTTLS (secure=false) or 465 + SSL (secure=true)
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

  const connectionTimeout = parseInt(
    trimEnv("SMTP_CONNECTION_TIMEOUT_MS") ?? "20000",
    10,
  );
  const greetingTimeout = parseInt(
    trimEnv("SMTP_GREETING_TIMEOUT_MS") ?? "20000",
    10,
  );
  const socketTimeout = parseInt(
    trimEnv("SMTP_SOCKET_TIMEOUT_MS") ?? "60000",
    10,
  );

  return {
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
    connectionTimeout: Number.isFinite(connectionTimeout)
      ? connectionTimeout
      : 20000,
    greetingTimeout: Number.isFinite(greetingTimeout) ? greetingTimeout : 20000,
    socketTimeout: Number.isFinite(socketTimeout) ? socketTimeout : 60000,
    /** Prefer IPv4 — avoids flaky IPv6 paths on some networks / hosts. */
    family: 4 as const,
  };
}

export type SmtpSettings = ReturnType<typeof resolveSmtpSettings>;

export default registerAs("smtp", () => resolveSmtpSettings());
