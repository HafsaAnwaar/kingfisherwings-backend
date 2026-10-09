import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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

@ApiTags("Shipments")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("shipments")
export class ShipmentsController {
  constructor(private readonly service: ShipmentsService) {}

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
