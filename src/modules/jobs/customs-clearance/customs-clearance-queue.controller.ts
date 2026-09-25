import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { JOBS_PERMISSIONS } from "../constants/jobs-permission.constants";
import { CustomsClearanceService } from "./customs-clearance.service";
import { CcQueueQueryDto } from "./dto/customs-clearance.dto";

@ApiTags("Jobs — Customs Clearance Queue")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("jobs/cc")
export class CustomsClearanceQueueController {
  constructor(private readonly cc: CustomsClearanceService) {}

  @Get("dashboard")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "CC dashboard counts by status and owner dept" })
  dashboard(@CurrentUser("tenantId") tenantId: string) {
    return this.cc.dashboard(tenantId);
  }

  @Get("queue")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "CC work queue filtered by owner/status/direction" })
  queue(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: CcQueueQueryDto,
  ) {
    return this.cc.queue(tenantId, query);
  }
}
