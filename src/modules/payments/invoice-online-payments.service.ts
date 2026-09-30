import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  OnlinePaymentStatus,
  PaymentInitiatorType,
  PaymentTransaction,
  Prisma,
} from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { PaymentsService } from "../gl/payments.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import {
  CHECKOUT_SESSION_TTL_SECONDS,
  ERP_POSTING_CLAIM_STALE_MS,
  IN_FLIGHT_ATTEMPT_STATUSES,
  METADATA_SCOPE,
  ONLINE_PAYABLE_INVOICE_STATUSES,
  ONLINE_PAYABLE_INVOICE_TYPES,
  OPEN_ATTEMPT_STATUSES,
  SETTLED_ATTEMPT_STATUSES,
  STRIPE_METADATA,
} from "./constants/online-payment.constants";
import {
  OnlinePaymentQueryDto,
  RefundPaymentDto,
} from "./dto/online-payment.dto";
import { PaymentAuditService } from "./payment-audit.service";
import { PaymentGatewaySettingsService } from "./payment-gateway-settings.service";
import { PaymentNotificationsService } from "./payment-notifications.service";
import { StripeCustomersService } from "./stripe-customers.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import {
  fromMinorUnits,
  gtMoney,
  isPositiveMoney,
  minDecimal,
  roundMoney,
  toDecimal,
  toMinorUnits,
} from "./utils/money.util";
import { withQuery } from "./utils/frontend-url.util";

export interface PaymentInitiator {
  type: PaymentInitiatorType;
  id?: string | null;
}

export interface StartCheckoutOptions {
  initiator: PaymentInitiator;
  /** Requested partial amount (validated; ignored unless partials allowed). */
  amount?: number;
  /** Trusted, server-built page the payer returns to after Checkout. */
  returnUrl: string;
  paymentLinkId?: string;
}

export interface GatewaySuccessInfo {
  paymentIntentId: string | null;
  chargeId?: string | null;
  payerEmail?: string | null;
  amountMinor: number | null;
  currency: string | null;
}

/** Reference stored on the ERP Payment — also the DB-level dedupe key. */
export const stripeErpReference = (paymentIntentId: string) =>
  `STRIPE:${paymentIntentId}`;

/**
 * Stripe Checkout for tenant customer invoices.
 *
 * ERP invoice → PaymentTransaction (attempt) → Stripe Checkout Session →
 * webhook → ERP Payment created + posted via gl/PaymentsService (voucher,
 * allocation, invoice balance) → notifications.
 */
@Injectable()
export class InvoiceOnlinePaymentsService {
  private readonly logger = new Logger(InvoiceOnlinePaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly settings: PaymentGatewaySettingsService,
    private readonly customers: StripeCustomersService,
    private readonly glPayments: PaymentsService,
    private readonly notifications: NotificationEmitterService,
    private readonly mailer: PaymentNotificationsService,
    private readonly audit: PaymentAuditService,
  ) {}

  // ───────────────────────────── checkout ─────────────────────────────

  async startCheckout(
    tenantId: string,
    invoiceId: string,
    opts: StartCheckoutOptions,
  ) {
    // Ownership / payability first (404 for another tenant's invoice).
    const invoice = await this.loadPayableInvoice(tenantId, invoiceId);
    const account = await this.settings.resolveTenantAccount(tenantId);
    const amount = this.resolvePayableAmount(
      invoice.balance_due,
      opts.amount,
      account.gateway.allow_partial_payments,
    );
    const currency = invoice.currency_code.toUpperCase();
    const amountMinor = toMinorUnits(amount, currency);
    if (amountMinor <= 0n) {
      throw new BadRequestException("Amount is too small to charge online.");
    }

    // Reuse an identical open session (double-click / page refresh) and
    // supersede any other open ones so the invoice is never paid twice.
    const reusable = await this.settleOpenAttempts(
      tenantId,
      invoiceId,
      account.client,
      amountMinor,
    );
    if (reusable) {
      return { success: true, data: this.toCheckoutResponse(reusable, true) };
    }

    const stripeCustomerId = await this.customers.ensureCustomer(
      account.client,
      account.accountRef,
      tenantId,
      {
        type: "PARTY",
        id: invoice.party.id,
        name: invoice.party.name,
        email: invoice.party.email,
      },
    );

    const txn = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const attempts = await tx.paymentTransaction.count({
        where: { tenant_id: tenantId, invoice_id: invoiceId },
      });
      return tx.paymentTransaction.create({
        data: {
          tenant_id: tenantId,
          invoice_id: invoiceId,
          party_id: invoice.party_id,
          provider: "STRIPE",
          status: "PENDING",
          attempt_number: attempts + 1,
          amount: amount,
          currency_code: currency,
          amount_minor: amountMinor,
          account_ref: account.accountRef,
          stripe_customer_id: stripeCustomerId,
          initiated_by_type: opts.initiator.type,
          initiated_by_id: opts.initiator.id ?? null,
          payment_link_id: opts.paymentLinkId ?? null,
        },
      });
    });

    const metadata: Record<string, string> = {
      [STRIPE_METADATA.SCOPE]: METADATA_SCOPE.TENANT_INVOICE,
      [STRIPE_METADATA.TENANT_ID]: tenantId,
      [STRIPE_METADATA.INVOICE_ID]: invoice.id,
      [STRIPE_METADATA.PAYMENT_ID]: txn.id,
      [STRIPE_METADATA.PARTY_ID]: invoice.party_id,
      [STRIPE_METADATA.INVOICE_NUMBER]: invoice.invoice_number,
      [STRIPE_METADATA.PAYMENT_TYPE]: invoice.invoice_type,
    };
    const description = `Invoice ${invoice.invoice_number}`;

    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.createCheckoutSession(
        account.client,
        {
          mode: "payment",
          customer: stripeCustomerId,
          client_reference_id: txn.id,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: currency.toLowerCase(),
                unit_amount: Number(amountMinor),
                product_data: {
                  name: description,
                  description: `${invoice.party.name} — ${invoice.invoice_type === "DEBIT_NOTE" ? "debit note" : "invoice"} payment`,
                },
              },
            },
          ],
          metadata,
          payment_intent_data: {
            metadata,
            description,
            ...(account.gateway.statement_descriptor
              ? {
                  statement_descriptor_suffix:
                    account.gateway.statement_descriptor,
                }
              : {}),
          },
          expires_at:
            Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
          success_url: withQuery(opts.returnUrl, {
            payment: "success",
            session_id: "{CHECKOUT_SESSION_ID}",
          }),
          cancel_url: withQuery(opts.returnUrl, { payment: "cancelled" }),
        },
        `erp-checkout:${txn.id}`,
      );
    } catch (err) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.paymentTransaction.update({
          where: { id: txn.id },
          data: {
            status: "FAILED",
            failure_message: "Could not create checkout session.",
          },
        }),
      );
      throw err;
    }

    const saved = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentTransaction.update({
        where: { id: txn.id },
        data: {
          stripe_checkout_session_id: session.id,
          checkout_url: session.url,
          checkout_expires_at: session.expires_at
            ? new Date(session.expires_at * 1000)
            : null,
        },
      }),
    );

    await this.audit.log(tenantId, {
      userId: opts.initiator.type === "STAFF" ? opts.initiator.id : null,
      action: "CHECKOUT_SESSION_CREATED",
      entity: "PaymentTransaction",
      entityId: saved.id,
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        amount: amount.toFixed(2),
        currency,
        attempt_number: saved.attempt_number,
        initiated_by_type: opts.initiator.type,
        initiated_by_id: opts.initiator.id ?? null,
      },
    });

    return { success: true, data: this.toCheckoutResponse(saved, false) };
  }

  /** New attempt on the same invoice after a failed / cancelled / expired one. */
  async retry(
    tenantId: string,
    transactionId: string,
    opts: StartCheckoutOptions,
  ) {
    const txn = await this.requireTransaction(tenantId, transactionId);
    if (!["FAILED", "CANCELLED", "EXPIRED"].includes(txn.status)) {
      throw new BadRequestException(
        `Only failed, cancelled or expired payments can be retried (current: ${txn.status}).`,
      );
    }
    return this.startCheckout(tenantId, txn.invoice_id, opts);
  }

  async cancel(
    tenantId: string,
    transactionId: string,
    actor: PaymentInitiator,
  ) {
    const txn = await this.requireTransaction(tenantId, transactionId);
    if (!OPEN_ATTEMPT_STATUSES.includes(txn.status)) {
      throw new BadRequestException(
        `Only pending payments can be cancelled (current: ${txn.status}).`,
      );
    }
    if (txn.stripe_checkout_session_id) {
      const client = await this.settings.clientForAccountRef(
        txn.account_ref,
        tenantId,
      );
      await this.stripe.expireCheckoutSession(
        client,
        txn.stripe_checkout_session_id,
      );
    }
    const updated = await this.transition(
      tenantId,
      txn.id,
      OPEN_ATTEMPT_STATUSES,
      {
        status: "CANCELLED",
        failure_message: "Cancelled by user.",
      },
    );
    await this.audit.log(tenantId, {
      userId: actor.type === "STAFF" ? actor.id : null,
      action: "PAYMENT_CANCELLED",
      entity: "PaymentTransaction",
      entityId: txn.id,
      metadata: { by_type: actor.type, by_id: actor.id ?? null },
    });
    return { success: true, data: this.toView(updated ?? txn) };
  }

  /**
   * Current state of an attempt. With `sync`, the server re-reads the
   * Checkout Session from Stripe (server-to-server, never trusting the
   * browser redirect) and applies it — a safety net for delayed webhooks.
   */
  async checkoutStatus(tenantId: string, transactionId: string, sync = false) {
    let txn = await this.requireTransaction(tenantId, transactionId);
    if (
      sync &&
      txn.stripe_checkout_session_id &&
      [
        ...OPEN_ATTEMPT_STATUSES,
        ...IN_FLIGHT_ATTEMPT_STATUSES,
        "FAILED",
      ].includes(txn.status)
    ) {
      const client = await this.settings.clientForAccountRef(
        txn.account_ref,
        tenantId,
      );
      const session = await this.stripe.retrieveCheckoutSession(
        client,
        txn.stripe_checkout_session_id,
      );
      await this.applyCheckoutSession(tenantId, txn.account_ref, session);
      txn = await this.requireTransaction(tenantId, transactionId);
    }
    return { success: true, data: this.toView(txn) };
  }

  // ───────────────────────────── queries ─────────────────────────────

  async list(tenantId: string, query: OnlinePaymentQueryDto, partyId?: string) {
    const where: Prisma.PaymentTransactionWhereInput = {
      tenant_id: tenantId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.invoice_id ? { invoice_id: query.invoice_id } : {}),
      ...(partyId
        ? { party_id: partyId }
        : query.party_id
          ? { party_id: query.party_id }
          : {}),
    };
    const [rows, total] = await this.prisma.runWithTenant(tenantId, (tx) =>
      Promise.all([
        tx.paymentTransaction.findMany({
          where,
          include: {
            invoice: { select: { id: true, invoice_number: true } },
            party: { select: { id: true, code: true, name: true } },
            payment: {
              select: { id: true, payment_number: true, status: true },
            },
          },
          orderBy: { created_at: "desc" },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        tx.paymentTransaction.count({ where }),
      ]),
    );
    return {
      success: true,
      data: rows.map((r) => ({
        ...this.toView(r),
        invoice: r.invoice,
        party: r.party,
        erp_payment: r.payment,
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getOne(tenantId: string, id: string, partyId?: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentTransaction.findFirst({
        where: {
          id,
          tenant_id: tenantId,
          ...(partyId ? { party_id: partyId } : {}),
        },
        include: {
          invoice: {
            select: {
              id: true,
              invoice_number: true,
              status: true,
              total_amount: true,
              balance_due: true,
              currency_code: true,
            },
          },
          party: { select: { id: true, code: true, name: true } },
          payment: {
            select: {
              id: true,
              payment_number: true,
              status: true,
              voucher: { select: { id: true, voucher_number: true } },
            },
          },
          refunds: { orderBy: { created_at: "desc" } },
        },
      }),
    );
    if (!row) throw new NotFoundException("Payment not found.");
    return {
      success: true,
      data: {
        ...this.toView(row),
        invoice: row.invoice,
        party: row.party,
        erp_payment: row.payment,
        refunds: row.refunds.map((r) => this.refundView(r)),
      },
    };
  }

  /**
   * Invoice payment status: ERP balance (source of truth) + online
   * attempts + posted ERP receipts + manual proofs awaiting review.
   */
  async invoicePaymentStatus(
    tenantId: string,
    invoiceId: string,
    partyId?: string,
  ) {
    const result = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: {
          id: invoiceId,
          tenant_id: tenantId,
          deleted_at: null,
          ...(partyId ? { party_id: partyId } : {}),
        },
        select: {
          id: true,
          invoice_number: true,
          invoice_type: true,
          status: true,
          currency_code: true,
          total_amount: true,
          amount_paid: true,
          balance_due: true,
          due_date: true,
          party_id: true,
        },
      });
      if (!invoice) return null;
      const [attempts, allocations, pendingProofs] = await Promise.all([
        tx.paymentTransaction.findMany({
          where: { tenant_id: tenantId, invoice_id: invoiceId },
          orderBy: { created_at: "desc" },
          take: 20,
        }),
        tx.paymentAllocation.findMany({
          where: {
            tenant_id: tenantId,
            invoice_id: invoiceId,
            deleted_at: null,
          },
          include: {
            payment: {
              select: {
                id: true,
                payment_number: true,
                payment_date: true,
                payment_method: true,
                status: true,
                reference_number: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        }),
        tx.paymentProof.count({
          where: {
            tenant_id: tenantId,
            invoice_id: invoiceId,
            status: "SUBMITTED",
            deleted_at: null,
          },
        }),
      ]);
      return { invoice, attempts, allocations, pendingProofs };
    });
    if (!result) throw new NotFoundException("Invoice not found.");
    const { invoice, attempts, allocations, pendingProofs } = result;

    const onlineEnabled = await this.settings.isOnlinePaymentEnabled(tenantId);
    const inFlight = attempts.find((a) =>
      [...OPEN_ATTEMPT_STATUSES, ...IN_FLIGHT_ATTEMPT_STATUSES].includes(
        a.status,
      ),
    );
    const payable =
      onlineEnabled &&
      ONLINE_PAYABLE_INVOICE_TYPES.includes(invoice.invoice_type) &&
      ONLINE_PAYABLE_INVOICE_STATUSES.includes(invoice.status) &&
      isPositiveMoney(invoice.balance_due) &&
      !attempts.some((a) => IN_FLIGHT_ATTEMPT_STATUSES.includes(a.status));

    return {
      success: true,
      data: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_status: invoice.status,
        currency_code: invoice.currency_code,
        total_amount: invoice.total_amount,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        due_date: invoice.due_date,
        payment_status: this.derivePaymentStatus(
          invoice,
          attempts,
          pendingProofs,
        ),
        online_payment_enabled: onlineEnabled,
        can_pay_online: payable,
        pending_proofs: pendingProofs,
        current_attempt: inFlight ? this.toView(inFlight) : null,
        attempts: attempts.map((a) => this.toView(a)),
        payments: allocations
          .filter((a) => a.payment.status === "POSTED")
          .map((a) => ({
            payment_id: a.payment.id,
            payment_number: a.payment.payment_number,
            payment_date: a.payment.payment_date,
            payment_method: a.payment.payment_method,
            transaction_reference: a.payment.reference_number,
            allocated_amount: a.amount,
          })),
      },
    };
  }

  // ─────────────────────── webhook / reconciliation ───────────────────────

  /** Applies a Checkout Session (webhook or server-side sync). */
  async applyCheckoutSession(
    tenantId: string,
    accountRef: string,
    session: Stripe.Checkout.Session,
    eventType = "checkout.session.sync",
  ) {
    const txn = await this.findForGatewayObject(tenantId, accountRef, {
      sessionId: session.id,
      transactionId: session.metadata?.[STRIPE_METADATA.PAYMENT_ID],
    });
    if (!txn) return { handled: false, reason: "transaction_not_found" };

    const pi = session.payment_intent;
    const piId = typeof pi === "string" ? pi : (pi?.id ?? null);
    const chargeId =
      pi && typeof pi !== "string" && pi.latest_charge
        ? typeof pi.latest_charge === "string"
          ? pi.latest_charge
          : pi.latest_charge.id
        : null;

    if (eventType === "checkout.session.async_payment_failed") {
      await this.markFailed(tenantId, txn.id, {
        paymentIntentId: piId,
        code: "async_payment_failed",
        message: "The payment could not be completed by the bank.",
      });
      return { handled: true };
    }

    if (session.status === "expired") {
      await this.transition(
        tenantId,
        txn.id,
        [...OPEN_ATTEMPT_STATUSES, "FAILED"],
        {
          status: "EXPIRED",
          failure_message: "Checkout session expired.",
        },
      );
      return { handled: true };
    }

    if (session.status === "complete" && session.payment_status === "paid") {
      await this.markSucceeded(tenantId, txn.id, {
        paymentIntentId: piId,
        chargeId,
        payerEmail: session.customer_details?.email ?? null,
        amountMinor: session.amount_total,
        currency: session.currency,
      });
      return { handled: true };
    }

    if (session.status === "complete" && session.payment_status === "unpaid") {
      // Asynchronous method (e.g. bank debit) — confirmation comes later.
      await this.transition(
        tenantId,
        txn.id,
        [...OPEN_ATTEMPT_STATUSES, "FAILED"],
        {
          status: "PROCESSING",
          stripe_payment_intent_id: piId ?? undefined,
        },
      );
      return { handled: true };
    }

    this.logger.debug(`Session ${session.id} (${eventType}) left unchanged.`);
    return { handled: true };
  }

  async applyPaymentIntent(
    tenantId: string,
    accountRef: string,
    pi: Stripe.PaymentIntent,
  ) {
    const txn = await this.findForGatewayObject(tenantId, accountRef, {
      paymentIntentId: pi.id,
      transactionId: pi.metadata?.[STRIPE_METADATA.PAYMENT_ID],
    });
    if (!txn) return { handled: false, reason: "transaction_not_found" };

    const chargeId =
      typeof pi.latest_charge === "string"
        ? pi.latest_charge
        : pi.latest_charge?.id;

    switch (pi.status) {
      case "succeeded":
        await this.markSucceeded(tenantId, txn.id, {
          paymentIntentId: pi.id,
          chargeId,
          payerEmail: pi.receipt_email,
          amountMinor: pi.amount_received || pi.amount,
          currency: pi.currency,
        });
        break;
      case "processing":
        await this.transition(
          tenantId,
          txn.id,
          [...OPEN_ATTEMPT_STATUSES, "FAILED"],
          {
            status: "PROCESSING",
            stripe_payment_intent_id: pi.id,
          },
        );
        break;
      case "requires_action":
        await this.transition(tenantId, txn.id, ["PENDING", "FAILED"], {
          status: "REQUIRES_ACTION",
          stripe_payment_intent_id: pi.id,
        });
        break;
      case "canceled":
        await this.transition(
          tenantId,
          txn.id,
          [...OPEN_ATTEMPT_STATUSES, ...IN_FLIGHT_ATTEMPT_STATUSES, "FAILED"],
          { status: "CANCELLED", stripe_payment_intent_id: pi.id },
        );
        break;
      case "requires_payment_method":
        if (pi.last_payment_error) {
          await this.markFailed(tenantId, txn.id, {
            paymentIntentId: pi.id,
            code:
              pi.last_payment_error.decline_code ??
              pi.last_payment_error.code ??
              null,
            message: pi.last_payment_error.message ?? "Payment failed.",
          });
        }
        break;
      default:
        break;
    }
    return { handled: true };
  }

  /**
   * Idempotent success path. The attempt row is locked, flipped to PAID
   * and "claimed" for ERP posting in one transaction; only the claimer
   * posts the ERP payment, and the partial unique index on
   * payments(reference_number) is the final guard against duplicates.
   */
  async markSucceeded(
    tenantId: string,
    transactionId: string,
    info: GatewaySuccessInfo,
  ) {
    const claim = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const txn = await this.lockTransaction(tx, tenantId, transactionId);
      if (!txn) throw new NotFoundException("Payment transaction not found.");

      if (
        info.amountMinor !== null &&
        (BigInt(info.amountMinor) !== txn.amount_minor ||
          (info.currency ?? "").toUpperCase() !==
            txn.currency_code.toUpperCase())
      ) {
        this.logger.error(
          `Amount mismatch on transaction ${txn.id}: expected ${txn.amount_minor} ${txn.currency_code}, got ${info.amountMinor} ${info.currency}`,
        );
        await tx.paymentTransaction.update({
          where: { id: txn.id },
          data: {
            failure_code: "amount_mismatch",
            failure_message:
              "Gateway amount does not match the ERP attempt; manual review required.",
          },
        });
        return { txn, claimed: false, mismatch: true };
      }

      const alreadySettled = SETTLED_ATTEMPT_STATUSES.includes(txn.status);
      const staleClaim =
        !txn.erp_posting_claimed_at ||
        Date.now() - txn.erp_posting_claimed_at.getTime() >
          ERP_POSTING_CLAIM_STALE_MS;
      const claimed = !txn.payment_id && staleClaim;

      const updated = await tx.paymentTransaction.update({
        where: { id: txn.id },
        data: {
          ...(alreadySettled
            ? {}
            : {
                status: "PAID" as OnlinePaymentStatus,
                paid_at: new Date(),
                failure_code: null,
                failure_message: null,
              }),
          stripe_payment_intent_id:
            txn.stripe_payment_intent_id ?? info.paymentIntentId,
          stripe_charge_id: txn.stripe_charge_id ?? info.chargeId ?? null,
          payer_email: txn.payer_email ?? info.payerEmail ?? null,
          ...(claimed ? { erp_posting_claimed_at: new Date() } : {}),
        },
      });
      return {
        txn: updated,
        claimed,
        mismatch: false,
        newlyPaid: !alreadySettled,
      };
    });

    if (claim.mismatch || !claim.claimed) return claim.txn;

    let erpPaymentId: string;
    try {
      erpPaymentId = await this.postErpReceipt(tenantId, claim.txn);
    } catch (err) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.paymentTransaction.update({
          where: { id: transactionId },
          data: { erp_posting_claimed_at: null },
        }),
      );
      throw err;
    }

    const linked = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentTransaction.update({
        where: { id: transactionId },
        data: { payment_id: erpPaymentId, erp_posting_claimed_at: null },
        include: {
          invoice: { select: { id: true, invoice_number: true } },
          party: { select: { id: true, name: true, email: true } },
          payment: { select: { payment_number: true } },
        },
      }),
    );

    if ("newlyPaid" in claim && claim.newlyPaid) {
      await this.afterSuccess(tenantId, linked);
    }
    return linked;
  }

  async markFailed(
    tenantId: string,
    transactionId: string,
    info: {
      paymentIntentId?: string | null;
      code?: string | null;
      message: string;
    },
  ) {
    const updated = await this.transition(
      tenantId,
      transactionId,
      [...OPEN_ATTEMPT_STATUSES, ...IN_FLIGHT_ATTEMPT_STATUSES],
      {
        status: "FAILED",
        failure_code: info.code ?? null,
        failure_message: info.message.slice(0, 1000),
        ...(info.paymentIntentId
          ? { stripe_payment_intent_id: info.paymentIntentId }
          : {}),
      },
    );
    if (!updated) return null;

    await this.audit.log(tenantId, {
      action: "PAYMENT_FAILED",
      entity: "PaymentTransaction",
      entityId: updated.id,
      metadata: { invoice_id: updated.invoice_id, code: info.code ?? null },
    });
    if (
      updated.initiated_by_type === "PORTAL_USER" &&
      updated.initiated_by_id
    ) {
      await this.notifications.notifyPortalUser(
        tenantId,
        updated.initiated_by_id,
        {
          type: "PAYMENT_FAILED",
          title: "Payment failed",
          message:
            "Your online payment could not be completed. You can retry from the invoice.",
          entity_type: "invoice",
          entity_id: updated.invoice_id,
          link_path: `/portal/invoices/${updated.invoice_id}`,
        },
      );
    }
    return updated;
  }

  // ───────────────────────────── refunds ─────────────────────────────

  async refund(
    tenantId: string,
    transactionId: string,
    dto: RefundPaymentDto,
    actor: PaymentInitiator,
  ) {
    const txn = await this.requireTransaction(tenantId, transactionId);
    if (
      !["PAID", "PARTIALLY_REFUNDED"].includes(txn.status) ||
      !txn.stripe_payment_intent_id
    ) {
      throw new BadRequestException(
        "Only completed Stripe payments can be refunded.",
      );
    }

    const refundable = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const pending = await tx.paymentRefund.aggregate({
        where: {
          tenant_id: tenantId,
          payment_transaction_id: txn.id,
          status: "PENDING",
        },
        _sum: { amount: true },
      });
      return toDecimal(txn.amount)
        .minus(toDecimal(txn.amount_refunded))
        .minus(toDecimal(pending._sum.amount));
    });
    const amount =
      dto.amount !== undefined
        ? roundMoney(dto.amount)
        : roundMoney(refundable);
    if (!isPositiveMoney(amount)) {
      throw new BadRequestException("Nothing left to refund on this payment.");
    }
    if (gtMoney(amount, refundable)) {
      throw new BadRequestException(
        `Refund exceeds refundable amount (${roundMoney(refundable).toFixed(2)} ${txn.currency_code}).`,
      );
    }

    const refund = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRefund.create({
        data: {
          tenant_id: tenantId,
          scope: "TENANT_INVOICE",
          payment_transaction_id: txn.id,
          amount,
          currency_code: txn.currency_code,
          reason: dto.reason,
          requested_by: actor.id ?? null,
          requested_by_type: actor.type,
        },
      }),
    );

    const client = await this.settings.clientForAccountRef(
      txn.account_ref,
      tenantId,
    );
    let stripeRefund: Stripe.Refund;
    try {
      stripeRefund = await this.stripe.createRefund(
        client,
        {
          payment_intent: txn.stripe_payment_intent_id,
          amount: Number(toMinorUnits(amount, txn.currency_code)),
          reason: "requested_by_customer",
          metadata: {
            [STRIPE_METADATA.SCOPE]: METADATA_SCOPE.TENANT_INVOICE,
            [STRIPE_METADATA.TENANT_ID]: tenantId,
            [STRIPE_METADATA.PAYMENT_ID]: txn.id,
            erp_refund_id: refund.id,
          },
        },
        `erp-refund:${refund.id}`,
      );
    } catch (err) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.paymentRefund.update({
          where: { id: refund.id },
          data: {
            status: "FAILED",
            failure_reason: "Payment provider rejected the refund.",
          },
        }),
      );
      throw err;
    }

    await this.audit.log(tenantId, {
      userId: actor.type === "STAFF" ? actor.id : null,
      action: "REFUND_CREATED",
      entity: "PaymentRefund",
      entityId: refund.id,
      metadata: {
        payment_transaction_id: txn.id,
        amount: amount.toFixed(2),
        currency: txn.currency_code,
        stripe_refund_id: stripeRefund.id,
        reason: dto.reason ?? null,
      },
    });

    const synced = await this.applyStripeRefund(
      tenantId,
      txn.account_ref,
      stripeRefund,
    );
    return { success: true, data: this.refundView(synced ?? refund) };
  }

  async listRefunds(tenantId: string, transactionId: string) {
    await this.requireTransaction(tenantId, transactionId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRefund.findMany({
        where: { tenant_id: tenantId, payment_transaction_id: transactionId },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data: rows.map((r) => this.refundView(r)) };
  }

  async getRefund(tenantId: string, refundId: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRefund.findFirst({
        where: { id: refundId, tenant_id: tenantId, scope: "TENANT_INVOICE" },
      }),
    );
    if (!row) throw new NotFoundException("Refund not found.");
    return { success: true, data: this.refundView(row) };
  }

  /**
   * Syncs one Stripe Refund into the ERP (API response or webhook). A
   * refund created in the Stripe dashboard is adopted as a new row.
   */
  async applyStripeRefund(
    tenantId: string,
    accountRef: string,
    refund: Stripe.Refund,
  ) {
    const piId =
      typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : refund.payment_intent?.id;
    if (!piId) return null;

    const txn = await this.findForGatewayObject(tenantId, accountRef, {
      paymentIntentId: piId,
    });
    if (!txn) return null;

    const status =
      refund.status === "succeeded"
        ? "SUCCEEDED"
        : refund.status === "failed"
          ? "FAILED"
          : refund.status === "canceled"
            ? "CANCELLED"
            : "PENDING";

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const erpRefundId = refund.metadata?.erp_refund_id;
      const existing = await tx.paymentRefund.findFirst({
        where: {
          tenant_id: tenantId,
          OR: [
            { stripe_refund_id: refund.id },
            ...(erpRefundId
              ? [{ id: erpRefundId, payment_transaction_id: txn.id }]
              : []),
          ],
        },
      });
      if (existing) {
        return tx.paymentRefund.update({
          where: { id: existing.id },
          data: {
            stripe_refund_id: refund.id,
            status,
            failure_reason: refund.failure_reason ?? existing.failure_reason,
            processed_at:
              status === "PENDING"
                ? null
                : (existing.processed_at ?? new Date()),
          },
        });
      }
      return tx.paymentRefund.create({
        data: {
          tenant_id: tenantId,
          scope: "TENANT_INVOICE",
          payment_transaction_id: txn.id,
          amount: fromMinorUnits(refund.amount, txn.currency_code),
          currency_code: txn.currency_code,
          reason: "Refund issued in Stripe dashboard",
          stripe_refund_id: refund.id,
          status,
          requested_by_type: "STAFF",
          processed_at: status === "PENDING" ? null : new Date(),
        },
      });
    });

    if (row.status === "SUCCEEDED") {
      await this.applyRefundAccounting(tenantId, row.id);
    }
    return row;
  }

  /**
   * Reflects a succeeded refund in the ERP ledger using the existing
   * accounting flow: the posted receipt is cancelled (reversal voucher,
   * invoice balance restored) and — for a partial refund — the net amount
   * is re-posted as a new receipt. Claimed via `accounting_applied_at`.
   */
  async applyRefundAccounting(tenantId: string, refundId: string) {
    const claimed = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRefund.updateMany({
        where: {
          id: refundId,
          tenant_id: tenantId,
          status: "SUCCEEDED",
          accounting_applied_at: null,
        },
        data: { accounting_applied_at: new Date() },
      }),
    );
    if (claimed.count === 0) return;

    try {
      const refund = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.paymentRefund.findUniqueOrThrow({ where: { id: refundId } }),
      );
      const txn = await this.requireTransaction(
        tenantId,
        refund.payment_transaction_id!,
      );
      const refundedTotal = toDecimal(txn.amount_refunded).plus(
        toDecimal(refund.amount),
      );
      const net = toDecimal(txn.amount).minus(refundedTotal);

      let newPaymentId: string | null = txn.payment_id;
      if (txn.payment_id) {
        const erp = await this.glPayments.findOne(tenantId, txn.payment_id);
        if (erp.status === "POSTED") {
          await this.glPayments.cancel(tenantId, erp.id);
        } else if (erp.status === "DRAFT") {
          await this.glPayments.softDelete(tenantId, erp.id);
        }
        newPaymentId = null;
        if (isPositiveMoney(net)) {
          newPaymentId = await this.postErpReceipt(tenantId, {
            ...txn,
            amount: net,
          });
        }
      }

      const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.paymentTransaction.update({
          where: { id: txn.id },
          data: {
            amount_refunded: refundedTotal,
            status: isPositiveMoney(net) ? "PARTIALLY_REFUNDED" : "REFUNDED",
            payment_id: newPaymentId,
          },
        }),
      );

      await this.audit.log(tenantId, {
        action: "REFUND_COMPLETED",
        entity: "PaymentRefund",
        entityId: refundId,
        metadata: {
          payment_transaction_id: txn.id,
          amount: toDecimal(refund.amount).toFixed(2),
          refunded_total: refundedTotal.toFixed(2),
          reposted_erp_payment_id: newPaymentId,
        },
      });
      await this.notifications.notifyFinanceStaff(tenantId, {
        type: "PAYMENT_REFUNDED",
        title: "Online payment refunded",
        message: `Refund of ${toDecimal(refund.amount).toFixed(2)} ${refund.currency_code} completed for invoice payment.`,
        entity_type: "invoice",
        entity_id: updated.invoice_id,
        link_path: `/invoices/${updated.invoice_id}`,
      });
      await this.notifications.notifyPartyPortalUsers(
        tenantId,
        updated.party_id,
        {
          type: "PAYMENT_REFUNDED",
          title: "Refund processed",
          message: `A refund of ${toDecimal(refund.amount).toFixed(2)} ${refund.currency_code} has been processed.`,
          entity_type: "invoice",
          entity_id: updated.invoice_id,
          link_path: `/portal/invoices/${updated.invoice_id}`,
        },
      );
    } catch (err) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.paymentRefund.update({
          where: { id: refundId },
          data: { accounting_applied_at: null },
        }),
      );
      throw err;
    }
  }

  // ───────────────────────────── internals ─────────────────────────────

  /**
   * Creates + posts the ERP receipt for a gateway payment through the
   * existing gl PaymentsService (voucher, allocation, invoice balance).
   * Idempotent on the STRIPE:<payment_intent> reference.
   */
  private async postErpReceipt(
    tenantId: string,
    txn: PaymentTransaction,
  ): Promise<string> {
    if (!txn.stripe_payment_intent_id) {
      throw new ConflictException(
        "Gateway payment has no payment intent id yet.",
      );
    }
    const reference = stripeErpReference(txn.stripe_payment_intent_id);

    const { existing, invoice, gateway } = await this.prisma.runWithTenant(
      tenantId,
      async (tx) => ({
        existing: await tx.payment.findFirst({
          where: {
            tenant_id: tenantId,
            reference_number: reference,
            deleted_at: null,
            status: { not: "CANCELLED" },
          },
        }),
        invoice: await tx.invoice.findFirst({
          where: { id: txn.invoice_id, tenant_id: tenantId, deleted_at: null },
        }),
        gateway: await tx.tenantPaymentGateway.findUnique({
          where: { tenant_id: tenantId },
        }),
      }),
    );

    if (existing?.status === "POSTED") return existing.id;
    if (existing?.status === "DRAFT") {
      // A previous attempt crashed between create and post; rebuild it so
      // the allocation reflects the invoice's current balance.
      await this.glPayments.softDelete(tenantId, existing.id);
    }

    const amount = roundMoney(txn.amount);
    const open =
      invoice &&
      ONLINE_PAYABLE_INVOICE_STATUSES.includes(invoice.status) &&
      isPositiveMoney(invoice.balance_due);
    const allocate = open ? minDecimal(amount, invoice.balance_due) : null;

    if (!open) {
      this.logger.warn(
        `Invoice ${txn.invoice_id} no longer open; posting Stripe payment ${reference} on account (unallocated).`,
      );
    }

    let created;
    try {
      created = await this.glPayments.create(tenantId, {
        direction: "RECEIPT",
        payment_method: "CREDIT_CARD",
        party_id: txn.party_id,
        amount: Number(amount.toFixed(4)),
        currency_code: txn.currency_code,
        exchange_rate: invoice ? Number(invoice.exchange_rate) : 1,
        company_id: invoice?.company_id ?? undefined,
        branch_id: invoice?.branch_id ?? undefined,
        bank_account_id: gateway?.bank_account_id ?? undefined,
        reference_number: reference,
        narration: `Online card payment (Stripe) for ${invoice?.invoice_number ?? "invoice"} — attempt #${txn.attempt_number}`,
        allocations: allocate
          ? [
              {
                invoice_id: txn.invoice_id,
                amount: Number(allocate.toFixed(4)),
              },
            ]
          : [],
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        // Unique guard hit — another worker created it concurrently.
        const winner = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.payment.findFirst({
            where: {
              tenant_id: tenantId,
              reference_number: reference,
              deleted_at: null,
              status: { not: "CANCELLED" },
            },
          }),
        );
        if (winner) return winner.id;
      }
      throw err;
    }

    const posted = await this.glPayments.post(tenantId, created.id);
    return posted.id;
  }

  private async afterSuccess(
    tenantId: string,
    txn: PaymentTransaction & {
      invoice: { id: string; invoice_number: string };
      party: { id: string; name: string; email: string | null };
      payment: { payment_number: string } | null;
    },
  ) {
    const amount = toDecimal(txn.amount).toFixed(2);
    await this.audit.log(tenantId, {
      action: "PAYMENT_SUCCEEDED",
      entity: "PaymentTransaction",
      entityId: txn.id,
      metadata: {
        invoice_id: txn.invoice.id,
        invoice_number: txn.invoice.invoice_number,
        amount,
        currency: txn.currency_code,
        stripe_payment_intent_id: txn.stripe_payment_intent_id,
        erp_payment_id: txn.payment_id,
      },
    });
    // Portal users already get PAYMENT_RECEIVED from gl PaymentsService.post().
    await this.notifications.notifyFinanceStaff(tenantId, {
      type: "PAYMENT_RECEIVED",
      title: "Online payment received",
      message: `${txn.party.name} paid ${amount} ${txn.currency_code} online for ${txn.invoice.invoice_number}.`,
      entity_type: "invoice",
      entity_id: txn.invoice.id,
      link_path: `/invoices/${txn.invoice.id}`,
    });
    const to = txn.payer_email ?? txn.party.email;
    if (to) {
      // Not awaited: SMTP timeouts (up to ~90s) must not hold the Stripe
      // webhook response open. sendReceipt never throws; the ERP payment is
      // already posted at this point.
      void this.mailer.sendReceipt(tenantId, {
        to,
        invoiceNumber: txn.invoice.invoice_number,
        amount,
        currency: txn.currency_code,
        reference:
          txn.payment?.payment_number ?? txn.stripe_payment_intent_id ?? txn.id,
      });
    }
  }

  private async loadPayableInvoice(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({
        where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
        include: { party: { select: { id: true, name: true, email: true } } },
      }),
    );
    if (!invoice) throw new NotFoundException("Invoice not found.");
    if (!ONLINE_PAYABLE_INVOICE_TYPES.includes(invoice.invoice_type)) {
      throw new BadRequestException("This document cannot be paid online.");
    }
    if (!ONLINE_PAYABLE_INVOICE_STATUSES.includes(invoice.status)) {
      throw new BadRequestException(
        `Invoice is not open for payment (${invoice.status}).`,
      );
    }
    if (!isPositiveMoney(invoice.balance_due)) {
      throw new BadRequestException("Invoice has no outstanding balance.");
    }
    return invoice;
  }

  /** Server-side amount: the ERP balance, or a validated partial amount. */
  resolvePayableAmount(
    balanceDue: Prisma.Decimal | number | string,
    requested: number | undefined,
    allowPartial: boolean,
  ): Prisma.Decimal {
    const balance = roundMoney(balanceDue);
    if (requested === undefined || requested === null) return balance;
    const req = roundMoney(requested);
    if (!allowPartial) {
      if (!req.equals(balance)) {
        throw new BadRequestException(
          "Partial online payments are not enabled; the full balance must be paid.",
        );
      }
      return balance;
    }
    if (!isPositiveMoney(req)) {
      throw new BadRequestException("Amount must be greater than zero.");
    }
    if (gtMoney(req, balance)) {
      throw new BadRequestException(
        `Amount exceeds the outstanding balance (${balance.toFixed(2)}).`,
      );
    }
    return req;
  }

  /**
   * Returns an open attempt that can be reused as-is, after cancelling
   * every other open attempt for the invoice. Rejects while a payment is
   * already processing (money may be moving).
   */
  private async settleOpenAttempts(
    tenantId: string,
    invoiceId: string,
    client: Stripe,
    amountMinor: bigint,
  ): Promise<PaymentTransaction | null> {
    const open = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentTransaction.findMany({
        where: {
          tenant_id: tenantId,
          invoice_id: invoiceId,
          status: {
            in: [...OPEN_ATTEMPT_STATUSES, ...IN_FLIGHT_ATTEMPT_STATUSES],
          },
        },
        orderBy: { created_at: "desc" },
      }),
    );
    if (open.some((t) => IN_FLIGHT_ATTEMPT_STATUSES.includes(t.status))) {
      throw new ConflictException(
        "A payment for this invoice is already being processed.",
      );
    }

    const now = Date.now() + 60_000; // keep a minute of headroom
    let reusable: PaymentTransaction | null = null;
    for (const t of open) {
      const live =
        t.status === "PENDING" &&
        t.checkout_url &&
        t.checkout_expires_at &&
        t.checkout_expires_at.getTime() > now;
      if (!reusable && live && t.amount_minor === amountMinor) {
        reusable = t;
        continue;
      }
      if (t.stripe_checkout_session_id) {
        await this.stripe.expireCheckoutSession(
          client,
          t.stripe_checkout_session_id,
        );
      }
      const expired =
        t.checkout_expires_at && t.checkout_expires_at.getTime() <= Date.now();
      await this.transition(tenantId, t.id, OPEN_ATTEMPT_STATUSES, {
        status: expired ? "EXPIRED" : "CANCELLED",
        failure_message: expired
          ? "Checkout session expired."
          : "Superseded by a new checkout.",
      });
    }
    return reusable;
  }

  /** Conditional status update — no-op when the row moved on meanwhile. */
  private async transition(
    tenantId: string,
    id: string,
    from: OnlinePaymentStatus[],
    data: Prisma.PaymentTransactionUpdateInput,
  ): Promise<PaymentTransaction | null> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const txn = await this.lockTransaction(tx, tenantId, id);
      if (!txn || !from.includes(txn.status)) return null;
      return tx.paymentTransaction.update({ where: { id }, data });
    });
  }

  private async lockTransaction(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id: string,
  ): Promise<PaymentTransaction | null> {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM payment_transactions
      WHERE tenant_id = ${tenantId}::uuid AND id = ${id}::uuid
      FOR UPDATE
    `;
    if (!rows.length) return null;
    return tx.paymentTransaction.findUnique({ where: { id } });
  }

  /**
   * Finds the attempt a Stripe object refers to, requiring it to live on
   * the same Stripe account the (signature-verified) event came from.
   */
  private async findForGatewayObject(
    tenantId: string,
    accountRef: string,
    keys: {
      sessionId?: string;
      paymentIntentId?: string;
      transactionId?: string;
    },
  ) {
    const or: Prisma.PaymentTransactionWhereInput[] = [];
    if (keys.sessionId) or.push({ stripe_checkout_session_id: keys.sessionId });
    if (keys.paymentIntentId)
      or.push({ stripe_payment_intent_id: keys.paymentIntentId });
    if (keys.transactionId && /^[0-9a-f-]{36}$/i.test(keys.transactionId)) {
      or.push({ id: keys.transactionId });
    }
    if (!or.length) return null;
    const txn = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentTransaction.findFirst({
        where: { tenant_id: tenantId, OR: or },
      }),
    );
    if (!txn) return null;
    if (txn.account_ref !== accountRef) {
      this.logger.warn(
        `Ignoring Stripe object for transaction ${txn.id}: account ${accountRef} ≠ ${txn.account_ref}.`,
      );
      return null;
    }
    return txn;
  }

  private async requireTransaction(tenantId: string, id: string) {
    const txn = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentTransaction.findFirst({ where: { id, tenant_id: tenantId } }),
    );
    if (!txn) throw new NotFoundException("Payment not found.");
    return txn;
  }

  private derivePaymentStatus(
    invoice: { status: string; amount_paid: unknown; balance_due: unknown },
    attempts: PaymentTransaction[],
    pendingProofs: number,
  ): string {
    if (
      invoice.status === "PAID" ||
      !isPositiveMoney(invoice.balance_due as Prisma.Decimal)
    ) {
      return "PAID";
    }
    if (attempts.some((a) => a.status === "PROCESSING")) return "PROCESSING";
    if (attempts.some((a) => a.status === "REQUIRES_ACTION"))
      return "REQUIRES_ACTION";
    if (pendingProofs > 0) return "PENDING_VERIFICATION";
    if (isPositiveMoney(invoice.amount_paid as Prisma.Decimal))
      return "PARTIALLY_PAID";
    if (attempts[0]?.status === "FAILED") return "FAILED";
    return "PENDING";
  }

  private toCheckoutResponse(txn: PaymentTransaction, reused: boolean) {
    return {
      payment_id: txn.id,
      checkout_url: txn.checkout_url,
      checkout_session_id: txn.stripe_checkout_session_id,
      expires_at: txn.checkout_expires_at,
      amount: roundMoney(txn.amount).toFixed(2),
      currency_code: txn.currency_code,
      attempt_number: txn.attempt_number,
      reused,
    };
  }

  toView(txn: PaymentTransaction) {
    return {
      id: txn.id,
      invoice_id: txn.invoice_id,
      party_id: txn.party_id,
      provider: txn.provider,
      payment_method: "CARD",
      status: txn.status,
      attempt_number: txn.attempt_number,
      amount: roundMoney(txn.amount).toFixed(2),
      amount_refunded: roundMoney(txn.amount_refunded).toFixed(2),
      currency_code: txn.currency_code,
      checkout_url: OPEN_ATTEMPT_STATUSES.includes(txn.status)
        ? txn.checkout_url
        : null,
      checkout_expires_at: txn.checkout_expires_at,
      transaction_reference: txn.stripe_payment_intent_id,
      erp_payment_id: txn.payment_id,
      paid_at: txn.paid_at,
      failure_code: txn.failure_code,
      failure_message: txn.failure_message,
      initiated_by_type: txn.initiated_by_type,
      created_at: txn.created_at,
      updated_at: txn.updated_at,
    };
  }

  private refundView(r: {
    id: string;
    amount: Prisma.Decimal;
    currency_code: string;
    status: string;
    reason: string | null;
    stripe_refund_id: string | null;
    failure_reason: string | null;
    processed_at: Date | null;
    created_at: Date;
    accounting_applied_at?: Date | null;
  }) {
    return {
      id: r.id,
      amount: roundMoney(r.amount).toFixed(2),
      currency_code: r.currency_code,
      status: r.status,
      reason: r.reason,
      provider_reference: r.stripe_refund_id,
      failure_reason: r.failure_reason,
      accounting_applied: Boolean(r.accounting_applied_at),
      processed_at: r.processed_at,
      created_at: r.created_at,
    };
  }
}
