import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { JOBS_PERMISSIONS } from "../jobs/constants/jobs-permission.constants";
import { OperationsImportDeliveryService } from "./operations-import-delivery.service";
import { OperationsDashboardService } from "./operations-dashboard.service";
import {
  ImportCargoDeliveryQueryDto,
  PatchImportCargoDeliveryDto,
} from "./dto/import-cargo-delivery.dto";
import { OperationsDashboardQueryDto } from "./dto/operations-dashboard.dto";
import { ReportsGenerateService } from "../reports/reports-generate.service";
import { ReportGenerateDto } from "../reports/dto/report-generate.dto";
import { ReportFormat } from "@prisma/client";

@ApiTags("Operations")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("operations")
export class OperationsController {
  constructor(
    private readonly importDelivery: OperationsImportDeliveryService,
    private readonly dashboard: OperationsDashboardService,
    private readonly reports: ReportsGenerateService,
  ) {}

  @Get("import-cargo-delivery")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Import Cargo Delivery list (Fresa)" })
  listImportDelivery(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ImportCargoDeliveryQueryDto,
  ) {
    return this.importDelivery.list(tenantId, query);
  }

  @Patch("import-cargo-delivery/:jobId")
  @RequirePermissions(JOBS_PERMISSIONS.CLOSED_DELIVERY_EDIT)
  @ApiOperation({
    summary: "Update delivery/DO fields on closed or open import jobs",
  })
  patchImportDelivery(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
    @Body() dto: PatchImportCargoDeliveryDto,
  ) {
    return this.importDelivery.patchDelivery(tenantId, jobId, dto, actorId);
  }

  @Get("dashboard")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Operation Dashboard for date range" })
  opsDashboard(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: OperationsDashboardQueryDto,
  ) {
    return this.dashboard.dashboard(tenantId, query);
  }

  @Get("closed-job-report")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Closed Job Report screen data" })
  closedJobReport(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: OperationsDashboardQueryDto,
  ) {
    return this.dashboard.closedJobReport(tenantId, query);
  }

  @Post("closed-job-report/download")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Generate CLOSED_JOB_LIST_REPORT_FORMAT for download",
  })
  closedJobReportDownload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() query: OperationsDashboardQueryDto,
  ) {
    const dto: ReportGenerateDto = {
      code: "CLOSED_JOB_LIST_REPORT_FORMAT",
      format: ReportFormat.XLSX,
      parameters: {
        from_date: query.from_date,
        to_date: query.to_date,
        branch_id: query.branch_id ?? null,
      },
    };
    return this.reports.generate(tenantId, actorId, dto, permissions);
  }
}
