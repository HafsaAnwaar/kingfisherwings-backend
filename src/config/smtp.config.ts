import { registerAs } from "@nestjs/config";

function buildFromAddress(): string {
  const explicit = process.env.SMTP_FROM?.trim();
  if (explicit) return explicit;

  const name = (process.env.SMTP_FROM_NAME ?? "KingFisher Wings").trim();
  const email = (
    process.env.SMTP_FROM_EMAIL ?? "kingfisherwings@gmail.com"
  ).trim();
  return `${name} <${email}>`;
}

export default registerAs("smtp", () => ({
  host: process.env.SMTP_HOST ?? "localhost",
  port: parseInt(process.env.SMTP_PORT ?? "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER || undefined,
  pass: process.env.SMTP_PASS || undefined,
  from: buildFromAddress(),
  fromName: process.env.SMTP_FROM_NAME ?? "KingFisher Wings",
  fromEmail: process.env.SMTP_FROM_EMAIL ?? "kingfisherwings@gmail.com",
  vendorNotifyEmail: process.env.VENDOR_NOTIFY_EMAIL || undefined,
}));
