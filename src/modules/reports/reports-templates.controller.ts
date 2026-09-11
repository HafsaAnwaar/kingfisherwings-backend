import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { REPORTS_PERMISSIONS } from "./constants/reports-permission.constants";
import { ReportTemplatesQueryDto } from "./dto/report-templates-query.dto";
import { ReportsTemplatesService } from "./reports-templates.service";

@ApiTags("Reports — Catalog")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("reports/templates")
export class ReportsTemplatesController {
  constructor(private readonly service: ReportsTemplatesService) {}

  @Get()
  @RequirePermissions(REPORTS_PERMISSIONS.READ)
  @ApiOperation({
    summary: "List active report templates (paginated, tenant catalog)",
  })
  list(@Query() query: ReportTemplatesQueryDto) {
    return this.service.list(query);
  }

  @Get(":idOrCode")
  @RequirePermissions(REPORTS_PERMISSIONS.READ)
  @ApiOperation({
    summary: "Template detail + parameter schema (UUID or stable code)",
  })
  detail(
    @CurrentUser("tenantId") tenantId: string,
    @Param("idOrCode") idOrCode: string,
  ) {
    return this.service.getByIdOrCode(tenantId, idOrCode);
  }
}
