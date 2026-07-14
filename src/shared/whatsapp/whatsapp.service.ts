import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailEventType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

/**
 * WhatsApp stub (Week 6) — logs outbound intent until a provider is wired.
 * Same shape as EmailService send for easy swap later (Twilio / Meta Cloud API).
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async sendStatusMessage(params: {
    tenantId: string;
    toPhoneE164: string;
    body: string;
    jobId?: string;
    createdBy?: string;
  }) {
    const enabled = this.config.get<string>('WHATSAPP_ENABLED') === 'true';
    this.logger.log(
      `WhatsApp ${enabled ? 'SEND' : 'STUB'} → ${params.toPhoneE164}: ${params.body.slice(0, 80)}`,
    );

    // Persist via email_log with WHATSAPP_OUTBOUND so ops can audit stubs.
    return this.email.send({
      tenantId: params.tenantId,
      eventType: 'WHATSAPP_OUTBOUND' as EmailEventType,
      to: params.toPhoneE164,
      subject: '[WhatsApp] status notification',
      body: params.body + (enabled ? '' : '\n\n(STUB — set WHATSAPP_ENABLED=true + provider creds to deliver)'),
      jobId: params.jobId,
      createdBy: params.createdBy,
    });
  }
}
