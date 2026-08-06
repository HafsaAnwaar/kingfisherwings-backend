import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailEventType, EmailStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const host = this.config.get<string>('smtp.host');
    const port = this.config.get<number>('smtp.port');
    const user = this.config.get<string>('smtp.user');
    const pass = this.config.get<string>('smtp.pass');

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: this.config.get<boolean>('smtp.secure'),
        auth: user && pass ? { user, pass } : undefined,
      });
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
          status: 'PENDING',
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
      this.logger.warn(`SMTP not configured — email logged only (id=${log.id})`);
      await this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: { status: 'SENT', sent_at: new Date(), error_message: 'SMTP not configured — logged only.' },
        }),
      );
      return log;
    }

    try {
      const from = this.config.get<string>('smtp.from');
      const attachments: nodemailer.SendMailOptions['attachments'] = [];

      if (options.attachmentBuffer && options.attachmentName) {
        attachments.push({ filename: options.attachmentName, content: options.attachmentBuffer });
      }

      await this.transporter.sendMail({
        from,
        to: options.to,
        cc: options.cc,
        subject: options.subject,
        html: options.body,
        attachments,
      });

      return this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: { status: 'SENT', sent_at: new Date() },
        }),
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown email error';
      this.logger.error(`Email failed: ${message}`);

      return this.prisma.runWithTenant(options.tenantId, (tx) =>
        tx.emailLog.update({
          where: { id: log.id },
          data: { status: 'FAILED', error_message: message },
        }),
      );
    }
  }

  async listLogs(tenantId: string, filters: Prisma.EmailLogWhereInput = {}, limit = 50) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailLog.findMany({
        where: { tenant_id: tenantId, ...filters },
        orderBy: { created_at: 'desc' },
        take: limit,
      }),
    );
  }
}
