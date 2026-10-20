import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { SHIPMENTS_PERMISSIONS } from "./constants/shipments-permission.constants";
import {
  ChangeShipmentStatusDto,
  CopyShipmentChargesDto,
  CopyShipmentDto,
  CreateShipmentChargeDto,
  CreateShipmentDto,
  GenerateJobFromShipmentDto,
  GetShipmentChargesDto,
  ShipmentQueryDto,
  UpdateShipmentDto,
} from "./dto/shipment.dto";
import { GenerateJobDocumentDto } from "../jobs/dto/generate-job-document.dto";
import { ShipmentsService } from "./shipments.service";
import { ShipmentDetailService } from "./shipment-detail.service";
import { ShipmentTabParityService } from "./shipment-tab-parity.service";
import { ShipmentEdiService } from "./shipment-edi.service";
import { ShipmentStatusCatalogService } from "./shipment-status-catalog.service";
import {
  CreateStatusCatalogDto,
  UpdateStatusCatalogDto,
} from "../jobs/dto/status-catalog.dto";
import { GenerateShipmentEdiDto } from "./dto/shipment-edi.dto";
import {
  ChangeShipmentBlStatusDto,
  MergeShipmentsDto,
  SplitShipmentDto,
} from "./dto/shipment-detail.dto";
import { CreateSubJobDto } from "../jobs/dto/week4-6-ops.dto";
import { BookingFormEntityService } from "../jobs/booking-forms/booking-form-entity.service";
import { OpsSectionAttachmentsService } from "../jobs/ops-section-attachments.service";
import { AddJobOrganizationDto } from "../jobs/dto/job-organization-tab.dto";
import { UpsertJobDimensionLineDto } from "../jobs/dto/job-dimension.dto";
import { CompositeJobChargeDto } from "../jobs/dto/job-costing.dto";
import {
  PatchJobDepartmentDto,
  UpsertJobCustomsRefDto,
  UpsertJobExchangeRateDto,
  UpsertJobRoutingLegDto,
} from "../jobs/dto/job-tab-panels.dto";

@ApiTags("Shipments")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("shipments")
export class ShipmentsController {
  constructor(
    private readonly service: ShipmentsService,
    private readonly detail: ShipmentDetailService,
    private readonly tabParity: ShipmentTabParityService,
    private readonly shipmentEdi: ShipmentEdiService,
    private readonly bookingForms: BookingFormEntityService,
    private readonly sectionFiles: OpsSectionAttachmentsService,
    private readonly statusCatalog: ShipmentStatusCatalogService,
  ) {}

  @Get("status-options")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Shipment status catalog (system + custom)" })
  statusOptions(
    @CurrentUser("tenantId") tenantId: string,
    @Query("shipment_id") shipmentId?: string,
  ) {
    return this.statusCatalog.listOptions(tenantId, shipmentId);
  }

  @Post("status-catalog")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Add a custom shipment status — send { label } (code/maps_to optional). Always listed in status-options.",
  })
  createStatusCatalog(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: CreateStatusCatalogDto,
  ) {
    return this.statusCatalog.createCustom(tenantId, dto);
  }

  @Patch("status-catalog/:catalogId")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  updateStatusCatalog(
    @CurrentUser("tenantId") tenantId: string,
    @Param("catalogId", ParseUUIDPipe) catalogId: string,
    @Body() dto: UpdateStatusCatalogDto,
  ) {
    return this.statusCatalog.updateCustom(tenantId, catalogId, dto);
  }

  @Delete("status-catalog/:catalogId")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  deactivateStatusCatalog(
    @CurrentUser("tenantId") tenantId: string,
    @Param("catalogId", ParseUUIDPipe) catalogId: string,
  ) {
    return this.statusCatalog.deactivate(tenantId, catalogId);
  }

  @Get()
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List shipments (Fresa booking / HBL layer)" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ShipmentQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  @RequirePermissions(SHIPMENTS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Create shipment (direct or from quote fields)" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Get(":id/detail/:tab")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Shipment detail tab (costing, containers, customs, …)" })
  getDetailTab(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("tab") tab: string,
  ) {
    return this.detail.getDetailTab(tenantId, id, tab);
  }

  @Get(":id/detail")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Fresa shipment detail — header, tabs, actions, links" })
  getDetail(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.detail.getDetail(tenantId, id);
  }

  @Get(":id/booking-form")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Get booking form for shipment (job-scoped; creates provisional job if needed)",
  })
  getBookingForm(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.bookingForms.getForShipment(tenantId, id, { id: actorId });
  }

  @Put(":id/booking-form")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert booking form for shipment (via provisional/linked job)" })
  putBookingForm(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.bookingForms.upsertForShipment(tenantId, id, dto, {
      id: actorId,
      role: role as never,
    });
  }

  @Post(":id/booking-form/complete")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Complete booking form for shipment" })
  completeBookingForm(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.bookingForms.completeForShipment(tenantId, id, {
      id: actorId,
      role: role as never,
    });
  }

  @Post(":id/organizations")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Add organization on shipment (proxies to job when linked)",
  })
  addOrganization(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddJobOrganizationDto,
  ) {
    return this.tabParity.addOrganization(tenantId, id, dto, actorId);
  }

  @Post(":id/dimensions")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add dimension line on shipment (proxies to job when linked)",
  })
  addDimension(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobDimensionLineDto,
  ) {
    return this.tabParity.addDimension(tenantId, id, dto, actorId);
  }

  @Post(":id/charges/composite")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add paired sale/cost charge (proxies to job when linked)",
  })
  addCompositeCharge(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CompositeJobChargeDto,
  ) {
    return this.tabParity.addComposite(tenantId, id, dto, actorId);
  }

  @Post(":id/exchange-rates")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Upsert shipment exchange rate (proxies to job when linked)",
  })
  upsertExchangeRate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobExchangeRateDto,
  ) {
    return this.tabParity.upsertExchangeRate(tenantId, id, dto, actorId);
  }

  @Post(":id/customs-refs")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add customs / SB / BOE ref (proxies to job when linked)",
  })
  createCustomsRef(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobCustomsRefDto,
  ) {
    return this.tabParity.createCustomsRef(tenantId, id, dto, actorId);
  }

  @Post(":id/routing-legs")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  createRoutingLeg(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertJobRoutingLegDto,
  ) {
    return this.detail.createRoutingLeg(tenantId, id, dto, actorId);
  }

  @Patch(":id/routing-legs/:legId")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  updateRoutingLeg(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("legId", ParseUUIDPipe) legId: string,
    @Body() dto: UpsertJobRoutingLegDto,
  ) {
    return this.detail.updateRoutingLeg(tenantId, id, legId, dto, actorId);
  }

  @Post(":id/change-bl-status")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  changeBlStatus(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ChangeShipmentBlStatusDto,
  ) {
    return this.detail.changeBlStatus(tenantId, id, dto, actorId);
  }

  @Patch(":id/department")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Patch department tab (branch/company/department/salesperson; proxies to job when linked)",
  })
  changeDepartment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PatchJobDepartmentDto,
  ) {
    return this.detail.changeDepartment(tenantId, id, dto, actorId);
  }

  @Post(":id/split")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  split(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SplitShipmentDto,
  ) {
    return this.detail.split(tenantId, id, dto, actorId);
  }

  @Post(":id/merge")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  merge(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: MergeShipmentsDto,
  ) {
    return this.detail.merge(tenantId, id, dto, actorId);
  }

  @Post(":id/switch-bl")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  switchBl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.detail.switchBl(tenantId, id, dto, actorId);
  }

  @Get(":id/edi/types")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Eligible EDI types for this shipment (Fresa Generate EDI picker)",
  })
  listShipmentEdiTypes(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.shipmentEdi.listTypes(tenantId, id);
  }

  @Post(":id/edi/generate")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Generate EDI for shipment (uses linked job; pick type → download)",
  })
  generateShipmentEdi(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateShipmentEdiDto,
  ) {
    return this.shipmentEdi.generate(tenantId, id, dto, actorId);
  }

  @Get(":id/edi/submissions")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List EDI submissions for this shipment / linked job" })
  listShipmentEdiSubmissions(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.shipmentEdi.listSubmissions(tenantId, id);
  }

  @Get(":id/edi/submissions/:submissionId/download")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Download shipment EDI as PDF (authenticated stream). Do not fetch S3 URLs from the browser.",
  })
  downloadShipmentEdiSubmission(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("submissionId", ParseUUIDPipe) submissionId: string,
    @Res() res: Response,
  ) {
    return this.shipmentEdi.download(tenantId, id, submissionId, res);
  }

  @Post(":id/edi/:action")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Legacy EDI action facade (bayan-generate, ccn-fwb, …). Prefer POST …/edi/generate",
  })
  ediAction(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("action") action: string,
  ) {
    return this.detail.runEdiAction(tenantId, id, action, actorId);
  }

  @Post(":id/create-submaster")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.GENERATE)
  createSubmaster(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateSubJobDto,
  ) {
    return this.detail.createSubmaster(tenantId, id, dto, actorId);
  }

  @Get(":id/kpi")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  kpi(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.detail.kpi(tenantId, id);
  }

  @Get(":id/bills-of-lading")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  async listBl(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const rows = await this.detail.listBillsOfLading(tenantId, id);
    const list = Array.isArray(rows) ? rows : [rows];
    return this.sectionFiles.decorateList(
      tenantId,
      "SHIPMENT",
      id,
      "bills_of_lading",
      list as object[],
    );
  }

  @Get(":id/awb")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  awb(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.detail.awb(tenantId, id);
  }

  @Get(":id/tracking")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  tracking(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.detail.tracking(tenantId, id);
  }

  @Get(":id")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Shipment detail" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(":id")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update shipment" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Post(":id/change-status")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Change shipment status (Booked → Completed …)" })
  changeStatus(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ChangeShipmentStatusDto,
  ) {
    return this.service.changeStatus(tenantId, id, dto, actorId);
  }

  @Post(":id/generate-job")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.GENERATE)
  @ApiOperation({
    summary: "Generate Job from Shipment (HOUSE or DIRECT) — Fresa Generate Job",
  })
  generateJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobFromShipmentDto,
  ) {
    return this.service.generateJob(tenantId, id, dto, actorId);
  }

  @Post(":id/copy")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Copy shipment with selective fields" })
  copy(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CopyShipmentDto,
  ) {
    return this.service.copy(tenantId, id, dto, actorId);
  }

  @Get(":id/charges")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  listCharges(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listCharges(tenantId, id);
  }

  @Post(":id/charges")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  addCharge(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateShipmentChargeDto,
  ) {
    return this.service.addCharge(tenantId, id, dto, actorId);
  }

  @Post(":id/get-charges")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Pull standard / quotation charges onto shipment (Fresa Get Charges)",
  })
  getCharges(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GetShipmentChargesDto,
  ) {
    return this.service.getCharges(tenantId, id, dto, actorId);
  }

  @Post(":id/copy-charges")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Copy charges from another shipment, job, or quotation (Fresa Copy Charges)",
  })
  copyCharges(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CopyShipmentChargesDto,
  ) {
    return this.service.copyCharges(tenantId, id, dto, actorId);
  }

  @Post(":id/documents/booking-confirmation")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Queue booking confirmation PDF (requires linked Job — reuses job document generation)",
  })
  generateBookingConfirmation(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateLinkedJobDocument(
      tenantId,
      id,
      "BOOKING_CONFIRMATION",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/hbl")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Queue HBL draft/original PDF for shipment's linked Job (Fresa HBL from booking)",
  })
  generateHbl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateLinkedJobDocument(
      tenantId,
      id,
      "HBL",
      dto,
      actorId,
    );
  }
}
