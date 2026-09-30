import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TenantStatus } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import {
  METADATA_SCOPE,
  PLATFORM_ACCOUNT_REF,
  STRIPE_METADATA,
} from "./constants/online-payment.constants";
import {
  CreateBillingPlanDto,
  UpdateBillingPlanDto,
} from "./dto/platform-billing.dto";
import { PaymentAuditService } from "./payment-audit.service";
import { StripeCustomersService } from "./stripe-customers.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import { roundMoney, toMinorUnits } from "./utils/money.util";
import { staffFrontendUrl, withQuery } from "./utils/frontend-url.util";

/**
 * SaaS subscription billing (Stripe Billing) for tenants. Kept separate
 * from ERP customer invoices. Plans map the existing SubscriptionPlan enum
 * to Stripe Prices; tenant subscription state is synced from webhooks.
 */
@Injectable()
export class PlatformSubscriptionsService {
  private readonly logger = new Logger(PlatformSubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly customers: StripeCustomersService,
    private readonly audit: PaymentAuditService,
  ) {}

  // ─────────────────────────── plans ───────────────────────────

  async listPlans(activeOnly = false) {
    const rows = await this.prisma.platformBillingPlan.findMany({
      where: { deleted_at: null, ...(activeOnly ? { is_active: true } : {}) },
      orderBy: [{ amount: "asc" }, { name: "asc" }],
    });
    return { success: true, data: rows.map((p) => this.planView(p)) };
  }

  async createPlan(dto: CreateBillingPlanDto) {
    const exists = await this.prisma.platformBillingPlan.findUnique({
      where: { code: dto.code },
    });
    if (exists)
      throw new BadRequestException("A plan with this code already exists.");

    const currency = dto.currency_code.toUpperCase();
    const interval = dto.interval ?? "MONTH";
    let productId: string | null = null;
    let priceId = dto.stripe_price_id ?? null;

    if (!priceId && dto.sync_to_stripe !== false) {
      const client = this.stripe.requirePlatformClient();
      const product = await this.stripe.createProduct(
        client,
        { name: dto.name, metadata: { erp_plan_code: dto.code } },
        `erp-plan-product:${dto.code}`,
      );
      const price = await this.stripe.createPrice(
        client,
        {
          product: product.id,
          currency: currency.toLowerCase(),
          unit_amount: Number(toMinorUnits(dto.amount, currency)),
          recurring: { interval: interval === "YEAR" ? "year" : "month" },
          metadata: { erp_plan_code: dto.code },
        },
        `erp-plan-price:${dto.code}:${dto.amount}:${currency}:${interval}`,
      );
      productId = product.id;
      priceId = price.id;
    }

    const plan = await this.prisma.platformBillingPlan.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        subscription_plan: dto.subscription_plan,
        amount: roundMoney(dto.amount),
        currency_code: currency,
        interval,
        stripe_product_id: productId,
        stripe_price_id: priceId,
        max_users: dto.max_users,
        max_branches: dto.max_branches,
        max_storage_gb: dto.max_storage_gb,
      },
    });
    return { success: true, data: this.planView(plan) };
  }

  async updatePlan(id: string, dto: UpdateBillingPlanDto) {
    await this.requirePlan(id);
    const plan = await this.prisma.platformBillingPlan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.stripe_price_id !== undefined
          ? { stripe_price_id: dto.stripe_price_id }
          : {}),
        ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
        ...(dto.max_users !== undefined ? { max_users: dto.max_users } : {}),
        ...(dto.max_branches !== undefined
          ? { max_branches: dto.max_branches }
          : {}),
        ...(dto.max_storage_gb !== undefined
          ? { max_storage_gb: dto.max_storage_gb }
          : {}),
      },
    });
    return { success: true, data: this.planView(plan) };
  }

  async deletePlan(id: string) {
    await this.requirePlan(id);
    const inUse = await this.prisma.tenant.count({
      where: { billing_plan_id: id, deleted_at: null },
    });
    await this.prisma.platformBillingPlan.update({
      where: { id },
      // A plan with subscribers is only deactivated so history stays intact.
      data: inUse
        ? { is_active: false }
        : { is_active: false, deleted_at: new Date() },
    });
    return { success: true, data: { deactivated: true, deleted: !inUse } };
  }

  // ─────────────────────────── tenant subscription ───────────────────────────

  async getSubscription(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { billing_plan: true },
    });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    return {
      success: true,
      data: {
        subscription_plan: tenant.subscription_plan,
        tenant_status: tenant.status,
        billing_plan: tenant.billing_plan
          ? this.planView(tenant.billing_plan)
          : null,
        stripe_subscription_status: tenant.stripe_subscription_status,
        current_period_start: tenant.subscription_current_period_start,
        current_period_end: tenant.subscription_current_period_end,
        cancel_at_period_end: tenant.subscription_cancel_at_period_end,
        subscription_ends: tenant.subscription_ends,
        trial_ends: tenant.trial_ends,
        has_subscription: Boolean(tenant.stripe_subscription_id),
      },
    };
  }

  async startSubscriptionCheckout(
    tenantId: string,
    planId: string,
    actorId?: string,
  ) {
    const client = this.stripe.requirePlatformClient();
    const plan = await this.requirePlan(planId);
    if (!plan.is_active || !plan.stripe_price_id) {
      throw new BadRequestException(
        "This plan is not available for online subscription.",
      );
    }
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
    });
    if (
      tenant.stripe_subscription_id &&
      !["canceled", "incomplete_expired"].includes(
        tenant.stripe_subscription_status ?? "",
      )
    ) {
      throw new BadRequestException(
        "Tenant already has a subscription; change the plan instead.",
      );
    }
    const customer = await this.customers.ensureCustomer(
      client,
      PLATFORM_ACCOUNT_REF,
      tenantId,
      {
        type: "TENANT",
        id: tenantId,
        name: tenant.display_name ?? tenant.name,
        email: tenant.email,
      },
    );
    const metadata = {
      [STRIPE_METADATA.SCOPE]: METADATA_SCOPE.PLATFORM_SUBSCRIPTION,
      [STRIPE_METADATA.TENANT_ID]: tenantId,
      [STRIPE_METADATA.PLAN_ID]: plan.id,
    };
    const base = `${staffFrontendUrl()}/billing/subscription`;
    const session = await this.stripe.createCheckoutSession(
      client,
      {
        mode: "subscription",
        customer,
        client_reference_id: tenantId,
        line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
        metadata,
        subscription_data: { metadata },
        success_url: withQuery(base, {
          payment: "success",
          session_id: "{CHECKOUT_SESSION_ID}",
        }),
        cancel_url: withQuery(base, { payment: "cancelled" }),
      },
      `erp-sub-checkout:${tenantId}:${plan.id}:${Math.floor(Date.now() / 60_000)}`,
    );
    await this.audit.log(tenantId, {
      userId: actorId,
      action: "SUBSCRIPTION_CHECKOUT_CREATED",
      entity: "Tenant",
      entityId: tenantId,
      metadata: { plan_id: plan.id, plan_code: plan.code },
    });
    return {
      success: true,
      data: { checkout_url: session.url, session_id: session.id },
    };
  }

  async changePlan(
    tenantId: string,
    planId: string,
    actor: { superAdminId?: string; userId?: string },
  ) {
    const client = this.stripe.requirePlatformClient();
    const plan = await this.requirePlan(planId);
    if (!plan.is_active || !plan.stripe_price_id) {
      throw new BadRequestException("This plan is not available.");
    }
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
    });
    if (!tenant.stripe_subscription_id) {
      throw new BadRequestException("Tenant has no active subscription.");
    }
    const sub = await this.stripe.retrieveSubscription(
      client,
      tenant.stripe_subscription_id,
    );
    const item = sub.items.data[0];
    if (!item) throw new BadRequestException("Subscription has no items.");
    const updated = await this.stripe.updateSubscription(client, sub.id, {
      items: [{ id: item.id, price: plan.stripe_price_id }],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
      metadata: { ...sub.metadata, [STRIPE_METADATA.PLAN_ID]: plan.id },
    });
    await this.syncSubscription(updated);
    await this.audit.log(tenantId, {
      userId: actor.userId,
      action: "SUBSCRIPTION_CHANGED",
      entity: "Tenant",
      entityId: tenantId,
      metadata: {
        plan_id: plan.id,
        super_admin_id: actor.superAdminId ?? null,
      },
    });
    return this.getSubscription(tenantId);
  }

  async cancelSubscription(
    tenantId: string,
    actor: { superAdminId?: string; userId?: string },
    atPeriodEnd = true,
  ) {
    const client = this.stripe.requirePlatformClient();
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
    });
    if (!tenant.stripe_subscription_id) {
      throw new BadRequestException("Tenant has no active subscription.");
    }
    const updated = atPeriodEnd
      ? await this.stripe.updateSubscription(
          client,
          tenant.stripe_subscription_id,
          {
            cancel_at_period_end: true,
          },
        )
      : await client.subscriptions.cancel(tenant.stripe_subscription_id);
    await this.syncSubscription(updated);
    await this.audit.log(tenantId, {
      userId: actor.userId,
      action: "SUBSCRIPTION_CANCELLED",
      entity: "Tenant",
      entityId: tenantId,
      metadata: {
        at_period_end: atPeriodEnd,
        super_admin_id: actor.superAdminId ?? null,
      },
    });
    return this.getSubscription(tenantId);
  }

  /**
   * Webhook: customer.subscription.created|updated|deleted. Records
   * status and period on the tenant. Suspension on non-payment remains a
   * Super Admin decision (tenant status is only promoted to ACTIVE here).
   */
  async syncSubscription(sub: Stripe.Subscription) {
    const tenantId = sub.metadata?.[STRIPE_METADATA.TENANT_ID];
    let tenant = tenantId
      ? await this.prisma.tenant.findUnique({ where: { id: tenantId } })
      : null;
    if (!tenant) {
      tenant = await this.prisma.tenant.findUnique({
        where: { stripe_subscription_id: sub.id },
      });
    }
    if (!tenant) {
      this.logger.warn(`Subscription ${sub.id} has no matching tenant.`);
      return { handled: false };
    }
    if (
      tenant.stripe_subscription_id &&
      tenant.stripe_subscription_id !== sub.id &&
      sub.status !== "active" &&
      sub.status !== "trialing"
    ) {
      // Stale event for a replaced subscription.
      return { handled: false };
    }

    const planId = sub.metadata?.[STRIPE_METADATA.PLAN_ID];
    const plan = planId
      ? await this.prisma.platformBillingPlan.findUnique({
          where: { id: planId },
        })
      : null;
    const item = sub.items?.data?.[0] as
      | (Stripe.SubscriptionItem & {
          current_period_start?: number;
          current_period_end?: number;
        })
      | undefined;
    const legacy = sub as unknown as {
      current_period_start?: number;
      current_period_end?: number;
    };
    const periodStart =
      item?.current_period_start ?? legacy.current_period_start;
    const periodEnd = item?.current_period_end ?? legacy.current_period_end;

    const active = sub.status === "active" || sub.status === "trialing";
    const data: Prisma.TenantUpdateInput = {
      stripe_subscription_id: sub.id,
      stripe_subscription_status: sub.status,
      subscription_cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      subscription_current_period_start: periodStart
        ? new Date(periodStart * 1000)
        : null,
      subscription_current_period_end: periodEnd
        ? new Date(periodEnd * 1000)
        : null,
      ...(periodEnd ? { subscription_ends: new Date(periodEnd * 1000) } : {}),
      ...(plan
        ? {
            billing_plan: { connect: { id: plan.id } },
            subscription_plan: plan.subscription_plan,
            ...(plan.max_users ? { max_users: plan.max_users } : {}),
            ...(plan.max_branches ? { max_branches: plan.max_branches } : {}),
            ...(plan.max_storage_gb
              ? { max_storage_gb: plan.max_storage_gb }
              : {}),
          }
        : {}),
      ...(active && ["TRIAL", "EXPIRED"].includes(tenant.status)
        ? { status: "ACTIVE" as TenantStatus }
        : {}),
    };
    await this.prisma.tenant.update({ where: { id: tenant.id }, data });
    await this.audit.log(tenant.id, {
      action: "SUBSCRIPTION_CHANGED",
      entity: "Tenant",
      entityId: tenant.id,
      metadata: {
        stripe_subscription_id: sub.id,
        status: sub.status,
        plan_id: plan?.id ?? null,
        cancel_at_period_end: sub.cancel_at_period_end,
      },
    });
    return { handled: true };
  }

  private async requirePlan(id: string) {
    const plan = await this.prisma.platformBillingPlan.findFirst({
      where: { id, deleted_at: null },
    });
    if (!plan) throw new NotFoundException("Billing plan not found.");
    return plan;
  }

  private planView(p: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    subscription_plan: string;
    amount: Prisma.Decimal;
    currency_code: string;
    interval: string;
    stripe_price_id: string | null;
    max_users: number | null;
    max_branches: number | null;
    max_storage_gb: number | null;
    is_active: boolean;
  }) {
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      subscription_plan: p.subscription_plan,
      amount: roundMoney(p.amount).toFixed(2),
      currency_code: p.currency_code,
      interval: p.interval,
      stripe_price_configured: Boolean(p.stripe_price_id),
      max_users: p.max_users,
      max_branches: p.max_branches,
      max_storage_gb: p.max_storage_gb,
      is_active: p.is_active,
    };
  }
}
