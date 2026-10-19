import * as fs from "fs";
import * as path from "path";

export type BrandAudience = "CUSTOMER" | "VENDOR" | "STAFF";

export type BrandedEmailContent = {
  /** Email subject line */
  subject: string;
  /** Main headline under the logo */
  headline: string;
  /** Recipient display name */
  recipientName: string;
  /** Optional organization / party name */
  organizationName?: string;
  /** Intro paragraphs (plain text; HTML-escaped by helper) */
  intro: string[];
  /** Key-value credential / detail rows */
  details?: Array<{ label: string; value: string }>;
  /** Primary call-to-action */
  cta?: { label: string; url: string };
  /** Closing paragraphs */
  closing?: string[];
  audience: BrandAudience;
};

const BRAND = {
  company: "King Fisher Technologies",
  tagline: "by CREW INNOVATIONS",
  product: "KingFisher Wings Logistics Platform",
  supportEmail:
    process.env.SUPPORT_EMAIL?.trim() ||
    process.env.SMTP_FROM_EMAIL?.trim() ||
    "support@kingfisherwings.com",
  website:
    process.env.BRAND_WEBSITE?.trim() ||
    process.env.APP_URL?.trim() ||
    "https://kingfisherwings.com",
  colors: {
    blue: "#0B5FFF",
    deepBlue: "#063A9E",
    orange: "#F28C28",
    gold: "#E8B84A",
    ink: "#0F172A",
    muted: "#475569",
    border: "#E2E8F0",
    bg: "#F8FAFC",
    white: "#FFFFFF",
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Absolute logo URL for email clients (preferred over data-URI). */
export function resolveBrandLogoUrl(): string {
  const configured = process.env.EMAIL_BRAND_LOGO_URL?.trim();
  if (configured) return configured;

  const base =
    process.env.PUBLIC_API_URL?.trim() ||
    process.env.RENDER_EXTERNAL_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "";
  if (base) {
    return `${base.replace(/\/$/, "")}/branding/king-fisher-technologies-logo.png`;
  }
  return "";
}

/**
 * Fallback inline logo when no public URL is configured.
 * Some clients strip data URIs; hosted URL is preferred.
 */
export function resolveBrandLogoSrc(): string {
  const url = resolveBrandLogoUrl();
  if (url) return url;

  const candidates = [
    path.join(
      process.cwd(),
      "public",
      "branding",
      "king-fisher-technologies-logo.png",
    ),
    path.join(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      "branding",
      "king-fisher-technologies-logo.png",
    ),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const buf = fs.readFileSync(file);
        return `data:image/png;base64,${buf.toString("base64")}`;
      }
    } catch {
      /* continue */
    }
  }
  return "";
}

function audienceLabel(audience: BrandAudience): string {
  switch (audience) {
    case "CUSTOMER":
      return "Customer Portal";
    case "VENDOR":
      return "Vendor Portal";
    default:
      return "Staff Workspace";
  }
}

/**
 * Formal King Fisher Technologies HTML email shell.
 */
export function renderBrandedEmail(content: BrandedEmailContent): {
  subject: string;
  html: string;
} {
  const logoSrc = resolveBrandLogoSrc();
  const logoBlock = logoSrc
    ? `<img src="${logoSrc}" alt="King Fisher Technologies" width="220" style="display:block;margin:0 auto 12px;max-width:220px;height:auto;border:0;" />`
    : `<div style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:${BRAND.colors.blue};letter-spacing:0.5px;">King Fisher</div>
       <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${BRAND.colors.orange};letter-spacing:2px;text-transform:uppercase;">Technologies</div>`;

  const detailRows =
    content.details
      ?.map(
        (row) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid ${BRAND.colors.border};color:${BRAND.colors.muted};font-size:13px;width:38%;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid ${BRAND.colors.border};color:${BRAND.colors.ink};font-size:14px;font-weight:600;">${escapeHtml(row.value)}</td>
      </tr>`,
      )
      .join("") ?? "";

  const introHtml = content.intro
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.colors.ink};">${escapeHtml(p)}</p>`,
    )
    .join("");

  const closingHtml = (content.closing ?? [])
    .map(
      (p) =>
        `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.colors.muted};">${escapeHtml(p)}</p>`,
    )
    .join("");

  const ctaHtml = content.cta
    ? `<p style="margin:28px 0 8px;text-align:center;">
         <a href="${escapeHtml(content.cta.url)}" style="display:inline-block;background:linear-gradient(135deg,${BRAND.colors.blue},${BRAND.colors.deepBlue});color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;letter-spacing:0.3px;">
           ${escapeHtml(content.cta.label)}
         </a>
       </p>
       <p style="margin:0 0 18px;text-align:center;font-size:12px;color:${BRAND.colors.muted};word-break:break-all;">
         Or copy this link:<br/>${escapeHtml(content.cta.url)}
       </p>`
    : "";

  const orgLine = content.organizationName
    ? `<p style="margin:0 0 18px;font-size:14px;color:${BRAND.colors.muted};">Account for <strong style="color:${BRAND.colors.ink};">${escapeHtml(content.organizationName)}</strong> · ${audienceLabel(content.audience)}</p>`
    : `<p style="margin:0 0 18px;font-size:14px;color:${BRAND.colors.muted};">${audienceLabel(content.audience)}</p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(content.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.colors.bg};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.colors.bg};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${BRAND.colors.white};border-radius:14px;overflow:hidden;border:1px solid ${BRAND.colors.border};box-shadow:0 8px 24px rgba(15,23,42,0.06);">
          <tr>
            <td style="background:#0A0A0A;padding:28px 24px 20px;text-align:center;">
              ${logoBlock}
              <div style="margin-top:8px;font-size:11px;color:#94A3B8;letter-spacing:1px;">${escapeHtml(BRAND.tagline)}</div>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${BRAND.colors.blue},${BRAND.colors.orange},${BRAND.colors.gold});"></td>
          </tr>
          <tr>
            <td style="padding:32px 28px 12px;">
              <p style="margin:0 0 6px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.colors.orange};font-weight:700;">Formal notice</p>
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${BRAND.colors.deepBlue};font-family:Georgia,serif;">${escapeHtml(content.headline)}</h1>
              <p style="margin:0 0 8px;font-size:15px;color:${BRAND.colors.ink};">Dear ${escapeHtml(content.recipientName)},</p>
              ${orgLine}
              ${introHtml}
              ${
                detailRows
                  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 22px;border:1px solid ${BRAND.colors.border};border-radius:10px;overflow:hidden;background:#FCFCFD;">
                       <tr><td colspan="2" style="padding:12px 14px;background:#F1F5F9;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BRAND.colors.deepBlue};">Account details</td></tr>
                       ${detailRows}
                     </table>`
                  : ""
              }
              ${ctaHtml}
              ${closingHtml}
              <p style="margin:24px 0 0;font-size:14px;color:${BRAND.colors.ink};">
                With kind regards,<br/>
                <strong>${escapeHtml(BRAND.company)}</strong><br/>
                <span style="color:${BRAND.colors.muted};font-size:13px;">${escapeHtml(BRAND.product)}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 28px;border-top:1px solid ${BRAND.colors.border};background:#F8FAFC;">
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.colors.muted};line-height:1.5;">
                Need assistance? Contact us at
                <a href="mailto:${escapeHtml(BRAND.supportEmail)}" style="color:${BRAND.colors.blue};text-decoration:none;">${escapeHtml(BRAND.supportEmail)}</a>
                · <a href="${escapeHtml(BRAND.website)}" style="color:${BRAND.colors.blue};text-decoration:none;">${escapeHtml(BRAND.website)}</a>
              </p>
              <p style="margin:0;font-size:11px;color:#94A3B8;line-height:1.5;">
                This message was sent by ${escapeHtml(BRAND.company)}. Please do not share temporary passwords. If you did not expect this email, contact support immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: content.subject, html };
}

export function buildCredentialsEmail(opts: {
  audience: "CUSTOMER" | "VENDOR";
  recipientName: string;
  organizationName: string;
  email: string;
  temporaryPassword: string;
  loginUrl?: string;
}): { subject: string; html: string } {
  const portal =
    opts.audience === "CUSTOMER" ? "customer portal" : "vendor portal";
  const subject = `Welcome to King Fisher Technologies — your ${portal} access`;

  return renderBrandedEmail({
    subject,
    headline: `Your ${portal} credentials are ready`,
    recipientName: opts.recipientName,
    organizationName: opts.organizationName,
    audience: opts.audience,
    intro: [
      `It is our pleasure to welcome you to ${BRAND.company}. Your secure ${portal} account has been prepared so you can collaborate with your logistics partner with confidence.`,
      "Below you will find your official sign-in details. For your security, we recommend changing the temporary password immediately after your first successful login.",
    ],
    details: [
      { label: "Portal", value: audienceLabel(opts.audience) },
      { label: "Organization", value: opts.organizationName },
      { label: "Login email", value: opts.email },
      { label: "Temporary password", value: opts.temporaryPassword },
    ],
    cta: opts.loginUrl
      ? { label: "Open portal login", url: opts.loginUrl }
      : undefined,
    closing: [
      "Should you require any assistance activating your account, our support team remains at your service.",
      "Thank you for entrusting King Fisher Technologies with your freight and supply-chain operations.",
    ],
  });
}

export function buildInviteEmail(opts: {
  audience: BrandAudience;
  recipientName: string;
  organizationName: string;
  inviteUrl: string;
  expiresAt: Date;
}): { subject: string; html: string } {
  const portal = audienceLabel(opts.audience).toLowerCase();
  const subject = `Invitation to King Fisher Technologies — activate your ${portal}`;

  return renderBrandedEmail({
    subject,
    headline: "You are formally invited",
    recipientName: opts.recipientName,
    organizationName: opts.organizationName,
    audience: opts.audience,
    intro: [
      `${BRAND.company} cordially invites you to activate your ${portal} account for ${opts.organizationName}.`,
      "Please use the secure link below to set your password and complete activation. This invitation is time-limited for your protection.",
    ],
    details: [
      { label: "Organization", value: opts.organizationName },
      {
        label: "Link expires",
        value: opts.expiresAt.toUTCString(),
      },
    ],
    cta: {
      label: "Activate account & set password",
      url: opts.inviteUrl,
    },
    closing: [
      "If you did not expect this invitation, you may disregard this message or contact our support desk.",
      "We look forward to supporting your logistics journey with King Fisher Technologies.",
    ],
  });
}

export function buildPasswordResetEmail(opts: {
  audience: BrandAudience;
  recipientName: string;
  organizationName?: string;
  resetUrl?: string;
  temporaryPassword?: string;
  email?: string;
  expiresAt?: Date;
}): { subject: string; html: string } {
  const subject = `King Fisher Technologies — password assistance`;

  const details: Array<{ label: string; value: string }> = [];
  if (opts.organizationName) {
    details.push({ label: "Organization", value: opts.organizationName });
  }
  if (opts.email) {
    details.push({ label: "Account email", value: opts.email });
  }
  if (opts.temporaryPassword) {
    details.push({
      label: "Temporary password",
      value: opts.temporaryPassword,
    });
  }
  if (opts.expiresAt) {
    details.push({
      label: "Link expires",
      value: opts.expiresAt.toUTCString(),
    });
  }

  return renderBrandedEmail({
    subject,
    headline: "Password reset assistance",
    recipientName: opts.recipientName,
    organizationName: opts.organizationName,
    audience: opts.audience,
    intro: [
      `We received a request to assist with access to your ${audienceLabel(opts.audience).toLowerCase()} on the ${BRAND.product}.`,
      opts.temporaryPassword
        ? "A temporary password has been issued for your account. Please sign in and update it at your earliest convenience."
        : "Please follow the secure link below to choose a new password. If you did not request this assistance, contact support immediately and disregard the link.",
    ],
    details: details.length ? details : undefined,
    cta: opts.resetUrl
      ? { label: "Reset your password", url: opts.resetUrl }
      : opts.temporaryPassword
        ? undefined
        : undefined,
    closing: [
      "Your account security is our priority. Never share passwords or reset links with anyone.",
      `For help, write to ${BRAND.supportEmail}.`,
    ],
  });
}

export function buildStaffInviteEmail(opts: {
  recipientName: string;
  inviteUrl: string;
  expiresAt: Date;
}): { subject: string; html: string } {
  return renderBrandedEmail({
    subject: "You are invited to King Fisher Technologies",
    headline: "Staff workspace invitation",
    recipientName: opts.recipientName || "Colleague",
    audience: "STAFF",
    intro: [
      `Welcome to ${BRAND.company}. You have been invited to join the ${BRAND.product} staff workspace.`,
      "Kindly activate your account using the secure link below and set a strong password. The invitation expires for security reasons.",
    ],
    details: [
      { label: "Link expires", value: opts.expiresAt.toUTCString() },
    ],
    cta: {
      label: "Accept invitation",
      url: opts.inviteUrl,
    },
    closing: [
      "We are delighted to have you on board and look forward to your contribution.",
    ],
  });
}
