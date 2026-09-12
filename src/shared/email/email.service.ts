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

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private settings: SmtpSettings | null = null;
  private lastVerifyError: string | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initTransporter();
  }

  private initTransporter() {
    // Prefer live process.env normalization (handles SMTP_pass casing, spaces, bad host)
    const settings = resolveSmtpSettings();
    this.settings = settings;

    const host = settings.host;
    const user = settings.user;
    const pass = settings.pass;

    if (!host || host === "localhost") {
      if (user && pass) {
        this.transporter = this.createTransport(settings);
      } else {
        this.transporter = null;
      }
      return;
    }

    this.transporter = this.createTransport(settings);
  }

  private createTransport(settings: SmtpSettings): nodemailer.Transporter {
    // Cast: @types/nodemailer TransportOptions union is awkward for SMTP fields.
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
      },
      requireTLS: !settings.secure && settings.port === 587,
      pool: false,
    } as nodemailer.TransportOptions);
  }

  async onModuleInit() {
    if (!this.transporter) {
      this.logger.warn(
        "SMTP transporter not configured — document share endpoints will return 503 until SMTP_* is set.",
      );
      return;
    }
    try {
      await this.transporter.verify();
      this.lastVerifyError = null;
      this.logger.log(
        `SMTP ready (${this.settings?.host}:${this.settings?.port} → ${this.settings?.from})`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.lastVerifyError = msg;
      this.logger.warn(`SMTP verify failed: ${this.formatSmtpError(msg)}`);
    }
  }

  isConfigured(): boolean {
    return this.transporter != null && !!this.settings?.user && !!this.settings?.pass;
  }

  getSmtpStatus() {
    return {
      configured: this.isConfigured(),
      host: this.settings?.host ?? null,
      port: this.settings?.port ?? null,
      secure: this.settings?.secure ?? null,
      from: this.settings?.from ?? null,
      last_verify_error: this.lastVerifyError,
    };
  }

  private formatSmtpError(raw: string): string {
    const lower = raw.toLowerCase();
    if (
      lower.includes("connection timeout") ||
      lower.includes("etimedout") ||
      lower.includes("econnrefused") ||
      lower.includes("connect enetunreach") ||
      lower.includes("connect ehostunreach")
    ) {
      return (
        `${raw} — Backend cannot reach the SMTP server. ` +
        `Use smtp.gmail.com:587 (STARTTLS, SMTP_SECURE=false) or :465 (SSL, SMTP_SECURE=true), ` +
        `a Gmail App Password in SMTP_PASS, and avoid port 25 on Render.`
      );
    }
    if (lower.includes("ebadname") || lower.includes("enotfound")) {
      return (
        `${raw} — SMTP_HOST must be smtp.gmail.com (not your mailbox email). ` +
        `Check SMTP_HOST / DNS.`
      );
    }
    if (
      lower.includes("invalid login") ||
      lower.includes("badcredentials") ||
      lower.includes("username and password not accepted") ||
      lower.includes("535")
    ) {
      return (
        `${raw} — Gmail rejected credentials. Use an App Password (not the normal login), ` +
        `set SMTP_USER to the full Gmail address, strip spaces in SMTP_PASS, enable 2FA.`
      );
    }
    return raw;
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

    if (!this.transporter || !this.isConfigured()) {
      // Retry init in case env was fixed after boot
      this.initTransporter();
    }

    if (!this.transporter || !this.isConfigured()) {
      const msg = "SMTP not configured — email not delivered.";
      this.logger.warn(`${msg} (id=${log.id})`);
      await this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: {
            status: options.requireDelivery ? "FAILED" : "SENT",
            sent_at: options.requireDelivery ? undefined : new Date(),
            error_message: options.requireDelivery
              ? msg
              : "SMTP not configured — logged only.",
          },
        }),
      );
      if (options.requireDelivery) {
        throw new ServiceUnavailableException(
          "Email delivery is unavailable. Configure SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER, SMTP_PASS (App Password). See docs/EMAIL_SETUP_GMAIL.md.",
        );
      }
      return this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.findUniqueOrThrow({ where: { id: log.id } }),
      );
    }

    try {
      const from =
        this.settings?.from ?? this.config.get<string>("smtp.from");
      const attachments: nodemailer.SendMailOptions["attachments"] = [];

      if (options.attachmentBuffer && options.attachmentName) {
        attachments.push({
          filename: options.attachmentName,
          content: options.attachmentBuffer,
        });
      }

      await this.transporter.sendMail({
        from,
        to: options.to,
        cc: options.cc,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.body,
        attachments,
      });

      this.lastVerifyError = null;
      return this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: { status: "SENT", sent_at: new Date() },
        }),
      );
    } catch (error: unknown) {
      const raw =
        error instanceof Error ? error.message : "Unknown email error";
      const message = this.formatSmtpError(raw);
      this.lastVerifyError = message;
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
