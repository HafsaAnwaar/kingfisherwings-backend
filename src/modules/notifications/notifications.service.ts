import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Notification, Prisma, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { collectEffectivePermissionCodes } from "../../common/constants/effective-permissions";
import {
  NotificationAudience,
  resolveNotificationLink,
} from "./notification-link.util";
import { NotificationEmitterService } from "./notification-emitter.service";
import {
  CreateNotificationDto,
  NotificationTargetAudience,
} from "./dto/create-notification.dto";

export type NotificationListQuery = {
  page?: number;
  limit?: number;
  unread_only?: boolean;
  /** Admin-only: view another staff user's inbox */
  for_user_id?: string;
  /** Accepted for FE compatibility (delivery is per-user at write time). */
  audience?: string;
  role?: string;
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: NotificationEmitterService,
  ) {}

  async listForStaff(
    tenantId: string,
    userId: string,
    actorRole: string | undefined,
    query: NotificationListQuery,
  ) {
    const ownerId = await this.resolveStaffOwnerId(
      tenantId,
      userId,
      actorRole,
      query.for_user_id,
    );
    return this.list(tenantId, { user_id: ownerId }, query, "STAFF");
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

  async unreadCountForStaff(
    tenantId: string,
    userId: string,
    actorRole?: string,
    query?: Pick<NotificationListQuery, "for_user_id" | "audience" | "role">,
  ) {
    const ownerId = await this.resolveStaffOwnerId(
      tenantId,
      userId,
      actorRole,
      query?.for_user_id,
    );
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.notification.count({
        where: { tenant_id: tenantId, user_id: ownerId, is_read: false },
      }),
    );
    return { success: true, data: { unread_count: count } };
  }

  /**
   * Create one in-app notification per resolved staff recipient.
   * Requires at least one of: audience, recipient_user_ids, roles, permissions, modules.
   */
  async createTargeted(tenantId: string, dto: CreateNotificationDto) {
    const hasTarget =
      !!dto.audience ||
      (dto.recipient_user_ids?.length ?? 0) > 0 ||
      (dto.roles?.length ?? 0) > 0 ||
      (dto.permissions?.length ?? 0) > 0 ||
      (dto.modules?.length ?? 0) > 0;
    if (!hasTarget) {
      throw new BadRequestException(
        "Provide at least one of: audience, recipient_user_ids, roles, permissions, modules.",
      );
    }
    if (
      dto.audience === NotificationTargetAudience.user &&
      !(dto.recipient_user_ids?.length ?? 0)
    ) {
      throw new BadRequestException(
        "audience=user requires recipient_user_ids.",
      );
    }

    const recipientIds = await this.resolveTargetUserIds(tenantId, dto);
    if (!recipientIds.length) {
      return {
        success: true,
        data: { created: 0, recipient_user_ids: [] as string[] },
        message: "No matching active staff recipients.",
      };
    }

    const created = await this.emitter.notifyStaffUsers(tenantId, recipientIds, {
      type: dto.type,
      title: dto.title,
      message: dto.message,
      entity_type: dto.entity_type,
      entity_id: dto.entity_id,
      link_path: dto.link_path,
    });

    return {
      success: true,
      data: {
        created,
        recipient_user_ids: recipientIds,
        type: dto.type,
        entity_type: dto.entity_type ?? null,
        entity_id: dto.entity_id ?? null,
      },
    };
  }

  private async resolveStaffOwnerId(
    tenantId: string,
    actorId: string,
    actorRole: string | undefined,
    forUserId?: string,
  ): Promise<string> {
    if (!forUserId || forUserId === actorId) return actorId;
    const canImpersonateInbox =
      actorRole === UserRole.TENANT_ADMIN ||
      actorRole === UserRole.BRANCH_MANAGER;
    if (!canImpersonateInbox) {
      throw new ForbiddenException(
        "Only tenant admin or branch manager may use for_user_id.",
      );
    }
    const target = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.user.findFirst({
        where: {
          id: forUserId,
          tenant_id: tenantId,
          deleted_at: null,
        },
        select: { id: true },
      }),
    );
    if (!target) throw new NotFoundException("Target user not found.");
    return target.id;
  }

  private async resolveTargetUserIds(
    tenantId: string,
    dto: CreateNotificationDto,
  ): Promise<string[]> {
    const ids = new Set<string>();

    if (dto.recipient_user_ids?.length) {
      const found = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.user.findMany({
          where: {
            tenant_id: tenantId,
            id: { in: dto.recipient_user_ids },
            deleted_at: null,
            status: "ACTIVE",
          },
          select: { id: true },
        }),
      );
      for (const u of found) ids.add(u.id);
    }

    const roleSet = new Set<string>(dto.roles ?? []);
    if (dto.audience === NotificationTargetAudience.tenant_manager) {
      roleSet.add(UserRole.TENANT_ADMIN);
    }
    if (
      dto.audience === NotificationTargetAudience.staff ||
      dto.audience === NotificationTargetAudience.all
    ) {
      // Active staff only — never portal/vendor. Cap to avoid accidental blast.
      const staff = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.user.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: "ACTIVE",
          },
          select: { id: true },
          take: 500,
        }),
      );
      for (const u of staff) ids.add(u.id);
    }

    if (roleSet.size) {
      const roles = [...roleSet].filter((r) =>
        Object.values(UserRole).includes(r as UserRole),
      ) as UserRole[];
      const roleCodes = [...roleSet].map((r) => String(r).trim()).filter(Boolean);
      if (roles.length || roleCodes.length) {
        const byRole = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.user.findMany({
            where: {
              tenant_id: tenantId,
              deleted_at: null,
              status: "ACTIVE",
              OR: [
                ...(roles.length ? [{ role: { in: roles } }] : []),
                ...(roleCodes.length
                  ? [
                      {
                        roles: {
                          some: {
                            tenant_id: tenantId,
                            role: {
                              deleted_at: null,
                              is_active: true,
                              OR: [
                                { code: { in: roleCodes } },
                                { name: { in: roleCodes } },
                              ],
                            },
                          },
                        },
                      },
                    ]
                  : []),
              ],
            },
            select: { id: true },
            take: 500,
          }),
        );
        for (const u of byRole) ids.add(u.id);
      }
    }

    const needPermScan =
      (dto.permissions?.length ?? 0) > 0 || (dto.modules?.length ?? 0) > 0;
    if (needPermScan) {
      const candidates = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.user.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: "ACTIVE",
          },
          select: { id: true },
          take: 500,
        }),
      );
      const permNeedles = new Set(
        (dto.permissions ?? []).map((p) => p.trim()).filter(Boolean),
      );
      const moduleNeedles = (dto.modules ?? [])
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean);

      for (const u of candidates) {
        if (ids.has(u.id) && !permNeedles.size && !moduleNeedles.length) {
          continue;
        }
        const codes = await this.prisma.runWithTenant(tenantId, (tx) =>
          collectEffectivePermissionCodes(tx, tenantId, u.id),
        );
        let match = false;
        if (permNeedles.size) {
          for (const code of permNeedles) {
            if (codes.has(code)) {
              match = true;
              break;
            }
          }
        }
        if (!match && moduleNeedles.length) {
          for (const code of codes) {
            const lower = code.toLowerCase();
            if (
              moduleNeedles.some(
                (m) =>
                  lower.startsWith(`${m}.`) ||
                  lower.startsWith(`${m}_`) ||
                  lower === m,
              )
            ) {
              match = true;
              break;
            }
          }
        }
        if (match) ids.add(u.id);
      }

      // When only permissions/modules are provided, ids starts empty then fills.
      // When mixed with roles, keep union (already in set).
      if (
        !dto.recipient_user_ids?.length &&
        !roleSet.size &&
        dto.audience !== NotificationTargetAudience.staff &&
        dto.audience !== NotificationTargetAudience.all &&
        dto.audience !== NotificationTargetAudience.tenant_manager
      ) {
        // permission/module-only targeting already added matches above
      }
    }

    return [...ids];
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
