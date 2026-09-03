import {
  BadRequestException,
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
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { JOBS_PERMISSIONS } from "../jobs/constants/jobs-permission.constants";
import {
  SendJobToVendorDto,
  VendorNegotiationAcceptDto,
  VendorNegotiationRejectDto,
  VendorQuoteQueryDto,
  VendorReviseAndSendDto,
} from "./dto/vendor-quote.dto";
import { VendorQuotesService } from "./vendor-quotes.service";

/**
 * Staff job-offers API — same negotiation shape as customer quotations.
 */
@ApiTags("Job Offers")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("job-offers")
export class JobOffersController {
  constructor(private readonly quotes: VendorQuotesService) {}

  @Get()
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List vendor job offers for this tenant" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: VendorQuoteQueryDto,
  ) {
    return this.quotes.listForTenant(tenantId, query);
  }

  @Post()
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Pass a job to a vendor with optional seeded cost (proposed_total / lines).",
  })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: SendJobToVendorDto,
  ) {
    if (!dto.job_id) {
      throw new BadRequestException("job_id is required.");
    }
    return this.quotes.sendJobToVendor(tenantId, dto.job_id, dto, actorId);
  }

  @Get(":id")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Vendor offer detail + shared negotiation_pricing" })
  get(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.getForTenant(tenantId, id);
  }

  @Get(":id/negotiation")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Negotiation timeline (same shape as quotations)" })
  negotiation(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.getNegotiationTimeline(tenantId, id);
  }

  @Post(":id/revise-and-send")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Revise cost offer and send back to vendor" })
  reviseAndSend(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VendorReviseAndSendDto,
  ) {
    return this.quotes.reviseAndSend(tenantId, id, dto, actorId);
  }

  @Post(":id/negotiation/accept")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Accept vendor counter-offer" })
  negotiationAccept(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VendorNegotiationAcceptDto,
  ) {
    return this.quotes.tenantAcceptCounter(tenantId, id, dto, actorId);
  }

  @Post(":id/negotiation/reject")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Reject vendor counter-offer" })
  negotiationReject(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VendorNegotiationRejectDto,
  ) {
    return this.quotes.tenantRejectCounter(tenantId, id, dto, actorId);
  }

  @Post(":id/approve")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Approve vendor-priced / countered offer" })
  approve(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.decide(tenantId, id, true, actorId);
  }

  @Post(":id/disapprove")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Disapprove vendor offer (terminal)" })
  disapprove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.decide(tenantId, id, false, actorId);
  }
}
