import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { JobChargeAttachmentSide, JobPartyRole } from "@prisma/client";
import "multer";

import { JobsService } from "./jobs.service";
import { JobsDashboardService } from "./jobs-dashboard.service";
import { JobDetailService } from "./job-detail.service";
import {
  ChangeJobStatusDto,
  ReopenJobDto,
  StopJobDto,
} from "./dto/job-detail.dto";
import {
  PatchJobDimensionsDto,
  UpsertJobPartyReferenceDto,
} from "./dto/job-organization.dto";
import {
  AddJobOrganizationDto,
  CopyJobOrganizationsDto,
  RefreshOrgPartySnapshotDto,
  ReplaceJobOrganizationDto,
} from "./dto/job-organization-tab.dto";
import {
  BulkJobDimensionsDto,
  ConfirmDimensionUploadDto,
  PasteDimensionUploadDto,
  SyncDimensionsToCargoDto,
  UpdateJobDimensionLineDto,
  UpsertJobDimensionLineDto,
} from "./dto/job-dimension.dto";
import { PutJobGpumDto } from "./dto/job-gpum.dto";
import {
  CalculateStorageChargesDto,
  ConfirmStorageChargesDto,
} from "./dto/job-storage-costing.dto";
import { CreateJobChargeAttachmentDto } from "./dto/job-charge-attachment.dto";
import { JobStatusCatalogService } from "./job-status-catalog.service";
import { JobGpumService } from "./job-gpum.service";
import { JobContainerStorageCostingService } from "./job-container-storage-costing.service";
import { JobChargeAttachmentService } from "./job-charge-attachment.service";
import { JobOrganizationService } from "./job-organization.service";
import { JobDimensionService } from "./job-dimension.service";
import { JobContainerTabService } from "./job-container-tab.service";
import { JobCostingService } from "./job-costing.service";
import { JobProfitShareService } from "./job-profit-share.service";
import { JobTabPanelsService } from "./job-tab-panels.service";
import {
  CompositeJobChargeDto,
  CostSectionDto,
  GenerateJobVoucherDto,
  GetJobChargesFromShipmentDto,
  JobInvoiceFromChargesDto,
  ProfitShareAddDto,
  ProfitSharePreviewDto,
  SaleSectionDto,
} from "./dto/job-costing.dto";
import {
  PatchJobDepartmentDto,
  UpsertJobCustomsRefDto,
  UpsertJobExchangeRateDto,
  UpsertJobRoutingLegDto,
} from "./dto/job-tab-panels.dto";
import { JobsDashboardQueryDto } from "../../common/dto/dashboard-period-query.dto";

import { CreateJobDto, ScanJobBarcodeDto, UpdateJobDto } from "./dto/job.dto";
import { UpdateAirJobDetailDto } from "./dto/air-job-detail.dto";
import {
  UpdateSeaFclJobDetailDto,
  SubmitSiDto,
  SubmitVgmDto,
} from "./dto/sea-fcl-job-detail.dto";
import {
  SubmitLclSiDto,
  UpdateSeaLclJobDetailDto,
} from "./dto/sea-lcl-job-detail.dto";
import {
  AttachLclHouseDto,
  LclCfsStorageCalculationDto,
  LinkLclTranshipmentDto,
  LinkLclWmsStorageDto,
} from "./dto/sea-lcl.dto";
import {
  CopyJobChargesDto,
  CreateJobChargeDto,
  GetJobChargesDto,
  UpdateJobChargeDto,
} from "./dto/job-charge.dto";
import {
  UpdateJobMilestoneDto,
  CreateCustomMilestoneDto,
} from "./dto/job-milestone.dto";
import { CreateJobNoteDto, UpdateJobNoteDto } from "./dto/job-note.dto";
import {
  CreateJobDocumentDto,
  UpdateJobDocumentDto,
  FinalizeJobDocumentDto,
} from "./dto/job-document.dto";
import {
  BulkJobContainersDto,
  ConfirmContainerUploadDto,
  CreateJobContainerDto,
  PasteContainerUploadDto,
  SyncContainersFromSubJobsDto,
  UpdateJobContainerDto,
  UpdateJobDetailsFromContainerTabDto,
} from "./dto/job-container.dto";
import {
  AssignCargoToContainerDto,
  CreateJobCargoDto,
  SplitContainerDto,
  UpdateJobCargoDto,
} from "./dto/job-cargo.dto";
import {
  CreateBillOfLadingDto,
  UpdateBillOfLadingDto,
} from "./dto/bill-of-lading.dto";
import {
  CreateStuffingRecordDto,
  UpdateStuffingRecordDto,
} from "./dto/stuffing-record.dto";
import { SendPreAlertDto } from "./dto/pre-alert.dto";
import { GenerateJobDocumentDto } from "./dto/generate-job-document.dto";
import { JobQueryDto } from "./dto/job-query.dto";
import {
  CreatePaymentRequestFromJobDto,
  CreateSubJobDto,
  SchedulePreAlertDto,
  SendWhatsAppStatusDto,
} from "./dto/week4-6-ops.dto";
import {
  AttachJobShipmentsDto,
  CancelProrateDto,
  CloseJobDto,
  CopyJobDto,
  JobShipmentsBodyDto,
  ProrateToShipmentsDto,
} from "./dto/job-console.dto";
import {
  CalculateCfsStorageDto,
  CreateDamageReportDto,
  CreateJobDepositDto,
  CreatePartDeliveryDto,
  CreateProofOfDeliveryDto,
  LinkTranshipmentDto,
  ReturnContainerDto,
  UpdateCustomsStatusDto,
  UpdateJobDepositDto,
  UpsertContainerFreeDaysDto,
} from "./dto/sea-fcl-import.dto";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { JOBS_PERMISSIONS } from "./constants/jobs-permission.constants";
import { SendJobToVendorDto, VendorQuoteQueryDto } from "../vendor/dto/vendor-quote.dto";
import { VendorQuotesService } from "../vendor/vendor-quotes.service";
import { SeaFclImportService } from "./sea-fcl-import.service";
import { AirImportService } from "./air-import.service";
import { SeaLclService } from "./sea-lcl.service";
import { SeaLclImportService } from "./sea-lcl-import.service";
import { LandService } from "./land.service";
import { RoadFreightService } from "./road-freight.service";
import { CourierService } from "./courier.service";
import { TransportService } from "../transport/transport.service";
import {
  AssignLandTruckerDto,
  CreateLandPodDto,
  RecordLandBorderCrossingDto,
  RecordLandPickupDto,
  UpdateLandJobDetailDto,
} from "./dto/land-job-detail.dto";
import {
  AssignRoadFreightTruckerDto,
  CreateRoadFreightPodDto,
  RecordRoadFreightBorderCrossingDto,
  RecordRoadFreightPickupDto,
  UpdateRoadFreightJobDetailDto,
} from "./dto/road-freight-job-detail.dto";
import {
  ConfirmCourierBookingDto,
  CreateCourierPodDto,
  LinkCourierJobDto,
  ScanCourierCheckpointDto,
  UpdateCourierJobDetailDto,
} from "./dto/courier-job-detail.dto";
import { CreateTransportRequestDto } from "../transport/dto/transport-request.dto";
import {
  AirStorageCalculationQueryDto,
  CreateCustomsExaminationDto,
  LinkAirTranshipmentDto,
  SendImportNoticeDto,
} from "./dto/air-import.dto";

@ApiTags("Jobs")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("jobs")
export class JobsController {
  constructor(
    private readonly service: JobsService,
    private readonly dashboard: JobsDashboardService,
    private readonly detail: JobDetailService,
    private readonly statusCatalog: JobStatusCatalogService,
    private readonly gpum: JobGpumService,
    private readonly storageCosting: JobContainerStorageCostingService,
    private readonly chargeAttachments: JobChargeAttachmentService,
    private readonly organizations: JobOrganizationService,
    private readonly dimensions: JobDimensionService,
    private readonly containerTab: JobContainerTabService,
    private readonly costing: JobCostingService,
    private readonly profitShare: JobProfitShareService,
    private readonly tabPanels: JobTabPanelsService,
    private readonly seaFclImport: SeaFclImportService,
    private readonly airImport: AirImportService,
    private readonly seaLcl: SeaLclService,
    private readonly seaLclImport: SeaLclImportService,
    private readonly land: LandService,
    private readonly roadFreight: RoadFreightService,
    private readonly courier: CourierService,
    private readonly transport: TransportService,
    private readonly vendorQuotes: VendorQuotesService,
  ) {}

  @Get()
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List jobs" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("permissions") permissions: string[],
    @CurrentUser("role") role: string,
    @Query() query: JobQueryDto,
  ) {
    return this.service.findAll(tenantId, query, permissions, {
      role,
      permissions,
    });
  }

  @Get("dashboard-counts")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Job KPI counters for staff dashboards",
    description:
      "Single-round-trip aggregates by status/type. Supports period=7d|30d|mtd|custom.",
  })
  dashboardCounts(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: JobsDashboardQueryDto,
  ) {
    return this.dashboard.dashboardCounts(tenantId, query);
  }

  @Get("team-workload")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Per-user open jobs, capacity utilization, and milestone SLA %",
    description:
      "Capacity default is 25 open jobs per ops user. SLA uses milestones with planned_date in period.",
  })
  teamWorkload(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: JobsDashboardQueryDto,
  ) {
    return this.dashboard.teamWorkload(tenantId, query);
  }

  @Get("status-options")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Job status catalog (Approved/Open/Closed labels)" })
  statusOptions(
    @CurrentUser("tenantId") tenantId: string,
    @Query("job_id") jobId?: string,
  ) {
    return this.statusCatalog.listOptions(tenantId, jobId);
  }

  @Get("job-offers")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List vendor job offers (feature-detect path)" })
  listAllJobOffers(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: VendorQuoteQueryDto,
  ) {
    return this.vendorQuotes.listForTenant(tenantId, query);
  }

  @Post("job-offers")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Pass a job to a vendor (body.job_id required)" })
  createJobOffer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: SendJobToVendorDto,
  ) {
    if (!dto.job_id) {
      throw new BadRequestException("job_id is required.");
    }
    return this.vendorQuotes.sendJobToVendor(
      tenantId,
      dto.job_id,
      dto,
      actorId,
    );
  }

  @Get("by-barcode/:code")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Staff barcode lookup — full job card (ports, weight, CBM, parties)",
    description:
      "Tenant-authenticated only. Printed CODE128 encodes an opaque id; job details are never returned without staff JWT + tenant scope. Public /track does not resolve by barcode.",
  })
  findByBarcode(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("code") code: string,
  ) {
    return this.service.findByBarcode(tenantId, code, permissions);
  }

  @Post("scan")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Staff in-system barcode scan — record event + return full job details",
    description:
      "For Tenant Admin / staff scanners inside the ERP. Requires jobs.update. Returns id, ports, origin/destination, weight, CBM, pieces, parties, mode refs, and the new scan_event. Outsiders scanning the printed label only see the CODE128 string — not this payload.",
  })
  scanBarcode(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() dto: ScanJobBarcodeDto,
  ) {
    return this.service.scanBarcode(tenantId, dto, actorId, permissions);
  }

  @Get([":id/job-offers", ":id/vendor-quotes"])
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List vendor job offers for this job" })
  listVendorQuotes(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.vendorQuotes.listForJob(tenantId, id);
  }

  @Post([":id/job-offers", ":id/pass-to-vendor", ":id/send-to-vendor"])
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Pass this job to a vendor for pricing. Customer revenue/cost is not shared.",
  })
  sendToVendor(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendJobToVendorDto,
  ) {
    return this.vendorQuotes.sendJobToVendor(tenantId, id, dto, actorId);
  }

  @Get(":id/detail/:tab")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Job detail tab (info, costing, history, booking_form, shipments, …)",
  })
  getDetailTab(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("tab") tab: string,
  ) {
    return this.detail.getDetailTab(tenantId, id, tab);
  }

  @Get(":id/detail")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Fresa job detail — header, tabs, actions, links",
  })
  getDetail(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.detail.getDetail(tenantId, id);
  }

  @Post(":id/change-status")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Change job status (any catalog value, anytime)" })
  changeStatus(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ChangeJobStatusDto,
  ) {
    return this.detail.changeStatus(tenantId, id, dto, actorId, permissions);
  }

  @Post(":id/reopen")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Reopen closed/cancelled/delivered job" })
  reopenJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReopenJobDto,
  ) {
    return this.detail.reopen(tenantId, id, dto, actorId);
  }

  @Patch(":id/organization/client-reference")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert client reference (e.g. PO Number)" })
  patchClientReference(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobPartyReferenceDto,
  ) {
    return this.detail.patchOrganizationReference(tenantId, id, dto, actorId);
  }

  @Get(":id/organizations")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List job organizations (Organization tab)" })
  listOrganizations(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.organizations.list(tenantId, id);
  }

  @Post(":id/organizations")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add organization — select existing party or create new",
  })
  addOrganization(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddJobOrganizationDto,
  ) {
    return this.organizations.add(tenantId, id, dto, actorId);
  }

  @Put(":id/organizations/:orgType")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Replace organization party for a type" })
  replaceOrganization(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("orgType") orgType: string,
    @Body() dto: ReplaceJobOrganizationDto,
  ) {
    const role = orgType.toUpperCase() as JobPartyRole;
    if (!Object.values(JobPartyRole).includes(role)) {
      throw new BadRequestException(`Invalid org_type: ${orgType}`);
    }
    return this.organizations.replace(tenantId, id, role, dto, actorId);
  }

  @Delete(":id/organizations/:orgType")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Unlink organization type from job" })
  removeOrganization(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("orgType") orgType: string,
  ) {
    const role = orgType.toUpperCase() as JobPartyRole;
    if (!Object.values(JobPartyRole).includes(role)) {
      throw new BadRequestException(`Invalid org_type: ${orgType}`);
    }
    return this.organizations.remove(tenantId, id, role, actorId);
  }

  @Post(":id/organizations/copy-from")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Copy organizations from parent (or source_job_id)",
  })
  copyOrganizations(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CopyJobOrganizationsDto,
  ) {
    return this.organizations.copyFromSource(tenantId, id, dto, actorId);
  }

  @Post(":id/organizations/refresh-snapshots")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Re-freeze party address/name snapshots from current master party data",
  })
  refreshOrgSnapshots(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RefreshOrgPartySnapshotDto,
  ) {
    return this.organizations.refreshPartySnapshots(
      tenantId,
      id,
      dto,
      actorId,
    );
  }

  @Patch(":id/dimensions")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Legacy: update job header commodity/hs on Dimension tab",
  })
  patchDimensions(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PatchJobDimensionsDto,
  ) {
    return this.detail.patchDimensions(tenantId, id, dto, actorId);
  }

  @Get(":id/dimensions")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List dimension lines" })
  listDimensions(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.dimensions.list(tenantId, id);
  }

  @Post(":id/dimensions")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add dimension line" })
  addDimension(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobDimensionLineDto,
  ) {
    return this.dimensions.add(tenantId, id, dto, actorId);
  }

  @Patch(":id/dimensions/:lineId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update dimension line" })
  updateDimension(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateJobDimensionLineDto,
  ) {
    return this.dimensions.update(tenantId, id, lineId, dto, actorId);
  }

  @Delete(":id/dimensions/:lineId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Soft-delete dimension line" })
  removeDimension(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
  ) {
    return this.dimensions.remove(tenantId, id, lineId, actorId);
  }

  @Put(":id/dimensions/bulk")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Multiple update dimension lines" })
  bulkDimensions(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: BulkJobDimensionsDto,
  ) {
    return this.dimensions.bulk(tenantId, id, dto, actorId);
  }

  @Get(":id/dimensions/upload-sample")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Download dimension upload sample Excel" })
  async dimensionUploadSample(@Res({ passthrough: true }) res: Response) {
    const file = await this.dimensions.downloadSample();
    res.setHeader("Content-Type", file.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`,
    );
    return new StreamableFile(file.buffer);
  }

  @Get(":id/dimensions/export")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Export dimension lines as CSV" })
  async exportDimensions(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.dimensions.exportCsv(tenantId, id);
    res.setHeader("Content-Type", file.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`,
    );
    return new StreamableFile(file.buffer);
  }

  @Post(":id/dimensions/upload")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        confirm: { type: "boolean" },
        replace_all: { type: "boolean" },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @ApiOperation({
    summary: "Upload dimensions Excel/CSV/text (preview unless confirm=true)",
  })
  uploadDimensions(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query("confirm") confirm?: string,
    @Query("replace_all") replaceAll?: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("file is required.");
    }
    return this.dimensions.uploadFile(
      tenantId,
      id,
      file,
      confirm === "true" || confirm === "1",
      replaceAll === "true" || replaceAll === "1",
      actorId,
    );
  }

  @Post(":id/dimensions/upload/paste")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Paste EDI Format / CSV text (Fresa upload paste flow)",
  })
  pasteDimensions(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PasteDimensionUploadDto,
  ) {
    return this.dimensions.uploadPaste(tenantId, id, dto, actorId);
  }

  @Post(":id/dimensions/upload/confirm")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Confirm previewed dimension upload rows" })
  confirmDimensionUpload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ConfirmDimensionUploadDto,
  ) {
    return this.dimensions.confirmUpload(tenantId, id, dto, actorId);
  }

  @Post(":id/dimensions/sync-to-cargo")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Sync dimension lines into JobCargo (create/update linked rows)",
  })
  syncDimensionsToCargo(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SyncDimensionsToCargoDto,
  ) {
    return this.dimensions.syncToCargo(tenantId, id, dto, actorId);
  }

  @Patch(":id/department")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Patch job department tab (branch/company/department/salesperson)",
  })
  patchDepartment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PatchJobDepartmentDto,
  ) {
    return this.tabPanels.patchDepartment(tenantId, id, dto, actorId);
  }

  @Post(":id/exchange-rates")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Upsert job exchange rate (optional apply_to_charges)",
  })
  upsertExchangeRate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobExchangeRateDto,
  ) {
    return this.tabPanels.upsertExchangeRate(tenantId, id, dto, actorId);
  }

  @Delete(":id/exchange-rates/:rateId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Soft-delete a job exchange rate row" })
  async deleteExchangeRate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("rateId", ParseUUIDPipe) rateId: string,
  ) {
    await this.tabPanels.deleteExchangeRate(tenantId, id, rateId, actorId);
  }

  @Post(":id/routing-legs")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add a job routing leg" })
  createRoutingLeg(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobRoutingLegDto,
  ) {
    return this.tabPanels.createRoutingLeg(tenantId, id, dto, actorId);
  }

  @Patch(":id/routing-legs/:legId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a job routing leg" })
  updateRoutingLeg(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("legId", ParseUUIDPipe) legId: string,
    @Body() dto: UpsertJobRoutingLegDto,
  ) {
    return this.tabPanels.updateRoutingLeg(tenantId, id, legId, dto, actorId);
  }

  @Delete(":id/routing-legs/:legId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Soft-delete a job routing leg" })
  async deleteRoutingLeg(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("legId", ParseUUIDPipe) legId: string,
  ) {
    await this.tabPanels.deleteRoutingLeg(tenantId, id, legId, actorId);
  }

  @Post(":id/customs-refs")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add customs / SB / BOE reference on job" })
  createCustomsRef(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobCustomsRefDto,
  ) {
    return this.tabPanels.createCustomsRef(tenantId, id, dto, actorId);
  }

  @Patch(":id/customs-refs/:refId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update customs / SB / BOE reference" })
  updateCustomsRef(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("refId", ParseUUIDPipe) refId: string,
    @Body() dto: UpsertJobCustomsRefDto,
  ) {
    return this.tabPanels.updateCustomsRef(tenantId, id, refId, dto, actorId);
  }

  @Delete(":id/customs-refs/:refId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Soft-delete customs / SB / BOE reference" })
  async deleteCustomsRef(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("refId", ParseUUIDPipe) refId: string,
  ) {
    await this.tabPanels.deleteCustomsRef(tenantId, id, refId, actorId);
  }

  @Get(":id/gpum")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW_GP)
  @ApiOperation({ summary: "GPUM allocations for job" })
  getGpum(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.gpum.get(tenantId, id);
  }

  @Put(":id/gpum")
  @RequirePermissions(JOBS_PERMISSIONS.GPUM_MANAGE)
  @ApiOperation({ summary: "Replace GPUM allocations (total must be 100%)" })
  putGpum(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PutJobGpumDto,
  ) {
    return this.gpum.put(tenantId, id, dto, actorId);
  }

  @Post(":id/containers/storage-charges/calculate")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Calculate storage/detention from slabs" })
  calculateStorageCharges(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CalculateStorageChargesDto,
  ) {
    return this.storageCosting.calculate(tenantId, id, dto);
  }

  @Post(":id/containers/storage-charges/confirm-to-costing")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Confirm storage lines into job costing" })
  confirmStorageToCosting(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ConfirmStorageChargesDto,
  ) {
    return this.storageCosting.confirmToCosting(tenantId, id, dto, actorId);
  }

  @Get(":id/charges/:chargeId/attachments")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List attachments on a costing line (optional ?side=SALE|COST|CHARGE)",
  })
  listChargeAttachments(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeId", ParseUUIDPipe) chargeId: string,
    @Query("side") side?: JobChargeAttachmentSide,
  ) {
    return this.chargeAttachments.list(tenantId, id, chargeId, side);
  }

  @Post(":id/charges/:chargeId/attachments")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Attach file metadata to costing line" })
  addChargeAttachment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeId", ParseUUIDPipe) chargeId: string,
    @Body() dto: CreateJobChargeAttachmentDto,
  ) {
    return this.chargeAttachments.create(tenantId, id, chargeId, dto, actorId);
  }

  @Post(":id/stop")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Stop / put job on hold (status → ON_HOLD)" })
  stopJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StopJobDto,
  ) {
    return this.detail.stop(tenantId, id, dto.reason, actorId);
  }

  @Get(":id")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Get a job with air details, charges, milestones, and its house jobs (if a master)",
  })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("permissions") permissions: string[],
    @CurrentUser("role") role: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id, permissions, {
      role,
      permissions,
    });
  }

  @Get(":id/house-jobs")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List the house jobs consolidated under this master job",
  })
  getHouseJobs(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getHouseJobs(tenantId, id);
  }

  @Get(":id/milestones")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List all milestones for a job" })
  getMilestones(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getMilestones(tenantId, id);
  }

  @Get(":id/pnl")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW_GP)
  @ApiOperation({
    summary:
      "Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)",
  })
  getPnl(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getPnl(tenantId, id);
  }

  @Get(":id/notes")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List notes on a job" })
  listNotes(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listNotes(tenantId, id);
  }

  @Get(":id/documents")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List documents attached to a job" })
  listDocuments(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listDocuments(tenantId, id);
  }

  @Get(":id/containers/fill")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Container fill indicators — weight % and CBM % for all containers",
  })
  getContainersFill(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getContainerFill(tenantId, id);
  }

  @Get(":id/containers/:containerId/fill")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Container fill indicator for one container" })
  getContainerFill(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
  ) {
    return this.service.getContainerFill(tenantId, id, containerId);
  }

  @Get(":id/cutoffs")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "SI / VGM / CY cutoff traffic-light status (green / amber ≤24h / red past)",
  })
  getCutoffStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getCutoffStatus(tenantId, id);
  }

  @Get(":id/cargo")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List cargo lines on a Sea FCL or Sea LCL job" })
  listCargo(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listCargo(tenantId, id);
  }

  @Get(":id/bills-of-lading")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List bills of lading on a Sea FCL job" })
  listBillsOfLading(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listBillsOfLading(tenantId, id);
  }

  @Get(":id/stuffing-records")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List stuffing records on a Sea FCL job" })
  listStuffingRecords(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listStuffingRecords(tenantId, id);
  }

  @Post()
  @RequirePermissions(JOBS_PERMISSIONS.CREATE)
  @ApiOperation({
    summary:
      "Create a job (booking). AIR_EXPORT auto-seeds 15 milestones; SEA_FCL_EXPORT auto-seeds 16 FCL milestones + sea_fcl_details. Set parent_job_id for a HOUSE job.",
  })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() dto: CreateJobDto,
  ) {
    return this.service.create(tenantId, dto, actorId, permissions);
  }

  @Post(["vendor-quotes/:quoteId/approve", "job-offers/:quoteId/approve"])
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Approve a vendor-priced quote" })
  approveVendorQuote(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("quoteId", ParseUUIDPipe) quoteId: string,
  ) {
    return this.vendorQuotes.decide(tenantId, quoteId, true, actorId);
  }

  @Post(["vendor-quotes/:quoteId/disapprove", "job-offers/:quoteId/disapprove"])
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Disapprove a vendor-priced quote" })
  disapproveVendorQuote(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("quoteId", ParseUUIDPipe) quoteId: string,
  ) {
    return this.vendorQuotes.decide(tenantId, quoteId, false, actorId);
  }

  @Patch(":id")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Update a job (not allowed once COMPLETED or CANCELLED)",
  })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Get(":id/close-checklist")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Close blockers: uninvoiced sale charges, unposted vouchers, open shipments",
  })
  getCloseChecklist(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getCloseChecklist(tenantId, id);
  }

  @Post(":id/close")
  @RequirePermissions(JOBS_PERMISSIONS.CLOSE)
  @ApiOperation({
    summary:
      "Close a job (status -> COMPLETED). Enforces close checklist unless force=true.",
  })
  closeJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CloseJobDto = {},
  ) {
    return this.service.closeJob(tenantId, id, actorId, dto);
  }

  @Post(":id/copy")
  @RequirePermissions(JOBS_PERMISSIONS.CREATE)
  @ApiOperation({
    summary:
      "Copy a job with selective flags (parties/route default on; containers/sale/cost/dimensions/department/vessel opt-in)",
  })
  copyJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CopyJobDto = {},
  ) {
    return this.service.copyJob(tenantId, id, dto, actorId);
  }

  @Get(":id/shipments")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List shipments attached to this job" })
  listJobShipments(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listJobShipments(tenantId, id);
  }

  @Post(":id/shipments/attach")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Attach existing shipment(s) to this master job" })
  attachJobShipments(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AttachJobShipmentsDto,
  ) {
    return this.service.attachJobShipments(tenantId, id, dto, actorId);
  }

  @Post(":id/shipments")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Attach existing shipment(s) and/or create a new shipment on this job",
  })
  attachOrCreateJobShipments(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: JobShipmentsBodyDto,
  ) {
    return this.service.attachJobShipments(tenantId, id, dto, actorId);
  }

  @Post(":id/cancel")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Cancel a job (status -> CANCELLED)" })
  cancelJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.cancelJob(tenantId, id, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a completed or cancelled job" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  @Patch(":id/air-details")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update Air Export / Air Import booking fields" })
  updateAirDetails(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAirJobDetailDto,
  ) {
    return this.service.updateAirDetails(tenantId, id, dto, actorId);
  }

  @Patch(":id/sea-fcl-details")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs, VGM/SI)",
  })
  updateSeaFclDetails(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeaFclJobDetailDto,
  ) {
    return this.service.updateSeaFclDetails(tenantId, id, dto, actorId);
  }

  @Post(":id/sea-fcl-details/si-submission")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Record SI submission (date + version) and mark SI_SUBMITTED milestone",
  })
  submitSi(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitSiDto,
  ) {
    return this.service.submitSi(tenantId, id, dto, actorId);
  }

  @Post(":id/sea-fcl-details/vgm-submission")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Record VGM submission (date + SM1/SM2) and mark VGM_SUBMITTED milestone",
  })
  submitVgm(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitVgmDto,
  ) {
    return this.service.submitVgm(tenantId, id, dto, actorId);
  }

  @Patch(":id/sea-lcl-details")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Update Sea LCL-specific booking fields (CFS, consolidation, BL, customs, storage)",
  })
  updateSeaLclDetails(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeaLclJobDetailDto,
  ) {
    return this.service.updateSeaLclDetails(tenantId, id, dto, actorId);
  }

  @Post(":id/sea-lcl-details/si-submission")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Record LCL SI submission and mark SI_SUBMITTED milestone",
  })
  submitLclSi(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitLclSiDto,
  ) {
    return this.service.submitLclSi(tenantId, id, dto, actorId);
  }

  @Get(":id/lcl-consolidation")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "LCL master consolidation summary — house totals by weight/CBM/pieces",
  })
  getLclConsolidation(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaLcl.getConsolidation(tenantId, id);
  }

  @Post(":id/lcl/attach-house")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Attach an existing house LCL job under this master MBL",
  })
  attachLclHouse(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AttachLclHouseDto,
  ) {
    return this.seaLcl.attachHouse(tenantId, id, dto, actorId);
  }

  @Post(":id/lcl/detach-house/:houseJobId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Detach a house LCL job from this master" })
  detachLclHouse(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("houseJobId", ParseUUIDPipe) houseJobId: string,
  ) {
    return this.seaLcl.detachHouse(tenantId, id, houseJobId, actorId);
  }

  @Post(":id/lcl/milestones/cargo-received-at-cfs")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Mark CARGO_RECEIVED_AT_CFS on LCL export house/master",
  })
  markLclCargoReceivedAtCfs(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaLcl.markCargoReceivedAtCfs(tenantId, id, actorId);
  }

  @Post(":id/lcl/milestones/consolidation-started")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Mark CONSOLIDATION_STARTED on LCL export master" })
  markLclConsolidationStarted(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaLcl.markConsolidationStarted(tenantId, id, actorId);
  }

  @Post(":id/lcl/milestones/cfs-stuffing-completed")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Mark CFS_STUFFING_COMPLETED on LCL export job" })
  markLclCfsStuffingCompleted(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaLcl.markCfsStuffingCompleted(tenantId, id, actorId);
  }

  @Post(":id/lcl/milestones/cfs-devanning-completed")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Mark CFS_DEVANNING_COMPLETED on LCL import job" })
  markLclCfsDevanningCompleted(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaLcl.markCfsDevanningCompleted(tenantId, id, actorId);
  }

  @Post(":id/lcl/transhipment-link")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Link LCL Import job to an outbound SEA_LCL_EXPORT or SEA_FCL_EXPORT job",
  })
  linkLclTranshipment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LinkLclTranshipmentDto,
  ) {
    return this.seaLclImport.linkTranshipment(tenantId, id, dto, actorId);
  }

  @Post(":id/lcl/wms-storage-link")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Link Week 17 WMS storage charge to LCL import job for CFS billing",
  })
  linkLclWmsStorage(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LinkLclWmsStorageDto,
  ) {
    return this.seaLclImport.linkWmsStorageCharge(tenantId, id, dto, actorId);
  }

  @Post(":id/lcl/cfs-storage/calculate")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Calculate LCL CFS storage from sea-lcl-details or linked WMS charge",
  })
  calculateLclCfsStorage(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LclCfsStorageCalculationDto,
  ) {
    return this.seaLclImport.calculateCfsStorage(tenantId, id, dto);
  }

  @Post(":id/lcl/cfs-storage-invoice")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Create DRAFT CFS storage invoice for LCL import job",
  })
  createLclCfsStorageInvoice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaLclImport.createCfsStorageInvoice(tenantId, id, actorId);
  }

  @Patch(":id/land-details")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update Land / trucking booking fields" })
  updateLandDetails(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLandJobDetailDto,
  ) {
    return this.land.updateDetails(tenantId, id, dto, actorId);
  }

  @Post(":id/land/assign-trucker")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Assign a trucker to a LAND job and mark PICKUP_SCHEDULED",
  })
  assignLandTrucker(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignLandTruckerDto,
  ) {
    return this.land.assignTrucker(tenantId, id, dto, actorId);
  }

  @Post(":id/land/pickup")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Record land cargo pickup" })
  recordLandPickup(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RecordLandPickupDto,
  ) {
    return this.land.recordPickup(tenantId, id, dto, actorId);
  }

  @Post(":id/land/border-crossing")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Record land border crossing / customs cleared at border",
  })
  recordLandBorderCrossing(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RecordLandBorderCrossingDto,
  ) {
    return this.land.recordBorderCrossing(tenantId, id, dto, actorId);
  }

  @Patch(":id/land/cross-border")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Upsert cross-border declaration fields on a LAND job",
  })
  upsertLandCrossBorder(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLandJobDetailDto,
  ) {
    return this.land.upsertCrossBorder(tenantId, id, dto, actorId);
  }

  @Post(":id/land/pod")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Record LAND proof of delivery" })
  createLandPod(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateLandPodDto,
  ) {
    return this.land.createPod(tenantId, id, dto, actorId);
  }

  @Patch(":id/road-freight-details")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update Road Freight booking fields" })
  updateRoadFreightDetails(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoadFreightJobDetailDto,
  ) {
    return this.roadFreight.updateDetails(tenantId, id, dto, actorId);
  }

  @Post(":id/road-freight/assign-trucker")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Assign a trucker to a ROAD_FREIGHT job and mark PICKUP_SCHEDULED",
  })
  assignRoadFreightTrucker(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignRoadFreightTruckerDto,
  ) {
    return this.roadFreight.assignTrucker(tenantId, id, dto, actorId);
  }

  @Post(":id/road-freight/pickup")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Record road freight cargo pickup" })
  recordRoadFreightPickup(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RecordRoadFreightPickupDto,
  ) {
    return this.roadFreight.recordPickup(tenantId, id, dto, actorId);
  }

  @Post(":id/road-freight/border-crossing")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Record road freight border crossing / customs cleared at border",
  })
  recordRoadFreightBorderCrossing(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RecordRoadFreightBorderCrossingDto,
  ) {
    return this.roadFreight.recordBorderCrossing(tenantId, id, dto, actorId);
  }

  @Patch(":id/road-freight/cross-border")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Upsert cross-border declaration fields on a ROAD_FREIGHT job",
  })
  upsertRoadFreightCrossBorder(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoadFreightJobDetailDto,
  ) {
    return this.roadFreight.upsertCrossBorder(tenantId, id, dto, actorId);
  }

  @Post(":id/road-freight/pod")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Record ROAD_FREIGHT proof of delivery" })
  createRoadFreightPod(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateRoadFreightPodDto,
  ) {
    return this.roadFreight.createPod(tenantId, id, dto, actorId);
  }


  @Patch(":id/courier-details")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update Courier booking fields" })
  updateCourierDetails(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourierJobDetailDto,
  ) {
    return this.courier.updateDetails(tenantId, id, dto, actorId);
  }

  @Post(":id/courier/confirm-booking")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Confirm courier booking and generate tracking / barcode",
  })
  confirmCourierBooking(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ConfirmCourierBookingDto,
  ) {
    return this.courier.confirmBooking(tenantId, id, dto, actorId);
  }

  @Get(":id/courier/checkpoints")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List courier delivery checkpoints" })
  listCourierCheckpoints(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.courier.listCheckpoints(tenantId, id);
  }

  @Post(":id/courier/scan-checkpoint")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Scan a courier barcode / checkpoint and update milestones",
  })
  scanCourierCheckpoint(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ScanCourierCheckpointDto,
  ) {
    return this.courier.scanCheckpoint(tenantId, id, dto, actorId);
  }

  @Post(":id/courier/link-export")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Link this courier job to an outbound COURIER job" })
  linkCourierExport(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LinkCourierJobDto,
  ) {
    return this.courier.linkExport(tenantId, id, dto, actorId);
  }

  @Post(":id/courier/link-import")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Link this courier job to an inbound COURIER job" })
  linkCourierImport(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LinkCourierJobDto,
  ) {
    return this.courier.linkImport(tenantId, id, dto, actorId);
  }

  @Post(":id/courier/pod")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Record COURIER proof of delivery" })
  createCourierPod(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateCourierPodDto,
  ) {
    return this.courier.createPod(tenantId, id, dto, actorId);
  }

  @Post(":id/transport-requests")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Create a transport request on any job type" })
  createTransportRequest(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateTransportRequestDto,
  ) {
    return this.transport.createForJob(tenantId, id, dto, actorId);
  }

  @Get(":id/transport-requests")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List transport requests for a job" })
  listTransportRequests(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.transport.listForJob(tenantId, id);
  }

  @Patch(":id/milestones/:milestoneId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Update a milestone — set actual_date to mark it complete",
  })
  completeMilestone(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("milestoneId", ParseUUIDPipe) milestoneId: string,
    @Body() dto: UpdateJobMilestoneDto,
  ) {
    return this.service.completeMilestone(
      tenantId,
      id,
      milestoneId,
      dto,
      actorId,
    );
  }

  @Post(":id/milestones")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add a custom milestone outside the standard taxonomy",
  })
  addCustomMilestone(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateCustomMilestoneDto,
  ) {
    return this.service.addCustomMilestone(tenantId, id, dto, actorId);
  }

  @Get(":id/charges")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List job charge lines (costing grid)" })
  listCharges(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.costing.listCharges(tenantId, id);
  }

  @Post(":id/charges")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add a charge line — Job P&L recalculates automatically",
  })
  addCharge(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateJobChargeDto,
  ) {
    return this.service.addCharge(tenantId, id, dto, actorId);
  }

  @Post(":id/charges/composite")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add paired charge + sale + cost line (Fresa Costing Add)",
  })
  addCompositeCharge(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CompositeJobChargeDto,
  ) {
    return this.costing.addComposite(tenantId, id, dto, actorId);
  }

  @Get(":id/charges/history")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Job costing revision history (all lines)" })
  chargeHistory(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.costing.getHistory(tenantId, id);
  }

  @Get(":id/charges/:chargeId/history")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Costing revision history for one charge line" })
  chargeLineHistory(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeId", ParseUUIDPipe) chargeId: string,
  ) {
    return this.costing.getHistory(tenantId, id, chargeId);
  }

  @Patch(":id/charges/:chargeId/sale")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Patch sale side of a costing line" })
  patchChargeSale(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeId", ParseUUIDPipe) chargeId: string,
    @Body() dto: SaleSectionDto,
  ) {
    return this.costing.patchSale(tenantId, id, chargeId, dto, actorId);
  }

  @Patch(":id/charges/:chargeId/cost")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Patch cost side of a costing line" })
  patchChargeCost(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeId", ParseUUIDPipe) chargeId: string,
    @Body() dto: CostSectionDto,
  ) {
    return this.costing.patchCost(tenantId, id, chargeId, dto, actorId);
  }

  @Post(":id/get-charges")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Pull standard / quotation charges onto job (Fresa Get Charges)",
  })
  getCharges(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GetJobChargesDto,
  ) {
    return this.service.getCharges(tenantId, id, dto, actorId);
  }

  @Post(":id/get-job-charges")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Get Job Charges from shipment (preview when confirm=false; submit when true)",
  })
  getJobChargesFromShipment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GetJobChargesFromShipmentDto,
  ) {
    return this.costing.getJobChargesFromShipment(tenantId, id, dto, actorId);
  }

  @Post(":id/copy-charges")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Copy charges from another job, shipment, or quotation (Fresa Copy Charges)",
  })
  copyCharges(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CopyJobChargesDto,
  ) {
    return this.service.copyCharges(tenantId, id, dto, actorId);
  }

  @Post(":id/profit-share/preview")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW_GP)
  @ApiOperation({ summary: "Profit share calculator preview" })
  profitSharePreview(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ProfitSharePreviewDto,
  ) {
    return this.profitShare.preview(tenantId, id, dto);
  }

  @Post(":id/profit-share/add")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add profit share charge line from calculator" })
  profitShareAdd(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ProfitShareAddDto,
  ) {
    return this.profitShare.add(tenantId, id, dto, actorId);
  }

  @Get(":id/vouchers")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List vouchers linked to this job" })
  listJobVouchers(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.costing.listVouchers(tenantId, id);
  }

  @Post(":id/vouchers/generate")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Generate draft voucher from selected charge lines" })
  generateJobVoucher(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobVoucherDto,
  ) {
    return this.costing.generateVoucher(tenantId, id, dto, actorId);
  }

  @Post(":id/invoices/sale")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Generate sale invoice from selected (or all) billable sale lines",
  })
  generateSaleInvoice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: JobInvoiceFromChargesDto,
  ) {
    return this.costing.createSaleInvoice(tenantId, id, dto ?? {}, actorId);
  }

  @Post(":id/invoices/purchase")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Generate purchase invoice from selected (or all) cost lines",
  })
  generatePurchaseInvoice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: JobInvoiceFromChargesDto,
  ) {
    return this.costing.createPurchaseInvoice(tenantId, id, dto ?? {}, actorId);
  }

  @Get(":id/pnl/custom-duty")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW_GP)
  @ApiOperation({ summary: "Job profit sheet filtered for custom duty charges" })
  customDutyPnl(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.costing.getCustomDutyPnl(tenantId, id);
  }

  @Patch(":id/charges/:chargeId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a charge line" })
  updateCharge(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeId", ParseUUIDPipe) chargeId: string,
    @Body() dto: UpdateJobChargeDto,
  ) {
    return this.service.updateCharge(tenantId, id, chargeId, dto, actorId);
  }

  @Delete(":id/charges/:chargeId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a charge line" })
  async removeCharge(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeId", ParseUUIDPipe) chargeId: string,
  ) {
    await this.service.removeCharge(tenantId, id, chargeId);
  }

  @Post(":id/prorate-cost/:chargeCodeId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Distribute a master job's cost line to house jobs (or attached shipments if no houses)",
  })
  prorateMasterCost(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeCodeId", ParseUUIDPipe) chargeCodeId: string,
  ) {
    return this.service.prorateMasterCost(tenantId, id, chargeCodeId, actorId);
  }

  @Post(":id/prorate-to-shipments")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Prorate a master job cost line onto attached shipments (weight/CBM/kg) as ShipmentCharge",
  })
  prorateToShipments(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ProrateToShipmentsDto,
  ) {
    return this.service.prorateToShipments(tenantId, id, dto, actorId);
  }

  @Post(":id/cancel-prorate")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Cancel prorated ShipmentCharge lines written from this job's cost charges",
  })
  cancelProrate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CancelProrateDto = {},
  ) {
    return this.service.cancelProrate(tenantId, id, dto, actorId);
  }

  @Post(":id/notes")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add a note to a job" })
  addNote(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateJobNoteDto,
  ) {
    return this.service.addNote(tenantId, id, dto, actorId);
  }

  @Patch(":id/notes/:noteId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a job note" })
  updateNote(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("noteId", ParseUUIDPipe) noteId: string,
    @Body() dto: UpdateJobNoteDto,
  ) {
    return this.service.updateNote(tenantId, id, noteId, dto, actorId);
  }

  @Delete(":id/notes/:noteId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a job note" })
  async removeNote(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("noteId", ParseUUIDPipe) noteId: string,
  ) {
    await this.service.removeNote(tenantId, id, noteId, actorId);
  }

  @Post(":id/documents")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Register a document on a job (metadata + file URL)",
  })
  addDocument(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateJobDocumentDto,
  ) {
    return this.service.addDocument(tenantId, id, dto, actorId);
  }

  @Patch(":id/documents/:documentId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a draft document metadata" })
  updateDocument(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Body() dto: UpdateJobDocumentDto,
  ) {
    return this.service.updateDocument(tenantId, id, documentId, dto, actorId);
  }

  @Post(":id/documents/:documentId/finalize")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Finalize a document (DRAFT -> ORIGINAL, locked)" })
  finalizeDocument(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Body() dto: FinalizeJobDocumentDto,
  ) {
    return this.service.finalizeDocument(
      tenantId,
      id,
      documentId,
      dto,
      actorId,
    );
  }

  @Delete(":id/documents/:documentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a draft document" })
  async removeDocument(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("documentId", ParseUUIDPipe) documentId: string,
  ) {
    await this.service.removeDocument(tenantId, id, documentId, actorId);
  }

  @Get(":id/documents/generation-status")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List async document generation tasks for a job" })
  getDocumentGenerationStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getDocumentGenerationStatus(tenantId, id);
  }

  @Post(":id/documents/hawb")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue HAWB PDF generation (Puppeteer + BullMQ)" })
  generateHawb(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, "HAWB", dto, actorId);
  }

  @Post(":id/documents/mawb")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue MAWB PDF generation (Puppeteer + BullMQ)" })
  generateMawb(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, "MAWB", dto, actorId);
  }

  @Post(":id/documents/pre-alert")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue pre-alert document PDF generation" })
  generatePreAlertDoc(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "PRE_ALERT",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/cargo-manifest")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue cargo manifest PDF generation" })
  generateCargoManifest(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "CARGO_MANIFEST",
      dto,
      actorId,
    );
  }

  // ── Week 8 — Sea FCL Export documents (Ch.10 / Ch.16) ──────────────────────

  @Post(":id/documents/hbl")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Queue HBL draft/original PDF (layout_variant: STANDARD | LAYOUT_A | LAYOUT_B)",
  })
  generateHbl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, "HBL", dto, actorId);
  }

  @Post(":id/documents/hbl-express-release")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Queue Non-Negotiable HBL Express/Telex Release PDF",
  })
  generateHblExpressRelease(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "HBL_EXPRESS_RELEASE",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/mbl")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Master BL / OBL PDF" })
  generateMbl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, "MBL", dto, actorId);
  }

  @Post(":id/documents/fiata-bl")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue FIATA FBL PDF" })
  generateFiataBl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "FIATA_BL",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/rider-bl")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Queue Rider/Addendum to BL PDF (pass rider_terms)",
  })
  generateRiderBl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "RIDER_BL",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/switch-bl")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Queue Switch BL PDF (switched_from_bl_number + switch consignee/notify)",
  })
  generateSwitchBl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "SWITCH_BL",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/proxy-bl")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Queue Proxy BL PDF (proxy_forwarder_name / address)",
  })
  generateProxyBl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "PROXY_BL",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/back-to-back-bl")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Back-to-Back BL PDF (master + house pair)" })
  generateBackToBackBl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "BACK_TO_BACK_BL",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/surrender-notice")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue BL Surrender Notice PDF" })
  generateSurrenderNotice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "SURRENDER_NOTICE",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/si")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Shipping Instruction (SI) PDF" })
  generateShippingInstruction(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "SHIPPING_INSTRUCTION",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/stuffing-report")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Queue Stuffing Report PDF from stuffing records + containers",
  })
  generateStuffingReport(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "STUFFING_REPORT",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/sailing-confirmation")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Queue Sailing Confirmation PDF (uses sailed_at / vessel sailed milestone)",
  })
  generateSailingConfirmation(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "SAILING_CONFIRMATION",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/transhipment-confirmation")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Transhipment Confirmation PDF" })
  generateTranshipmentConfirmation(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "TRANSHIPMENT_CONFIRMATION",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/freight-manifest")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Freight Manifest PDF (FCL)" })
  generateFreightManifest(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "FREIGHT_MANIFEST",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/booking-confirmation")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Booking Confirmation PDF" })
  generateBookingConfirmation(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "BOOKING_CONFIRMATION",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/job-card")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Job Card PDF" })
  generateJobCard(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "JOB_CARD",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/job-pnl")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW_GP)
  @ApiOperation({ summary: "Queue Job P&L Statement PDF" })
  generateJobPnl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, "JOB_PNL", dto, actorId);
  }

  @Post(":id/documents/job-pnl-custom-duty")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW_GP)
  @ApiOperation({ summary: "Queue Job P&L Custom Duty PDF" })
  generateJobPnlCustomDuty(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "JOB_PNL_CUSTOM_DUTY",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/proforma-invoice")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Proforma Invoice PDF for the job" })
  generateProformaInvoice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "PROFORMA_INVOICE",
      dto,
      actorId,
    );
  }

  @Post(":id/pre-alert/send")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Send pre-alert and mark PRE_ALERT_SENT milestone complete",
  })
  sendPreAlert(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendPreAlertDto,
  ) {
    return this.service.sendPreAlert(tenantId, id, dto, actorId);
  }

  @Post(":id/pre-alert/schedule")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Schedule a pre-alert email for a future UTC time (cron delivers it)",
  })
  schedulePreAlert(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SchedulePreAlertDto,
  ) {
    return this.service.schedulePreAlert(tenantId, id, dto, actorId);
  }

  @Post(":id/whatsapp/status")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Send WhatsApp status stub (logged until WHATSAPP_ENABLED=true)",
  })
  sendWhatsApp(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendWhatsAppStatusDto,
  ) {
    return this.service.sendWhatsAppStatus(tenantId, id, dto, actorId);
  }

  @Get(":id/sub-jobs")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List operational sub-jobs under this parent" })
  listSubJobs(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listSubJobs(tenantId, id);
  }

  @Post(":id/sub-jobs")
  @RequirePermissions(JOBS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Create an operational sub-job under this parent" })
  createSubJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateSubJobDto,
  ) {
    return this.service.createSubJob(tenantId, id, dto, actorId);
  }

  @Post(":id/payment-requests")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Create a payment request from job totals / parties",
  })
  createPaymentRequestFromJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreatePaymentRequestFromJobDto,
  ) {
    return this.service.createPaymentRequestFromJob(tenantId, id, dto, actorId);
  }

  @Post(":id/documents/e-awb")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue E-AWB PDF generation" })
  generateEawb(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, "E_AWB", dto, actorId);
  }

  @Post(":id/documents/barcode-label")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue barcode label PDF" })
  generateBarcodeLabel(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "BARCODE_LABEL",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/cross-border-declaration")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Cross-Border Declaration PDF (LAND)" })
  generateCrossBorderDeclaration(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "CROSS_BORDER_DECLARATION",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/customs-transit")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Customs Transit Document PDF (LAND)" })
  generateCustomsTransit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "CUSTOMS_TRANSIT",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/delivery-note")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Delivery Note PDF (COURIER)" })
  generateDeliveryNote(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "DELIVERY_NOTE",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/courier-report")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Courier Report PDF" })
  generateCourierReport(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "COURIER_REPORT",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/consignee-label")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue consignee label PDF" })
  generateConsigneeLabel(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "CONSIGNEE_LABEL",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/job-costing")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue job costing sheet PDF" })
  generateJobCosting(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "JOB_COSTING",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/freight-certificate")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue freight certificate PDF" })
  generateFreightCertificate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "FREIGHT_CERTIFICATE",
      dto,
      actorId,
    );
  }

  @Get(":id/containers")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List job containers (all modes)" })
  listContainers(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Query("kind") kind?: string,
  ) {
    const k =
      kind?.toUpperCase() === "PLANNED"
        ? ("PLANNED" as const)
        : kind?.toUpperCase() === "ACTUAL"
          ? ("ACTUAL" as const)
          : undefined;
    return this.containerTab.list(tenantId, id, k);
  }

  @Get(":id/containers/upload-sample")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Download container upload sample Excel" })
  async containerUploadSample(@Res({ passthrough: true }) res: Response) {
    const file = await this.containerTab.downloadSample();
    res.setHeader("Content-Type", file.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`,
    );
    return new StreamableFile(file.buffer);
  }

  @Get(":id/containers/export")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Export containers as CSV" })
  async exportContainers(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.containerTab.exportCsv(tenantId, id);
    res.setHeader("Content-Type", file.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`,
    );
    return new StreamableFile(file.buffer);
  }

  @Post(":id/containers")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add a container to a job (any mode)" })
  addContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateJobContainerDto,
  ) {
    return this.containerTab.add(tenantId, id, dto, actorId);
  }

  @Put(":id/containers/bulk")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Multiple update containers" })
  bulkContainers(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: BulkJobContainersDto,
  ) {
    return this.containerTab.bulk(tenantId, id, dto, actorId);
  }

  @Post(":id/containers/upload")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @ApiOperation({
    summary: "Upload containers Excel/CSV (preview unless confirm=true)",
  })
  uploadContainers(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query("confirm") confirm?: string,
    @Query("replace_all") replaceAll?: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("file is required.");
    }
    return this.containerTab.uploadFile(
      tenantId,
      id,
      file,
      confirm === "true" || confirm === "1",
      replaceAll === "true" || replaceAll === "1",
      actorId,
    );
  }

  @Post(":id/containers/upload/paste")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Paste CSV text for container upload" })
  pasteContainers(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PasteContainerUploadDto,
  ) {
    return this.containerTab.uploadPaste(tenantId, id, dto, actorId);
  }

  @Post(":id/containers/upload/confirm")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Confirm previewed container upload rows" })
  confirmContainerUpload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ConfirmContainerUploadDto,
  ) {
    return this.containerTab.confirmUpload(tenantId, id, dto, actorId);
  }

  @Patch(":id/containers/job-details")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update job details from Container tab" })
  updateJobDetailsFromContainerTab(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDetailsFromContainerTabDto,
  ) {
    return this.containerTab.updateJobDetails(tenantId, id, dto, actorId);
  }

  @Post(":id/containers/sync-from-sub-jobs")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Update master containers from sub-job details (Fresa)",
  })
  syncContainersFromSubJobs(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SyncContainersFromSubJobsDto,
  ) {
    return this.containerTab.syncFromSubJobs(tenantId, id, dto, actorId);
  }

  @Get(":id/containers/:containerId")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "View a single container" })
  getContainer(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
  ) {
    return this.containerTab.getOne(tenantId, id, containerId);
  }

  @Patch(":id/containers/:containerId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a container on a job" })
  updateContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
    @Body() dto: UpdateJobContainerDto,
  ) {
    return this.containerTab.update(
      tenantId,
      id,
      containerId,
      dto,
      actorId,
    );
  }

  @Delete(":id/containers/:containerId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a container from a job" })
  async removeContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
  ) {
    return this.containerTab.remove(tenantId, id, containerId, actorId);
  }

  @Post(":id/containers/:containerId/cargo")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Assign an existing cargo line to a container" })
  assignCargoToContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
    @Body() dto: AssignCargoToContainerDto,
  ) {
    return this.service.assignCargoToContainer(
      tenantId,
      id,
      containerId,
      dto,
      actorId,
    );
  }

  @Post(":id/containers/:containerId/split")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Split one container across multiple house consignees (co-loading)",
  })
  splitContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
    @Body() dto: SplitContainerDto,
  ) {
    return this.service.splitContainer(tenantId, id, containerId, dto, actorId);
  }

  @Post(":id/cargo")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add a cargo line on Sea FCL (optional container) or Sea LCL job",
  })
  addCargo(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateJobCargoDto,
  ) {
    return this.service.addCargo(tenantId, id, dto, actorId);
  }

  @Patch(":id/cargo/:cargoId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update an FCL cargo line" })
  updateCargo(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("cargoId", ParseUUIDPipe) cargoId: string,
    @Body() dto: UpdateJobCargoDto,
  ) {
    return this.service.updateCargo(tenantId, id, cargoId, dto, actorId);
  }

  @Delete(":id/cargo/:cargoId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove an FCL cargo line" })
  async removeCargo(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("cargoId", ParseUUIDPipe) cargoId: string,
  ) {
    await this.service.removeCargo(tenantId, id, cargoId, actorId);
  }

  @Post(":id/bills-of-lading")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Create a bill of lading data record (PDF variants are Week 8)",
  })
  createBillOfLading(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateBillOfLadingDto,
  ) {
    return this.service.createBillOfLading(tenantId, id, dto, actorId);
  }

  @Patch(":id/bills-of-lading/:blId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Update a bill of lading (draft → original / surrendered flags)",
  })
  updateBillOfLading(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("blId", ParseUUIDPipe) blId: string,
    @Body() dto: UpdateBillOfLadingDto,
  ) {
    return this.service.updateBillOfLading(tenantId, id, blId, dto, actorId);
  }

  @Delete(":id/bills-of-lading/:blId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Soft-delete a bill of lading" })
  async removeBillOfLading(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("blId", ParseUUIDPipe) blId: string,
  ) {
    await this.service.removeBillOfLading(tenantId, id, blId, actorId);
  }

  @Post(":id/stuffing-records")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Create a stuffing record and mark STUFFING_COMPLETED",
  })
  createStuffingRecord(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateStuffingRecordDto,
  ) {
    return this.service.createStuffingRecord(tenantId, id, dto, actorId);
  }

  @Patch(":id/stuffing-records/:recordId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a stuffing record" })
  updateStuffingRecord(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("recordId", ParseUUIDPipe) recordId: string,
    @Body() dto: UpdateStuffingRecordDto,
  ) {
    return this.service.updateStuffingRecord(
      tenantId,
      id,
      recordId,
      dto,
      actorId,
    );
  }

  @Delete(":id/stuffing-records/:recordId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Soft-delete a stuffing record" })
  async removeStuffingRecord(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("recordId", ParseUUIDPipe) recordId: string,
  ) {
    await this.service.removeStuffingRecord(tenantId, id, recordId, actorId);
  }

  // ── Week 9 — Sea FCL Import (Ch.11) ────────────────────────────────────────

  @Get(":id/free-days")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "List per-container free days + demurrage/detention accrual (traffic light)",
  })
  listFreeDays(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaFclImport.listFreeDays(tenantId, id);
  }

  @Post(":id/free-days")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Upsert free-days / demurrage rates for a container",
  })
  upsertFreeDays(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertContainerFreeDaysDto,
  ) {
    return this.seaFclImport.upsertFreeDays(tenantId, id, dto, actorId);
  }

  @Post(":id/free-days/recalculate")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Recalculate demurrage + detention accruals for all containers on the job",
  })
  recalculateDemurrage(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaFclImport.recalculateDemurrage(tenantId, id);
  }

  @Get(":id/deposits")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List customs / port deposits with expiry alert bands",
  })
  listDeposits(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaFclImport.listDeposits(tenantId, id);
  }

  @Post(":id/deposits")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Create a customs or port deposit record" })
  createDeposit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateJobDepositDto,
  ) {
    return this.seaFclImport.createDeposit(tenantId, id, dto, actorId);
  }

  @Patch(":id/deposits/:depositId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a deposit" })
  updateDeposit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("depositId", ParseUUIDPipe) depositId: string,
    @Body() dto: UpdateJobDepositDto,
  ) {
    return this.seaFclImport.updateDeposit(
      tenantId,
      id,
      depositId,
      dto,
      actorId,
    );
  }

  @Delete(":id/deposits/:depositId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Soft-delete a deposit" })
  async removeDeposit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("depositId", ParseUUIDPipe) depositId: string,
  ) {
    await this.seaFclImport.removeDeposit(tenantId, id, depositId, actorId);
  }

  @Patch(":id/customs-status")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Update customs clearance workflow (PENDING→FILED→QUERY→CLEARED→RELEASED)",
  })
  updateCustomsStatus(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomsStatusDto,
  ) {
    return this.seaFclImport.updateCustomsStatus(tenantId, id, dto, actorId);
  }

  @Post(":id/containers/:containerId/return")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Record container return to shipping line" })
  returnContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
    @Body() dto: ReturnContainerDto,
  ) {
    return this.seaFclImport.returnContainer(
      tenantId,
      id,
      containerId,
      dto,
      actorId,
    );
  }

  @Get(":id/part-deliveries")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List part deliveries" })
  listPartDeliveries(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaFclImport.listPartDeliveries(tenantId, id);
  }

  @Post(":id/part-deliveries")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Record a part delivery (remaining balance auto-calculated from job pieces)",
  })
  createPartDelivery(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreatePartDeliveryDto,
  ) {
    return this.seaFclImport.createPartDelivery(tenantId, id, dto, actorId);
  }

  @Get(":id/pods")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List proofs of delivery" })
  listPods(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaFclImport.listPods(tenantId, id);
  }

  @Post(":id/pods")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Record proof of delivery" })
  createPod(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateProofOfDeliveryDto,
  ) {
    return this.seaFclImport.createPod(tenantId, id, dto, actorId);
  }

  @Get(":id/damage-reports")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List damage reports" })
  listDamageReports(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.seaFclImport.listDamageReports(tenantId, id);
  }

  @Post(":id/damage-reports")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Create a damage report (description + photo URLs + survey #)",
  })
  createDamageReport(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateDamageReportDto,
  ) {
    return this.seaFclImport.createDamageReport(tenantId, id, dto, actorId);
  }

  @Post(":id/transhipment-link")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Link this FCL Import job to an outbound SEA_FCL_EXPORT job",
  })
  linkTranshipment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LinkTranshipmentDto,
  ) {
    return this.seaFclImport.linkTranshipment(tenantId, id, dto, actorId);
  }

  @Post(":id/cfs-storage/calculate")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Calculate CFS storage: days × rate_per_day from sea-fcl-details",
  })
  calculateCfsStorage(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CalculateCfsStorageDto,
  ) {
    return this.seaFclImport.calculateCfsStorage(tenantId, id, dto);
  }

  @Post(":id/documents/pre-can")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Pre-CAN (pre-arrival notice) PDF" })
  generatePreCan(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, "PRE_CAN", dto, actorId);
  }

  @Post(":id/documents/can")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Queue Cargo Arrival Notice (CAN) PDF and mark CAN_SENT",
  })
  generateCan(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateImportDocument(
      tenantId,
      id,
      "CAN",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/exchange-letter")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Exchange Letter PDF" })
  generateExchangeLetter(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "EXCHANGE_LETTER",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/undertake-letter")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Undertake Letter PDF" })
  generateUndertakeLetter(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "UNDERTAKE_LETTER",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/delivery-order")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Delivery Order PDF and mark DO_ISSUED" })
  generateDeliveryOrder(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateImportDocument(
      tenantId,
      id,
      "DELIVERY_ORDER",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/transport-request")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Transport Request PDF" })
  generateTransportRequest(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "TRANSPORT_REQUEST",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/shipping-advice")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Shipping Advice PDF" })
  generateShippingAdvice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "SHIPPING_ADVICE",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/proof-of-delivery")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Queue Proof of Delivery PDF" })
  generatePodDocument(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(
      tenantId,
      id,
      "PROOF_OF_DELIVERY",
      dto,
      actorId,
    );
  }

  // ── Week 15 — Air Import (Ch.9) ───────────────────────────────────────────

  @Get(":id/customs-examinations")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List customs examination records (AIR_IMPORT or CUSTOMS_CLEARANCE)",
  })
  listCustomsExaminations(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.airImport.listCustomsExaminations(tenantId, id);
  }

  @Post(":id/customs-examinations")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Record a customs examination (AIR_IMPORT or CUSTOMS_CLEARANCE)",
  })
  createCustomsExamination(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateCustomsExaminationDto,
  ) {
    return this.airImport.createCustomsExamination(tenantId, id, dto, actorId);
  }

  @Get(":id/storage-calculation")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Calculate air import storage charges (AIR_IMPORT)",
  })
  calculateAirStorage(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: AirStorageCalculationQueryDto,
  ) {
    return this.airImport.calculateStorage(tenantId, id, query);
  }

  @Post(":id/storage-invoice")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Create DRAFT storage invoice from air import calculator (AIR_IMPORT)",
  })
  createAirStorageInvoice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.airImport.createStorageInvoice(tenantId, id, actorId);
  }

  @Post(":id/air-transhipment-link")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Link AIR_IMPORT job to outbound AIR_EXPORT or SEA_FCL_EXPORT job",
  })
  linkAirTranshipment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LinkAirTranshipmentDto,
  ) {
    return this.airImport.linkTranshipment(tenantId, id, dto, actorId);
  }

  @Post(":id/import-notices/can/send")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Email CAN PDF to consignee (AIR_IMPORT)" })
  sendCanNotice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendImportNoticeDto,
  ) {
    return this.airImport.sendImportNotice(tenantId, id, "CAN", dto, actorId);
  }

  @Post(":id/import-notices/do/send")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Email Delivery Order PDF to consignee (AIR_IMPORT)",
  })
  sendDoNotice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendImportNoticeDto,
  ) {
    return this.airImport.sendImportNotice(
      tenantId,
      id,
      "DELIVERY_ORDER",
      dto,
      actorId,
    );
  }
}
