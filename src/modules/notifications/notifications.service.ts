import { Injectable, NotFoundException } from "@nestjs/common";
import { Notification, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  NotificationAudience,
  resolveNotificationLink,
} from "./notification-link.util";

export type NotificationListQuery = {
  page?: number;
  limit?: number;
  unread_only?: boolean;
};

export type NotificationOwner = {
  user_id?: string;
  portal_user_id?: string;
  vendor_user_id?: string;
};

export type OpenNotificationResult = {
  id: string;
  link_path: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  title: string;
  message: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForStaff(
    tenantId: string,
    userId: string,
    query: NotificationListQuery,
  ) {
    return this.list(tenantId, { user_id: userId }, query, "STAFF");
  }

  async listForPortal(
    tenantId: string,
    portalUserId: string,
    query: NotificationListQuery,
  ) {
    return this.list(
      tenantId,
      { portal_user_id: portalUserId },
      query,
      "PORTAL",
    );
  }

  async listForVendor(
    tenantId: string,
    vendorUserId: string,
    query: NotificationListQuery,
  ) {
    return this.list(
      tenantId,
      { vendor_user_id: vendorUserId },
      query,
      "VENDOR",
    );
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

  async unreadCountForVendor(tenantId: string, vendorUserId: string) {
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.notification.count({
        where: {
          tenant_id: tenantId,
          vendor_user_id: vendorUserId,
          is_read: false,
        },
      }),
    );
    return { success: true, data: { unread_count: count } };
  }

  async markReadStaff(tenantId: string, userId: string, id: string) {
    return this.markRead(tenantId, id, { user_id: userId }, "STAFF");
  }

  async markReadPortal(tenantId: string, portalUserId: string, id: string) {
    return this.markRead(
      tenantId,
      id,
      { portal_user_id: portalUserId },
      "PORTAL",
    );
  }

  async markReadVendor(tenantId: string, vendorUserId: string, id: string) {
    return this.markRead(
      tenantId,
      id,
      { vendor_user_id: vendorUserId },
      "VENDOR",
    );
  }

  async markAllReadStaff(tenantId: string, userId: string) {
    return this.markAllRead(tenantId, { user_id: userId });
  }

  async markAllReadPortal(tenantId: string, portalUserId: string) {
    return this.markAllRead(tenantId, { portal_user_id: portalUserId });
  }

  async markAllReadVendor(tenantId: string, vendorUserId: string) {
    return this.markAllRead(tenantId, { vendor_user_id: vendorUserId });
  }

  /**
   * Mark read and return the deep-link target for FE navigation.
   * FE: POST …/:id/open then router.push(data.link_path).
   */
  async openStaff(tenantId: string, userId: string, id: string) {
    return this.open(tenantId, id, { user_id: userId }, "STAFF");
  }

  async openPortal(tenantId: string, portalUserId: string, id: string) {
    return this.open(
      tenantId,
      id,
      { portal_user_id: portalUserId },
      "PORTAL",
    );
  }

  async openVendor(tenantId: string, vendorUserId: string, id: string) {
    return this.open(
      tenantId,
      id,
      { vendor_user_id: vendorUserId },
      "VENDOR",
    );
  }

  private enrichRow(row: Notification, audience: NotificationAudience) {
    const link_path = resolveNotificationLink({
      audience,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      link_path: row.link_path,
    });
    return { ...row, link_path };
  }

  private async list(
    tenantId: string,
    owner: NotificationOwner,
    query: NotificationListQuery,
    audience: NotificationAudience,
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
      data: rows.map((r) => this.enrichRow(r, audience)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  private async markRead(
    tenantId: string,
    id: string,
    owner: NotificationOwner,
    audience: NotificationAudience,
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

    return { success: true, data: this.enrichRow(updated, audience) };
  }

  private async markAllRead(tenantId: string, owner: NotificationOwner) {
    const result = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.notification.updateMany({
        where: { tenant_id: tenantId, ...owner, is_read: false },
        data: { is_read: true, read_at: new Date() },
      }),
    );

    return { success: true, data: { updated: result.count } };
  }

  private async open(
    tenantId: string,
    id: string,
    owner: NotificationOwner,
    audience: NotificationAudience,
  ) {
    const { data } = await this.markRead(tenantId, id, owner, audience);
    const payload: OpenNotificationResult = {
      id: data.id,
      link_path: data.link_path,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      is_read: data.is_read,
      title: data.title,
      message: data.message,
    };
    return { success: true, data: payload };
  }
}
