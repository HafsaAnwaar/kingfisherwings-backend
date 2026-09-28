import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { EmailEventType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  resolveSmtpSettings,
  SmtpSettings,
} from "../../config/smtp.config";
import {
  OutboundMail,
  sendViaGmailApi,
  sendViaResend,
} from "./email-http.transport";

export interface SendEmailOptions {
  tenantId: string;
  eventType: EmailEventType;
  to: string;
  cc?: string;
  subject: string;
  body: string;
  attachmentPath?: string;
  attachmentName?: string;
  attachmentBuffer?: Buffer;
  quotationId?: string;
  jobId?: string;
  jobDocumentId?: string;
  createdBy?: string;
  replyTo?: string;
  /** When true, throw if SMTP is not configured or send fails (document share). */
  requireDelivery?: boolean;
}

function isTransientSmtpError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("greeting never received") ||
    lower.includes("connection timeout") ||
    lower.includes("etimedout") ||
    lower.includes("econnreset") ||
    lower.includes("econnrefused") ||
    lower.includes("socket closed") ||
    lower.includes("connection closed") ||
    lower.includes("timed out")
  );
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private settings: SmtpSettings | null = null;
  private lastVerifyError: string | null = null;
  private smtpReachable = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bootstrap();
  }

  private bootstrap() {
    this.settings = resolveSmtpSettings();
    this.transporter = null;
    this.smtpReachable = false;

    if (this.settings.provider === "smtp") {
      if (
        this.settings.host &&
        this.settings.host !== "localhost" &&
        this.settings.user &&
        this.settings.pass
      ) {
        this.transporter = this.createSmtpTransport(this.settings);
      } else if (
        this.settings.host === "localhost" &&
        this.settings.user &&
        this.settings.pass
      ) {
        this.transporter = this.createSmtpTransport(this.settings);
      }
    }
  }

  private createSmtpTransport(settings: SmtpSettings): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth:
        settings.user && settings.pass
          ? { user: settings.user, pass: settings.pass }
          : undefined,
      connectionTimeout: settings.connectionTimeout,
      greetingTimeout: settings.greetingTimeout,
      socketTimeout: settings.socketTimeout,
      family: settings.family,
      tls: {
        minVersion: "TLSv1.2",
        servername: settings.host,
        // Hostinger / shared hosts sometimes present intermediate chain quirks
        rejectUnauthorized: true,
      },
      requireTLS: !settings.secure && settings.port === 587,
      pool: false,
    } as nodemailer.TransportOptions);
  }

  /** Fresh transporter for retry after transient TCP/greeting failures. */
  private recreateSmtpTransporter() {
    if (!this.settings || this.settings.provider !== "smtp") return;
    try {
      this.transporter?.close();
    } catch {
      /* ignore */
    }
    this.transporter = this.createSmtpTransport(this.settings);
  }

  async onModuleInit() {
    const s = this.settings;
    if (!s) return;

    if (s.provider === "gmail_api") {
      if (s.gmailClientId && s.gmailClientSecret && s.gmailRefreshToken && s.gmailUser) {
        this.lastVerifyError = null;
        this.logger.log(
          `Email provider=gmail_api (HTTPS) → ${s.from} — works on Render free tier`,
        );
      } else {
        this.lastVerifyError =
          "gmail_api selected but GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN / GMAIL_USER incomplete";
        this.logger.warn(this.lastVerifyError);
      }
      return;
    }

    if (s.provider === "resend") {
      if (s.resendApiKey) {
        this.lastVerifyError = null;
        this.logger.log(
          `Email provider=resend (HTTPS) → ${s.resendFrom} — works on Render free tier`,
        );
      } else {
        this.lastVerifyError = "resend selected but RESEND_API_KEY missing";
        this.logger.warn(this.lastVerifyError);
      }
      return;
    }

    if (!this.transporter) {
      this.logger.warn(
        "SMTP not configured. On Render free tier SMTP is blocked — set EMAIL_PROVIDER=resend (or gmail_api) with HTTPS credentials. See docs/EMAIL_SETUP_GMAIL.md.",
      );
      return;
    }

    if (s.onRender) {
      this.logger.warn(
        `SMTP on Render (${s.host}:${s.port}). Free instances block outbound 25/465/587 — prefer EMAIL_PROVIDER=resend with verified domain From ${s.fromEmail}.`,
      );
    }

    try {
      await this.transporter.verify();
      this.smtpReachable = true;
      this.lastVerifyError = null;
      this.logger.log(
        `Email provider=smtp ready (${s.host}:${s.port} secure=${s.secure} → ${s.from})`,
      );
    } catch (err) {
      this.smtpReachable = false;
      const msg = err instanceof Error ? err.message : String(err);
      this.lastVerifyError = this.formatDeliveryError(msg);
      this.logger.warn(
        `SMTP verify failed: ${this.lastVerifyError}. ` +
          `If on Render free: set EMAIL_PROVIDER=resend + RESEND_API_KEY (verify ${s.fromEmail} domain). ` +
          `Local Hostinger: SMTP_HOST=smtp.hostinger.com SMTP_PORT=465 SMTP_SECURE=true.`,
      );
    }
  }

  isConfigured(): boolean {
    const s = this.settings;
    if (!s) return false;
    if (s.provider === "gmail_api") {
      return !!(
        s.gmailClientId &&
        s.gmailClientSecret &&
        s.gmailRefreshToken &&
        s.gmailUser
      );
    }
    if (s.provider === "resend") {
      return !!s.resendApiKey;
    }
    return this.transporter != null && !!s.user && !!s.pass;
  }

  getSmtpStatus() {
    const s = this.settings;
    return {
      configured: this.isConfigured(),
      provider: s?.provider ?? null,
      host: s?.host ?? null,
      port: s?.port ?? null,
      secure: s?.secure ?? null,
      from: s?.from ?? null,
      smtp_reachable: s?.provider === "smtp" ? this.smtpReachable : null,
      last_verify_error: this.lastVerifyError,
      on_render: s?.onRender ?? false,
      render_note:
        "Render free web services block outbound SMTP (25/465/587). Use EMAIL_PROVIDER=resend (HTTPS + verified domain) or gmail_api, or upgrade the instance. Hostinger SMTP needs PORT=465 + SECURE=true (or 587 + SECURE=false).",
    };
  }

  private formatDeliveryError(raw: string): string {
    const lower = raw.toLowerCase();
    if (
      lower.includes("greeting never received") ||
      lower.includes("connection timeout") ||
      lower.includes("etimedout") ||
      lower.includes("econnrefused") ||
      lower.includes("connect enetunreach") ||
      lower.includes("connect ehostunreach")
    ) {
      const host = this.settings?.host ?? "SMTP_HOST";
      const port = this.settings?.port ?? "?";
      return (
        `${raw} — The API host timed out opening SMTP during send (PDF + mail). ` +
        `/health can show smtp.configured=true and still fail here. ` +
        `Current target ${host}:${port}. ` +
        `On Render free tier outbound SMTP is blocked — set EMAIL_PROVIDER=resend with RESEND_API_KEY ` +
        `and RESEND_FROM matching your verified domain (e.g. inquiry@yourdomain.com), or upgrade Render. ` +
        `Local/paid host: Hostinger use smtp.hostinger.com:465 with SMTP_SECURE=true.`
      );
    }
    if (lower.includes("ebadname") || lower.includes("enotfound")) {
      return (
        `${raw} — SMTP_HOST must be a hostname like smtp.hostinger.com or smtp.gmail.com (not your mailbox email).`
      );
    }
    if (
      lower.includes("invalid login") ||
      lower.includes("badcredentials") ||
      lower.includes("username and password not accepted") ||
      lower.includes("535") ||
      lower.includes("authentication failed")
    ) {
      return (
        `${raw} — SMTP rejected credentials. For Hostinger use the full mailbox address as SMTP_USER and the mailbox password as SMTP_PASS. For Gmail use an App Password.`
      );
    }
    return raw;
  }

  private buildOutbound(options: SendEmailOptions): OutboundMail {
    const s = this.settings!;
    const from =
      s.provider === "resend" ? s.resendFrom : s.from;
    const attachments =
      options.attachmentBuffer && options.attachmentName
        ? [
            {
              filename: options.attachmentName,
              content: options.attachmentBuffer,
              contentType: options.attachmentName
                .toLowerCase()
                .endsWith(".pdf")
                ? "application/pdf"
                : undefined,
            },
          ]
        : undefined;

    return {
      from,
      to: options.to,
      cc: options.cc,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.body,
      attachments,
    };
  }

  private async sendSmtpOnce(mail: OutboundMail): Promise<void> {
    if (!this.transporter) {
      throw new Error("SMTP transporter not initialized");
    }
    await this.transporter.sendMail({
      from: mail.from,
      to: mail.to,
      cc: mail.cc,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      attachments: mail.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
  }

  private async deliver(mail: OutboundMail): Promise<void> {
    const s = this.settings!;
    if (s.provider === "gmail_api") {
      await sendViaGmailApi({
        clientId: s.gmailClientId!,
        clientSecret: s.gmailClientSecret!,
        refreshToken: s.gmailRefreshToken!,
        user: s.gmailUser!,
        mail,
      });
      return;
    }
    if (s.provider === "resend") {
      await sendViaResend({ apiKey: s.resendApiKey!, mail });
      return;
    }

    try {
      await this.sendSmtpOnce(mail);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      if (!isTransientSmtpError(raw)) throw err;

      this.logger.warn(
        `SMTP transient failure (${raw.slice(0, 120)}); recreating transporter and retrying once…`,
      );
      this.recreateSmtpTransporter();
      await this.sendSmtpOnce(mail);
    }
  }

  async send(options: SendEmailOptions) {
    const log = await this.prisma.runWithTenant(options.tenantId, (tx) =>
      tx.emailLog.create({
        data: {
          tenant_id: options.tenantId,
          event_type: options.eventType,
          to_email: options.to,
          cc_email: options.cc,
          subject: options.subject,
          body: options.body,
          status: "PENDING",
          attachment_url: options.attachmentPath,
          attachment_name: options.attachmentName,
          quotation_id: options.quotationId,
          job_id: options.jobId,
          job_document_id: options.jobDocumentId,
          created_by: options.createdBy,
        },
      }),
    );

    if (!this.isConfigured()) {
      this.bootstrap();
    }

    if (!this.isConfigured()) {
      const msg =
        "Email not configured. On Render free tier use EMAIL_PROVIDER=resend or gmail_api (HTTPS). See docs/EMAIL_SETUP_GMAIL.md.";
      this.logger.warn(`${msg} (id=${log.id})`);
      await this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: {
            status: options.requireDelivery ? "FAILED" : "SENT",
            sent_at: options.requireDelivery ? undefined : new Date(),
            error_message: options.requireDelivery
              ? msg
              : "Email not configured — logged only.",
          },
        }),
      );
      if (options.requireDelivery) {
        throw new ServiceUnavailableException(msg);
      }
      return this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.findUniqueOrThrow({ where: { id: log.id } }),
      );
    }

    try {
      await this.deliver(this.buildOutbound(options));
      this.lastVerifyError = null;
      if (this.settings?.provider === "smtp") this.smtpReachable = true;
      return this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: { status: "SENT", sent_at: new Date() },
        }),
      );
    } catch (error: unknown) {
      const raw =
        error instanceof Error ? error.message : "Unknown email error";
      const message = this.formatDeliveryError(raw);
      this.lastVerifyError = message;
      if (this.settings?.provider === "smtp") this.smtpReachable = false;
      this.logger.error(`Email failed: ${message}`);

      const failed = await this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: { status: "FAILED", error_message: message },
        }),
      );

      if (options.requireDelivery) {
        throw new ServiceUnavailableException(
          `Email delivery failed: ${message}`,
        );
      }
      return failed;
    }
  }

  async listLogs(
    tenantId: string,
    filters: Prisma.EmailLogWhereInput = {},
    limit = 50,
  ) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailLog.findMany({
        where: { tenant_id: tenantId, ...filters },
        orderBy: { created_at: "desc" },
        take: limit,
      }),
    );
  }
}
