import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface PaymentAuditEntry {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Writes payment events to the existing tenant-scoped `audit_logs` table.
 * Platform (Super Admin) actions are logged in the affected tenant's log
 * with `metadata.super_admin_id`. Never throws — audit must not break a
 * payment flow.
 */
@Injectable()
export class PaymentAuditService {
  private readonly logger = new Logger(PaymentAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(tenantId: string, entry: PaymentAuditEntry) {
    try {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.auditLog.create({
          data: {
            tenant_id: tenantId,
            // audit_logs.user_id is a uuid; portal/vendor/super-admin ids
            // are kept in metadata only to avoid implying a staff user.
            user_id: entry.userId ?? null,
            action: entry.action.slice(0, 50),
            entity: entry.entity,
            entity_id: entry.entityId ?? null,
            old_values: entry.oldValues as Prisma.InputJsonValue | undefined,
            new_values: entry.newValues as Prisma.InputJsonValue | undefined,
            metadata: entry.metadata as Prisma.InputJsonValue | undefined,
          },
        }),
      );
    } catch (err) {
      this.logger.warn(
        `Payment audit write failed (${entry.action}): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
