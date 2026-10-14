import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import { JobCostingService } from "../jobs/job-costing.service";
import { CurrentVendor } from "./decorators/vendor.decorators";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

@ApiTags("Vendor — Jobs")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller("vendor/jobs")
export class VendorJobsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly costing: JobCostingService,
  ) {}

  @Get(":id/costing")
  @ApiOperation({
    summary:
      "Job costing for vendor (cost side only; sale stripped). Access via vendor quote or cost_party.",
  })
  async getCosting(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const allowed = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const quote = await tx.vendorQuote.findFirst({
        where: {
          tenant_id: user.tenantId,
          job_id: id,
          vendor_party_id: user.partyId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (quote) return true;
      const costLine = await tx.jobCharge.findFirst({
        where: {
          tenant_id: user.tenantId,
          job_id: id,
          deleted_at: null,
          OR: [
            { cost_party_id: user.partyId },
            { party_id: user.partyId, is_cost: true },
          ],
        },
        select: { id: true },
      });
      return !!costLine;
    });
    if (!allowed) throw new NotFoundException("Job not found.");
    return this.costing.getTab(user.tenantId, id, "VENDOR");
  }
}
