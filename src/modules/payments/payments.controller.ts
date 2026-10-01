import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { INVOICES_PERMISSIONS } from "../invoices/constants/invoices-permission.constants";
import { PaymentsService as GlPaymentsService } from "../gl/payments.service";
import { PAYMENTS_PERMISSIONS } from "./constants/payments-permission.constants";
import {
  CreatePaymentLinkDto,
  OnlinePaymentQueryDto,
  RefundPaymentDto,
  StartCheckoutDto,
} from "./dto/online-payment.dto";
import { UpdatePaymentGatewaySettingsDto } from "./dto/payment-gateway.dto";
import { InvoiceOnlinePaymentsService } from "./invoice-online-payments.service";
import { PaymentGatewaySettingsService } from "./payment-gateway-settings.service";
import { PaymentLinksService } from "./payment-links.service";
import { TenantConnectService } from "./tenant-connect.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import { PaymentReconciliationService } from "./payment-reconciliation.service";
import { staffFrontendUrl } from "./utils/frontend-url.util";

/**
 * Online (Stripe) payments for tenant staff. Classic manual receipts and
 * vendor payments remain at /gl/payments (unchanged); a successful online
 * payment appears there as a posted RECEIPT with reference STRIPE:<pi>.
 *
 * Payment states: PENDING → (REQUIRES_ACTION | PROCESSING) → PAID
 * → PARTIALLY_REFUNDED | REFUNDED; or FAILED | CANCELLED | EXPIRED (retryable).
 */
@ApiTags("Online Payments (Stripe)")
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller("payments")
export class OnlinePaymentsController {
  constructor(
    private readonly online: InvoiceOnlinePaymentsService,
    private readonly settings: PaymentGatewaySettingsService,
    private readonly stripe: StripeGatewayService,
    private readonly glPayments: GlPaymentsService,
    private readonly reconciliation: PaymentReconciliationService,
    private readonly tenantConnect: TenantConnectService,
  ) {}

  // ─── Stripe configuration ───

  @Get("stripe/status")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Whether online payments are available for this company",
  })
  async stripeStatus(@CurrentUser("tenantId") tenantId: string) {
    const settings = await this.settings.getSettings(tenantId);
    return {
      success: true,
      data: {
        provider: "stripe",
        platform_configured: Boolean(this.stripe.platformClient()),
        online_payments_enabled:
          await this.settings.isOnlinePaymentEnabled(tenantId),
        use_platform_account:
          "use_platform_account" in settings.data
            ? settings.data.use_platform_account
            : false,
      },
    };
  }

  @Get("stripe/config")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Public Stripe config for the frontend (publishable key only — never secrets)",
  })
  async stripeConfig(@CurrentUser("tenantId") tenantId: string) {
    const gw = await this.settings.find(tenantId);
    return {
      success: true,
      data: {
        enabled: await this.settings.isOnlinePaymentEnabled(tenantId),
        publishable_key: this.settings.publishableKeyFor(gw),
        allow_partial_payments: gw?.allow_partial_payments ?? false,
      },
    };
  }

  @Get("stripe/settings")
  @RequirePermissions(PAYMENTS_PERMISSIONS.MANAGE_GATEWAY)
  @ApiOperation({ summary: "Stripe account settings (secrets are write-only)" })
  getSettings(@CurrentUser("tenantId") tenantId: string) {
    return this.settings.getSettings(tenantId);
  }

  @Put("stripe/settings")
  @RequirePermissions(PAYMENTS_PERMISSIONS.MANAGE_GATEWAY)
  @ApiOperation({
    summary: "Configure the company's Stripe account",
    description:
      "Secret key and webhook secret are stored encrypted (AES-256-GCM) and never returned. " +
      "Point a Stripe webhook at the returned webhook_url.",
  })
  updateSettings(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: UpdatePaymentGatewaySettingsDto,
  ) {
    return this.settings.updateSettings(tenantId, dto, actorId);
  }

  @Post("stripe/settings/rotate-webhook")
  @RequirePermissions(PAYMENTS_PERMISSIONS.MANAGE_GATEWAY)
  @ApiOperation({ summary: "Rotate the company webhook URL token" })
  rotateWebhook(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
  ) {
    return this.settings.rotateWebhookToken(tenantId, actorId);
  }

  @Get("stripe/connect")
  @RequirePermissions(PAYMENTS_PERMISSIONS.MANAGE_GATEWAY)
  @ApiOperation({
    summary: "Stripe Connect status for collecting customer payments",
  })
  connectStatus(@CurrentUser("tenantId") tenantId: string) {
    return this.tenantConnect.status(tenantId);
  }

  @Post("stripe/connect/onboarding-link")
  @RequirePermissions(PAYMENTS_PERMISSIONS.MANAGE_GATEWAY)
  @ApiOperation({
    summary: "Connect the company's Stripe account (Stripe-hosted onboarding)",
    description:
      "No API keys needed. When Stripe finishes verifying the company, online payments turn on " +
      "automatically and customer payments settle into the company's Stripe account.",
  })
  connectOnboarding(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
  ) {
    return this.tenantConnect.onboardingLink(tenantId, actorId);
  }

  @Post("stripe/connect/dashboard-link")
  @RequirePermissions(PAYMENTS_PERMISSIONS.MANAGE_GATEWAY)
  @ApiOperation({ summary: "Open the company's Stripe Express dashboard" })
  connectDashboard(@CurrentUser("tenantId") tenantId: string) {
    return this.tenantConnect.dashboardLink(tenantId);
  }

  @Post("stripe/reconcile")
  @RequirePermissions(PAYMENTS_PERMISSIONS.MANAGE_GATEWAY)
  @ApiOperation({
    summary: "Re-check this company's pending online payments with Stripe now",
    description:
      "Runs the same idempotent reconciliation as the 15-minute job, for this company only.",
  })
  async reconcile(@CurrentUser("tenantId") tenantId: string) {
    return {
      success: true,
      data: await this.reconciliation.runForTenant(tenantId),
    };
  }

  // ─── Payment history (ERP ledger = source of truth) ───

  @Get("history")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Posted ERP payments & receipts (all methods, incl. Stripe)",
  })
  history(@CurrentUser("tenantId") tenantId: string) {
    return this.glPayments.findAll(tenantId, { status: "POSTED" });
  }

  @Get("history/customer/:customerId")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Posted receipts for a customer" })
  customerHistory(
    @CurrentUser("tenantId") tenantId: string,
    @Param("customerId", ParseUUIDPipe) partyId: string,
  ) {
    return this.glPayments.findAll(tenantId, {
      party_id: partyId,
      direction: "RECEIPT",
      status: "POSTED",
    });
  }

  @Get("history/vendor/:vendorId")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Posted payments to a vendor" })
  vendorHistory(
    @CurrentUser("tenantId") tenantId: string,
    @Param("vendorId", ParseUUIDPipe) partyId: string,
  ) {
    return this.glPayments.findAll(tenantId, {
      party_id: partyId,
      direction: "PAYMENT",
      status: "POSTED",
    });
  }

  @Get("history/invoice/:invoiceId")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Payments, online attempts and proofs for an invoice",
  })
  invoiceHistory(
    @CurrentUser("tenantId") tenantId: string,
    @Param("invoiceId", ParseUUIDPipe) invoiceId: string,
  ) {
    return this.online.invoicePaymentStatus(tenantId, invoiceId);
  }

  // ─── Refund lookup ───

  @Get("refunds/:refundId")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Refund detail" })
  refund(
    @CurrentUser("tenantId") tenantId: string,
    @Param("refundId", ParseUUIDPipe) refundId: string,
  ) {
    return this.online.getRefund(tenantId, refundId);
  }

  // ─── Online payment attempts ───

  @Get()
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List online payment attempts" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: OnlinePaymentQueryDto,
  ) {
    return this.online.list(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Online payment detail (with ERP receipt + refunds)",
  })
  getOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.online.getOne(tenantId, id);
  }

  @Get(":id/checkout-status")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiQuery({ name: "sync", required: false, type: Boolean })
  @ApiOperation({
    summary: "Checkout status",
    description:
      "With sync=true the server re-reads the session from Stripe and applies it (webhook safety net).",
  })
  checkoutStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Query("sync", new ParseBoolPipe({ optional: true })) sync?: boolean,
  ) {
    return this.online.checkoutStatus(tenantId, id, Boolean(sync));
  }

  @Post(":id/retry")
  @RequirePermissions(PAYMENTS_PERMISSIONS.COLLECT)
  @ApiOperation({
    summary: "New checkout attempt after a failed / cancelled / expired one",
  })
  retry(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StartCheckoutDto,
  ) {
    return this.retryWithReturn(tenantId, actorId, id, dto);
  }

  @Post(":id/checkout")
  @RequirePermissions(PAYMENTS_PERMISSIONS.COLLECT)
  @ApiOperation({
    summary:
      "Alias of retry — (re)open Stripe Checkout for this payment's invoice",
  })
  checkout(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StartCheckoutDto,
  ) {
    return this.retryWithReturn(tenantId, actorId, id, dto);
  }

  @Post(":id/cancel")
  @RequirePermissions(PAYMENTS_PERMISSIONS.COLLECT)
  @ApiOperation({
    summary: "Cancel a pending checkout (expires the Stripe session)",
  })
  cancel(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.online.cancel(tenantId, id, { type: "STAFF", id: actorId });
  }

  @Post(":id/refund")
  @RequirePermissions(PAYMENTS_PERMISSIONS.REFUND)
  @ApiOperation({
    summary: "Refund a Stripe payment (full or partial)",
    description:
      "Validated server-side against the refundable amount. On success the ERP receipt is " +
      "reversed through the existing GL flow and any net amount re-posted; the invoice balance reopens.",
  })
  refundPayment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.online.refund(tenantId, id, dto, {
      type: "STAFF",
      id: actorId,
    });
  }

  @Get(":id/refunds")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Refunds for an online payment" })
  refunds(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.online.listRefunds(tenantId, id);
  }

  private async retryWithReturn(
    tenantId: string,
    actorId: string,
    id: string,
    dto: StartCheckoutDto,
  ) {
    const txn = await this.online.getOne(tenantId, id);
    return this.online.retry(tenantId, id, {
      initiator: { type: "STAFF", id: actorId },
      amount: dto.amount,
      returnUrl: `${staffFrontendUrl()}/invoices/${txn.data.invoice_id}`,
    });
  }
}

/** Stripe actions on existing customer invoices (tenant staff). */
@ApiTags("Online Payments (Stripe)")
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller("invoices")
export class InvoiceOnlinePaymentsController {
  constructor(
    private readonly online: InvoiceOnlinePaymentsService,
    private readonly links: PaymentLinksService,
  ) {}

  @Post(":id/pay")
  @RequirePermissions(PAYMENTS_PERMISSIONS.COLLECT)
  @ApiOperation({
    summary: "Create a Stripe Checkout session for the invoice balance",
    description:
      "Amount is computed from the ERP balance_due; a client amount is only used for allowed partial payments.",
  })
  @ApiOkResponse({
    description:
      "{ payment_id, checkout_url, expires_at, amount, currency_code }",
  })
  pay(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
    @Body() dto: StartCheckoutDto,
  ) {
    return this.online.startCheckout(tenantId, invoiceId, {
      initiator: { type: "STAFF", id: actorId },
      amount: dto.amount,
      returnUrl: `${staffFrontendUrl()}/invoices/${invoiceId}`,
    });
  }

  @Get(":id/payment-status")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Invoice payment status (balance, attempts, receipts, pending proofs)",
  })
  paymentStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
  ) {
    return this.online.invoicePaymentStatus(tenantId, invoiceId);
  }

  @Get(":id/payments")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Online payment attempts for the invoice" })
  payments(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
    @Query() query: OnlinePaymentQueryDto,
  ) {
    return this.online.list(tenantId, { ...query, invoice_id: invoiceId });
  }

  @Post(":id/payment-link")
  @RequirePermissions(PAYMENTS_PERMISSIONS.COLLECT)
  @ApiOperation({
    summary: "Generate a secure Pay Now link (optionally email it)",
    description:
      "The link is shown once; only its hash is stored. It never fixes an amount — checkout always uses the live balance.",
  })
  async paymentLink(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
    @Body() dto: CreatePaymentLinkDto,
  ) {
    if (dto.email_to) {
      const res = await this.links.createAndEmailForInvoice(
        tenantId,
        invoiceId,
        {
          to: dto.email_to,
          message: dto.message,
          expiresInDays: dto.expires_in_days,
          actorId,
        },
      );
      return {
        success: true,
        data: {
          id: res.link.id,
          url: res.url,
          expires_at: res.expires_at,
          email: res.email,
        },
      };
    }
    const res = await this.links.createForInvoice(tenantId, invoiceId, {
      expiresInDays: dto.expires_in_days,
      actorId,
    });
    return {
      success: true,
      data: { id: res.link.id, url: res.url, expires_at: res.expires_at },
    };
  }

  @Get(":id/payment-links")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Payment links issued for the invoice (no tokens)" })
  listLinks(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
  ) {
    return this.links.listForInvoice(tenantId, invoiceId);
  }

  @Post(":id/payment-links/:linkId/revoke")
  @RequirePermissions(PAYMENTS_PERMISSIONS.COLLECT)
  @ApiOperation({ summary: "Revoke a payment link" })
  revokeLink(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("linkId", ParseUUIDPipe) linkId: string,
  ) {
    return this.links.revoke(tenantId, linkId, actorId);
  }
}
