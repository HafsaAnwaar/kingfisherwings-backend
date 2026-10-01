import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { INVOICES_PERMISSIONS } from "../invoices/constants/invoices-permission.constants";
import { PAYMENTS_PERMISSIONS } from "./constants/payments-permission.constants";
import { VendorPayoutsService } from "./vendor-payouts.service";

/**
 * Automatic vendor payouts (Stripe Connect). Approving a payment request
 * already pays the vendor automatically; these routes cover onboarding,
 * visibility, and paying a vendor bill / retrying a failed payout.
 * Returns 503 until STRIPE_CONNECT_ENABLED=true.
 */
@ApiTags("Vendor Payouts (Stripe Connect)")
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller("vendor-payouts")
export class VendorPayoutsController {
  constructor(private readonly payouts: VendorPayoutsService) {}

  @Get()
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiQuery({ name: "party_id", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiOperation({
    summary: "Vendor payouts (Stripe transfers) with their ERP payment",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query("party_id") partyId?: string,
    @Query("status") status?: string,
  ) {
    return this.payouts.list(tenantId, {
      partyId:
        partyId && /^[0-9a-f-]{36}$/i.test(partyId) ? partyId : undefined,
      status,
    });
  }

  @Get("accounts/:partyId")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Vendor's payout onboarding status (refreshed from Stripe)",
  })
  account(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
  ) {
    return this.payouts.accountStatus(tenantId, partyId);
  }

  @Post("accounts/:partyId/onboarding-link")
  @RequirePermissions(PAYMENTS_PERMISSIONS.MANAGE_GATEWAY)
  @ApiOperation({
    summary:
      "Create the vendor's Stripe payout account and an onboarding link to send them",
  })
  onboarding(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
  ) {
    return this.payouts.onboardingLink(
      tenantId,
      partyId,
      this.payouts.defaultReturnUrl("staff", partyId),
    );
  }

  @Post("payment-requests/:id")
  @RequirePermissions(INVOICES_PERMISSIONS.APPROVE_PAYMENT)
  @ApiOperation({
    summary:
      "Pay an approved payment request now (normally automatic on approval)",
    description:
      "Amount comes from the payment request; the AP payment is posted via mark-paid.",
  })
  payRequest(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.payouts.payPaymentRequest(tenantId, id, {
      type: "STAFF",
      id: actorId,
    });
  }

  @Post("purchase-invoices/:id")
  @RequirePermissions(INVOICES_PERMISSIONS.APPROVE_PAYMENT)
  @ApiOperation({
    summary:
      "Pay a posted vendor bill's balance via Stripe and post the AP payment",
  })
  payBill(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.payouts.payPurchaseInvoice(tenantId, id, {
      type: "STAFF",
      id: actorId,
    });
  }

  @Get(":id")
  @RequirePermissions(PAYMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Payout detail" })
  getOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.payouts.getOne(tenantId, id);
  }
}
