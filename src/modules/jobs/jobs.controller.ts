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
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JobsService } from "./jobs.service";

import { CreateJobDto, UpdateJobDto } from "./dto/job.dto";
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
import { CreateJobChargeDto, UpdateJobChargeDto } from "./dto/job-charge.dto";
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
  CreateJobContainerDto,
  UpdateJobContainerDto,
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
    private readonly seaFclImport: SeaFclImportService,
    private readonly airImport: AirImportService,
    private readonly seaLcl: SeaLclService,
    private readonly seaLclImport: SeaLclImportService,
    private readonly land: LandService,
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
    @Query() query: JobQueryDto,
  ) {
    return this.service.findAll(tenantId, query, permissions);
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

  @Get(":id")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Get a job with air details, charges, milestones, and its house jobs (if a master)",
  })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id, permissions);
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

  @Get(":id/containers")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List containers on a Sea FCL job" })
  listContainers(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listContainers(tenantId, id);
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

  @Post(":id/close")
  @RequirePermissions(JOBS_PERMISSIONS.CLOSE)
  @ApiOperation({ summary: "Close a job (status -> COMPLETED)" })
  closeJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.closeJob(tenantId, id, actorId);
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
      "Distribute a master job's cost line to its house jobs, proportionally by chargeable weight",
  })
  prorateMasterCost(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("chargeCodeId", ParseUUIDPipe) chargeCodeId: string,
  ) {
    return this.service.prorateMasterCost(tenantId, id, chargeCodeId, actorId);
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

  @Post(":id/containers")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add a container to a Sea FCL job" })
  addContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateJobContainerDto,
  ) {
    return this.service.addContainer(tenantId, id, dto, actorId);
  }

  @Patch(":id/containers/:containerId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a container on a Sea FCL job" })
  updateContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
    @Body() dto: UpdateJobContainerDto,
  ) {
    return this.service.updateContainer(
      tenantId,
      id,
      containerId,
      dto,
      actorId,
    );
  }

  @Delete(":id/containers/:containerId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a container from a Sea FCL job" })
  async removeContainer(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("containerId", ParseUUIDPipe) containerId: string,
  ) {
    await this.service.removeContainer(tenantId, id, containerId, actorId);
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
  @ApiOperation({ summary: "List customs examination records (AIR_IMPORT)" })
  listCustomsExaminations(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.airImport.listCustomsExaminations(tenantId, id);
  }

  @Post(":id/customs-examinations")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Record a customs examination (AIR_IMPORT)" })
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
