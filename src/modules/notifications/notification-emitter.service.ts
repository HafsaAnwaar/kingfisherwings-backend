import { Injectable, Logger } from '@nestjs/common';
import { NotificationType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type EmitNotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  link_path?: string;
};

/**
 * Creates in-app notifications for staff and/or portal users.
 * Domain modules call this after meaningful events (invoice overdue, quote approved, etc.).
 * v1 is DB-backed (poll); SSE/WebSocket can subscribe later without changing callers.
 */
@Injectable()
export class NotificationEmitterService {
  private readonly logger = new Logger(NotificationEmitterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notifyPortalUser(
    tenantId: string,
    portalUserId: string,
    input: EmitNotificationInput,
  ) {
    try {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.notification.create({
          data: {
            tenant_id: tenantId,
            portal_user_id: portalUserId,
            type: input.type,
            title: input.title,
            message: input.message,
            entity_type: input.entity_type,
            entity_id: input.entity_id,
            link_path: input.link_path,
          },
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed to notify portal user ${portalUserId}: ${String(err)}`);
    }
  }

  async notifyStaffUser(tenantId: string, userId: string, input: EmitNotificationInput) {
    try {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.notification.create({
          data: {
            tenant_id: tenantId,
            user_id: userId,
            type: input.type,
            title: input.title,
            message: input.message,
            entity_type: input.entity_type,
            entity_id: input.entity_id,
            link_path: input.link_path,
          },
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed to notify staff user ${userId}: ${String(err)}`);
    }
  }

  /**
   * Fan-out to tenant staff who should see portal CCP events
   * (Tenant Admin, Finance, Sales, CS, Branch Manager).
   */
  async notifyStaffOfPortalEvent(tenantId: string, input: EmitNotificationInput) {
    const roles: UserRole[] = [
      'TENANT_ADMIN',
      'BRANCH_MANAGER',
      'FINANCE_MANAGER',
      'SALES_MANAGER',
      'CUSTOMER_SUPPORT',
    ];

    try {
      const users = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.user.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: 'ACTIVE',
            role: { in: roles },
          },
          select: { id: true },
          take: 100,
        }),
      );

      if (!users.length) return;

      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.notification.createMany({
          data: users.map((u) => ({
            tenant_id: tenantId,
            user_id: u.id,
            type: input.type,
            title: input.title,
            message: input.message,
            entity_type: input.entity_type,
            entity_id: input.entity_id,
            link_path: input.link_path,
          })),
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed staff fan-out for portal event: ${String(err)}`);
    }
  }

  async notifyPartyPortalUsers(
    tenantId: string,
    partyId: string,
    input: EmitNotificationInput,
  ) {
    try {
      const users = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.portalUser.findMany({
          where: {
            tenant_id: tenantId,
            party_id: partyId,
            status: 'ACTIVE',
            deleted_at: null,
          },
          select: { id: true },
        }),
      );

      if (!users.length) return;

      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.notification.createMany({
          data: users.map((u) => ({
            tenant_id: tenantId,
            portal_user_id: u.id,
            type: input.type,
            title: input.title,
            message: input.message,
            entity_type: input.entity_type,
            entity_id: input.entity_id,
            link_path: input.link_path,
          })),
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed party portal fan-out: ${String(err)}`);
    }
  }
}
