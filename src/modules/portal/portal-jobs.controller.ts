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
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { portalJobOwnershipWhere } from "./helpers/portal-ownership.helper";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";

@ApiTags("Portal — Jobs")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/jobs")
export class PortalJobsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly costing: JobCostingService,
  ) {}

  @Get(":id/costing")
  @ApiOperation({
    summary:
      "Job costing tab for portal customer (sale side only; cost stripped)",
  })
  async getCosting(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
        },
        select: { id: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return this.costing.getTab(user.tenantId, id, "CUSTOMER");
  }
}
