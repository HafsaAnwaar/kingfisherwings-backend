import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { JOBS_PERMISSIONS } from "./constants/jobs-permission.constants";
import { JobLookupsService } from "./job-lookups.service";

@ApiTags("Jobs")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("jobs")
export class JobLookupsController {
  constructor(private readonly lookups: JobLookupsService) {}

  @Get("lookups/dropdowns")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Name-based dropdowns for company, branch, department, salesperson, and employees (GPUM). No UUIDs.",
  })
  dropdowns(@CurrentUser("tenantId") tenantId: string) {
    return this.lookups.dropdowns(tenantId);
  }
}
