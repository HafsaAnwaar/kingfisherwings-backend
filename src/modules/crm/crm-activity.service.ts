import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FollowUpStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationEmitterService } from '../notifications/notification-emitter.service';
import { QuotationsService } from '../quotations/quotations.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { isCrmManager, salespersonScope } from './crm-access';
import { CrmLeadsService } from './crm-leads.service';
import {
  CallLogQueryDto,
  CreateCallLogDto,
  CreateEnquiryDto,
  CreateFollowUpDto,
  EnquiryQueryDto,
  FollowUpQueryDto,
  PatchFollowUpDto,
  UpdateEnquiryDto,
} from './dto/crm.dto';

@Injectable()
export class CrmActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotations: QuotationsService,
    private readonly leads: CrmLeadsService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async createCallLog(user: CurrentUser, dto: CreateCallLogDto, attachmentPath?: string) {
    if (!dto.lead_id && !dto.party_id) {
      throw new BadRequestException('Provide either lead_id or party_id.');
    }
    if (dto.lead_id && dto.party_id) {
      throw new BadRequestException('Provide lead_id or party_id, not both.');
    }
    if (dto.lead_id) await this.leads.requireLead(user, dto.lead_id);

    const log = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.callLog.create({
        data: {
          tenant_id: user.tenantId,
          owner_id: user.id,
          lead_id: dto.lead_id ?? null,
          party_id: dto.party_id ?? null,
          date_time: new Date(dto.date_time),
          contact_person: dto.contact_person.trim(),
          call_type: dto.call_type,
          purpose: dto.purpose,
          discussion_summary: dto.discussion_summary.trim(),
          outcome: dto.outcome,
          next_action: dto.next_action ?? null,
          next_followup_date: dto.next_followup_date ? new Date(dto.next_followup_date) : null,
          gps_latitude: dto.gps_latitude ?? null,
          gps_longitude: dto.gps_longitude ?? null,
          duration_minutes: dto.duration_minutes ?? null,
          attachment_path: attachmentPath ?? null,
          created_by: user.id,
        },
      }),
    );

    if (dto.next_followup_date) {
      await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.followUp.create({
          data: {
            tenant_id: user.tenantId,
            owner_id: user.id,
            lead_id: dto.lead_id ?? null,
            party_id: dto.party_id ?? null,
            due_date: new Date(dto.next_followup_date!),
            subject: dto.next_action || `Follow-up after ${dto.call_type} call`,
            notes: dto.discussion_summary,
            created_by: user.id,
          },
        }),
      );
    }

    if (dto.lead_id) {
      await this.leads.addActivity(
        user.tenantId,
        dto.lead_id,
        'CALL',
        `${dto.call_type} call — ${dto.outcome}`,
        user.id,
      );
    }

    return { success: true, data: log };
  }

  async listCallLogs(user: CurrentUser, query: CallLogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const ownerId = salespersonScope(user, query.salesperson_id);
    const where: Prisma.CallLogWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(ownerId ? { owner_id: ownerId } : {}),
      ...(query.lead_id ? { lead_id: query.lead_id } : {}),
      ...(query.party_id ? { party_id: query.party_id } : {}),
      ...(query.date
        ? {
            date_time: {
              gte: new Date(`${query.date}T00:00:00.000Z`),
              lt: new Date(`${query.date}T23:59:59.999Z`),
            },
          }
        : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.callLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { date_time: 'desc' },
        }),
        tx.callLog.count({ where }),
      ]),
    );
    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async dailySheet(user: CurrentUser, date: string, salespersonId?: string) {
    const ownerId = salespersonScope(user, salespersonId);
    const day = date || new Date().toISOString().slice(0, 10);
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.callLog.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(ownerId ? { owner_id: ownerId } : {}),
          date_time: {
            gte: new Date(`${day}T00:00:00.000Z`),
            lt: new Date(`${day}T23:59:59.999Z`),
          },
        },
        orderBy: { date_time: 'asc' },
      }),
    );
    return { success: true, data: { date: day, count: rows.length, calls: rows } };
  }

  async createFollowUp(user: CurrentUser, dto: CreateFollowUpDto) {
    const ownerId = dto.owner_id ?? user.id;
    salespersonScope(user, ownerId);
    const followUp = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.followUp.create({
        data: {
          tenant_id: user.tenantId,
          owner_id: ownerId,
          lead_id: dto.lead_id ?? null,
          party_id: dto.party_id ?? null,
          enquiry_id: dto.enquiry_id ?? null,
          due_date: new Date(dto.due_date),
          subject: dto.subject.trim(),
          notes: dto.notes ?? null,
          created_by: user.id,
        },
      }),
    );
    if (dto.lead_id) {
      await this.leads.addActivity(user.tenantId, dto.lead_id, 'FOLLOW_UP', dto.subject, user.id);
    }
    return { success: true, data: followUp };
  }

  async listFollowUps(user: CurrentUser, query: FollowUpQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const team = query.team === true && isCrmManager(user);
    const ownerId = team ? query.owner_id : salespersonScope(user, query.owner_id);
    const where: Prisma.FollowUpWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(ownerId ? { owner_id: ownerId } : {}),
      ...(query.from || query.to
        ? {
            due_date: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.followUp.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { due_date: 'asc' },
        }),
        tx.followUp.count({ where }),
      ]),
    );
    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async calendar(user: CurrentUser, from?: string, to?: string) {
    const ownerId = salespersonScope(user);
    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.followUp.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          status: 'PENDING',
          ...(ownerId ? { owner_id: ownerId } : {}),
          due_date: { gte: start, lte: end },
        },
        orderBy: { due_date: 'asc' },
      }),
    );
    return { success: true, data: rows };
  }

  async patchFollowUp(user: CurrentUser, id: string, dto: PatchFollowUpDto) {
    const ownerId = salespersonScope(user);
    const existing = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.followUp.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(ownerId ? { owner_id: ownerId } : {}),
        },
      }),
    );
    if (!existing) throw new NotFoundException('Follow-up not found.');

    const completed = dto.status === FollowUpStatus.COMPLETED;
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.followUp.update({
        where: { id },
        data: {
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.due_date ? { due_date: new Date(dto.due_date) } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          ...(completed ? { completed_at: new Date() } : {}),
        },
      }),
    );
    return { success: true, data: updated };
  }

  async createEnquiry(user: CurrentUser, dto: CreateEnquiryDto) {
    const salespersonId = dto.salesperson_id ?? user.id;
    salespersonScope(user, salespersonId);
    if (dto.lead_id) await this.leads.requireLead(user, dto.lead_id);

    const enquiry = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.create({
        data: {
          tenant_id: user.tenantId,
          lead_id: dto.lead_id ?? null,
          party_id: dto.party_id ?? null,
          salesperson_id: salespersonId,
          service_type: dto.service_type,
          origin_port_id: dto.origin_port_id ?? null,
          dest_port_id: dto.dest_port_id ?? null,
          cargo_details: dto.cargo_details ?? null,
          incoterms: dto.incoterms ?? null,
          special_requirements: dto.special_requirements ?? null,
          currency_code: dto.currency_code,
          created_by: user.id,
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: enquiry };
  }

  async listEnquiries(user: CurrentUser, query: EnquiryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const salespersonId = salespersonScope(user, query.salesperson_id);
    const where: Prisma.EnquiryWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(salespersonId ? { salesperson_id: salespersonId } : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.enquiry.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        tx.enquiry.count({ where }),
      ]),
    );
    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getEnquiry(user: CurrentUser, id: string) {
    return { success: true, data: await this.requireEnquiry(user, id) };
  }

  async updateEnquiry(user: CurrentUser, id: string, dto: UpdateEnquiryDto) {
    await this.requireEnquiry(user, id);
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.update({
        where: { id },
        data: {
          ...(dto.party_id !== undefined ? { party_id: dto.party_id } : {}),
          ...(dto.lead_id !== undefined ? { lead_id: dto.lead_id } : {}),
          ...(dto.salesperson_id !== undefined ? { salesperson_id: dto.salesperson_id } : {}),
          ...(dto.service_type !== undefined ? { service_type: dto.service_type } : {}),
          ...(dto.origin_port_id !== undefined ? { origin_port_id: dto.origin_port_id } : {}),
          ...(dto.dest_port_id !== undefined ? { dest_port_id: dto.dest_port_id } : {}),
          ...(dto.cargo_details !== undefined ? { cargo_details: dto.cargo_details } : {}),
          ...(dto.incoterms !== undefined ? { incoterms: dto.incoterms } : {}),
          ...(dto.special_requirements !== undefined
            ? { special_requirements: dto.special_requirements }
            : {}),
          ...(dto.currency_code !== undefined ? { currency_code: dto.currency_code } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async convertToQuote(user: CurrentUser, id: string) {
    const enquiry = await this.requireEnquiry(user, id);
    if (enquiry.quotation_id) {
      throw new BadRequestException('Enquiry already converted to a quotation.');
    }

    let customerId = enquiry.party_id;
    if (!customerId && enquiry.lead_id) {
      const lead = await this.leads.requireLead(user, enquiry.lead_id);
      customerId = lead.converted_party_id;
    }
    if (!customerId) {
      throw new BadRequestException(
        'Enquiry needs a customer party. Convert the lead first or set party_id.',
      );
    }

    const quote = await this.quotations.create(
      user.tenantId,
      {
        job_type: enquiry.service_type,
        customer_id: customerId,
        salesperson_id: enquiry.salesperson_id ?? user.id,
        origin_port_id: enquiry.origin_port_id ?? undefined,
        dest_port_id: enquiry.dest_port_id ?? undefined,
        incoterm: enquiry.incoterms ?? undefined,
        commodity: enquiry.cargo_details ?? undefined,
        special_requirements: enquiry.special_requirements ?? undefined,
        currency_code: enquiry.currency_code,
        remarks: `Converted from CRM enquiry ${enquiry.id}`,
      },
      user.id,
    );

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.update({
        where: { id },
        data: { quotation_id: quote.id, status: 'QUOTED', updated_by: user.id },
      }),
    );
    return { success: true, data: { enquiry: updated, quotation: quote } };
  }

  async notifyDueFollowUps() {
    const tenants = await this.prisma.tenant.findMany({
      where: { status: { in: ['ACTIVE', 'TRIAL'] }, is_active: true, deleted_at: null },
      select: { id: true },
    });
    let notified = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const tenant of tenants) {
      const due = await this.prisma.runWithTenant(tenant.id, (tx) =>
        tx.followUp.findMany({
          where: {
            tenant_id: tenant.id,
            deleted_at: null,
            status: 'PENDING',
            reminder_sent_at: null,
            due_date: { lte: today },
          },
          take: 200,
        }),
      );
      for (const item of due) {
        const claimed = await this.prisma.runWithTenant(tenant.id, (tx) =>
          tx.followUp.updateMany({
            where: {
              id: item.id,
              tenant_id: tenant.id,
              deleted_at: null,
              status: 'PENDING',
              reminder_sent_at: null,
            },
            data: { reminder_sent_at: new Date() },
          }),
        );

        if (claimed.count === 0) {
          continue;
        }

        await this.notifications.notifyStaffUser(tenant.id, item.owner_id, {
          type: 'FOLLOW_UP_DUE',
          title: 'Follow-up due',
          message: item.subject,
          entity_type: 'follow_up',
          entity_id: item.id,
          link_path: `/crm/follow-ups/${item.id}`,
        });
        notified += 1;
      }
    }
    return notified;
  }

  private async requireEnquiry(user: CurrentUser, id: string) {
    const salespersonId = salespersonScope(user);
    const enquiry = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(salespersonId ? { salesperson_id: salespersonId } : {}),
        },
      }),
    );
    if (!enquiry) throw new NotFoundException('Enquiry not found.');
    return enquiry;
  }
}
