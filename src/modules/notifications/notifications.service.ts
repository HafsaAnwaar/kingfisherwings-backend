import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export type NotificationListQuery = {
  page?: number;
  limit?: number;
  unread_only?: boolean;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForStaff(
    tenantId: string,
    userId: string,
    query: NotificationListQuery,
  ) {
    return this.list(tenantId, { user_id: userId }, query);
  }

  async listForPortal(
    tenantId: string,
    portalUserId: string,
    query: NotificationListQuery,
  ) {
    return this.list(tenantId, { portal_user_id: portalUserId }, query);
  }

  async unreadCountForStaff(tenantId: string, userId: string) {
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.notification.count({
        where: { tenant_id: tenantId, user_id: userId, is_read: false },
      }),
    );
    return { success: true, data: { unread_count: count } };
  }

  async unreadCountForPortal(tenantId: string, portalUserId: string) {
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.notification.count({
        where: {
          tenant_id: tenantId,
          portal_user_id: portalUserId,
          is_read: false,
        },
      }),
    );
    return { success: true, data: { unread_count: count } };
  }

  async markReadStaff(tenantId: string, userId: string, id: string) {
    return this.markRead(tenantId, id, { user_id: userId });
  }

  async markReadPortal(tenantId: string, portalUserId: string, id: string) {
    return this.markRead(tenantId, id, { portal_user_id: portalUserId });
  }

  async markAllReadStaff(tenantId: string, userId: string) {
    return this.markAllRead(tenantId, { user_id: userId });
  }

  async markAllReadPortal(tenantId: string, portalUserId: string) {
    return this.markAllRead(tenantId, { portal_user_id: portalUserId });
  }

  private async list(
    tenantId: string,
    owner: { user_id?: string; portal_user_id?: string },
    query: NotificationListQuery,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.NotificationWhereInput = {
      tenant_id: tenantId,
      ...owner,
      ...(query.unread_only ? { is_read: false } : {}),
    };

    const [rows, total] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          tx.notification.findMany({
            where,
            orderBy: [{ is_read: "asc" }, { created_at: "desc" }],
            skip: (page - 1) * limit,
            take: limit,
          }),
          tx.notification.count({ where }),
        ]),
    );

    return {
      success: true,
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  private async markRead(
    tenantId: string,
    id: string,
    owner: { user_id?: string; portal_user_id?: string },
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.notification.findFirst({
        where: { id, tenant_id: tenantId, ...owner },
      });
      if (!existing) throw new NotFoundException("Notification not found.");

      if (existing.is_read) return existing;

      return tx.notification.update({
        where: { id },
        data: { is_read: true, read_at: new Date() },
      });
    });

    return { success: true, data: updated };
  }

  private async markAllRead(
    tenantId: string,
    owner: { user_id?: string; portal_user_id?: string },
  ) {
    const result = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.notification.updateMany({
        where: { tenant_id: tenantId, ...owner, is_read: false },
        data: { is_read: true, read_at: new Date() },
      }),
    );

    return { success: true, data: { updated: result.count } };
  }
}
