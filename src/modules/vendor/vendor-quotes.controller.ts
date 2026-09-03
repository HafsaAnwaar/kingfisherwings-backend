import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { CurrentVendor } from "./decorators/vendor.decorators";
import {
  PriceVendorQuoteDto,
  VendorCounterOfferDto,
  VendorNegotiationAcceptDto,
  VendorNegotiationRejectDto,
  VendorQuoteQueryDto,
} from "./dto/vendor-quote.dto";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";
import { VendorQuotesService } from "./vendor-quotes.service";

@ApiTags("Vendor Quotes")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller(["vendor/quotes", "vendor/job-offers"])
export class VendorQuotesController {
  constructor(private readonly quotes: VendorQuotesService) {}

  @Get()
  @ApiOperation({
    summary: "Jobs / offers sent to this vendor (shared negotiation_pricing)",
  })
  list(
    @CurrentVendor() user: CurrentVendorUser,
    @Query() query: VendorQuoteQueryDto,
  ) {
    return this.quotes.listForVendor(user.tenantId, user.partyId, query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Offer detail + job cargo + negotiation_pricing (no customer revenue)",
  })
  get(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.getForVendor(user.tenantId, user.partyId, id);
  }

  @Get(":id/negotiation")
  @ApiOperation({ summary: "Negotiation timeline for this offer" })
  negotiation(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.getNegotiationTimeline(
      user.tenantId,
      id,
      user.partyId,
    );
  }

  @Post(":id/accept")
  @ApiOperation({ summary: "Accept the tenant cost offer as-is" })
  accept(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VendorNegotiationAcceptDto,
  ) {
    return this.quotes.vendorAccept(user.tenantId, user.partyId, id, dto);
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "Reject the tenant cost offer" })
  reject(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VendorNegotiationRejectDto,
  ) {
    return this.quotes.vendorReject(user.tenantId, user.partyId, id, dto);
  }

  @Post(":id/counter-offer")
  @ApiOperation({
    summary:
      "Counter the tenant cost — cost_total jumps immediately (same as customer quotes)",
  })
  counterOffer(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VendorCounterOfferDto,
  ) {
    return this.quotes.vendorCounterOffer(
      user.tenantId,
      user.partyId,
      id,
      dto,
    );
  }

  @Post([":id/price", ":id/quote"])
  @ApiOperation({
    summary: "Submit vendor pricing / counter (alias of counter-offer)",
  })
  price(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PriceVendorQuoteDto,
  ) {
    return this.quotes.priceAsVendor(user.tenantId, user.partyId, id, dto);
  }
}
