import { createHmac } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(private readonly prisma: PrismaService) {}

  async dispatch(tenantId: string, event: string, payload: Record<string, unknown>) {
    const webhooks = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantWebhook.findMany({
        where: {
          tenant_id: tenantId,
          is_active: true,
          deleted_at: null,
          OR: [{ events: { isEmpty: true } }, { events: { has: event } }],
        },
      }),
    );

    for (const webhook of webhooks) {
      await this.deliverOne(tenantId, webhook.id, webhook.url, webhook.secret, event, payload);
    }
  }

  private async deliverOne(
    tenantId: string,
    webhookId: string,
    url: string,
    secret: string,
    event: string,
    payload: Record<string, unknown>,
  ) {
    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({ event, timestamp, data: payload });
    const signature = createHmac('sha256', secret)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    const delivery = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantWebhookDelivery.create({
        data: {
          tenant_id: tenantId,
          webhook_id: webhookId,
          event,
          payload: payload as object,
          status: 'PENDING',
          signature,
        },
      }),
    );

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Timestamp': String(timestamp),
          'X-Webhook-Signature': `sha256=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(15_000),
      });

      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.tenantWebhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: res.ok ? 'DELIVERED' : 'FAILED',
            attempts: 1,
            response_status: res.status,
            delivered_at: res.ok ? new Date() : undefined,
            error_message: res.ok ? undefined : `HTTP ${res.status}`,
          },
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delivery failed';
      this.logger.warn(`Webhook ${webhookId} delivery failed: ${message}`);
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.tenantWebhookDelivery.update({
          where: { id: delivery.id },
          data: { status: 'FAILED', attempts: 1, error_message: message },
        }),
      );
    }
  }
}
