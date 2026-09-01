import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { CampaignStatus } from "@prisma/client";
import { Job as BullJob } from "bull";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../../shared/email/email.service";
import { NotificationEmitterService } from "../../modules/notifications/notification-emitter.service";
import {
  EMAIL_CAMPAIGN_QUEUE,
  EmailCampaignJobPayload,
} from "./queue.constants";

const BATCH_SIZE = 50;

@Processor(EMAIL_CAMPAIGN_QUEUE)
export class EmailCampaignProcessor {
  private readonly logger = new Logger(EmailCampaignProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  @Process("dispatch-batch")
  async handleBatch(job: BullJob<EmailCampaignJobPayload>) {
    const {
      tenantId,
      campaignId,
      actorId,
      offset = 0,
      batchSize = BATCH_SIZE,
    } = job.data;

    const campaign = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailCampaign.findFirst({
        where: { id: campaignId, tenant_id: tenantId, deleted_at: null },
      }),
    );

    if (
      !campaign ||
      campaign.status === CampaignStatus.SENT ||
      campaign.status === CampaignStatus.CANCELLED
    ) {
      return;
    }

    const subscribers = await this.resolveRecipients(
      tenantId,
      campaign,
      offset,
      batchSize,
    );
    if (!subscribers.length) {
      await this.finalizeIfComplete(
        tenantId,
        campaignId,
        actorId,
        campaign.name,
      );
      return;
    }

    let sentDelta = 0;
    let failedDelta = 0;

    for (const sub of subscribers) {
      const log = await this.email.send({
        tenantId,
        eventType: "CRM_CAMPAIGN",
        to: sub.email,
        subject: campaign.subject,
        body: campaign.body,
        createdBy: actorId,
      });
      if (log.status === "SENT") sentDelta += 1;
      else failedDelta += 1;
    }

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailCampaign.update({
        where: { id: campaignId },
        data: {
          sent_count: { increment: sentDelta },
          failed_count: { increment: failedDelta },
        },
      }),
    );

    if (subscribers.length === batchSize) {
      await job.queue.add(
        "dispatch-batch",
        {
          tenantId,
          campaignId,
          actorId,
          offset: offset + batchSize,
          batchSize,
        },
        { jobId: `${campaignId}:${offset + batchSize}` },
      );
      return;
    }

    await this.finalizeIfComplete(tenantId, campaignId, actorId, campaign.name);
  }

  private async finalizeIfComplete(
    tenantId: string,
    campaignId: string,
    actorId: string | undefined,
    campaignName: string,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailCampaign.update({
        where: { id: campaignId },
        data: {
          status: CampaignStatus.SENT,
          sent_at: new Date(),
        },
      }),
    );

    if (actorId) {
      await this.notifications.notifyStaffUser(tenantId, actorId, {
        type: "CAMPAIGN_SENT",
        title: "Campaign sent",
        message: `${campaignName}: ${updated.sent_count} sent, ${updated.failed_count} failed.`,
        entity_type: "email_campaign",
        entity_id: campaignId,
        link_path: `/crm/campaigns/${campaignId}`,
      });
    }
  }

  private async resolveRecipients(
    tenantId: string,
    campaign: {
      filter_party_type: string | null;
      filter_country: string | null;
    },
    offset: number,
    take: number,
  ) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.crmSubscriber.findMany({
        where: {
          tenant_id: tenantId,
          unsubscribed_at: null,
          ...(campaign.filter_country
            ? { country_code: campaign.filter_country }
            : {}),
          ...(campaign.filter_party_type
            ? { party: { party_type: campaign.filter_party_type as never } }
            : {}),
        },
        select: { id: true, email: true },
        skip: offset,
        take,
        orderBy: { created_at: "asc" },
      }),
    );
  }
}
