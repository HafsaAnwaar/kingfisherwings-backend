import { Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { StripeGatewayService } from "./stripe-gateway.service";

export type StripeCustomerSubject =
  | { type: "PARTY"; id: string; name: string; email?: string | null }
  | { type: "TENANT"; id: string; name: string; email?: string | null };

/**
 * ERP subject → Stripe Customer mapping. A customer is created once per
 * (Stripe account, subject) and reused; the Stripe idempotency key makes a
 * concurrent first-time create return the same customer.
 */
@Injectable()
export class StripeCustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
  ) {}

  async ensureCustomer(
    client: Stripe,
    accountRef: string,
    tenantId: string,
    subject: StripeCustomerSubject,
  ): Promise<string> {
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.stripeCustomer.findUnique({
        where: {
          account_ref_subject_type_subject_id: {
            account_ref: accountRef,
            subject_type: subject.type,
            subject_id: subject.id,
          },
        },
      }),
    );
    if (existing) return existing.stripe_customer_id;

    const customer = await this.stripe.createCustomer(
      client,
      {
        name: subject.name.slice(0, 256),
        email: subject.email || undefined,
        metadata: {
          tenant_id: tenantId,
          erp_subject_type: subject.type,
          erp_subject_id: subject.id,
        },
      },
      `erp-customer:${accountRef}:${subject.type}:${subject.id}`,
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.stripeCustomer.upsert({
        where: {
          account_ref_subject_type_subject_id: {
            account_ref: accountRef,
            subject_type: subject.type,
            subject_id: subject.id,
          },
        },
        create: {
          tenant_id: tenantId,
          account_ref: accountRef,
          subject_type: subject.type,
          subject_id: subject.id,
          stripe_customer_id: customer.id,
          email: subject.email ?? null,
        },
        update: {},
      }),
    );
    return customer.id;
  }
}
