import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailEventType } from '@prisma/client';
import { EmailService } from '../email/email.service';

/**
 * WhatsApp outbound (Week 6).
 * Until a provider is wired, this is an explicit stub:
 * - WHATSAPP_ENABLED!=true → audit log only, delivered=false
 * - WHATSAPP_ENABLED=true without provider credentials → clear failure
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly config: ConfigService,
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
    const provider = (this.config.get<string>('WHATSAPP_PROVIDER') ?? '').trim().toLowerCase();
    const hasCreds = Boolean(
      this.config.get<string>('WHATSAPP_API_TOKEN') || this.config.get<string>('TWILIO_AUTH_TOKEN'),
    );

    if (enabled && (!provider || !hasCreds)) {
      this.logger.error(
        `WhatsApp enabled but provider/credentials missing (to=${params.toPhoneE164})`,
      );
      throw new ServiceUnavailableException(
        'WhatsApp is enabled but not configured. Set WHATSAPP_PROVIDER and API credentials, or set WHATSAPP_ENABLED=false for stub mode.',
      );
    }

    this.logger.log(
      `WhatsApp ${enabled ? 'SEND' : 'STUB'} → ${params.toPhoneE164}: ${params.body.slice(0, 80)}`,
    );

    // Persist via email_log with WHATSAPP_OUTBOUND so ops can audit stubs / attempts.
    const log = await this.email.send({
      tenantId: params.tenantId,
      eventType: 'WHATSAPP_OUTBOUND' as EmailEventType,
      to: params.toPhoneE164,
      subject: '[WhatsApp] status notification',
      body:
        params.body +
        (enabled
          ? ''
          : '\n\n(STUB — not delivered. Set WHATSAPP_ENABLED=true + provider creds to deliver)'),
      jobId: params.jobId,
      createdBy: params.createdBy,
    });

    return {
      ...log,
      channel: 'whatsapp' as const,
      stub: !enabled,
      delivered: false,
      message: enabled
        ? 'WhatsApp provider not yet implemented — message audited only.'
        : 'WhatsApp stub: message logged for audit, not delivered to the recipient.',
    };
  }
}
