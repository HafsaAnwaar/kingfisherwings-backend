import { registerAs } from "@nestjs/config";

export default registerAs("smtp", () => ({
  host: process.env.SMTP_HOST ?? "localhost",
  port: parseInt(process.env.SMTP_PORT ?? "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER || undefined,
  pass: process.env.SMTP_PASS || undefined,
  from: process.env.SMTP_FROM ?? "noreply@kingfisherwings.com",
}));
