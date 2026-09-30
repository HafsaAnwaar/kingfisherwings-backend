import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  OnlinePaymentStatus,
  PaymentInitiatorType,
  PlatformInvoice,
  PlatformInvoiceStatus,
  PlatformPayment,
  Prisma,
} from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { PdfService } from "../../shared/pdf/pdf.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import {
  CHECKOUT_SESSION_TTL_SECONDS,
  IN_FLIGHT_ATTEMPT_STATUSES,
  METADATA_SCOPE,
  OPEN_ATTEMPT_STATUSES,
  PLATFORM_ACCOUNT_REF,
  STRIPE_METADATA,
} from "./constants/online-payment.constants";
import {
  CancelPlatformInvoiceDto,
  CreatePlatformInvoiceDto,
  PlatformInvoiceLineDto,
  PlatformInvoiceQueryDto,
  RecordPlatformManualPaymentDto,
  SendPlatformInvoiceDto,
  UpdatePlatformInvoiceDto,
} from "./dto/platform-billing.dto";
import { RefundPaymentDto } from "./dto/online-payment.dto";
import { PaymentAuditService } from "./payment-audit.service";
import { PaymentLinksService } from "./payment-links.service";
import { PaymentNotificationsService } from "./payment-notifications.service";
import { StripeCustomersService } from "./stripe-customers.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import {
  fromMinorUnits,
  gtMoney,
  isPositiveMoney,
  roundMoney,
  toDecimal,
  toMinorUnits,
} from "./utils/money.util";
import { staffFrontendUrl, withQuery } from "./utils/frontend-url.util";
import type {
  GatewaySuccessInfo,
  PaymentInitiator,
} from "./invoice-online-payments.service";

const PAYABLE_PLATFORM_STATUSES: PlatformInvoiceStatus[] = [
  "SENT",
  "PARTIALLY_PAID",
];

function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Super Admin → Tenant platform fee invoices, paid by the tenant via
 * Stripe (platform account) or manually (bank transfer etc. with proof,
 * verified by the Super Admin). This is the platform's own receivables
 * ledger — separate from any tenant's ERP books.
 */
@Injectable()
export class PlatformBillingService {
  private readonly logger = new Logger(PlatformBillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeGatewayService,
    private readonly customers: StripeCustomersService,
    private readonly links: PaymentLinksService,
    private readonly mailer: PaymentNotificationsService,
    private readonly notifications: NotificationEmitterService,
    private readonly storage: StorageService,
    private readonly pdf: PdfService,
    private readonly audit: PaymentAuditService,
  ) {}

  // ─────────────────────────── invoices (Super Admin) ───────────────────────────

  async create(dto: CreatePlatformInvoiceDto, superAdminId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: dto.tenant_id, deleted_at: null },
    });
    if (!tenant) throw new NotFoundException("Tenant not found.");

    const currency = (dto.currency_code ?? tenant.base_currency).toUpperCase();
    const totals = this.computeTotals(
      dto.lines,
      dto.discount_amount,
      dto.tax_rate,
    );

    const invoice = await this.prisma.$transaction(async (tx) => {
      const [{ seq }] = await tx.$queryRaw<Array<{ seq: bigint }>>`
        SELECT nextval('platform_invoice_number_seq') AS seq
      `;
      return tx.platformInvoice.create({
        data: {
          invoice_number: `PF-${seq.toString().padStart(6, "0")}`,
          tenant_id: tenant.id,
          currency_code: currency,
          issue_date: dto.issue_date ? new Date(dto.issue_date) : new Date(),
          due_date: dto.due_date ? new Date(dto.due_date) : null,
          period_start: dto.period_start ? new Date(dto.period_start) : null,
          period_end: dto.period_end ? new Date(dto.period_end) : null,
          notes: dto.notes,
          ...totals.header,
          balance_due: totals.header.total_amount,
          created_by_super_admin_id: superAdminId,
          updated_by_super_admin_id: superAdminId,
          lines: { create: totals.lines },
        },
        include: { lines: { orderBy: { sort_order: "asc" } } },
      });
    });

    await this.audit.log(tenant.id, {
      action: "PLATFORM_INVOICE_CREATED",
      entity: "PlatformInvoice",
      entityId: invoice.id,
      metadata: {
        super_admin_id: superAdminId,
        invoice_number: invoice.invoice_number,
        total: roundMoney(invoice.total_amount).toFixed(2),
        currency,
      },
    });
    return { success: true, data: this.toInvoiceView(invoice) };
  }

  async update(
    id: string,
    dto: UpdatePlatformInvoiceDto,
    superAdminId: string,
  ) {
    const invoice = await this.requireInvoice(id);
    const hasMoney = await this.prisma.platformPayment.count({
      where: {
        platform_invoice_id: id,
        status: {
          in: [
            "PAID",
            "PROCESSING",
            "PENDING_VERIFICATION",
            "PARTIALLY_REFUNDED",
            "REFUNDED",
          ],
        },
      },
    });
    if (!["DRAFT", "SENT"].includes(invoice.status) || hasMoney > 0) {
      throw new BadRequestException(
        "Only draft or unpaid sent invoices without payments can be edited.",
      );
    }

    const lines =
      dto.lines ??
      (
        await this.prisma.platformInvoiceLine.findMany({
          where: { platform_invoice_id: id },
          orderBy: { sort_order: "asc" },
        })
      ).map((l) => ({
        description: l.description,
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
      }));
    const totals = this.computeTotals(
      lines,
      dto.discount_amount ?? Number(invoice.discount_amount),
      dto.tax_rate ?? Number(invoice.tax_rate),
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.lines) {
        await tx.platformInvoiceLine.deleteMany({
          where: { platform_invoice_id: id },
        });
        await tx.platformInvoiceLine.createMany({
          data: totals.lines.map((l) => ({ ...l, platform_invoice_id: id })),
        });
      }
      return tx.platformInvoice.update({
        where: { id },
        data: {
          ...(dto.currency_code
            ? { currency_code: dto.currency_code.toUpperCase() }
            : {}),
          ...(dto.due_date !== undefined
            ? { due_date: dto.due_date ? new Date(dto.due_date) : null }
            : {}),
          ...(dto.period_start !== undefined
            ? { period_start: new Date(dto.period_start) }
            : {}),
          ...(dto.period_end !== undefined
            ? { period_end: new Date(dto.period_end) }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          ...totals.header,
          balance_due: totals.header.total_amount,
          updated_by_super_admin_id: superAdminId,
        },
        include: { lines: { orderBy: { sort_order: "asc" } } },
      });
    });

    // Amount changed → any open checkout for the old amount is stale.
    await this.expireOpenCheckouts(id);
    await this.audit.log(invoice.tenant_id, {
      action: "PLATFORM_INVOICE_UPDATED",
      entity: "PlatformInvoice",
      entityId: id,
      metadata: {
        super_admin_id: superAdminId,
        total: roundMoney(updated.total_amount).toFixed(2),
      },
    });
    return { success: true, data: this.toInvoiceView(updated) };
  }

  async remove(id: string, superAdminId: string) {
    const invoice = await this.requireInvoice(id);
    if (invoice.status !== "DRAFT") {
      throw new BadRequestException(
        "Only draft invoices can be deleted; cancel sent invoices instead.",
      );
    }
    await this.prisma.platformInvoice.update({
      where: { id },
      data: { deleted_at: new Date(), updated_by_super_admin_id: superAdminId },
    });
    await this.audit.log(invoice.tenant_id, {
      action: "PLATFORM_INVOICE_DELETED",
      entity: "PlatformInvoice",
      entityId: id,
      metadata: { super_admin_id: superAdminId },
    });
    return { success: true };
  }

  async list(query: PlatformInvoiceQueryDto, tenantId?: string) {
    const where: Prisma.PlatformInvoiceWhereInput = {
      deleted_at: null,
      ...(tenantId ? { tenant_id: tenantId, status: { not: "DRAFT" } } : {}),
      ...(!tenantId && query.tenant_id ? { tenant_id: query.tenant_id } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            invoice_number: {
              contains: query.search,
              mode: "insensitive" as const,
            },
          }
        : {}),
    };
    if (tenantId && query.status === "DRAFT")
      return {
        success: true,
        data: [],
        meta: { page: 1, limit: query.limit, total: 0, totalPages: 1 },
      };
    const [rows, total] = await Promise.all([
      this.prisma.platformInvoice.findMany({
        where,
        include: { tenant: { select: { id: true, name: true, code: true } } },
        orderBy: { created_at: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.platformInvoice.count({ where }),
    ]);
    return {
      success: true,
      data: rows.map((r) => ({ ...this.toInvoiceView(r), tenant: r.tenant })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getOne(id: string, tenantId?: string) {
    const invoice = await this.prisma.platformInvoice.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(tenantId ? { tenant_id: tenantId, status: { not: "DRAFT" } } : {}),
      },
      include: {
        lines: { orderBy: { sort_order: "asc" } },
        tenant: { select: { id: true, name: true, code: true, email: true } },
        payments: { orderBy: { created_at: "desc" } },
      },
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");
    return {
      success: true,
      data: {
        ...this.toInvoiceView(invoice),
        tenant: invoice.tenant,
        payments: invoice.payments.map((p) => this.toPaymentView(p)),
      },
    };
  }

  async send(id: string, dto: SendPlatformInvoiceDto, superAdminId: string) {
    const invoice = await this.requireInvoice(id);
    if (!["DRAFT", "SENT", "PARTIALLY_PAID"].includes(invoice.status)) {
      throw new BadRequestException(
        `Invoice cannot be sent (${invoice.status}).`,
      );
    }
    if (!isPositiveMoney(invoice.total_amount)) {
      throw new BadRequestException("Invoice total must be greater than zero.");
    }
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: invoice.tenant_id },
    });

    const recipients = dto.to_email
      ? [dto.to_email]
      : await this.tenantBillingEmails(tenant.id, tenant.email);
    if (!recipients.length) {
      throw new BadRequestException(
        "Tenant has no billing email; pass to_email.",
      );
    }

    const sent = await this.prisma.platformInvoice.update({
      where: { id },
      data: {
        status: invoice.status === "DRAFT" ? "SENT" : invoice.status,
        sent_at: invoice.sent_at ?? new Date(),
        last_emailed_at: new Date(),
        last_emailed_to: recipients.join(", ").slice(0, 255),
        updated_by_super_admin_id: superAdminId,
      },
      include: { lines: { orderBy: { sort_order: "asc" } } },
    });

    let payUrl: string | null = null;
    if (dto.include_payment_link !== false && this.stripe.platformClient()) {
      const link = await this.links.createForPlatformInvoice(tenant.id, id, {});
      payUrl = link.url;
    }

    const pdf = await this.renderPdf(sent, tenant).catch((err) => {
      this.logger.warn(`Platform invoice PDF failed: ${String(err)}`);
      return undefined;
    });

    const results = [];
    for (const to of recipients) {
      const log = await this.mailer.sendInvoiceWithPayLink(tenant.id, {
        to,
        companyName: process.env.APP_NAME ?? "Platform",
        invoiceNumber: sent.invoice_number,
        amount: roundMoney(sent.balance_due).toFixed(2),
        currency: sent.currency_code,
        dueDate: sent.due_date,
        payUrl,
        viewUrl: `${staffFrontendUrl()}/billing/invoices/${sent.id}`,
        message: dto.message,
        pdf,
        eventType: "PLATFORM_INVOICE_SENT",
        requireDelivery: false,
      });
      results.push({ to, status: log.status });
    }

    await this.notifications.notifyStaffByRoles(tenant.id, ["TENANT_ADMIN"], {
      type: "PLATFORM_INVOICE_ISSUED",
      title: `Platform invoice ${sent.invoice_number}`,
      message: `A platform invoice of ${roundMoney(sent.balance_due).toFixed(2)} ${sent.currency_code} is due${sent.due_date ? ` on ${sent.due_date.toISOString().slice(0, 10)}` : ""}.`,
      entity_type: "platform_invoice",
      entity_id: sent.id,
      link_path: `/billing/invoices/${sent.id}`,
    });
    await this.audit.log(tenant.id, {
      action: invoice.sent_at
        ? "PLATFORM_INVOICE_RESENT"
        : "PLATFORM_INVOICE_SENT",
      entity: "PlatformInvoice",
      entityId: id,
      metadata: {
        super_admin_id: superAdminId,
        recipients,
        payment_link: Boolean(payUrl),
      },
    });

    return {
      success: true,
      data: {
        ...this.toInvoiceView(sent),
        emails: results,
        payment_link: payUrl,
      },
    };
  }

  async createPaymentLink(
    id: string,
    superAdminId: string,
    expiresInDays?: number,
  ) {
    const invoice = await this.requireInvoice(id);
    this.assertPayable(invoice);
    this.stripe.requirePlatformClient();
    const link = await this.links.createForPlatformInvoice(
      invoice.tenant_id,
      id,
      {
        expiresInDays,
      },
    );
    await this.audit.log(invoice.tenant_id, {
      action: "PAYMENT_LINK_CREATED",
      entity: "PlatformInvoice",
      entityId: id,
      metadata: { super_admin_id: superAdminId, payment_link_id: link.link.id },
    });
    return {
      success: true,
      data: { url: link.url, expires_at: link.expires_at },
    };
  }

  async cancel(
    id: string,
    dto: CancelPlatformInvoiceDto,
    superAdminId: string,
  ) {
    const invoice = await this.requireInvoice(id);
    if (["CANCELLED", "PAID", "REFUNDED"].includes(invoice.status)) {
      throw new BadRequestException(
        `Invoice cannot be cancelled (${invoice.status}).`,
      );
    }
    if (isPositiveMoney(invoice.amount_paid)) {
      throw new BadRequestException(
        "Refund received payments before cancelling this invoice.",
      );
    }
    const processing = await this.prisma.platformPayment.count({
      where: {
        platform_invoice_id: id,
        status: { in: ["PROCESSING", "PENDING_VERIFICATION"] },
      },
    });
    if (processing) {
      throw new ConflictException(
        "A payment is in progress or awaiting verification.",
      );
    }
    await this.expireOpenCheckouts(id);
    await this.links.revokeAllFor({
      tenantId: invoice.tenant_id,
      platformInvoiceId: id,
    });
    const updated = await this.prisma.platformInvoice.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelled_at: new Date(),
        cancel_reason: dto.reason,
        updated_by_super_admin_id: superAdminId,
      },
    });
    await this.audit.log(invoice.tenant_id, {
      action: "PLATFORM_INVOICE_CANCELLED",
      entity: "PlatformInvoice",
      entityId: id,
      metadata: { super_admin_id: superAdminId, reason: dto.reason ?? null },
    });
    return { success: true, data: this.toInvoiceView(updated) };
  }

  async downloadPdf(id: string, tenantId?: string) {
    const invoice = await this.prisma.platformInvoice.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(tenantId ? { tenant_id: tenantId, status: { not: "DRAFT" } } : {}),
      },
      include: { lines: { orderBy: { sort_order: "asc" } } },
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: invoice.tenant_id },
    });
    return {
      buffer: await this.renderPdf(invoice, tenant),
      fileName: `${invoice.invoice_number}.pdf`,
    };
  }

  // ─────────────────────────── payments ───────────────────────────

  async listPayments(filter: {
    invoiceId?: string;
    tenantId?: string;
    status?: OnlinePaymentStatus;
  }) {
    const rows = await this.prisma.platformPayment.findMany({
      where: {
        ...(filter.invoiceId ? { platform_invoice_id: filter.invoiceId } : {}),
        ...(filter.tenantId ? { tenant_id: filter.tenantId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      include: { invoice: { select: { id: true, invoice_number: true } } },
      orderBy: { created_at: "desc" },
      take: 200,
    });
    return {
      success: true,
      data: rows.map((p) => ({ ...this.toPaymentView(p), invoice: p.invoice })),
    };
  }

  async getPayment(paymentId: string, tenantId?: string) {
    const p = await this.prisma.platformPayment.findFirst({
      where: { id: paymentId, ...(tenantId ? { tenant_id: tenantId } : {}) },
      include: { invoice: { select: { id: true, invoice_number: true } } },
    });
    if (!p) throw new NotFoundException("Payment not found.");
    const refunds = await this.prisma.runWithTenant(p.tenant_id, (tx) =>
      tx.paymentRefund.findMany({
        where: { tenant_id: p.tenant_id, platform_payment_id: p.id },
        orderBy: { created_at: "desc" },
      }),
    );
    return {
      success: true,
      data: {
        ...this.toPaymentView(p),
        invoice: p.invoice,
        refunds: refunds.map((r) => ({
          id: r.id,
          amount: roundMoney(r.amount).toFixed(2),
          currency_code: r.currency_code,
          status: r.status,
          reason: r.reason,
          provider_reference: r.stripe_refund_id,
          processed_at: r.processed_at,
          created_at: r.created_at,
        })),
      },
    };
  }

  async paymentStatus(invoiceId: string, tenantId?: string) {
    const invoice = await this.prisma.platformInvoice.findFirst({
      where: {
        id: invoiceId,
        deleted_at: null,
        ...(tenantId ? { tenant_id: tenantId, status: { not: "DRAFT" } } : {}),
      },
      include: { payments: { orderBy: { created_at: "desc" }, take: 20 } },
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");
    const current = invoice.payments.find((p) =>
      [
        ...OPEN_ATTEMPT_STATUSES,
        ...IN_FLIGHT_ATTEMPT_STATUSES,
        "PENDING_VERIFICATION",
      ].includes(p.status),
    );
    return {
      success: true,
      data: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_status: invoice.status,
        currency_code: invoice.currency_code,
        total_amount: roundMoney(invoice.total_amount).toFixed(2),
        amount_paid: roundMoney(invoice.amount_paid).toFixed(2),
        balance_due: roundMoney(invoice.balance_due).toFixed(2),
        due_date: invoice.due_date,
        online_payment_enabled: Boolean(this.stripe.platformClient()),
        can_pay_online:
          Boolean(this.stripe.platformClient()) &&
          PAYABLE_PLATFORM_STATUSES.includes(invoice.status) &&
          isPositiveMoney(invoice.balance_due) &&
          !invoice.payments.some((p) => p.status === "PROCESSING"),
        current_payment: current ? this.toPaymentView(current) : null,
        payments: invoice.payments.map((p) => this.toPaymentView(p)),
      },
    };
  }

  /** Tenant pays a platform invoice via Stripe Checkout (platform account). */
  async startCheckout(
    tenantId: string,
    invoiceId: string,
    actor: PaymentInitiator,
    returnUrl?: string,
  ) {
    const client = this.stripe.requirePlatformClient();
    const invoice = await this.prisma.platformInvoice.findFirst({
      where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");
    this.assertPayable(invoice);

    const amount = roundMoney(invoice.balance_due);
    const currency = invoice.currency_code.toUpperCase();
    const amountMinor = toMinorUnits(amount, currency);

    const open = await this.prisma.platformPayment.findMany({
      where: {
        platform_invoice_id: invoiceId,
        provider: "STRIPE",
        status: {
          in: [...OPEN_ATTEMPT_STATUSES, ...IN_FLIGHT_ATTEMPT_STATUSES],
        },
      },
      orderBy: { created_at: "desc" },
    });
    if (open.some((p) => p.status === "PROCESSING")) {
      throw new ConflictException(
        "A payment for this invoice is already being processed.",
      );
    }
    for (const p of open) {
      const live =
        p.status === "PENDING" &&
        p.checkout_url &&
        p.checkout_expires_at &&
        p.checkout_expires_at.getTime() > Date.now() + 60_000 &&
        p.amount_minor === amountMinor;
      if (live) {
        return { success: true, data: this.toCheckoutResponse(p, true) };
      }
    }
    await this.expireOpenCheckouts(invoiceId);

    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
    });
    const stripeCustomerId = await this.customers.ensureCustomer(
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

    const attempts = await this.prisma.platformPayment.count({
      where: { platform_invoice_id: invoiceId },
    });
    const payment = await this.prisma.platformPayment.create({
      data: {
        platform_invoice_id: invoiceId,
        tenant_id: tenantId,
        provider: "STRIPE",
        payment_method: "CREDIT_CARD",
        status: "PENDING",
        attempt_number: attempts + 1,
        amount,
        currency_code: currency,
        amount_minor: amountMinor,
        stripe_customer_id: stripeCustomerId,
        submitted_by_user_id:
          actor.type === "TENANT_ADMIN" ? (actor.id ?? null) : null,
        initiated_by_type: actor.type,
      },
    });

    const metadata: Record<string, string> = {
      [STRIPE_METADATA.SCOPE]: METADATA_SCOPE.PLATFORM_INVOICE,
      [STRIPE_METADATA.TENANT_ID]: tenantId,
      [STRIPE_METADATA.INVOICE_ID]: invoice.id,
      [STRIPE_METADATA.PAYMENT_ID]: payment.id,
      [STRIPE_METADATA.INVOICE_NUMBER]: invoice.invoice_number,
      [STRIPE_METADATA.PAYMENT_TYPE]: "PLATFORM_FEE",
    };
    const base =
      returnUrl ?? `${staffFrontendUrl()}/billing/invoices/${invoice.id}`;

    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.createCheckoutSession(
        client,
        {
          mode: "payment",
          customer: stripeCustomerId,
          client_reference_id: payment.id,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: currency.toLowerCase(),
                unit_amount: Number(amountMinor),
                product_data: {
                  name: `Platform invoice ${invoice.invoice_number}`,
                },
              },
            },
          ],
          metadata,
          payment_intent_data: {
            metadata,
            description: `Platform invoice ${invoice.invoice_number}`,
          },
          expires_at:
            Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
          success_url: withQuery(base, {
            payment: "success",
            session_id: "{CHECKOUT_SESSION_ID}",
          }),
          cancel_url: withQuery(base, { payment: "cancelled" }),
        },
        `erp-platform-checkout:${payment.id}`,
      );
    } catch (err) {
      await this.prisma.platformPayment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failure_message: "Could not create checkout session.",
        },
      });
      throw err;
    }

    const saved = await this.prisma.platformPayment.update({
      where: { id: payment.id },
      data: {
        stripe_checkout_session_id: session.id,
        checkout_url: session.url,
        checkout_expires_at: session.expires_at
          ? new Date(session.expires_at * 1000)
          : null,
      },
    });
    await this.audit.log(tenantId, {
      userId: actor.type === "TENANT_ADMIN" ? actor.id : null,
      action: "CHECKOUT_SESSION_CREATED",
      entity: "PlatformPayment",
      entityId: saved.id,
      metadata: {
        platform_invoice_id: invoiceId,
        amount: amount.toFixed(2),
        currency,
        by: actor.type,
      },
    });
    return { success: true, data: this.toCheckoutResponse(saved, false) };
  }

  /** Tenant uploads a manual payment (bank transfer, cheque…) with proof. */
  async submitManualPayment(
    tenantId: string,
    invoiceId: string,
    dto: RecordPlatformManualPaymentDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const invoice = await this.prisma.platformInvoice.findFirst({
      where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");
    this.assertPayable(invoice);
    const amount = roundMoney(dto.amount);
    if (gtMoney(amount, invoice.balance_due)) {
      throw new BadRequestException("Amount exceeds the outstanding balance.");
    }
    const saved = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      `platform-payment-proof-${file.originalname}`,
      file.mimetype,
    );
    const payment = await this.prisma.platformPayment.create({
      data: {
        platform_invoice_id: invoiceId,
        tenant_id: tenantId,
        provider: "MANUAL",
        payment_method: dto.payment_method ?? "BANK_TRANSFER",
        status: "PENDING_VERIFICATION",
        amount,
        currency_code: invoice.currency_code,
        reference_number: dto.reference_number,
        payment_date: dto.payment_date
          ? new Date(dto.payment_date)
          : new Date(),
        notes: dto.notes,
        proof_file_url: saved.fileUrl,
        proof_s3_key: saved.s3Key,
        proof_file_name: file.originalname.slice(0, 255),
        proof_mime_type: saved.mimeType,
        proof_file_size: saved.fileSize,
        submitted_by_user_id: userId,
        initiated_by_type: "TENANT_ADMIN",
      },
    });
    await this.audit.log(tenantId, {
      userId,
      action: "PAYMENT_PROOF_UPLOADED",
      entity: "PlatformPayment",
      entityId: payment.id,
      metadata: {
        platform_invoice_id: invoiceId,
        amount: amount.toFixed(2),
        method: payment.payment_method,
      },
    });
    return { success: true, data: this.toPaymentView(payment) };
  }

  async readProof(paymentId: string, tenantId?: string) {
    const p = await this.prisma.platformPayment.findFirst({
      where: { id: paymentId, ...(tenantId ? { tenant_id: tenantId } : {}) },
    });
    if (!p || !p.proof_file_url)
      throw new NotFoundException("Payment proof not found.");
    return this.storage.readByStoredFile(p.tenant_id, {
      file_name: p.proof_file_name ?? "payment-proof",
      file_url: p.proof_file_url,
      s3_key: p.proof_s3_key,
      mime_type: p.proof_mime_type ?? "application/octet-stream",
    });
  }

  async verifyManualPayment(paymentId: string, superAdminId: string) {
    const p = await this.prisma.platformPayment.findUnique({
      where: { id: paymentId },
    });
    if (!p) throw new NotFoundException("Payment not found.");
    if (p.status !== "PENDING_VERIFICATION") {
      throw new BadRequestException(
        "Only payments pending verification can be approved.",
      );
    }
    const applied = await this.applyPayment(paymentId, {
      reviewedBy: superAdminId,
      expectStatus: ["PENDING_VERIFICATION"],
    });
    await this.audit.log(p.tenant_id, {
      action: "PAYMENT_PROOF_APPROVED",
      entity: "PlatformPayment",
      entityId: paymentId,
      metadata: { super_admin_id: superAdminId },
    });
    return { success: true, data: this.toPaymentView(applied) };
  }

  async rejectManualPayment(
    paymentId: string,
    reason: string,
    superAdminId: string,
  ) {
    const res = await this.prisma.platformPayment.updateMany({
      where: { id: paymentId, status: "PENDING_VERIFICATION" },
      data: {
        status: "REJECTED",
        rejection_reason: reason,
        reviewed_by_super_admin_id: superAdminId,
        reviewed_at: new Date(),
      },
    });
    if (res.count === 0) {
      throw new BadRequestException(
        "Only payments pending verification can be rejected.",
      );
    }
    const p = await this.prisma.platformPayment.findUniqueOrThrow({
      where: { id: paymentId },
    });
    await this.audit.log(p.tenant_id, {
      action: "PAYMENT_PROOF_REJECTED",
      entity: "PlatformPayment",
      entityId: paymentId,
      metadata: { super_admin_id: superAdminId, reason },
    });
    if (p.submitted_by_user_id) {
      await this.notifications.notifyStaffUser(
        p.tenant_id,
        p.submitted_by_user_id,
        {
          type: "PAYMENT_PROOF_REVIEWED",
          title: "Payment proof rejected",
          message: `Your payment proof was rejected: ${reason}`,
          entity_type: "platform_invoice",
          entity_id: p.platform_invoice_id,
          link_path: `/billing/invoices/${p.platform_invoice_id}`,
        },
      );
    }
    return { success: true, data: this.toPaymentView(p) };
  }

  /** Super Admin records a payment received outside Stripe. */
  async recordManualPayment(
    invoiceId: string,
    dto: RecordPlatformManualPaymentDto,
    superAdminId: string,
  ) {
    const invoice = await this.requireInvoice(invoiceId);
    this.assertPayable(invoice);
    const amount = roundMoney(dto.amount);
    if (gtMoney(amount, invoice.balance_due)) {
      throw new BadRequestException("Amount exceeds the outstanding balance.");
    }
    const created = await this.prisma.platformPayment.create({
      data: {
        platform_invoice_id: invoiceId,
        tenant_id: invoice.tenant_id,
        provider: "MANUAL",
        payment_method: dto.payment_method ?? "BANK_TRANSFER",
        status: "PENDING_VERIFICATION",
        amount,
        currency_code: invoice.currency_code,
        reference_number: dto.reference_number,
        payment_date: dto.payment_date
          ? new Date(dto.payment_date)
          : new Date(),
        notes: dto.notes,
        initiated_by_type: "SUPER_ADMIN",
      },
    });
    const applied = await this.applyPayment(created.id, {
      reviewedBy: superAdminId,
      expectStatus: ["PENDING_VERIFICATION"],
    });
    await this.audit.log(invoice.tenant_id, {
      action: "MANUAL_PAYMENT_RECORDED",
      entity: "PlatformPayment",
      entityId: created.id,
      metadata: {
        super_admin_id: superAdminId,
        amount: amount.toFixed(2),
        method: created.payment_method,
      },
    });
    return { success: true, data: this.toPaymentView(applied) };
  }

  async refund(paymentId: string, dto: RefundPaymentDto, superAdminId: string) {
    const p = await this.prisma.platformPayment.findUnique({
      where: { id: paymentId },
    });
    if (!p) throw new NotFoundException("Payment not found.");
    if (!["PAID", "PARTIALLY_REFUNDED"].includes(p.status)) {
      throw new BadRequestException("Only completed payments can be refunded.");
    }
    const pending = await this.prisma.runWithTenant(p.tenant_id, (tx) =>
      tx.paymentRefund.aggregate({
        where: {
          tenant_id: p.tenant_id,
          platform_payment_id: p.id,
          status: "PENDING",
        },
        _sum: { amount: true },
      }),
    );
    const refundable = toDecimal(p.amount)
      .minus(toDecimal(p.amount_refunded))
      .minus(toDecimal(pending._sum.amount));
    const amount =
      dto.amount !== undefined
        ? roundMoney(dto.amount)
        : roundMoney(refundable);
    if (!isPositiveMoney(amount) || gtMoney(amount, refundable)) {
      throw new BadRequestException(
        `Refund must be between 0 and ${roundMoney(refundable).toFixed(2)} ${p.currency_code}.`,
      );
    }

    const refund = await this.prisma.runWithTenant(p.tenant_id, (tx) =>
      tx.paymentRefund.create({
        data: {
          tenant_id: p.tenant_id,
          scope: "PLATFORM_INVOICE",
          platform_payment_id: p.id,
          amount,
          currency_code: p.currency_code,
          reason: dto.reason,
          requested_by: superAdminId,
          requested_by_type: "SUPER_ADMIN",
          // Manual payments are refunded offline; record as completed.
          ...(p.provider === "MANUAL"
            ? { status: "SUCCEEDED" as const, processed_at: new Date() }
            : {}),
        },
      }),
    );
    await this.audit.log(p.tenant_id, {
      action: "REFUND_CREATED",
      entity: "PaymentRefund",
      entityId: refund.id,
      metadata: {
        super_admin_id: superAdminId,
        platform_payment_id: p.id,
        amount: amount.toFixed(2),
      },
    });

    if (p.provider === "MANUAL") {
      await this.applyRefund(p.tenant_id, refund.id);
      return {
        success: true,
        data: { id: refund.id, status: "SUCCEEDED", amount: amount.toFixed(2) },
      };
    }

    if (!p.stripe_payment_intent_id) {
      throw new BadRequestException(
        "Stripe payment has no payment intent to refund.",
      );
    }
    let stripeRefund: Stripe.Refund;
    try {
      stripeRefund = await this.stripe.createRefund(
        this.stripe.requirePlatformClient(),
        {
          payment_intent: p.stripe_payment_intent_id,
          amount: Number(toMinorUnits(amount, p.currency_code)),
          metadata: {
            [STRIPE_METADATA.SCOPE]: METADATA_SCOPE.PLATFORM_INVOICE,
            [STRIPE_METADATA.TENANT_ID]: p.tenant_id,
            [STRIPE_METADATA.PAYMENT_ID]: p.id,
            erp_refund_id: refund.id,
          },
        },
        `erp-platform-refund:${refund.id}`,
      );
    } catch (err) {
      await this.prisma.runWithTenant(p.tenant_id, (tx) =>
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
    const synced = await this.applyStripeRefund(stripeRefund);
    return {
      success: true,
      data: {
        id: refund.id,
        status: synced?.status ?? "PENDING",
        amount: amount.toFixed(2),
        provider_reference: stripeRefund.id,
      },
    };
  }

  // ─────────────────────────── webhook handlers ───────────────────────────

  async applyCheckoutSession(
    session: Stripe.Checkout.Session,
    eventType?: string,
  ) {
    const p = await this.findForGatewayObject({
      sessionId: session.id,
      paymentId: session.metadata?.[STRIPE_METADATA.PAYMENT_ID],
    });
    if (!p) return { handled: false, reason: "platform_payment_not_found" };
    const piId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    if (eventType === "checkout.session.async_payment_failed") {
      await this.transition(
        p.id,
        [...OPEN_ATTEMPT_STATUSES, ...IN_FLIGHT_ATTEMPT_STATUSES],
        {
          status: "FAILED",
          failure_message: "The payment could not be completed by the bank.",
        },
      );
    } else if (session.status === "expired") {
      await this.transition(p.id, OPEN_ATTEMPT_STATUSES, {
        status: "EXPIRED",
        failure_message: "Checkout session expired.",
      });
    } else if (
      session.status === "complete" &&
      session.payment_status === "paid"
    ) {
      await this.markSucceeded(p.id, {
        paymentIntentId: piId,
        amountMinor: session.amount_total,
        currency: session.currency,
        payerEmail: session.customer_details?.email ?? null,
      });
    } else if (session.status === "complete") {
      await this.transition(p.id, OPEN_ATTEMPT_STATUSES, {
        status: "PROCESSING",
        stripe_payment_intent_id: piId,
      });
    }
    return { handled: true };
  }

  async applyPaymentIntent(pi: Stripe.PaymentIntent) {
    const p = await this.findForGatewayObject({
      paymentIntentId: pi.id,
      paymentId: pi.metadata?.[STRIPE_METADATA.PAYMENT_ID],
    });
    if (!p) return { handled: false, reason: "platform_payment_not_found" };
    const chargeId =
      typeof pi.latest_charge === "string"
        ? pi.latest_charge
        : pi.latest_charge?.id;
    switch (pi.status) {
      case "succeeded":
        await this.markSucceeded(p.id, {
          paymentIntentId: pi.id,
          chargeId,
          amountMinor: pi.amount_received || pi.amount,
          currency: pi.currency,
        });
        break;
      case "processing":
        await this.transition(p.id, [...OPEN_ATTEMPT_STATUSES, "FAILED"], {
          status: "PROCESSING",
          stripe_payment_intent_id: pi.id,
        });
        break;
      case "requires_action":
        await this.transition(p.id, ["PENDING", "FAILED"], {
          status: "REQUIRES_ACTION",
          stripe_payment_intent_id: pi.id,
        });
        break;
      case "canceled":
        await this.transition(
          p.id,
          [...OPEN_ATTEMPT_STATUSES, "PROCESSING", "FAILED"],
          {
            status: "CANCELLED",
            stripe_payment_intent_id: pi.id,
          },
        );
        break;
      case "requires_payment_method":
        if (pi.last_payment_error) {
          await this.transition(
            p.id,
            [...OPEN_ATTEMPT_STATUSES, "PROCESSING"],
            {
              status: "FAILED",
              stripe_payment_intent_id: pi.id,
              failure_message: (
                pi.last_payment_error.message ?? "Payment failed."
              ).slice(0, 1000),
            },
          );
        }
        break;
    }
    return { handled: true };
  }

  async markSucceeded(paymentId: string, info: GatewaySuccessInfo) {
    const p = await this.prisma.platformPayment.findUnique({
      where: { id: paymentId },
    });
    if (!p) return null;
    if (
      info.amountMinor !== null &&
      (p.amount_minor === null ||
        BigInt(info.amountMinor) !== p.amount_minor ||
        (info.currency ?? "").toUpperCase() !== p.currency_code)
    ) {
      this.logger.error(
        `Amount mismatch on platform payment ${p.id}; manual review required.`,
      );
      await this.prisma.platformPayment.update({
        where: { id: p.id },
        data: {
          failure_message:
            "Gateway amount does not match the invoice attempt; manual review required.",
        },
      });
      return p;
    }
    const applied = await this.applyPayment(paymentId, {
      expectStatus: [
        ...OPEN_ATTEMPT_STATUSES,
        ...IN_FLIGHT_ATTEMPT_STATUSES,
        "FAILED",
        "EXPIRED",
        "CANCELLED",
      ],
      stripe: {
        paymentIntentId: info.paymentIntentId,
        chargeId: info.chargeId ?? null,
      },
    });
    return applied;
  }

  async applyStripeRefund(refund: Stripe.Refund) {
    const piId =
      typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : refund.payment_intent?.id;
    if (!piId) return null;
    const p = await this.prisma.platformPayment.findUnique({
      where: { stripe_payment_intent_id: piId },
    });
    if (!p) return null;
    const status =
      refund.status === "succeeded"
        ? "SUCCEEDED"
        : refund.status === "failed"
          ? "FAILED"
          : refund.status === "canceled"
            ? "CANCELLED"
            : "PENDING";
    const row = await this.prisma.runWithTenant(p.tenant_id, async (tx) => {
      const erpRefundId = refund.metadata?.erp_refund_id;
      const existing = await tx.paymentRefund.findFirst({
        where: {
          tenant_id: p.tenant_id,
          OR: [
            { stripe_refund_id: refund.id },
            ...(erpRefundId
              ? [{ id: erpRefundId, platform_payment_id: p.id }]
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
          tenant_id: p.tenant_id,
          scope: "PLATFORM_INVOICE",
          platform_payment_id: p.id,
          amount: fromMinorUnits(refund.amount, p.currency_code),
          currency_code: p.currency_code,
          reason: "Refund issued in Stripe dashboard",
          stripe_refund_id: refund.id,
          status,
          requested_by_type: "SUPER_ADMIN",
          processed_at: status === "PENDING" ? null : new Date(),
        },
      });
    });
    if (row.status === "SUCCEEDED") await this.applyRefund(p.tenant_id, row.id);
    return row;
  }

  // ─────────────────────────── ledger internals ───────────────────────────

  /**
   * Atomically marks a platform payment PAID and applies it to the invoice
   * balance (both rows locked). `applied_at` makes it idempotent.
   */
  private async applyPayment(
    paymentId: string,
    opts: {
      expectStatus: OnlinePaymentStatus[];
      reviewedBy?: string;
      stripe?: { paymentIntentId: string | null; chargeId: string | null };
    },
  ): Promise<PlatformPayment> {
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM platform_payments WHERE id = ${paymentId}::uuid FOR UPDATE`;
      const p = await tx.platformPayment.findUniqueOrThrow({
        where: { id: paymentId },
      });
      if (p.applied_at) return { payment: p, newly: false };
      if (!opts.expectStatus.includes(p.status)) {
        throw new BadRequestException(
          `Payment cannot be applied from status ${p.status}.`,
        );
      }
      await tx.$queryRaw`SELECT id FROM platform_invoices WHERE id = ${p.platform_invoice_id}::uuid FOR UPDATE`;
      const inv = await tx.platformInvoice.findUniqueOrThrow({
        where: { id: p.platform_invoice_id },
      });

      const paid = toDecimal(inv.amount_paid).plus(toDecimal(p.amount));
      const balance = toDecimal(inv.total_amount).minus(paid);
      await tx.platformInvoice.update({
        where: { id: inv.id },
        data: {
          amount_paid: paid,
          balance_due: balance.isNegative() ? 0 : balance,
          status: this.deriveInvoiceStatus(inv, paid),
        },
      });
      const payment = await tx.platformPayment.update({
        where: { id: p.id },
        data: {
          status: "PAID",
          paid_at: new Date(),
          applied_at: new Date(),
          failure_message: null,
          ...(opts.reviewedBy
            ? {
                reviewed_by_super_admin_id: opts.reviewedBy,
                reviewed_at: new Date(),
              }
            : {}),
          ...(opts.stripe
            ? {
                stripe_payment_intent_id:
                  p.stripe_payment_intent_id ?? opts.stripe.paymentIntentId,
                stripe_charge_id: p.stripe_charge_id ?? opts.stripe.chargeId,
              }
            : {}),
        },
      });
      return { payment, newly: true, invoice: inv };
    });

    if (result.newly) {
      const p = result.payment;
      await this.audit.log(p.tenant_id, {
        action: "PAYMENT_SUCCEEDED",
        entity: "PlatformPayment",
        entityId: p.id,
        metadata: {
          platform_invoice_id: p.platform_invoice_id,
          amount: roundMoney(p.amount).toFixed(2),
          currency: p.currency_code,
          provider: p.provider,
        },
      });
      await this.notifications.notifyStaffByRoles(
        p.tenant_id,
        ["TENANT_ADMIN"],
        {
          type: "PLATFORM_PAYMENT_RECEIVED",
          title: "Platform payment received",
          message: `Payment of ${roundMoney(p.amount).toFixed(2)} ${p.currency_code} applied to ${"invoice" in result && result.invoice ? result.invoice.invoice_number : "your platform invoice"}.`,
          entity_type: "platform_invoice",
          entity_id: p.platform_invoice_id,
          link_path: `/billing/invoices/${p.platform_invoice_id}`,
        },
      );
      const inv = await this.prisma.platformInvoice.findUnique({
        where: { id: p.platform_invoice_id },
      });
      if (inv && inv.status === "PAID") {
        await this.links.revokeAllFor({
          tenantId: p.tenant_id,
          platformInvoiceId: inv.id,
        });
      }
    }
    return result.payment;
  }

  private async applyRefund(tenantId: string, refundId: string) {
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
      await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM platform_payments WHERE id = ${refund.platform_payment_id}::uuid FOR UPDATE`;
        const p = await tx.platformPayment.findUniqueOrThrow({
          where: { id: refund.platform_payment_id! },
        });
        await tx.$queryRaw`SELECT id FROM platform_invoices WHERE id = ${p.platform_invoice_id}::uuid FOR UPDATE`;
        const inv = await tx.platformInvoice.findUniqueOrThrow({
          where: { id: p.platform_invoice_id },
        });

        const refundedOnPayment = toDecimal(p.amount_refunded).plus(
          toDecimal(refund.amount),
        );
        await tx.platformPayment.update({
          where: { id: p.id },
          data: {
            amount_refunded: refundedOnPayment,
            status: gtMoney(p.amount, refundedOnPayment)
              ? "PARTIALLY_REFUNDED"
              : "REFUNDED",
          },
        });
        const paid = toDecimal(inv.amount_paid).minus(toDecimal(refund.amount));
        const netPaid = paid.isNegative() ? toDecimal(0) : paid;
        const refundedOnInvoice = toDecimal(inv.amount_refunded).plus(
          toDecimal(refund.amount),
        );
        await tx.platformInvoice.update({
          where: { id: inv.id },
          data: {
            amount_paid: netPaid,
            amount_refunded: refundedOnInvoice,
            balance_due: toDecimal(inv.total_amount).minus(netPaid),
            status: isPositiveMoney(netPaid)
              ? this.deriveInvoiceStatus(inv, netPaid)
              : "REFUNDED",
          },
        });
      });
      await this.audit.log(tenantId, {
        action: "REFUND_COMPLETED",
        entity: "PaymentRefund",
        entityId: refundId,
        metadata: {
          platform_payment_id: refund.platform_payment_id,
          amount: roundMoney(refund.amount).toFixed(2),
        },
      });
      await this.notifications.notifyStaffByRoles(tenantId, ["TENANT_ADMIN"], {
        type: "PAYMENT_REFUNDED",
        title: "Platform payment refunded",
        message: `A refund of ${roundMoney(refund.amount).toFixed(2)} ${refund.currency_code} was issued.`,
        entity_type: "platform_payment",
        entity_id: refund.platform_payment_id ?? undefined,
      });
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

  private deriveInvoiceStatus(
    inv: PlatformInvoice,
    paid: Prisma.Decimal,
  ): PlatformInvoiceStatus {
    if (!gtMoney(inv.total_amount, paid)) return "PAID";
    if (isPositiveMoney(paid)) return "PARTIALLY_PAID";
    return "SENT";
  }

  private async transition(
    id: string,
    from: OnlinePaymentStatus[],
    data: Prisma.PlatformPaymentUpdateManyMutationInput,
  ) {
    await this.prisma.platformPayment.updateMany({
      where: { id, status: { in: from }, applied_at: null },
      data,
    });
  }

  private async findForGatewayObject(keys: {
    sessionId?: string;
    paymentIntentId?: string;
    paymentId?: string;
  }) {
    const or: Prisma.PlatformPaymentWhereInput[] = [];
    if (keys.sessionId) or.push({ stripe_checkout_session_id: keys.sessionId });
    if (keys.paymentIntentId)
      or.push({ stripe_payment_intent_id: keys.paymentIntentId });
    if (keys.paymentId && /^[0-9a-f-]{36}$/i.test(keys.paymentId))
      or.push({ id: keys.paymentId });
    if (!or.length) return null;
    return this.prisma.platformPayment.findFirst({
      where: { provider: "STRIPE", OR: or },
    });
  }

  private async expireOpenCheckouts(invoiceId: string) {
    const open = await this.prisma.platformPayment.findMany({
      where: {
        platform_invoice_id: invoiceId,
        status: { in: OPEN_ATTEMPT_STATUSES },
      },
    });
    const client = this.stripe.platformClient();
    for (const p of open) {
      if (client && p.stripe_checkout_session_id) {
        await this.stripe.expireCheckoutSession(
          client,
          p.stripe_checkout_session_id,
        );
      }
      await this.transition(p.id, OPEN_ATTEMPT_STATUSES, {
        status: "CANCELLED",
        failure_message: "Superseded.",
      });
    }
  }

  private async requireInvoice(id: string) {
    const inv = await this.prisma.platformInvoice.findFirst({
      where: { id, deleted_at: null },
    });
    if (!inv) throw new NotFoundException("Invoice not found.");
    return inv;
  }

  private assertPayable(inv: PlatformInvoice) {
    if (
      !PAYABLE_PLATFORM_STATUSES.includes(inv.status) ||
      !isPositiveMoney(inv.balance_due)
    ) {
      throw new BadRequestException(
        `Invoice is not open for payment (${inv.status}).`,
      );
    }
  }

  private async tenantBillingEmails(
    tenantId: string,
    tenantEmail: string | null,
  ) {
    const emails = new Set<string>();
    if (tenantEmail) emails.add(tenantEmail.toLowerCase());
    const admins = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.user.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: "ACTIVE",
          role: "TENANT_ADMIN",
        },
        select: { email: true },
        take: 5,
      }),
    );
    admins.forEach((a) => a.email && emails.add(a.email.toLowerCase()));
    return [...emails];
  }

  /** Server-side totals — never trusts client-computed amounts. */
  computeTotals(
    lines: Array<
      Pick<PlatformInvoiceLineDto, "description" | "quantity" | "unit_price">
    >,
    discount?: number,
    taxRate?: number,
  ) {
    const built = lines.map((l, idx) => {
      const qty = toDecimal(l.quantity ?? 1);
      const price = toDecimal(l.unit_price);
      return {
        description: l.description,
        quantity: qty,
        unit_price: price,
        amount: roundMoney(qty.mul(price)),
        sort_order: idx,
      };
    });
    const subtotal = built.reduce((s, l) => s.plus(l.amount), toDecimal(0));
    const discountAmount = roundMoney(discount ?? 0);
    if (gtMoney(discountAmount, subtotal)) {
      throw new BadRequestException("Discount cannot exceed the subtotal.");
    }
    const rate = toDecimal(taxRate ?? 0);
    const taxable = subtotal.minus(discountAmount);
    const tax = roundMoney(taxable.mul(rate).div(100));
    const total = roundMoney(taxable.plus(tax));
    return {
      lines: built,
      header: {
        subtotal,
        discount_amount: discountAmount,
        tax_rate: rate,
        tax_amount: tax,
        total_amount: total,
      },
    };
  }

  private async renderPdf(
    invoice: PlatformInvoice & {
      lines: Array<{
        description: string;
        quantity: Prisma.Decimal;
        unit_price: Prisma.Decimal;
        amount: Prisma.Decimal;
      }>;
    },
    tenant: {
      name: string;
      display_name: string | null;
      address: string | null;
      email: string | null;
      vat_number: string | null;
    },
  ) {
    const money = (v: Prisma.Decimal) =>
      `${roundMoney(v).toFixed(2)} ${esc(invoice.currency_code)}`;
    const rows = invoice.lines
      .map(
        (l) =>
          `<tr><td>${esc(l.description)}</td><td class="r">${esc(toDecimal(l.quantity).toString())}</td><td class="r">${money(l.unit_price)}</td><td class="r">${money(l.amount)}</td></tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#111;margin:32px}
      h1{font-size:20px;margin:0 0 4px} table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{padding:6px;border-bottom:1px solid #e5e7eb;text-align:left} .r{text-align:right}
      .totals td{border:none} .muted{color:#6b7280}
      </style></head><body>
      <h1>${esc(process.env.APP_NAME ?? "Platform")} — Invoice ${esc(invoice.invoice_number)}</h1>
      <div class="muted">Status: ${esc(invoice.status)} · Issued ${esc(invoice.issue_date.toISOString().slice(0, 10))}${invoice.due_date ? ` · Due ${esc(invoice.due_date.toISOString().slice(0, 10))}` : ""}</div>
      <p><strong>Bill to:</strong> ${esc(tenant.display_name ?? tenant.name)}<br/>${esc(tenant.address)}<br/>${esc(tenant.email)}${tenant.vat_number ? `<br/>VAT: ${esc(tenant.vat_number)}` : ""}</p>
      ${invoice.period_start && invoice.period_end ? `<p>Billing period: ${esc(invoice.period_start.toISOString().slice(0, 10))} – ${esc(invoice.period_end.toISOString().slice(0, 10))}</p>` : ""}
      <table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <table class="totals">
        <tr><td class="r">Subtotal</td><td class="r" style="width:140px">${money(invoice.subtotal)}</td></tr>
        <tr><td class="r">Discount</td><td class="r">-${money(invoice.discount_amount)}</td></tr>
        <tr><td class="r">Tax (${esc(toDecimal(invoice.tax_rate).toString())}%)</td><td class="r">${money(invoice.tax_amount)}</td></tr>
        <tr><td class="r"><strong>Total</strong></td><td class="r"><strong>${money(invoice.total_amount)}</strong></td></tr>
        <tr><td class="r">Paid</td><td class="r">${money(invoice.amount_paid)}</td></tr>
        <tr><td class="r"><strong>Balance due</strong></td><td class="r"><strong>${money(invoice.balance_due)}</strong></td></tr>
      </table>
      ${invoice.notes ? `<p class="muted">${esc(invoice.notes)}</p>` : ""}
      </body></html>`;
    try {
      return await this.pdf.renderHtmlToPdf(html);
    } catch (err) {
      this.logger.error(`PDF render failed: ${String(err)}`);
      throw new ServiceUnavailableException("Could not render invoice PDF.");
    }
  }

  private toCheckoutResponse(p: PlatformPayment, reused: boolean) {
    return {
      payment_id: p.id,
      checkout_url: p.checkout_url,
      checkout_session_id: p.stripe_checkout_session_id,
      expires_at: p.checkout_expires_at,
      amount: roundMoney(p.amount).toFixed(2),
      currency_code: p.currency_code,
      attempt_number: p.attempt_number,
      reused,
    };
  }

  toInvoiceView(
    inv: PlatformInvoice & {
      lines?: Array<{
        id: string;
        description: string;
        quantity: Prisma.Decimal;
        unit_price: Prisma.Decimal;
        amount: Prisma.Decimal;
        sort_order: number;
      }>;
    },
  ) {
    return {
      id: inv.id,
      invoice_number: inv.invoice_number,
      tenant_id: inv.tenant_id,
      status: inv.status,
      currency_code: inv.currency_code,
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      period_start: inv.period_start,
      period_end: inv.period_end,
      subtotal: roundMoney(inv.subtotal).toFixed(2),
      discount_amount: roundMoney(inv.discount_amount).toFixed(2),
      tax_rate: toDecimal(inv.tax_rate).toString(),
      tax_amount: roundMoney(inv.tax_amount).toFixed(2),
      total_amount: roundMoney(inv.total_amount).toFixed(2),
      amount_paid: roundMoney(inv.amount_paid).toFixed(2),
      amount_refunded: roundMoney(inv.amount_refunded).toFixed(2),
      balance_due: roundMoney(inv.balance_due).toFixed(2),
      is_overdue:
        PAYABLE_PLATFORM_STATUSES.includes(inv.status) &&
        !!inv.due_date &&
        inv.due_date.getTime() < Date.now(),
      notes: inv.notes,
      sent_at: inv.sent_at,
      last_emailed_at: inv.last_emailed_at,
      cancelled_at: inv.cancelled_at,
      cancel_reason: inv.cancel_reason,
      created_at: inv.created_at,
      updated_at: inv.updated_at,
      ...(inv.lines
        ? {
            lines: inv.lines.map((l) => ({
              id: l.id,
              description: l.description,
              quantity: toDecimal(l.quantity).toString(),
              unit_price: roundMoney(l.unit_price).toFixed(2),
              amount: roundMoney(l.amount).toFixed(2),
              sort_order: l.sort_order,
            })),
          }
        : {}),
    };
  }

  toPaymentView(p: PlatformPayment) {
    return {
      id: p.id,
      platform_invoice_id: p.platform_invoice_id,
      tenant_id: p.tenant_id,
      provider: p.provider,
      payment_method: p.payment_method,
      status: p.status,
      attempt_number: p.attempt_number,
      amount: roundMoney(p.amount).toFixed(2),
      amount_refunded: roundMoney(p.amount_refunded).toFixed(2),
      currency_code: p.currency_code,
      checkout_url: OPEN_ATTEMPT_STATUSES.includes(p.status)
        ? p.checkout_url
        : null,
      checkout_expires_at: p.checkout_expires_at,
      transaction_reference: p.stripe_payment_intent_id ?? p.reference_number,
      payment_date: p.payment_date ?? p.paid_at,
      paid_at: p.paid_at,
      notes: p.notes,
      failure_message: p.failure_message,
      has_proof: Boolean(p.proof_file_url),
      proof_file_name: p.proof_file_name,
      proof_mime_type: p.proof_mime_type,
      reviewed_at: p.reviewed_at,
      rejection_reason: p.rejection_reason,
      initiated_by_type: p.initiated_by_type as PaymentInitiatorType,
      created_at: p.created_at,
    };
  }
}
