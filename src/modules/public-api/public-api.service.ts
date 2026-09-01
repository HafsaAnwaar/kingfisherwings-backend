import { createHash, randomBytes } from "crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TenantApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantApiKey.findMany({
        where: { tenant_id: tenantId },
        select: {
          id: true,
          name: true,
          key_prefix: true,
          status: true,
          scopes: true,
          last_used_at: true,
          expires_at: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  async create(
    tenantId: string,
    name: string,
    scopes: string[] = [],
    actorId?: string,
  ) {
    const rawKey = `kf_${randomBytes(24).toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 12);
    const keyHash = await argon2.hash(rawKey);

    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantApiKey.create({
        data: {
          tenant_id: tenantId,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          scopes,
          created_by: actorId,
        },
      }),
    );

    return { ...row, api_key: rawKey };
  }

  async revoke(tenantId: string, id: string, actorId?: string) {
    const key = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantApiKey.findFirst({ where: { id, tenant_id: tenantId } }),
    );
    if (!key) throw new NotFoundException("API key not found.");

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantApiKey.update({
        where: { id },
        data: { status: "REVOKED", revoked_at: new Date() },
      }),
    );
  }

  async validateApiKey(rawKey: string) {
    const prefix = rawKey.slice(0, 12);
    const key = await this.prisma.tenantApiKey.findFirst({
      where: { key_prefix: prefix, status: "ACTIVE" },
    });
    if (!key) return null;
    const valid = await argon2.verify(key.key_hash, rawKey);
    if (!valid) return null;

    await this.prisma.tenantApiKey.update({
      where: { id: key.id },
      data: { last_used_at: new Date() },
    });

    return key;
  }
}

@Injectable()
export class TenantWebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantWebhook.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  create(tenantId: string, url: string, events: string[], actorId?: string) {
    const secret = createHash("sha256").update(randomBytes(32)).digest("hex");
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantWebhook.create({
        data: {
          tenant_id: tenantId,
          url,
          secret,
          events,
          created_by: actorId,
        },
      }),
    );
  }
}

@Injectable()
export class StripeBillingService {
  private stripeClient: Stripe | null = null;

  private getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    if (!this.stripeClient) {
      this.stripeClient = new Stripe(key);
    }
    return this.stripeClient;
  }

  getStatus() {
    const stripe = this.getStripe();
    return {
      provider: "stripe",
      configured: !!stripe,
      subscription_status: stripe ? "ready" : "not_configured",
      message: stripe
        ? "Stripe SDK initialized — use checkout-session to create sessions."
        : "Set STRIPE_SECRET_KEY to enable platform billing checkout.",
    };
  }

  async createCheckoutSession() {
    const stripe = this.getStripe();
    if (!stripe) {
      return {
        checkout_url: null,
        session_id: `stub_${Date.now()}`,
        message: "Stripe not configured — set STRIPE_SECRET_KEY.",
      };
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return {
        checkout_url: null,
        session_id: null,
        message: "Set STRIPE_PRICE_ID for subscription checkout.",
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL ?? "http://localhost:3000"}/billing/success`,
      cancel_url: `${process.env.APP_URL ?? "http://localhost:3000"}/billing/cancel`,
    });

    return { checkout_url: session.url, session_id: session.id };
  }
}
