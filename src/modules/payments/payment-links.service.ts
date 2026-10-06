import {
  BadRequestException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { OnlinePaymentScope, PaymentLink } from "@prisma/client";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import {
  ONLINE_PAYABLE_INVOICE_STATUSES,
  ONLINE_PAYABLE_INVOICE_TYPES,
  PAYMENT_LINK_DEFAULT_TTL_DAYS,
  PAYMENT_LINK_MAX_TTL_DAYS,
} from "./constants/online-payment.constants";
import { PaymentAuditService } from "./payment-audit.service";
import { PaymentGatewaySettingsService } from "./payment-gateway-settings.service";
import { PaymentNotificationsService } from "./payment-notifications.service";
import { paymentLinkUrl, portalFrontendUrl } from "./utils/frontend-url.util";
import { isPositiveMoney, roundMoney } from "./utils/money.util";

export const hashPaymentLinkToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/**
 * Secure "Pay Now" links. The raw token (192 bits) is only ever returned
 * once / emailed; the DB keeps its SHA-256. A link carries no amount —
 * every checkout re-reads the ERP balance — and it expires / can be revoked.
 */
@Injectable()
export class PaymentLinksService {
  private readonly logger = new Logger(PaymentLinksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: PaymentGatewaySettingsService,
    private readonly audit: PaymentAuditService,
    private readonly mailer: PaymentNotificationsService,
    private readonly storage: StorageService,
  ) {}

  /** Creates a link and emails it (with the stored invoice PDF, if any). */
  async createAndEmailForInvoice(
    tenantId: string,
    invoiceId: string,
    opts: {
      to: string;
      message?: string;
      expiresInDays?: number;
      actorId?: string;
    },
  ) {
    const created = await this.createForInvoice(tenantId, invoiceId, opts);
    const { invoice, companyName } = await this.prisma.runWithTenant(
      tenantId,
      async (tx) => {
        const inv = await tx.invoice.findFirstOrThrow({
          where: { id: invoiceId, tenant_id: tenantId },
          include: { company: { select: { name: true } } },
        });
        const tenant = await tx.tenant.findUnique({
          where: { id: tenantId },
          select: { name: true, display_name: true },
        });
        return {
          invoice: inv,
          companyName:
            inv.company?.name ?? tenant?.display_name ?? tenant?.name ?? "",
        };
      },
    );

    let pdf: Buffer | undefined;
    if (invoice.pdf_url || invoice.pdf_s3_key) {
      try {
        pdf = (
          await this.storage.readByStoredFile(tenantId, {
            file_name: `${invoice.invoice_number}.pdf`,
            file_url: invoice.pdf_url ?? "",
            s3_key: invoice.pdf_s3_key,
            mime_type: "application/pdf",
          })
        ).buffer;
      } catch (err) {
        this.logger.warn(
          `Invoice PDF unavailable for payment link email: ${String(err)}`,
        );
      }
    }

    const log = await this.mailer.sendInvoiceWithPayLink(tenantId, {
      to: opts.to,
      companyName,
      invoiceNumber: invoice.invoice_number,
      amount: roundMoney(invoice.balance_due).toFixed(2),
      currency: invoice.currency_code,
      dueDate: invoice.due_date,
      payUrl: created.url,
      viewUrl: `${portalFrontendUrl()}/portal/invoices/${invoice.id}`,
      message: opts.message,
      pdf,
      createdBy: opts.actorId,
    });
    return {
      ...created,
      email: { to: opts.to, status: log.status, email_log_id: log.id },
    };
  }

  async createForInvoice(
    tenantId: string,
    invoiceId: string,
    opts: { expiresInDays?: number; actorId?: string },
  ) {
    const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({
        where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!invoice) throw new NotFoundException("Invoice not found.");
    if (
      !ONLINE_PAYABLE_INVOICE_TYPES.includes(invoice.invoice_type) ||
      !ONLINE_PAYABLE_INVOICE_STATUSES.includes(invoice.status) ||
      !isPositiveMoney(invoice.balance_due)
    ) {
      throw new BadRequestException("Invoice is not open for online payment.");
    }
    await this.settings.resolveTenantAccount(tenantId);

    const created = await this.create(tenantId, "TENANT_INVOICE", {
      invoiceId,
      expiresInDays: opts.expiresInDays,
      actorId: opts.actorId,
    });
    await this.audit.log(tenantId, {
      userId: opts.actorId,
      action: "PAYMENT_LINK_CREATED",
      entity: "Invoice",
      entityId: invoiceId,
      metadata: {
        payment_link_id: created.link.id,
        expires_at: created.link.expires_at,
      },
    });
    return created;
  }

  async createForPlatformInvoice(
    tenantId: string,
    platformInvoiceId: string,
    opts: { expiresInDays?: number },
  ) {
    return this.create(tenantId, "PLATFORM_INVOICE", {
      platformInvoiceId,
      expiresInDays: opts.expiresInDays,
    });
  }

  private async create(
    tenantId: string,
    scope: OnlinePaymentScope,
    opts: {
      invoiceId?: string;
      platformInvoiceId?: string;
      expiresInDays?: number;
      actorId?: string;
    },
  ) {
    const days = Math.min(
      Math.max(opts.expiresInDays ?? PAYMENT_LINK_DEFAULT_TTL_DAYS, 1),
      PAYMENT_LINK_MAX_TTL_DAYS,
    );
    const token = randomBytes(24).toString("base64url");
    const link = await this.prisma.paymentLink.create({
      data: {
        tenant_id: tenantId,
        scope,
        invoice_id: opts.invoiceId ?? null,
        platform_invoice_id: opts.platformInvoiceId ?? null,
        token_hash: hashPaymentLinkToken(token),
        expires_at: new Date(Date.now() + days * 86_400_000),
        created_by: opts.actorId ?? null,
      },
    });
    return {
      link,
      token,
      url: paymentLinkUrl(token),
      expires_at: link.expires_at,
    };
  }

  /** Resolves a live link or throws (404 unknown, 410 expired/revoked). */
  async resolve(token: string): Promise<PaymentLink> {
    if (!token || token.length < 20 || token.length > 100) {
      throw new NotFoundException("Payment link not found.");
    }
    const link = await this.prisma.paymentLink.findUnique({
      where: { token_hash: hashPaymentLinkToken(token) },
    });
    if (!link) throw new NotFoundException("Payment link not found.");
    if (link.revoked_at || link.expires_at.getTime() < Date.now()) {
      throw new GoneException("This payment link has expired.");
    }
    return link;
  }

  async touch(linkId: string) {
    await this.prisma.paymentLink.update({
      where: { id: linkId },
      data: { last_used_at: new Date(), use_count: { increment: 1 } },
    });
  }

  async listForInvoice(tenantId: string, invoiceId: string) {
    const rows = await this.prisma.paymentLink.findMany({
      where: { tenant_id: tenantId, invoice_id: invoiceId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        expires_at: true,
        revoked_at: true,
        last_used_at: true,
        use_count: true,
        created_at: true,
      },
    });
    return { success: true, data: rows };
  }

  async revoke(tenantId: string, linkId: string, actorId?: string) {
    const res = await this.prisma.paymentLink.updateMany({
      where: { id: linkId, tenant_id: tenantId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
    if (res.count === 0) throw new NotFoundException("Payment link not found.");
    await this.audit.log(tenantId, {
      userId: actorId,
      action: "PAYMENT_LINK_REVOKED",
      entity: "PaymentLink",
      entityId: linkId,
    });
    return { success: true };
  }

  /** Revokes all live links for an invoice (paid / cancelled). */
  async revokeAllFor(where: {
    tenantId: string;
    invoiceId?: string;
    platformInvoiceId?: string;
  }) {
    await this.prisma.paymentLink.updateMany({
      where: {
        tenant_id: where.tenantId,
        revoked_at: null,
        ...(where.invoiceId ? { invoice_id: where.invoiceId } : {}),
        ...(where.platformInvoiceId
          ? { platform_invoice_id: where.platformInvoiceId }
          : {}),
      },
      data: { revoked_at: new Date() },
    });
  }

  /** Minimal, non-sensitive invoice summary for the public pay page. */
  async publicSummary(link: PaymentLink) {
    if (link.scope === "PLATFORM_INVOICE") {
      const inv = await this.prisma.platformInvoice.findFirst({
        where: {
          id: link.platform_invoice_id!,
          tenant_id: link.tenant_id,
          deleted_at: null,
        },
      });
      if (!inv) throw new NotFoundException("Invoice not found.");
      return {
        kind: "platform_invoice",
        issuer: process.env.APP_NAME ?? "Platform",
        invoice_number: inv.invoice_number,
        currency_code: inv.currency_code,
        total_amount: roundMoney(inv.total_amount).toFixed(2),
        balance_due: roundMoney(inv.balance_due).toFixed(2),
        due_date: inv.due_date,
        status: inv.status,
        payable:
          ["SENT", "PARTIALLY_PAID"].includes(inv.status) &&
          isPositiveMoney(inv.balance_due),
        expires_at: link.expires_at,
      };
    }

    const data = await this.prisma.runWithTenant(link.tenant_id, async (tx) => {
      const inv = await tx.invoice.findFirst({
        where: {
          id: link.invoice_id!,
          tenant_id: link.tenant_id,
          deleted_at: null,
        },
        include: { company: { select: { name: true } } },
      });
      const tenant = await tx.tenant.findUnique({
        where: { id: link.tenant_id },
        select: { name: true, display_name: true, logo_url: true },
      });
      return { inv, tenant };
    });
    if (!data.inv) throw new NotFoundException("Invoice not found.");
    const inv = data.inv;
    return {
      kind: "invoice",
      issuer:
        inv.company?.name ??
        data.tenant?.display_name ??
        data.tenant?.name ??
        "",
      issuer_logo_url: data.tenant?.logo_url ?? null,
      invoice_number: inv.invoice_number,
      currency_code: inv.currency_code,
      total_amount: roundMoney(inv.total_amount).toFixed(2),
      balance_due: roundMoney(inv.balance_due).toFixed(2),
      due_date: inv.due_date,
      status: inv.status,
      payable:
        ONLINE_PAYABLE_INVOICE_STATUSES.includes(inv.status) &&
        isPositiveMoney(inv.balance_due),
      expires_at: link.expires_at,
    };
  }
}
