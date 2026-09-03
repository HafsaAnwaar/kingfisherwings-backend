import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { CurrentPortal } from "./decorators/portal.decorators";
import {
  PortalQuotationAcceptDto,
  PortalQuotationCounterOfferDto,
  PortalQuotationEstimateDto,
  PortalQuotationQueryDto,
  PortalQuotationRejectDto,
  PortalQuotationRequestDto,
} from "./dto/portal-quotation.dto";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalQuotationsService } from "./portal-quotations.service";

/**
 * Customer Portal — Quotations submodule.
 * Customers request quotes (POST) and view quotes issued to their Party (GET).
 * Cost lines, GP, and internal notes are never returned.
 */
@ApiTags("Portal Quotations")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/quotations")
export class PortalQuotationsController {
  constructor(private readonly quotations: PortalQuotationsService) {}

  @Get("summary")
  @ApiOperation({
    summary: "Quotation dashboard counters for the logged-in customer",
  })
  summary(@CurrentPortal() user: CurrentPortalUser) {
    return this.quotations.summary(user);
  }

  @Get("service-catalog")
  @ApiOperation({ summary: "List services available for portal quote requests" })
  serviceCatalog(
    @CurrentPortal() user: CurrentPortalUser,
    @Query("job_type") jobType?: string,
  ) {
    return this.quotations.getServiceCatalog(user, jobType);
  }

  @Post("estimate")
  @ApiOperation({
    summary: "Preview quote pricing with packages and selected services",
  })
  estimate(
    @CurrentPortal() user: CurrentPortalUser,
    @Body() dto: PortalQuotationEstimateDto,
  ) {
    return this.quotations.estimate(user, dto);
  }

  @Post("request")
  @ApiOperation({
    summary: "Request a new freight quote",
    description:
      "Creates a quotation enquiry bound to the portal user’s Party. Staff price and send the formal quote.",
  })
  request(
    @CurrentPortal() user: CurrentPortalUser,
    @Body() dto: PortalQuotationRequestDto,
  ) {
    return this.quotations.requestQuote(user, dto);
  }

  @Post(":id/accept")
  @ApiOperation({
    summary: "Accept a sent quotation",
    description:
      "Marks the quote APPROVED (customer accepted). Only SENT, CUSTOMER_REVIEW, or NEGOTIATING quotes can be accepted — not a new portal enquiry.",
  })
  accept(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PortalQuotationAcceptDto,
  ) {
    return this.quotations.accept(user, id, dto);
  }

  @Post(":id/reject")
  @ApiOperation({
    summary: "Reject a sent quotation",
    description:
      "Marks the quote DISAPPROVED. Only SENT, CUSTOMER_REVIEW, or NEGOTIATING quotes can be rejected — not a new portal enquiry.",
  })
  reject(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PortalQuotationRejectDto,
  ) {
    return this.quotations.reject(user, id, dto);
  }

  @Post(":id/counter-offer")
  @ApiOperation({ summary: "Submit a counter-offer on a sent or revised quote" })
  counterOffer(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PortalQuotationCounterOfferDto,
  ) {
    return this.quotations.counterOffer(user, id, dto);
  }

  @Get(":id/negotiation")
  @ApiOperation({ summary: "Negotiation timeline for this quotation" })
  negotiation(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotations.negotiationTimeline(user, id);
  }

  @Get()
  @ApiOperation({
    summary: "List my quotations",
    description:
      "Quotes for this customer Party. Excludes internal staff-only drafts.",
  })
  list(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalQuotationQueryDto,
  ) {
    return this.quotations.list(user, query);
  }

  @Get(":id/pdf")
  @ApiOperation({
    summary: "Download customer-facing quotation PDF when generated",
  })
  downloadPdf(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.quotations.downloadPdf(user, id, res);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Quotation detail",
    description: "Revenue lines only — no cost lines, GP, or internal notes.",
  })
  detail(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotations.findOne(user, id);
  }
}
