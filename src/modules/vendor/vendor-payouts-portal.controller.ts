import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { VendorPayoutsService } from "../payments/vendor-payouts.service";
import { CurrentVendor } from "./decorators/vendor.decorators";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

/**
 * Vendor portal — get paid automatically. The vendor completes Stripe's
 * hosted onboarding once; approved payments then arrive without any manual
 * step. Tenant and vendor come only from the vendor JWT.
 */
@ApiTags("Vendor Payouts")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller("vendor/payouts")
export class VendorPayoutsPortalController {
  constructor(private readonly payouts: VendorPayoutsService) {}

  @Get("account")
  @ApiOperation({ summary: "My payout account status" })
  account(@CurrentVendor() user: CurrentVendorUser) {
    return this.payouts.accountStatus(user.tenantId, user.partyId);
  }

  @Post("account/onboarding-link")
  @ApiOperation({
    summary: "Set up / continue payout onboarding (Stripe-hosted)",
  })
  onboarding(@CurrentVendor() user: CurrentVendorUser) {
    return this.payouts.onboardingLink(
      user.tenantId,
      user.partyId,
      this.payouts.defaultReturnUrl("vendor"),
    );
  }

  @Get()
  @ApiOperation({ summary: "Payouts sent to me" })
  list(@CurrentVendor() user: CurrentVendorUser) {
    return this.payouts.list(user.tenantId, { partyId: user.partyId });
  }

  @Get(":id")
  @ApiOperation({ summary: "Payout detail" })
  getOne(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.payouts.getOne(user.tenantId, id, user.partyId);
  }
}
