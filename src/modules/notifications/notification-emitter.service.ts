import { Injectable, Logger } from "@nestjs/common";
import {
  DocumentType,
  NotificationType,
  PortalDocumentType,
  UserRole,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  isPortalVisibleDocumentType,
  toPortalDocumentType,
} from "../portal/helpers/portal-document-type.helper";

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
      this.logger.warn(
        `Failed to notify portal user ${portalUserId}: ${String(err)}`,
      );
    }
  }

  async notifyVendorUser(
    tenantId: string,
    vendorUserId: string,
    input: EmitNotificationInput,
  ) {
    try {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.notification.create({
          data: {
            tenant_id: tenantId,
            vendor_user_id: vendorUserId,
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
      this.logger.warn(
        `Failed to notify vendor user ${vendorUserId}: ${String(err)}`,
      );
    }
  }

  async notifyPartyVendorUsers(
    tenantId: string,
    partyId: string,
    input: EmitNotificationInput,
  ) {
    try {
      const users = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.vendorUser.findMany({
          where: {
            tenant_id: tenantId,
            party_id: partyId,
            status: "ACTIVE",
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
            vendor_user_id: u.id,
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
      this.logger.warn(`Failed party vendor fan-out: ${String(err)}`);
    }
  }

  async notifyStaffUser(
    tenantId: string,
    userId: string,
    input: EmitNotificationInput,
  ) {
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
  async notifyStaffOfPortalEvent(
    tenantId: string,
    input: EmitNotificationInput,
  ) {
    await this.notifyStaffByRoles(
      tenantId,
      [
        "TENANT_ADMIN",
        "BRANCH_MANAGER",
        "FINANCE_MANAGER",
        "SALES_MANAGER",
        "CUSTOMER_SUPPORT",
      ],
      input,
    );
  }

  /** Finance desk: Tenant Admin, Finance Manager, Accountant. */
  async notifyFinanceStaff(tenantId: string, input: EmitNotificationInput) {
    await this.notifyStaffByRoles(
      tenantId,
      ["TENANT_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT", "BRANCH_MANAGER"],
      input,
    );
  }

  /** Ops desk for milestone alerts. */
  async notifyOpsStaff(tenantId: string, input: EmitNotificationInput) {
    await this.notifyStaffByRoles(
      tenantId,
      [
        "TENANT_ADMIN",
        "OPERATIONS_MANAGER",
        "OPERATIONS_EXECUTIVE",
        "DOCUMENTATION",
        "BRANCH_MANAGER",
      ],
      input,
    );
  }

  async notifyStaffByRoles(
    tenantId: string,
    roles: UserRole[],
    input: EmitNotificationInput,
  ) {
    try {
      const users = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.user.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: "ACTIVE",
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
      this.logger.warn(`Failed staff role fan-out: ${String(err)}`);
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
            status: "ACTIVE",
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

  /**
   * Notify ACTIVE party portal users who opted into milestone alerts.
   * Users without a preferences row are treated as opted-out (default false).
   */
  async notifyPartyPortalUsersMilestoneOptIn(
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
            status: "ACTIVE",
            deleted_at: null,
            preference: { milestone_alerts_enabled: true },
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
      this.logger.warn(`Failed milestone opt-in fan-out: ${String(err)}`);
    }
  }

  /**
   * Notify ACTIVE party portal users with document alerts enabled.
   * Missing preference row is treated as opted-in (default true).
   */
  async notifyPartyPortalUsersDocumentReady(
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
            status: "ACTIVE",
            deleted_at: null,
            OR: [
              { preference: null },
              { preference: { document_alerts_enabled: true } },
            ],
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
      this.logger.warn(`Failed document-ready fan-out: ${String(err)}`);
    }
  }

  /**
   * When a job document becomes portal-visible, notify owning parties' portal users
   * who have view rights for the document type and document alerts enabled.
   */
  async notifyPortalDocumentReadyForJob(
    tenantId: string,
    jobId: string,
    document: {
      id: string;
      document_type: DocumentType;
      file_url?: string | null;
    },
  ) {
    try {
      if (!document.file_url) return;
      if (!isPortalVisibleDocumentType(document.document_type)) return;

      const portalType = toPortalDocumentType(document.document_type);

      const job = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.findFirst({
          where: { id: jobId, tenant_id: tenantId, deleted_at: null },
          select: {
            id: true,
            job_number: true,
            shipper_id: true,
            consignee_id: true,
            billing_party_id: true,
          },
        }),
      );
      if (!job) return;

      const partyIds = [
        ...new Set(
          [job.shipper_id, job.consignee_id, job.billing_party_id].filter(
            Boolean,
          ) as string[],
        ),
      ];
      if (!partyIds.length) return;

      const title = `Document ready: ${job.job_number}`;
      const message = `${document.document_type.replace(/_/g, " ")} is available for shipment ${job.job_number}.`;

      for (const partyId of partyIds) {
        const canView = await this.partyCanViewDocument(
          tenantId,
          partyId,
          portalType,
        );
        if (!canView) continue;

        await this.notifyPartyPortalUsersDocumentReady(tenantId, partyId, {
          type: "DOCUMENT_READY",
          title,
          message,
          entity_type: "job_document",
          entity_id: document.id,
          link_path: `/portal/shipments/${job.id}/documents`,
        });
      }
    } catch (err) {
      this.logger.warn(
        `Failed DOCUMENT_READY notify for job ${jobId}: ${String(err)}`,
      );
    }
  }

  private async partyCanViewDocument(
    tenantId: string,
    partyId: string,
    portalType: PortalDocumentType,
  ): Promise<boolean> {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.portalPermission.findUnique({
        where: {
          tenant_id_party_id_document_type: {
            tenant_id: tenantId,
            party_id: partyId,
            document_type: portalType,
          },
        },
        select: { can_view: true },
      }),
    );
    // Default view-on when no explicit row (matches PortalPermissionsService).
    return row?.can_view ?? true;
  }
}
