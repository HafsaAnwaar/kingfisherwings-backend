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
  VendorQuoteQueryDto,
} from "./dto/vendor-quote.dto";
import { VendorQuotesService } from "./vendor-quotes.service";

/**
 * Staff job-offers API. Frontend feature-detects these paths;
 * aliases also exist under /jobs/:id/....
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
    summary: "Pass a job to a vendor for pricing (no customer rates)",
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

  @Post(":id/approve")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  approve(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.decide(tenantId, id, true, actorId);
  }

  @Post(":id/disapprove")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  disapprove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.quotes.decide(tenantId, id, false, actorId);
  }
}
