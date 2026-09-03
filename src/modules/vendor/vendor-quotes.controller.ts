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
    summary: "Jobs sent to this vendor for pricing (no customer rates)",
  })
  list(
    @CurrentVendor() user: CurrentVendorUser,
    @Query() query: VendorQuoteQueryDto,
  ) {
    return this.quotes.listForVendor(user.tenantId, user.partyId, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Vendor quote + job cargo details (no customer prices)" })
  get(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.getForVendor(user.tenantId, user.partyId, id);
  }

  @Post([":id/price", ":id/quote"])
  @ApiOperation({ summary: "Submit vendor pricing for a sent job" })
  price(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PriceVendorQuoteDto,
  ) {
    return this.quotes.priceAsVendor(user.tenantId, user.partyId, id, dto);
  }
}
