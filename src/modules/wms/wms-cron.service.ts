import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { WmsStockService } from "./wms-stock.service";
import { WmsStorageService } from "./wms-storage.service";

@Injectable()
export class WmsCronService {
  private readonly logger = new Logger(WmsCronService.name);
  private running = false;
  private storageRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: WmsStockService,
    private readonly storage: WmsStorageService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleLowStock() {
    if (this.running) return;
    this.running = true;
    try {
      const tenants = await this.prisma.tenant.findMany({
        where: {
          is_active: true,
          deleted_at: null,
          status: { in: ["TRIAL", "ACTIVE"] },
        },
        select: { id: true, name: true },
      });
      for (const tenant of tenants) {
        try {
          const items = await this.stock.lowStockForTenant(tenant.id);
          if (!items.length) continue;
          await this.notifications.notifyStaffByRoles(
            tenant.id,
            [
              "TENANT_ADMIN",
              "WAREHOUSE_STAFF",
              "OPERATIONS_MANAGER",
              "BRANCH_MANAGER",
            ],
            {
              type: "WMS_LOW_STOCK",
              title: "WMS low stock alert",
              message: `${items.length} item(s) are at or below their low-stock threshold.`,
              entity_type: "wms_item",
              link_path: "/wms/stock/low-stock",
            },
          );
          this.logger.log(
            `Tenant ${tenant.name}: ${items.length} low-stock item(s).`,
          );
        } catch (error) {
          this.logger.error(
            `Low-stock check failed for tenant ${tenant.id}: ${String(error)}`,
          );
        }
      }
    } finally {
      this.running = false;
    }
  }

  /** Mark overdue lots NOT_COLLECTED and upsert OVERDUE_EXTRA charges. */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleStorageOverdue() {
    if (this.storageRunning) return;
    this.storageRunning = true;
    try {
      const tenants = await this.prisma.tenant.findMany({
        where: {
          is_active: true,
          deleted_at: null,
          status: { in: ["TRIAL", "ACTIVE"] },
        },
        select: { id: true, name: true },
      });
      for (const tenant of tenants) {
        try {
          const result = await this.storage.accrueOverdueForTenant(tenant.id);
          if (result.lots_marked_overdue || result.charges_upserted) {
            this.logger.log(
              `Tenant ${tenant.name}: overdue lots=${result.lots_marked_overdue}, charges=${result.charges_upserted}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Storage overdue accrual failed for tenant ${tenant.id}: ${String(error)}`,
          );
        }
      }
    } finally {
      this.storageRunning = false;
    }
  }
}
