import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from "@nestjs/common";
import {
  ApiExcludeEndpoint,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { Public } from "../../common/decorators/public.decorators";
import { StartCheckoutDto } from "./dto/online-payment.dto";
import { InvoiceOnlinePaymentsService } from "./invoice-online-payments.service";
import { PaymentLinksService } from "./payment-links.service";
import { PlatformBillingService } from "./platform-billing.service";
import { StripeWebhookService } from "./stripe-webhook.service";
import { paymentLinkUrl } from "./utils/frontend-url.util";

/**
 * Stripe webhooks. Unauthenticated by design — authenticity comes from
 * the Stripe-Signature header verified against the raw body.
 *   POST /payments/stripe/webhook          platform Stripe account
 *   POST /payments/stripe/webhook/:token   a company's own Stripe account
 */
@ApiTags("Stripe Webhook")
@Public()
@SkipThrottle()
@Controller("payments/stripe/webhook")
export class StripeWebhookController {
  constructor(private readonly webhooks: StripeWebhookService) {}

  // Stripe Connect endpoints (events from connected vendor accounts) are
  // declared first so "connect" is never taken as a :token.
  @Post("connect")
  @HttpCode(200)
  @ApiOperation({
    summary: "Stripe Connect webhook (platform account's connected accounts)",
  })
  @ApiHeader({ name: "stripe-signature", required: true })
  platformConnect(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature?: string,
  ) {
    return this.webhooks.handle(req.rawBody, signature, undefined, true);
  }

  @Post(":token/connect")
  @HttpCode(200)
  @ApiOperation({
    summary: "Stripe Connect webhook (a company's connected accounts)",
  })
  @ApiHeader({ name: "stripe-signature", required: true })
  tenantConnect(
    @Req() req: RawBodyRequest<Request>,
    @Param("token") token: string,
    @Headers("stripe-signature") signature?: string,
  ) {
    return this.webhooks.handle(req.rawBody, signature, token, true);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: "Stripe webhook (platform account)",
    description:
      "Verifies Stripe-Signature over the raw body, stores the event (unique per account) and applies it idempotently. " +
      "Handled: checkout.session.completed|async_payment_succeeded|async_payment_failed|expired, " +
      "payment_intent.succeeded|payment_failed|processing|canceled|requires_action, charge.refunded, " +
      "refund.created|updated|failed, customer.subscription.created|updated|deleted, invoice.paid|payment_failed. " +
      "400 = bad signature; 5xx = processing failed (Stripe retries).",
  })
  @ApiHeader({ name: "stripe-signature", required: true })
  platform(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature?: string,
  ) {
    return this.webhooks.handle(req.rawBody, signature);
  }

  @Post(":token")
  @HttpCode(200)
  @ApiOperation({
    summary:
      "Stripe webhook (company Stripe account; token from payment settings)",
  })
  @ApiHeader({ name: "stripe-signature", required: true })
  tenant(
    @Req() req: RawBodyRequest<Request>,
    @Param("token") token: string,
    @Headers("stripe-signature") signature?: string,
  ) {
    return this.webhooks.handle(req.rawBody, signature, token);
  }
}

/**
 * Public "Pay Now" page backend. The token is the only credential; it
 * resolves to one invoice, exposes a minimal summary, and can only open a
 * Checkout for the live ERP balance (the link never carries an amount).
 */
@ApiTags("Payment Links (public)")
@Public()
@Throttle({ default: { limit: 20, ttl: 60_000 } })
@Controller("pay")
export class PublicPaymentLinksController {
  constructor(
    private readonly links: PaymentLinksService,
    private readonly online: InvoiceOnlinePaymentsService,
    private readonly platform: PlatformBillingService,
  ) {}

  @Get(":token")
  @ApiOperation({ summary: "Invoice summary behind a payment link" })
  async summary(@Param("token") token: string) {
    const link = await this.links.resolve(token);
    return { success: true, data: await this.links.publicSummary(link) };
  }

  @Post(":token/checkout")
  @ApiOperation({ summary: "Open Stripe Checkout for a payment link" })
  async checkout(@Param("token") token: string, @Body() dto: StartCheckoutDto) {
    const link = await this.links.resolve(token);
    await this.links.touch(link.id);
    const returnUrl = paymentLinkUrl(token);
    if (link.scope === "PLATFORM_INVOICE") {
      return this.platform.startCheckout(
        link.tenant_id,
        link.platform_invoice_id!,
        { type: "PAYMENT_LINK" },
        returnUrl,
      );
    }
    return this.online.startCheckout(link.tenant_id, link.invoice_id!, {
      initiator: { type: "PAYMENT_LINK" },
      amount: dto.amount,
      returnUrl,
      paymentLinkId: link.id,
    });
  }

  @Get(":token/status")
  @ApiExcludeEndpoint()
  async status(@Param("token") token: string) {
    const link = await this.links.resolve(token);
    const s = await this.links.publicSummary(link);
    return {
      success: true,
      data: {
        status: s.status,
        balance_due: s.balance_due,
        payable: s.payable,
      },
    };
  }
}
