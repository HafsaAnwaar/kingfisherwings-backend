import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { CampaignStatus, PartyType, Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../../shared/email/email.service";
import { EMAIL_CAMPAIGN_QUEUE } from "../../shared/queue/queue.constants";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import {
  CreateCampaignDto,
  CreateCampaignTemplateDto,
  CreateSubscriberDto,
} from "./dto/crm.dto";

@Injectable()
export class CrmEmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationEmitterService,
    @InjectQueue(EMAIL_CAMPAIGN_QUEUE) private readonly campaignQueue: Queue,
  ) {}

  async createSubscriber(user: CurrentUser, dto: CreateSubscriberDto) {
    const email = dto.email.trim().toLowerCase();
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.crmSubscriber.upsert({
        where: { tenant_id_email: { tenant_id: user.tenantId, email } },
        create: {
          tenant_id: user.tenantId,
          email,
          full_name: dto.full_name ?? null,
          party_id: dto.party_id ?? null,
          country_code: dto.country_code ?? null,
          tags: dto.tags ?? [],
        },
        update: {
          full_name: dto.full_name ?? undefined,
          party_id: dto.party_id ?? undefined,
          country_code: dto.country_code ?? undefined,
          tags: dto.tags ?? undefined,
          unsubscribed_at: null,
        },
      }),
    );
    return { success: true, data: row };
  }

  async listSubscribers(user: CurrentUser) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.crmSubscriber.findMany({
        where: { tenant_id: user.tenantId },
        orderBy: { created_at: "desc" },
        take: 2000,
      }),
    );
    return { success: true, data: rows };
  }

  async unsubscribe(user: CurrentUser, id: string) {
    const existing = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.crmSubscriber.findFirst({ where: { id, tenant_id: user.tenantId } }),
    );
    if (!existing) throw new NotFoundException("Subscriber not found.");
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.crmSubscriber.update({
        where: { id },
        data: { unsubscribed_at: new Date() },
      }),
    );
    return { success: true, data: updated };
  }

  async importSubscribers(user: CurrentUser, buffer: Buffer) {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;
    let created = 0;
    const errors: Array<{ row: number; message: string }> = [];
    for (const [index, row] of records.entries()) {
      try {
        if (!row.email) throw new Error("email is required.");
        await this.createSubscriber(user, {
          email: row.email,
          full_name: row.full_name || undefined,
          country_code: row.country_code || undefined,
          tags: row.tags
            ? row.tags
                .split("|")
                .map((t) => t.trim())
                .filter(Boolean)
            : undefined,
        });
        created += 1;
      } catch (err) {
        errors.push({
          row: index + 2,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { success: true, data: { created, failed: errors.length, errors } };
  }

  async createTemplate(user: CurrentUser, dto: CreateCampaignTemplateDto) {
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.emailCampaignTemplate.create({
        data: {
          tenant_id: user.tenantId,
          name: dto.name.trim(),
          subject: dto.subject.trim(),
          body: dto.body,
          created_by: user.id,
        },
      }),
    );
    return { success: true, data: row };
  }

  async listTemplates(user: CurrentUser) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.emailCampaignTemplate.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data: rows };
  }

  async createCampaign(user: CurrentUser, dto: CreateCampaignDto) {
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.emailCampaign.create({
        data: {
          tenant_id: user.tenantId,
          name: dto.name.trim(),
          subject: dto.subject.trim(),
          body: dto.body,
          status: dto.scheduled_at ? "SCHEDULED" : "DRAFT",
          scheduled_at: dto.scheduled_at ? new Date(dto.scheduled_at) : null,
          filter_party_type: dto.filter_party_type ?? null,
          filter_country: dto.filter_country ?? null,
          created_by: user.id,
        },
      }),
    );
    return { success: true, data: row };
  }

  async listCampaigns(user: CurrentUser) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.emailCampaign.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data: rows };
  }

  async schedule(user: CurrentUser, id: string, scheduledAt: string) {
    const campaign = await this.requireCampaign(user.tenantId, id);
    if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
      throw new BadRequestException(
        "Only draft or scheduled campaigns can be rescheduled.",
      );
    }
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.emailCampaign.update({
        where: { id },
        data: { status: "SCHEDULED", scheduled_at: new Date(scheduledAt) },
      }),
    );
    return { success: true, data: updated };
  }

  async sendNow(user: CurrentUser, id: string) {
    const campaign = await this.requireCampaign(user.tenantId, id);
    if (campaign.status === "SENT" || campaign.status === "SENDING") {
      throw new BadRequestException("Campaign has already been sent.");
    }
    const result = await this.dispatchCampaign(
      user.tenantId,
      campaign.id,
      user.id,
    );
    if (!result) {
      throw new BadRequestException(
        "Campaign is already being sent or has been sent.",
      );
    }
    return result;
  }

  async processScheduledCampaigns() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        status: { in: ["ACTIVE", "TRIAL"] },
        is_active: true,
        deleted_at: null,
      },
      select: { id: true },
    });
    let sent = 0;
    for (const tenant of tenants) {
      const due = await this.prisma.runWithTenant(tenant.id, (tx) =>
        tx.emailCampaign.findMany({
          where: {
            tenant_id: tenant.id,
            deleted_at: null,
            status: "SCHEDULED",
            scheduled_at: { lte: new Date() },
          },
          take: 20,
        }),
      );
      for (const campaign of due) {
        const result = await this.dispatchCampaign(
          tenant.id,
          campaign.id,
          campaign.created_by ?? undefined,
        );
        if (result) {
          sent += 1;
        }
      }
    }
    return sent;
  }

  private async dispatchCampaign(
    tenantId: string,
    campaignId: string,
    actorId?: string,
  ) {
    const claimed = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailCampaign.updateMany({
        where: {
          id: campaignId,
          tenant_id: tenantId,
          deleted_at: null,
          status: { in: [CampaignStatus.DRAFT, CampaignStatus.SCHEDULED] },
        },
        data: { status: CampaignStatus.SENDING },
      }),
    );

    if (claimed.count === 0) {
      return null;
    }

    const campaign = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailCampaign.findFirst({
        where: { id: campaignId, tenant_id: tenantId, deleted_at: null },
      }),
    );

    if (!campaign) {
      return null;
    }

    await this.campaignQueue.add(
      "dispatch-batch",
      { tenantId, campaignId, actorId, offset: 0, batchSize: 50 },
      { jobId: `${campaignId}:0`, removeOnComplete: true },
    );

    return {
      success: true,
      data: campaign,
      message: "Campaign dispatch queued.",
    };
  }

  private async requireCampaign(tenantId: string, id: string) {
    const campaign = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailCampaign.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!campaign) throw new NotFoundException("Campaign not found.");
    return campaign;
  }
}
