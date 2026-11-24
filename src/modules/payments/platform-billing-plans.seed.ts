import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Boot-upserts the low-paid DEVELOPER platform billing SKU.
 * Stripe Product/Price can be attached later via PATCH or createPlan sync.
 */
@Injectable()
export class PlatformBillingPlansSeedService implements OnModuleInit {
  private readonly logger = new Logger(PlatformBillingPlansSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.ensureDeveloperPlan();
    } catch (err) {
      this.logger.warn(
        `Developer plan seed skipped: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async ensureDeveloperPlan() {
    const existing = await this.prisma.platformBillingPlan.findFirst({
      where: { code: "DEVELOPER" },
    });
    if (existing) {
      if (existing.deleted_at || !existing.is_active) {
        await this.prisma.platformBillingPlan.update({
          where: { id: existing.id },
          data: {
            deleted_at: null,
            is_active: true,
            subscription_plan: SubscriptionPlan.DEVELOPER,
          },
        });
        this.logger.log("Reactivated PlatformBillingPlan DEVELOPER");
      }
      return;
    }

    await this.prisma.platformBillingPlan.create({
      data: {
        code: "DEVELOPER",
        name: "Developer",
        description:
          "Low-cost developer tier for internal and staging tenants. Price/limits editable via PATCH /platform/billing/plans/:id.",
        subscription_plan: SubscriptionPlan.DEVELOPER,
        amount: 29,
        currency_code: "USD",
        interval: BillingInterval.MONTH,
        max_users: 10,
        max_branches: 3,
        max_storage_gb: 20,
        is_active: true,
      },
    });
    this.logger.log("Seeded PlatformBillingPlan DEVELOPER ($29/mo)");
  }
}
