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

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const host = this.config.get<string>("smtp.host");
    const port = this.config.get<number>("smtp.port");
    const user = this.config.get<string>("smtp.user");
    const pass = this.config.get<string>("smtp.pass");

    if (host && host !== "localhost") {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: this.config.get<boolean>("smtp.secure"),
        auth: user && pass ? { user, pass } : undefined,
      });
    } else if (host === "localhost" && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: this.config.get<boolean>("smtp.secure"),
        auth: { user, pass },
      });
    }
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
      this.logger.log(
        `SMTP ready (${this.config.get<string>("smtp.host")} → ${this.config.get<string>("smtp.from")})`,
      );
    } catch (err) {
      this.logger.warn(
        `SMTP verify failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  isConfigured(): boolean {
    return this.transporter != null;
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

    if (!this.transporter) {
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
          "Email delivery is unavailable. Configure SMTP_HOST / SMTP_USER / SMTP_PASS (see docs/EMAIL_SETUP_GMAIL.md).",
        );
      }
      return this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.findUniqueOrThrow({ where: { id: log.id } }),
      );
    }

    try {
      const from = this.config.get<string>("smtp.from");
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

      return this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: { status: "SENT", sent_at: new Date() },
        }),
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown email error";
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
