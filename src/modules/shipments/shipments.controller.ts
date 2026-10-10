import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
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
import {
  ChangeShipmentBlStatusDto,
  ChangeShipmentDepartmentDto,
  MergeShipmentsDto,
  SplitShipmentDto,
  UpsertShipmentRoutingLegDto,
} from "./dto/shipment-detail.dto";
import { CreateSubJobDto } from "../jobs/dto/week4-6-ops.dto";
import { BookingFormEntityService } from "../jobs/booking-forms/booking-form-entity.service";

@ApiTags("Shipments")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("shipments")
export class ShipmentsController {
  constructor(
    private readonly service: ShipmentsService,
    private readonly detail: ShipmentDetailService,
    private readonly bookingForms: BookingFormEntityService,
  ) {}

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

  @Post(":id/routing-legs")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  createRoutingLeg(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertShipmentRoutingLegDto,
  ) {
    return this.detail.createRoutingLeg(tenantId, id, dto, actorId);
  }

  @Patch(":id/routing-legs/:legId")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  updateRoutingLeg(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("legId", ParseUUIDPipe) legId: string,
    @Body() dto: UpsertShipmentRoutingLegDto,
  ) {
    return this.detail.updateRoutingLeg(tenantId, id, legId, dto);
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
  changeDepartment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ChangeShipmentDepartmentDto,
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

  @Post(":id/edi/:action")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
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
  listBl(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.detail.listBillsOfLading(tenantId, id);
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
