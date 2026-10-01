import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  forwardRef,
} from "@nestjs/common";
import { PaymentInitiatorType, Prisma, VendorPayout } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { PaymentsService } from "../gl/payments.service";
import { PaymentRequestsService } from "../invoices/payment-requests.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { PaymentAuditService } from "./payment-audit.service";
import { PaymentGatewaySettingsService } from "./payment-gateway-settings.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import { staffFrontendUrl } from "./utils/frontend-url.util";
import {
  gtMoney,
  isPositiveMoney,
  roundMoney,
  toDecimal,
  toMinorUnits,
} from "./utils/money.util";

export const VENDOR_PAYOUT_SCOPE = "vendor_payout";

export interface PayoutActor {
  type: PaymentInitiatorType;
  id?: string | null;
}

/**
 * Automatic tenant → vendor payments via Stripe Connect.
 *
 *   payment request approved ─▶ Stripe transfer to the vendor's connected
 *   account (amount from the ERP) ─▶ existing PaymentRequestsService.markPaid
 *   ─▶ existing gl PaymentsService posts the AP payment (payment voucher,
 *   allocation, vendor balance) with reference STRIPE:<transfer id>.
 *
 * Funds come from the company's Stripe balance (its own account, or the
 * platform account when it collects on the company's behalf); Stripe then
 * pays the vendor's bank on the connected account's payout schedule.
 * Requests whose vendor is not onboarded yet are paid automatically by the
 * reconciliation job once onboarding completes. Everything here is inert
 * until STRIPE_CONNECT_ENABLED=true.
 */
@Injectable()
export class VendorPayoutsService {
  private readonly logger = new Logger(VendorPayoutsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly settings: PaymentGatewaySettingsService,
    private readonly glPayments: PaymentsService,
    @Inject(forwardRef(() => PaymentRequestsService))
    private readonly paymentRequests: PaymentRequestsService,
    private readonly notifications: NotificationEmitterService,
    private readonly audit: PaymentAuditService,
  ) {}

  enabled() {
    return this.stripe.connectEnabled();
  }

  private requireEnabled() {
    if (!this.enabled()) {
      throw new ServiceUnavailableException(
        "Automatic vendor payouts (Stripe Connect) are not enabled yet.",
      );
    }
  }

  // ─────────────────────────── vendor accounts ───────────────────────────

  /** Creates (once) the vendor's Stripe Express connected account. */
  async ensureAccount(tenantId: string, partyId: string) {
    this.requireEnabled();
    const account = await this.settings.resolveTenantAccount(tenantId);
    const existing = await this.prisma.vendorPayoutAccount.findUnique({
      where: {
        tenant_id_party_id_account_ref: {
          tenant_id: tenantId,
          party_id: partyId,
          account_ref: account.accountRef,
        },
      },
    });
    if (existing) return { row: existing, client: account.client };

    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!party) throw new NotFoundException("Vendor not found.");
    if (party.party_type === "CUSTOMER") {
      throw new BadRequestException("Payouts can only be set up for vendors.");
    }

    const acct = await this.stripe.createConnectedAccount(
      account.client,
      {
        type: "express",
        ...(party.country_code ? { country: party.country_code } : {}),
        email: party.email ?? undefined,
        business_profile: { name: party.name.slice(0, 200) },
        capabilities: { transfers: { requested: true } },
        metadata: {
          tenant_id: tenantId,
          party_id: partyId,
          erp_scope: VENDOR_PAYOUT_SCOPE,
        },
      },
      `erp-vendor-account:${account.accountRef}:${partyId}`,
    );
    const row = await this.prisma.vendorPayoutAccount.upsert({
      where: {
        tenant_id_party_id_account_ref: {
          tenant_id: tenantId,
          party_id: partyId,
          account_ref: account.accountRef,
        },
      },
      create: {
        tenant_id: tenantId,
        party_id: partyId,
        account_ref: account.accountRef,
        stripe_account_id: acct.id,
        ...this.accountFlags(acct),
      },
      update: {},
    });
    await this.audit.log(tenantId, {
      action: "VENDOR_PAYOUT_ACCOUNT_CREATED",
      entity: "VendorPayoutAccount",
      entityId: row.id,
      metadata: { party_id: partyId },
    });
    return { row, client: account.client };
  }

  /** Stripe-hosted onboarding link (vendor enters bank / identity details). */
  async onboardingLink(tenantId: string, partyId: string, returnUrl: string) {
    const { row, client } = await this.ensureAccount(tenantId, partyId);
    const link = await this.stripe.createAccountLink(client, {
      account: row.stripe_account_id,
      type: "account_onboarding",
      refresh_url: returnUrl,
      return_url: returnUrl,
    });
    return {
      success: true,
      data: { url: link.url, expires_at: new Date(link.expires_at * 1000) },
    };
  }

  /** Current payout readiness (refreshed from Stripe). */
  async accountStatus(tenantId: string, partyId: string) {
    const rows = await this.prisma.vendorPayoutAccount.findMany({
      where: { tenant_id: tenantId, party_id: partyId },
    });
    if (!rows.length) {
      return {
        success: true,
        data: {
          onboarded: false,
          payouts_ready: false,
          connect_enabled: this.enabled(),
        },
      };
    }
    const row = this.enabled() ? await this.refreshAccount(rows[0]) : rows[0];
    return {
      success: true,
      data: {
        onboarded: row.details_submitted,
        payouts_ready: this.isReady(row),
        payouts_enabled: row.payouts_enabled,
        transfers_active: row.transfers_active,
        requirements_due: row.requirements_due,
        connect_enabled: this.enabled(),
      },
    };
  }

  async refreshAccount(row: {
    id: string;
    tenant_id: string;
    account_ref: string;
    stripe_account_id: string;
  }) {
    const client = await this.settings.clientForAccountRef(
      row.account_ref,
      row.tenant_id,
    );
    const acct = await this.stripe.retrieveConnectedAccount(
      client,
      row.stripe_account_id,
    );
    return this.updateAccountFromStripe(acct);
  }

  /** Connect webhook account.updated (and refreshes). */
  async updateAccountFromStripe(acct: Stripe.Account) {
    const before = await this.prisma.vendorPayoutAccount.findUnique({
      where: { stripe_account_id: acct.id },
    });
    if (!before) throw new NotFoundException("Unknown connected account.");
    const row = await this.prisma.vendorPayoutAccount.update({
      where: { id: before.id },
      data: this.accountFlags(acct),
    });
    if (!this.isReady(before) && this.isReady(row)) {
      // Vendor just finished onboarding — pay what is waiting for them.
      void this.payApprovedForVendor(row.tenant_id, row.party_id);
    }
    return row;
  }

  private accountFlags(acct: Stripe.Account) {
    return {
      details_submitted: Boolean(acct.details_submitted),
      payouts_enabled: Boolean(acct.payouts_enabled),
      transfers_active: acct.capabilities?.transfers === "active",
      requirements_due: (acct.requirements?.currently_due ??
        []) as Prisma.InputJsonValue,
    };
  }

  private isReady(row: {
    transfers_active: boolean;
    payouts_enabled: boolean;
  }) {
    return row.transfers_active && row.payouts_enabled;
  }

  // ─────────────────────────── payouts ───────────────────────────

  /**
   * Hook from PaymentRequestsService.approve(). Pays automatically when
   * Connect + auto payouts are on and the vendor is ready; otherwise the
   * request waits and the reconciler pays it later. Never throws.
   */
  async autoPayApprovedRequest(
    tenantId: string,
    requestId: string,
    actor: PayoutActor,
  ) {
    try {
      if (!this.enabled()) return;
      const gw = await this.settings.find(tenantId);
      if (!gw?.is_enabled || !gw.auto_vendor_payouts) return;
      await this.payPaymentRequest(tenantId, requestId, actor);
    } catch (err) {
      this.logger.warn(
        `Automatic payout of payment request ${requestId} not completed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /** Transfers an approved payment request to the vendor and records it in the ERP. */
  async payPaymentRequest(
    tenantId: string,
    requestId: string,
    actor: PayoutActor,
  ) {
    this.requireEnabled();
    const request = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.findFirst({
        where: { id: requestId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!request) throw new NotFoundException("Payment request not found.");
    if (request.status !== "APPROVED" || request.payment_id) {
      throw new BadRequestException(
        "Only approved, unpaid payment requests can be paid out.",
      );
    }
    if (request.invoice_id) {
      const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.invoice.findFirst({
          where: {
            id: request.invoice_id!,
            tenant_id: tenantId,
            deleted_at: null,
          },
        }),
      );
      if (!invoice || ["CANCELLED", "VOID"].includes(invoice.status)) {
        throw new BadRequestException("Linked vendor bill is not payable.");
      }
      if (gtMoney(request.amount, invoice.balance_due)) {
        throw new BadRequestException(
          "Payment request exceeds the bill's balance due.",
        );
      }
    }

    const payout = await this.transfer(tenantId, {
      partyId: request.party_id,
      paymentRequestId: request.id,
      invoiceId: request.invoice_id,
      amount: toDecimal(request.amount),
      currency: request.currency_code,
      description: `Payment request ${request.request_number}`,
      actor,
    });

    try {
      await this.settleRequestInErp(tenantId, payout, request.id, actor.id);
    } catch (err) {
      // Money has moved; the reconciler re-attempts the ERP posting.
      this.logger.error(
        `Payout ${payout.id} sent but ERP posting failed: ${String(err)}`,
      );
    }
    return {
      success: true,
      data: this.view(await this.requirePayout(tenantId, payout.id)),
    };
  }

  /** Pays a posted vendor bill's full balance directly (no payment request). */
  async payPurchaseInvoice(
    tenantId: string,
    invoiceId: string,
    actor: PayoutActor,
  ) {
    this.requireEnabled();
    const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({
        where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!invoice || invoice.invoice_type !== "PURCHASE_INVOICE") {
      throw new NotFoundException("Vendor bill not found.");
    }
    if (
      !["POSTED", "SENT", "PARTIALLY_PAID"].includes(invoice.status) ||
      !isPositiveMoney(invoice.balance_due)
    ) {
      throw new BadRequestException(
        `Vendor bill is not open for payment (${invoice.status}).`,
      );
    }
    const amount = roundMoney(invoice.balance_due);
    const payout = await this.transfer(tenantId, {
      partyId: invoice.party_id,
      paymentRequestId: null,
      invoiceId: invoice.id,
      amount,
      currency: invoice.currency_code,
      description: `Vendor bill ${invoice.invoice_number}`,
      actor,
    });
    try {
      await this.postErpPayment(tenantId, payout.id);
    } catch (err) {
      this.logger.error(
        `Payout ${payout.id} sent but ERP posting failed: ${String(err)}`,
      );
    }
    return {
      success: true,
      data: this.view(await this.requirePayout(tenantId, payout.id)),
    };
  }

  private async transfer(
    tenantId: string,
    input: {
      partyId: string;
      paymentRequestId: string | null;
      invoiceId: string | null;
      amount: Prisma.Decimal;
      currency: string;
      description: string;
      actor: PayoutActor;
    },
  ): Promise<VendorPayout> {
    const account = await this.settings.resolveTenantAccount(tenantId);
    const vendor = await this.prisma.vendorPayoutAccount.findUnique({
      where: {
        tenant_id_party_id_account_ref: {
          tenant_id: tenantId,
          party_id: input.partyId,
          account_ref: account.accountRef,
        },
      },
    });
    if (!vendor || !this.isReady(vendor)) {
      throw new BadRequestException(
        "Vendor has not completed Stripe payout onboarding yet; they will be paid automatically once they do.",
      );
    }
    const currency = input.currency.toUpperCase();
    const amountMinor = toMinorUnits(input.amount, currency);
    if (amountMinor <= 0n) throw new BadRequestException("Nothing to pay.");

    let payout: VendorPayout;
    try {
      payout = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.vendorPayout.create({
          data: {
            tenant_id: tenantId,
            party_id: input.partyId,
            invoice_id: input.invoiceId,
            payment_request_id: input.paymentRequestId,
            status: "PROCESSING",
            amount: roundMoney(input.amount),
            currency_code: currency,
            amount_minor: amountMinor,
            account_ref: account.accountRef,
            stripe_account_id: vendor.stripe_account_id,
            initiated_by_type: input.actor.type,
            initiated_by_id: input.actor.id ?? null,
          },
        }),
      );
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException(
          "A payout for this item is already in progress or completed.",
        );
      }
      throw err;
    }

    let transfer: Stripe.Transfer;
    try {
      transfer = await this.stripe.createTransfer(
        account.client,
        {
          amount: Number(amountMinor),
          currency: currency.toLowerCase(),
          destination: vendor.stripe_account_id,
          description: input.description,
          transfer_group:
            input.paymentRequestId ?? input.invoiceId ?? payout.id,
          metadata: {
            erp_scope: VENDOR_PAYOUT_SCOPE,
            tenant_id: tenantId,
            payout_id: payout.id,
            party_id: input.partyId,
            ...(input.paymentRequestId
              ? { payment_request_id: input.paymentRequestId }
              : {}),
            ...(input.invoiceId ? { invoice_id: input.invoiceId } : {}),
          },
        },
        `erp-payout:${payout.id}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.vendorPayout.update({
          where: { id: payout.id },
          data: { status: "FAILED", failure_message: message.slice(0, 1000) },
        }),
      );
      await this.notifications.notifyFinanceStaff(tenantId, {
        type: "PAYMENT_ACTION_REQUIRED",
        title: "Vendor payout failed",
        message: `Stripe payout of ${roundMoney(input.amount).toFixed(2)} ${currency} for ${input.description} failed (${message}). It will be retried automatically; check the Stripe balance.`,
        entity_type: "vendor_payout",
        entity_id: payout.id,
      });
      throw err;
    }

    const paid = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPayout.update({
        where: { id: payout.id },
        data: {
          status: "PAID",
          stripe_transfer_id: transfer.id,
          paid_at: new Date(),
          failure_message: null,
        },
      }),
    );
    await this.audit.log(tenantId, {
      userId: input.actor.type === "STAFF" ? input.actor.id : null,
      action: "VENDOR_PAYOUT_SENT",
      entity: "VendorPayout",
      entityId: payout.id,
      metadata: {
        amount: roundMoney(input.amount).toFixed(2),
        currency,
        stripe_transfer_id: transfer.id,
        party_id: input.partyId,
        payment_request_id: input.paymentRequestId,
        invoice_id: input.invoiceId,
      },
    });
    return paid;
  }

  /** AP payment for a direct bill payout (existing gl create + post). */
  private async postErpPayment(tenantId: string, payoutId: string) {
    const payout = await this.requirePayout(tenantId, payoutId);
    if (
      payout.erp_payment_id ||
      payout.status !== "PAID" ||
      !payout.stripe_transfer_id
    )
      return;
    const reference = `STRIPE:${payout.stripe_transfer_id}`;
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.payment.findFirst({
        where: {
          tenant_id: tenantId,
          reference_number: reference,
          deleted_at: null,
          status: { not: "CANCELLED" },
        },
      }),
    );
    let paymentId = existing?.id ?? null;
    if (!existing) {
      const invoice = payout.invoice_id
        ? await this.prisma.runWithTenant(tenantId, (tx) =>
            tx.invoice.findFirst({
              where: { id: payout.invoice_id!, tenant_id: tenantId },
            }),
          )
        : null;
      const allocate =
        invoice && isPositiveMoney(invoice.balance_due)
          ? Prisma.Decimal.min(
              toDecimal(payout.amount),
              toDecimal(invoice.balance_due),
            )
          : null;
      const created = await this.glPayments.create(tenantId, {
        direction: "PAYMENT",
        payment_method: "BANK_TRANSFER",
        party_id: payout.party_id,
        amount: Number(roundMoney(payout.amount).toFixed(4)),
        currency_code: payout.currency_code,
        exchange_rate: invoice ? Number(invoice.exchange_rate) : 1,
        company_id: invoice?.company_id ?? undefined,
        reference_number: reference,
        narration: `Stripe payout to vendor${invoice ? ` — ${invoice.invoice_number}` : ""}`,
        allocations: allocate
          ? [{ invoice_id: invoice!.id, amount: Number(allocate.toFixed(4)) }]
          : [],
      });
      paymentId = (await this.glPayments.post(tenantId, created.id)).id;
    } else if (existing.status === "DRAFT") {
      paymentId = (await this.glPayments.post(tenantId, existing.id)).id;
    }
    await this.linkErpPayment(tenantId, payout.id, paymentId);
  }

  /**
   * Records a sent request payout in the ERP: the existing markPaid (AP
   * payment allocated to the linked bill). A request without a bill gets no
   * payment from markPaid, but money did leave the bank — so it is booked
   * as an unallocated AP payment (vendor advance) and linked to the request.
   * Safe to repeat (reconciler).
   */
  private async settleRequestInErp(
    tenantId: string,
    payout: VendorPayout,
    requestId: string,
    actorId?: string | null,
  ) {
    let req = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.findFirst({
        where: { id: requestId, tenant_id: tenantId },
      }),
    );
    if (!req) return;
    if (req.status === "APPROVED" && !req.payment_id) {
      req = await this.paymentRequests.markPaid(
        tenantId,
        req.id,
        actorId ?? undefined,
        {
          referenceNumber: `STRIPE:${payout.stripe_transfer_id}`,
          narration: `Stripe payout to vendor — ${req.request_number}`,
          paymentMethod: "BANK_TRANSFER",
        },
      );
    }
    if (req.payment_id) {
      await this.linkErpPayment(tenantId, payout.id, req.payment_id);
      return;
    }
    if (req.status !== "PAID") return;
    await this.postErpPayment(tenantId, payout.id);
    const linked = await this.requirePayout(tenantId, payout.id);
    if (linked.erp_payment_id) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.paymentRequest.updateMany({
          where: { id: req!.id, tenant_id: tenantId, payment_id: null },
          data: { payment_id: linked.erp_payment_id },
        }),
      );
    }
  }

  private async linkErpPayment(
    tenantId: string,
    payoutId: string,
    paymentId: string | null,
  ) {
    if (!paymentId) return;
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPayout.update({
        where: { id: payoutId },
        data: { erp_payment_id: paymentId },
      }),
    );
  }

  /**
   * transfer.reversed: the vendor did not keep the money — reverse the ERP
   * AP payment (existing cancel → reversal voucher) and reopen the request.
   */
  async applyTransferReversed(
    tenantId: string,
    transfer: Stripe.Transfer,
    accountRef?: string,
  ) {
    const payout = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPayout.findFirst({
        where: { tenant_id: tenantId, stripe_transfer_id: transfer.id },
      }),
    );
    if (!payout || (accountRef && payout.account_ref !== accountRef))
      return null;
    if (payout.status === "REFUNDED") return payout;
    if (transfer.amount_reversed < transfer.amount) {
      this.logger.warn(
        `Partial reversal on transfer ${transfer.id}; finance review required.`,
      );
    }
    if (payout.erp_payment_id) {
      const erp = await this.glPayments.findOne(
        tenantId,
        payout.erp_payment_id,
      );
      if (erp.status === "POSTED")
        await this.glPayments.cancel(tenantId, erp.id);
    }
    if (payout.payment_request_id) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.paymentRequest.updateMany({
          where: {
            id: payout.payment_request_id!,
            tenant_id: tenantId,
            status: "PAID",
          },
          data: { status: "APPROVED", payment_id: null, paid_at: null },
        }),
      );
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPayout.update({
        where: { id: payout.id },
        data: { status: "REFUNDED", reversed_at: new Date() },
      }),
    );
    await this.audit.log(tenantId, {
      action: "VENDOR_PAYOUT_REVERSED",
      entity: "VendorPayout",
      entityId: payout.id,
      metadata: { stripe_transfer_id: transfer.id },
    });
    await this.notifications.notifyFinanceStaff(tenantId, {
      type: "PAYMENT_ACTION_REQUIRED",
      title: "Vendor payout reversed",
      message: `Stripe reversed payout ${transfer.id} (${roundMoney(payout.amount).toFixed(2)} ${payout.currency_code}). The AP payment was reversed and the bill is open again.`,
      entity_type: "vendor_payout",
      entity_id: payout.id,
    });
    return updated;
  }

  private async payApprovedForVendor(tenantId: string, partyId: string) {
    const requests = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.findMany({
        where: {
          tenant_id: tenantId,
          party_id: partyId,
          status: "APPROVED",
          payment_id: null,
          deleted_at: null,
        },
        select: { id: true, approved_by: true },
        take: 25,
      }),
    );
    for (const r of requests) {
      await this.autoPayApprovedRequest(tenantId, r.id, {
        type: "STAFF",
        id: r.approved_by,
      });
    }
  }

  /** Reconciler: pay waiting requests, retry ERP posting, refresh accounts. */
  async reconcileTenant(tenantId: string) {
    const result = { paid: 0, posted: 0, accounts: 0 };
    if (!this.enabled()) return result;
    const gw = await this.settings.find(tenantId);
    if (!gw?.is_enabled) return result;

    const pendingAccounts = await this.prisma.vendorPayoutAccount.findMany({
      where: {
        tenant_id: tenantId,
        OR: [{ transfers_active: false }, { payouts_enabled: false }],
      },
      take: 10,
    });
    for (const a of pendingAccounts) {
      try {
        await this.refreshAccount(a);
        result.accounts++;
      } catch (err) {
        this.logger.warn(
          `Refresh of connected account ${a.stripe_account_id} failed: ${String(err)}`,
        );
      }
    }

    const unposted = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPayout.findMany({
        where: { tenant_id: tenantId, status: "PAID", erp_payment_id: null },
        take: 25,
      }),
    );
    for (const p of unposted) {
      try {
        if (p.payment_request_id) {
          await this.settleRequestInErp(tenantId, p, p.payment_request_id);
        } else {
          await this.postErpPayment(tenantId, p.id);
        }
        result.posted++;
      } catch (err) {
        this.logger.warn(
          `ERP posting retry for payout ${p.id} failed: ${String(err)}`,
        );
      }
    }

    if (gw.auto_vendor_payouts) {
      const ready = await this.prisma.vendorPayoutAccount.findMany({
        where: {
          tenant_id: tenantId,
          transfers_active: true,
          payouts_enabled: true,
        },
        select: { party_id: true },
      });
      if (ready.length) {
        const waiting = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.paymentRequest.findMany({
            where: {
              tenant_id: tenantId,
              status: "APPROVED",
              payment_id: null,
              deleted_at: null,
              party_id: { in: ready.map((r) => r.party_id) },
            },
            select: { id: true, approved_by: true },
            take: 25,
          }),
        );
        for (const r of waiting) {
          const live = await this.prisma.runWithTenant(tenantId, (tx) =>
            tx.vendorPayout.count({
              where: {
                tenant_id: tenantId,
                payment_request_id: r.id,
                status: { in: ["PENDING", "PROCESSING", "PAID"] },
              },
            }),
          );
          if (live) continue;
          await this.autoPayApprovedRequest(tenantId, r.id, {
            type: "STAFF",
            id: r.approved_by,
          });
          result.paid++;
        }
      }
    }
    return result;
  }

  // ─────────────────────────── queries ───────────────────────────

  async list(
    tenantId: string,
    filter: { partyId?: string; status?: string } = {},
  ) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPayout.findMany({
        where: {
          tenant_id: tenantId,
          ...(filter.partyId ? { party_id: filter.partyId } : {}),
          ...(filter.status
            ? { status: filter.status as VendorPayout["status"] }
            : {}),
        },
        orderBy: { created_at: "desc" },
        take: 200,
      }),
    );
    return { success: true, data: rows.map((r) => this.view(r)) };
  }

  async getOne(tenantId: string, id: string, partyId?: string) {
    const row = await this.requirePayout(tenantId, id, partyId);
    return { success: true, data: this.view(row) };
  }

  private async requirePayout(tenantId: string, id: string, partyId?: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPayout.findFirst({
        where: {
          id,
          tenant_id: tenantId,
          ...(partyId ? { party_id: partyId } : {}),
        },
      }),
    );
    if (!row) throw new NotFoundException("Payout not found.");
    return row;
  }

  view(p: VendorPayout) {
    return {
      id: p.id,
      party_id: p.party_id,
      invoice_id: p.invoice_id,
      payment_request_id: p.payment_request_id,
      status: p.status,
      amount: roundMoney(p.amount).toFixed(2),
      currency_code: p.currency_code,
      transaction_reference: p.stripe_transfer_id,
      erp_payment_id: p.erp_payment_id,
      failure_message: p.failure_message,
      paid_at: p.paid_at,
      reversed_at: p.reversed_at,
      created_at: p.created_at,
    };
  }

  defaultReturnUrl(kind: "staff" | "vendor", partyId?: string) {
    return kind === "vendor"
      ? `${(process.env.PORTAL_FRONTEND_URL ?? staffFrontendUrl()).replace(/\/$/, "")}/vendor/payouts`
      : `${staffFrontendUrl()}/parties/${partyId}`;
  }
}
