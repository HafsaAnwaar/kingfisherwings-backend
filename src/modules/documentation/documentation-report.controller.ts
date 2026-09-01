import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { DOCUMENTATION_PERMISSIONS } from "./constants/documentation-permission.constants";
import {
  DocumentationReportQueryDto,
  DocumentationReportService,
} from "./documentation-report.service";

@ApiTags("Documentation — Reports")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("documentation/reports")
export class DocumentationReportController {
  constructor(private readonly service: DocumentationReportService) {}

  @Get()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  list() {
    return this.service.listReports();
  }

  @Get("eta-followup")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  eta(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: DocumentationReportQueryDto,
  ) {
    return this.service.etaFollowup(tenantId, query);
  }

  @Get("etd-followup")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  etd(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: DocumentationReportQueryDto,
  ) {
    return this.service.etdFollowup(tenantId, query);
  }

  @Get("jobs-list")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  jobsList(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: DocumentationReportQueryDto,
  ) {
    return this.service.jobsList(tenantId, query);
  }

  @Get("manifest-status")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  manifest(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: DocumentationReportQueryDto,
  ) {
    return this.service.manifestStatus(tenantId, query);
  }
}
