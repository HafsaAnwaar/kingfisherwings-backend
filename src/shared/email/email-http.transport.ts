import axios from "axios";

export type OutboundAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type OutboundMail = {
  from: string;
  to: string;
  cc?: string;
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: OutboundAttachment[];
};

function encodeHeader(value: string): string {
  // RFC 2047 for non-ASCII subjects
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function toBase64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/** Build RFC 2822 raw message for Gmail API users.messages.send */
export function buildRawMimeMessage(mail: OutboundMail): string {
  const boundary = `kf_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const lines: string[] = [];
  lines.push(`From: ${mail.from}`);
  lines.push(`To: ${mail.to}`);
  if (mail.cc) lines.push(`Cc: ${mail.cc}`);
  if (mail.replyTo) lines.push(`Reply-To: ${mail.replyTo}`);
  lines.push(`Subject: ${encodeHeader(mail.subject)}`);
  lines.push("MIME-Version: 1.0");

  const hasAttachments = (mail.attachments?.length ?? 0) > 0;
  if (!hasAttachments) {
    lines.push("Content-Type: text/html; charset=UTF-8");
    lines.push("Content-Transfer-Encoding: 7bit");
    lines.push("");
    lines.push(mail.html);
    return lines.join("\r\n");
  }

  lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
  lines.push("");
  lines.push(`--${boundary}`);
  lines.push("Content-Type: text/html; charset=UTF-8");
  lines.push("Content-Transfer-Encoding: 7bit");
  lines.push("");
  lines.push(mail.html);

  for (const att of mail.attachments ?? []) {
    const ctype = att.contentType ?? "application/octet-stream";
    const b64 = att.content.toString("base64").replace(/(.{76})/g, "$1\r\n");
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: ${ctype}; name="${att.filename}"`);
    lines.push("Content-Transfer-Encoding: base64");
    lines.push(
      `Content-Disposition: attachment; filename="${att.filename}"`,
    );
    lines.push("");
    lines.push(b64);
  }
  lines.push(`--${boundary}--`);
  lines.push("");
  return lines.join("\r\n");
}

export async function sendViaGmailApi(opts: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  user: string;
  mail: OutboundMail;
}): Promise<void> {
  const tokenRes = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      refresh_token: opts.refreshToken,
      grant_type: "refresh_token",
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 20000,
    },
  );

  const accessToken = tokenRes.data?.access_token as string | undefined;
  if (!accessToken) {
    throw new Error(
      "Gmail OAuth token refresh failed — check GMAIL_CLIENT_ID / SECRET / REFRESH_TOKEN",
    );
  }

  const raw = toBase64Url(Buffer.from(buildRawMimeMessage(opts.mail), "utf8"));
  await axios.post(
    `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(opts.user)}/messages/send`,
    { raw },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 60000,
    },
  );
}

export async function sendViaResend(opts: {
  apiKey: string;
  mail: OutboundMail;
}): Promise<void> {
  const attachments = (opts.mail.attachments ?? []).map((a) => ({
    filename: a.filename,
    content: a.content.toString("base64"),
  }));

  const payload: Record<string, unknown> = {
    from: opts.mail.from,
    to: opts.mail.to.split(",").map((s) => s.trim()).filter(Boolean),
    subject: opts.mail.subject,
    html: opts.mail.html,
  };
  if (opts.mail.cc) {
    payload.cc = opts.mail.cc.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (opts.mail.replyTo) payload.reply_to = opts.mail.replyTo;
  if (attachments.length) payload.attachments = attachments;

  const res = await axios.post("https://api.resend.com/emails", payload, {
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 60000,
    validateStatus: () => true,
  });

  if (res.status >= 300) {
    const detail =
      typeof res.data === "object"
        ? JSON.stringify(res.data)
        : String(res.data);
    throw new Error(`Resend API ${res.status}: ${detail}`);
  }
}
