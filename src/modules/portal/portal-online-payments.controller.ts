import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { PaymentProofsService } from "../invoices/payment-proofs/payment-proofs.service";
import {
  OnlinePaymentQueryDto,
  StartCheckoutDto,
} from "../payments/dto/online-payment.dto";
import { InvoiceOnlinePaymentsService } from "../payments/invoice-online-payments.service";
import { PaymentGatewaySettingsService } from "../payments/payment-gateway-settings.service";
import { portalFrontendUrl } from "../payments/utils/frontend-url.util";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalFinanceService } from "./portal-finance.service";

/**
 * Customer portal — Stripe "Pay Now" on the customer's own invoices.
 * Ownership is enforced by PortalFinanceService.getInvoice (party match +
 * portal visibility) before any payment action; tenant and party come
 * from the portal JWT only.
 */
@ApiTags("Portal Invoices")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal")
export class PortalOnlinePaymentsController {
  constructor(
    private readonly finance: PortalFinanceService,
    private readonly online: InvoiceOnlinePaymentsService,
    private readonly gateway: PaymentGatewaySettingsService,
    private readonly proofs: PaymentProofsService,
  ) {}

  @Get("payments/stripe/config")
  @ApiOperation({
    summary: "Whether online payment is available (publishable key only)",
  })
  async config(@CurrentPortal() user: CurrentPortalUser) {
    const gw = await this.gateway.find(user.tenantId);
    return {
      success: true,
      data: {
        enabled: await this.gateway.isOnlinePaymentEnabled(user.tenantId),
        publishable_key: this.gateway.publishableKeyFor(gw),
        allow_partial_payments: gw?.allow_partial_payments ?? false,
      },
    };
  }

  @Get("invoices/:id/payment-status")
  @ApiOperation({ summary: "Payment status of my invoice" })
  async paymentStatus(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.finance.getInvoice(user, id);
    return this.online.invoicePaymentStatus(user.tenantId, id, user.partyId);
  }

  @Post("invoices/:id/pay")
  @ApiOperation({
    summary: "Pay Now — opens Stripe Checkout",
    description:
      "Charges the live ERP balance (or an allowed partial amount validated server-side).",
  })
  pay(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StartCheckoutDto,
  ) {
    return this.startCheckout(user, id, dto);
  }

  @Post("invoices/:id/checkout")
  @ApiOperation({ summary: "Alias of /pay" })
  checkout(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StartCheckoutDto,
  ) {
    return this.startCheckout(user, id, dto);
  }

  @Get("payments/online")
  @ApiOperation({ summary: "My online payment attempts" })
  list(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: OnlinePaymentQueryDto,
  ) {
    return this.online.list(user.tenantId, query, user.partyId);
  }

  @Get("payments/online/:id")
  @ApiQuery({ name: "sync", required: false, type: Boolean })
  @ApiOperation({
    summary: "My online payment detail (sync=true re-checks with Stripe)",
  })
  async detail(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Query("sync", new ParseBoolPipe({ optional: true })) sync?: boolean,
  ) {
    await this.online.getOne(user.tenantId, id, user.partyId);
    if (sync) await this.online.checkoutStatus(user.tenantId, id, true);
    return this.online.getOne(user.tenantId, id, user.partyId);
  }

  @Post("payments/online/:id/retry")
  @ApiOperation({
    summary: "Retry a failed / expired payment on the same invoice",
  })
  async retry(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StartCheckoutDto,
  ) {
    const txn = await this.online.getOne(user.tenantId, id, user.partyId);
    await this.finance.getInvoice(user, txn.data.invoice_id);
    return this.online.retry(user.tenantId, id, {
      initiator: { type: "PORTAL_USER", id: user.id },
      amount: dto.amount,
      returnUrl: `${portalFrontendUrl()}/portal/invoices/${txn.data.invoice_id}`,
    });
  }

  @Post("payments/online/:id/cancel")
  @ApiOperation({ summary: "Cancel my pending checkout" })
  async cancel(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.online.getOne(user.tenantId, id, user.partyId);
    return this.online.cancel(user.tenantId, id, {
      type: "PORTAL_USER",
      id: user.id,
    });
  }

  @Get("invoices/:id/payment-proofs/:proofId/file")
  @ApiOperation({
    summary: "Download a payment proof I uploaded for this invoice",
  })
  async proofFile(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("proofId", ParseUUIDPipe) proofId: string,
    @Res() res: Response,
  ) {
    await this.finance.getInvoice(user, id);
    const file = await this.proofs.readFile(user.tenantId, proofId, {
      partyId: user.partyId,
    });
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.fileName.replace(/[^\w.\- ]/g, "_")}"`,
    );
    res.send(file.buffer);
  }

  private async startCheckout(
    user: CurrentPortalUser,
    invoiceId: string,
    dto: StartCheckoutDto,
  ) {
    await this.finance.getInvoice(user, invoiceId);
    return this.online.startCheckout(user.tenantId, invoiceId, {
      initiator: { type: "PORTAL_USER", id: user.id },
      amount: dto.amount,
      returnUrl: `${portalFrontendUrl()}/portal/invoices/${invoiceId}`,
    });
  }
}
