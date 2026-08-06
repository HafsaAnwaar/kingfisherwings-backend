import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreditLimitRequestStatus,
  PortalDisputeStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCreditLimitRequestDto,
  CreatePortalDisputeDto,
  CreatePortalMessageDto,
  PortalDisputeQueryDto,
  PortalMessageQueryDto,
  ReviewCreditLimitRequestDto,
  ReviewPortalDisputeDto,
  StaffPortalInboxQueryDto,
} from './dto/portal-ccp.dto';
import { portalJobOwnershipWhere } from './helpers/portal-ownership.helper';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { NotificationEmitterService } from '../notifications/notification-emitter.service';

@Injectable()
export class PortalCcpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  // ─── Messages ──────────────────────────────────────────────

  async createMessage(user: CurrentPortalUser, dto: CreatePortalMessageDto) {
    if (dto.job_id) await this.assertOwnedJob(user, dto.job_id);
    if (dto.invoice_id) await this.assertOwnedInvoice(user, dto.invoice_id);

    const message = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.portalMessage.create({
        data: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          portal_user_id: user.id,
          subject: dto.subject.trim(),
          body: dto.body.trim(),
          job_id: dto.job_id,
          invoice_id: dto.invoice_id,
        },
      }),
    );

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: 'PORTAL_MESSAGE',
      title: `Portal message: ${message.subject}`,
      message: `${user.fullName} sent a message from the customer portal.`,
      entity_type: 'portal_message',
      entity_id: message.id,
      link_path: `/portal-admin/messages/${message.id}`,
    });

    return {
      success: true,
      message: 'Message sent to your forwarder.',
      data: this.toMessage(message),
    };
  }

  async listMyMessages(user: CurrentPortalUser, query: PortalMessageQueryDto) {
    const where: Prisma.PortalMessageWhereInput = {
      tenant_id: user.tenantId,
      party_id: user.partyId,
      portal_user_id: user.id,
    };

    const [rows, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.portalMessage.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        tx.portalMessage.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows.map((m) => this.toMessage(m)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async staffListMessages(tenantId: string, query: StaffPortalInboxQueryDto) {
    const where: Prisma.PortalMessageWhereInput = {
      tenant_id: tenantId,
      ...(query.party_id ? { party_id: query.party_id } : {}),
      ...(query.unread_only === 'true' || query.unread_only === '1'
        ? { read_by_staff_at: null }
        : {}),
    };

    const [rows, total] = await this.prisma.runWithTenant(tenantId, async (tx) =>
      Promise.all([
        tx.portalMessage.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          include: {
            party: { select: { id: true, name: true, code: true } },
            portal_user: { select: { id: true, email: true, full_name: true } },
          },
        }),
        tx.portalMessage.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async staffMarkMessageRead(tenantId: string, id: string) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.portalMessage.findFirst({
        where: { id, tenant_id: tenantId },
      });
      if (!existing) throw new NotFoundException('Message not found.');

      return tx.portalMessage.update({
        where: { id },
        data: { read_by_staff_at: existing.read_by_staff_at ?? new Date() },
      });
    });

    return { success: true, data: this.toMessage(updated) };
  }

  // ─── Disputes ──────────────────────────────────────────────

  async createDispute(user: CurrentPortalUser, dto: CreatePortalDisputeDto) {
    await this.assertOwnedInvoice(user, dto.invoice_id);

    const open = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.portalDispute.findFirst({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          invoice_id: dto.invoice_id,
          status: { in: [PortalDisputeStatus.OPEN, PortalDisputeStatus.UNDER_REVIEW] },
        },
      }),
    );
    if (open) {
      throw new BadRequestException('An open dispute already exists for this invoice.');
    }

    const dispute = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.portalDispute.create({
        data: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          portal_user_id: user.id,
          invoice_id: dto.invoice_id,
          reason: dto.reason.trim(),
          description: dto.description.trim(),
        },
      }),
    );

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: 'PORTAL_DISPUTE',
      title: `Invoice dispute: ${dto.reason}`,
      message: `${user.fullName} raised a dispute on an invoice.`,
      entity_type: 'portal_dispute',
      entity_id: dispute.id,
      link_path: `/portal-admin/disputes/${dispute.id}`,
    });

    return { success: true, data: dispute };
  }

  async listMyDisputes(user: CurrentPortalUser, query: PortalDisputeQueryDto) {
    const where: Prisma.PortalDisputeWhereInput = {
      tenant_id: user.tenantId,
      party_id: user.partyId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [rows, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) =>
      Promise.all([
        tx.portalDispute.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        tx.portalDispute.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async staffListDisputes(tenantId: string, query: PortalDisputeQueryDto & { party_id?: string }) {
    const where: Prisma.PortalDisputeWhereInput = {
      tenant_id: tenantId,
      ...(query.party_id ? { party_id: query.party_id } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [rows, total] = await this.prisma.runWithTenant(tenantId, async (tx) =>
      Promise.all([
        tx.portalDispute.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          include: {
            party: { select: { id: true, name: true, code: true } },
            portal_user: { select: { id: true, email: true, full_name: true } },
          },
        }),
        tx.portalDispute.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async staffReviewDispute(
    tenantId: string,
    actorId: string,
    id: string,
    dto: ReviewPortalDisputeDto,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.portalDispute.findFirst({
        where: { id, tenant_id: tenantId },
      });
      if (!existing) throw new NotFoundException('Dispute not found.');

      const terminal =
        dto.status === PortalDisputeStatus.RESOLVED || dto.status === PortalDisputeStatus.REJECTED;

      return tx.portalDispute.update({
        where: { id },
        data: {
          status: dto.status,
          staff_notes: dto.staff_notes?.trim() ?? existing.staff_notes,
          ...(terminal
            ? { resolved_at: new Date(), resolved_by: actorId }
            : { resolved_at: null, resolved_by: null }),
        },
      });
    });

    await this.notifications.notifyPortalUser(tenantId, updated.portal_user_id, {
      type: 'PORTAL_DISPUTE',
      title: `Dispute ${dto.status.toLowerCase().replace('_', ' ')}`,
      message: `Your invoice dispute was updated to ${dto.status}.`,
      entity_type: 'portal_dispute',
      entity_id: updated.id,
      link_path: `/portal/disputes/${updated.id}`,
    });

    return { success: true, data: updated };
  }

  // ─── Credit limit requests ─────────────────────────────────

  async createCreditLimitRequest(user: CurrentPortalUser, dto: CreateCreditLimitRequestDto) {
    const party = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: user.partyId, tenant_id: user.tenantId, deleted_at: null },
        select: { credit_limit: true },
      }),
    );
    if (!party) throw new NotFoundException('Party not found.');

    const pending = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.creditLimitRequest.findFirst({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          status: CreditLimitRequestStatus.PENDING,
        },
      }),
    );
    if (pending) {
      throw new BadRequestException('A pending credit limit request already exists.');
    }

    const current = party.credit_limit != null ? Number(party.credit_limit) : null;
    if (current != null && dto.requested_limit <= current) {
      throw new BadRequestException('Requested limit must be higher than the current limit.');
    }

    const request = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.creditLimitRequest.create({
        data: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          portal_user_id: user.id,
          requested_limit: dto.requested_limit,
          current_limit: party.credit_limit,
          justification: dto.justification.trim(),
        },
      }),
    );

    await this.notifications.notifyStaffOfPortalEvent(user.tenantId, {
      type: 'CREDIT_LIMIT_REQUEST',
      title: 'Credit limit increase requested',
      message: `${user.fullName} requested a credit limit of ${dto.requested_limit}.`,
      entity_type: 'credit_limit_request',
      entity_id: request.id,
      link_path: `/portal-admin/credit-limit-requests/${request.id}`,
    });

    return { success: true, data: request };
  }

  async listMyCreditLimitRequests(user: CurrentPortalUser) {
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.creditLimitRequest.findMany({
        where: { tenant_id: user.tenantId, party_id: user.partyId },
        orderBy: { created_at: 'desc' },
      }),
    );

    return { success: true, data: rows };
  }

  async staffListCreditLimitRequests(
    tenantId: string,
    query: { page?: number; limit?: number; party_id?: string; status?: CreditLimitRequestStatus },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CreditLimitRequestWhereInput = {
      tenant_id: tenantId,
      ...(query.party_id ? { party_id: query.party_id } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [rows, total] = await this.prisma.runWithTenant(tenantId, async (tx) =>
      Promise.all([
        tx.creditLimitRequest.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            party: { select: { id: true, name: true, code: true, credit_limit: true } },
            portal_user: { select: { id: true, email: true, full_name: true } },
          },
        }),
        tx.creditLimitRequest.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async staffReviewCreditLimitRequest(
    tenantId: string,
    actorId: string,
    id: string,
    dto: ReviewCreditLimitRequestDto,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.creditLimitRequest.findFirst({
        where: { id, tenant_id: tenantId },
      });
      if (!existing) throw new NotFoundException('Credit limit request not found.');
      if (existing.status !== CreditLimitRequestStatus.PENDING) {
        throw new BadRequestException('Only PENDING requests can be reviewed.');
      }

      if (dto.status === CreditLimitRequestStatus.APPROVED) {
        const newLimit = dto.approved_limit ?? Number(existing.requested_limit);
        await tx.party.update({
          where: { id: existing.party_id },
          data: { credit_limit: newLimit, updated_by: actorId },
        });
      }

      return tx.creditLimitRequest.update({
        where: { id },
        data: {
          status: dto.status,
          reviewed_by: actorId,
          reviewed_at: new Date(),
          review_notes: dto.review_notes?.trim() ?? null,
        },
      });
    });

    await this.notifications.notifyPortalUser(tenantId, updated.portal_user_id, {
      type: 'CREDIT_LIMIT_REQUEST',
      title: `Credit limit request ${dto.status.toLowerCase()}`,
      message:
        dto.status === CreditLimitRequestStatus.APPROVED
          ? 'Your credit limit increase was approved.'
          : 'Your credit limit increase was rejected.',
      entity_type: 'credit_limit_request',
      entity_id: updated.id,
      link_path: `/portal/credit/limit-requests`,
    });

    return { success: true, data: updated };
  }

  // ─── Helpers ───────────────────────────────────────────────

  private toMessage(m: {
    id: string;
    subject: string;
    body: string;
    job_id: string | null;
    invoice_id: string | null;
    created_at: Date;
    read_by_staff_at: Date | null;
  }) {
    return {
      id: m.id,
      subject: m.subject,
      body: m.body,
      job_id: m.job_id,
      invoice_id: m.invoice_id,
      created_at: m.created_at,
      read_by_staff_at: m.read_by_staff_at,
    };
  }

  private async assertOwnedJob(user: CurrentPortalUser, jobId: string) {
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
        },
        select: { id: true },
      }),
    );
    if (!job) throw new BadRequestException('Job not found for this customer.');
  }

  private async assertOwnedInvoice(user: CurrentPortalUser, invoiceId: string) {
    const invoice = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findFirst({
        where: {
          id: invoiceId,
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
        },
        select: { id: true },
      }),
    );
    if (!invoice) throw new BadRequestException('Invoice not found for this customer.');
  }
}
