import { Body, Controller, Post, UseGuards } from "@nestjs/common";
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
import { ReportGenerateDto } from "./dto/report-generate.dto";
import { ReportsGenerateService } from "./reports-generate.service";

@ApiTags("Reports — Catalog")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("reports")
export class ReportsGenerateController {
  constructor(private readonly service: ReportsGenerateService) {}

  @Post("generate")
  @RequirePermissions(REPORTS_PERMISSIONS.GENERATE)
  @ApiOperation({
    summary:
      "Start report generation (async when Redis on; sync ready when Redis off)",
  })
  generate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: ReportGenerateDto,
  ) {
    return this.service.generate(tenantId, userId, dto);
  }
}
