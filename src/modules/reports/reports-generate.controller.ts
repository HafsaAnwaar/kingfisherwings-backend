import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(REPORTS_PERMISSIONS.GENERATE)
  @ApiOperation({
    summary:
      "Start report generation (async when Redis on; sync ready when Redis off). Returns 201.",
  })
  @ApiCreatedResponse({
    description:
      "Job created. Sync (Redis off) includes download_url/expires_at when ready.",
    schema: {
      example: {
        id: "00000000-0000-4000-8000-000000000001",
        status: "ready",
        format: "PDF",
        template_code: "SEA_ARRIVAL_NOTICE_LIST",
        download_url: "/reports/jobs/00000000-0000-4000-8000-000000000001/download",
        expires_at: "2026-09-12T12:00:00.000Z",
        error: null,
      },
    },
  })
  generate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: ReportGenerateDto,
  ) {
    return this.service.generate(tenantId, userId, dto);
  }
}
