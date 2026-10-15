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
import { ReportFormat } from "@prisma/client";
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
import {
  ExceptionsQueryDto,
  JobFinanceReportQueryDto,
  JobListSummaryQueryDto,
  JobNotInvoicedDoQueryDto,
  KpiStatusQueryDto,
  VoyageJobsShipmentsQueryDto,
} from "./dto/operations-fresa-reports.dto";
import { ReportsGenerateService } from "../reports/reports-generate.service";
import { ReportGenerateDto } from "../reports/dto/report-generate.dto";
import { OperationsFresaReportsService } from "../reports/operations-fresa-reports.service";

@ApiTags("Operations")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("operations")
export class OperationsController {
  constructor(
    private readonly importDelivery: OperationsImportDeliveryService,
    private readonly dashboard: OperationsDashboardService,
    private readonly reports: ReportsGenerateService,
    private readonly fresaReports: OperationsFresaReportsService,
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

  @Get("job-not-invoiced-do")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Jobs with DO released and uninvoiced sale charges (Fresa AR Job Not Invoice)",
  })
  jobNotInvoicedDo(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: JobNotInvoicedDoQueryDto,
  ) {
    return this.fresaReports.jobNotInvoicedDo(tenantId, query);
  }

  @Post("job-not-invoiced-do/download")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Download AR_JOB_NOT_INVOICE_REPORT_FORMAT XLSX" })
  jobNotInvoicedDoDownload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() query: JobNotInvoicedDoQueryDto,
  ) {
    const dto: ReportGenerateDto = {
      code: "AR_JOB_NOT_INVOICE_REPORT_FORMAT",
      format: ReportFormat.XLSX,
      parameters: {
        from_date: query.from_date,
        to_date: query.to_date,
        branch_id: query.branch_id ?? null,
        job_type: query.job_type ?? null,
        date_basis: query.date_basis ?? "do_issued",
      },
    };
    return this.reports.generate(tenantId, actorId, dto, permissions);
  }

  @Get("job-finance-report")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Multi-job finance rows filtered by shipment_date (fallback job_date)",
  })
  jobFinanceReport(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: JobFinanceReportQueryDto,
  ) {
    return this.fresaReports.jobFinanceReport(tenantId, query);
  }

  @Post("job-finance-report/download")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Download JOB_FINANCE_BY_SHIPMENT_DATE_REPORT_FORMAT",
  })
  jobFinanceReportDownload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() query: JobFinanceReportQueryDto,
  ) {
    const dto: ReportGenerateDto = {
      code: "JOB_FINANCE_BY_SHIPMENT_DATE_REPORT_FORMAT",
      format: ReportFormat.XLSX,
      parameters: {
        from_date: query.from_date,
        to_date: query.to_date,
        branch_id: query.branch_id ?? null,
        job_type: query.job_type ?? null,
        date_basis: query.date_basis ?? "shipment_date",
        group_by: query.group_by ?? "none",
      },
    };
    return this.reports.generate(tenantId, actorId, dto, permissions);
  }

  @Get("voyage-jobs-shipments")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Combined jobs + shipments by voyage number" })
  voyageJobsShipments(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: VoyageJobsShipmentsQueryDto,
  ) {
    return this.fresaReports.voyageJobsShipments(tenantId, query);
  }

  @Get("exceptions")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Ops exception rules (DO uninvoiced, ATD no BL, ATA missing, etc.)",
  })
  exceptions(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ExceptionsQueryDto,
  ) {
    return this.fresaReports.exceptions(tenantId, query);
  }

  @Post("exceptions/download")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Download EXCEPTION_REPORT_FORMAT" })
  exceptionsDownload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() query: ExceptionsQueryDto,
  ) {
    const dto: ReportGenerateDto = {
      code: "EXCEPTION_REPORT_FORMAT",
      format: ReportFormat.XLSX,
      parameters: {
        from_date: query.from_date,
        to_date: query.to_date,
        branch_id: query.branch_id ?? null,
        rules: query.rules ?? null,
        eta_grace_days: query.eta_grace_days ?? 7,
      },
    };
    return this.reports.generate(tenantId, actorId, dto, permissions);
  }

  @Get("kpi-status")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "KPI status by job_date or completed window" })
  kpiStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: KpiStatusQueryDto,
  ) {
    return this.fresaReports.kpiStatus(tenantId, query);
  }

  @Post("kpi-status/download")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Download KPI_STATUS_BY_COMPLETED_DATE_REPORT_FORMAT",
  })
  kpiStatusDownload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() query: KpiStatusQueryDto,
  ) {
    const dto: ReportGenerateDto = {
      code: "KPI_STATUS_BY_COMPLETED_DATE_REPORT_FORMAT",
      format: ReportFormat.XLSX,
      parameters: {
        from_date: query.from_date,
        to_date: query.to_date,
        branch_id: query.branch_id ?? null,
        date_basis: query.date_basis ?? "job_date",
      },
    };
    return this.reports.generate(tenantId, actorId, dto, permissions);
  }

  @Get("job-list-summary")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Job list summary with chargeable_units; date_basis job|shipment|voucher",
  })
  jobListSummary(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: JobListSummaryQueryDto,
  ) {
    return this.fresaReports.jobListSummary(tenantId, query);
  }

  @Post("job-list-summary/download")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Download JOB_LIST_SUMMARY_REPORT_FORMAT" })
  jobListSummaryDownload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() query: JobListSummaryQueryDto,
  ) {
    const dto: ReportGenerateDto = {
      code: "JOB_LIST_SUMMARY_REPORT_FORMAT",
      format: ReportFormat.XLSX,
      parameters: {
        from_date: query.from_date,
        to_date: query.to_date,
        branch_id: query.branch_id ?? null,
        date_basis: query.date_basis ?? "job_date",
      },
    };
    return this.reports.generate(tenantId, actorId, dto, permissions);
  }
}
