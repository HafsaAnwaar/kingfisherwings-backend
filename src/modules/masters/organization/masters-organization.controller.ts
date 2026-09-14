import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { OrganizationService } from "../../organization/organization.service";
import { MASTERS_PERMISSIONS } from "../constants/masters-permission.constants";

@ApiTags("Masters — Organization")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("masters/organization")
export class MastersOrganizationController {
  constructor(private readonly organization: OrganizationService) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Proxy: organization profile (read; writes stay on /organization)",
  })
  getProfile(@CurrentUser("tenantId") tenantId: string) {
    return this.organization.getProfile(tenantId);
  }
}
