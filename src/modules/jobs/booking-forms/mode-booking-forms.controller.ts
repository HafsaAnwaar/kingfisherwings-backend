import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { JOBS_PERMISSIONS } from "../constants/jobs-permission.constants";
import { ModeBookingFormService } from "./mode-booking-form.service";
import {
  UpsertCourierBookingFormDto,
  UpsertCustomsClearanceBookingFormDto,
  UpsertLandBookingFormDto,
  UpsertRoadFreightBookingFormDto,
  UpsertSeaFclBookingFormDto,
  UpsertSeaLclBookingFormDto,
  UpsertWarehouseBookingFormDto,
} from "./dto/mode-booking-form.dto";

@ApiTags("Jobs — mode booking forms")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("jobs")
export class ModeBookingFormsController {
  constructor(private readonly forms: ModeBookingFormService) {}

  @Post(":id/:mode/booking-form/documents/:kind")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary:
      "Upload a mandatory booking document (invoice, packing list, BL/AWB, licence, UAT/TAX)",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadDocument(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("mode") mode: string,
    @Param("kind") kind: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.forms.attachDocument(
      this.forms.resolveKind(mode),
      tenantId,
      id,
      kind,
      file as Express.Multer.File,
      actorId,
    );
  }

  @Get(":id/sea-fcl/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get Sea FCL booking form" })
  getSeaFcl(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.get("sea_fcl", tenantId, id);
  }

  @Put(":id/sea-fcl/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert Sea FCL booking form" })
  putSeaFcl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertSeaFclBookingFormDto,
  ) {
    return this.forms.upsert("sea_fcl", tenantId, id, dto, actorId);
  }

  @Post(":id/sea-fcl/booking-form/complete")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Complete Sea FCL booking form" })
  completeSeaFcl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.complete("sea_fcl", tenantId, id, actorId);
  }

  @Get(":id/sea-lcl/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get Sea LCL booking form" })
  getSeaLcl(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.get("sea_lcl", tenantId, id);
  }

  @Put(":id/sea-lcl/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert Sea LCL booking form" })
  putSeaLcl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertSeaLclBookingFormDto,
  ) {
    return this.forms.upsert("sea_lcl", tenantId, id, dto, actorId);
  }

  @Post(":id/sea-lcl/booking-form/complete")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Complete Sea LCL booking form" })
  completeSeaLcl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.complete("sea_lcl", tenantId, id, actorId);
  }

  @Get(":id/land/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get Land booking form" })
  getLand(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.get("land", tenantId, id);
  }

  @Put(":id/land/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert Land booking form" })
  putLand(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertLandBookingFormDto,
  ) {
    return this.forms.upsert("land", tenantId, id, dto, actorId);
  }

  @Post(":id/land/booking-form/complete")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Complete Land booking form" })
  completeLand(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.complete("land", tenantId, id, actorId);
  }

  @Get(":id/road-freight/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get Road Freight booking form" })
  getRoad(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.get("road_freight", tenantId, id);
  }

  @Put(":id/road-freight/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert Road Freight booking form" })
  putRoad(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertRoadFreightBookingFormDto,
  ) {
    return this.forms.upsert("road_freight", tenantId, id, dto, actorId);
  }

  @Post(":id/road-freight/booking-form/complete")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Complete Road Freight booking form" })
  completeRoad(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.complete("road_freight", tenantId, id, actorId);
  }

  @Get(":id/courier/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get Courier booking form" })
  getCourier(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.get("courier", tenantId, id);
  }

  @Put(":id/courier/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert Courier booking form" })
  putCourier(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertCourierBookingFormDto,
  ) {
    return this.forms.upsert("courier", tenantId, id, dto, actorId);
  }

  @Post(":id/courier/booking-form/complete")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Complete Courier booking form" })
  completeCourier(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.complete("courier", tenantId, id, actorId);
  }

  @Get(":id/customs-clearance/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Get Customs Clearance booking form",
    description:
      "Specialized intake form for CUSTOMS_CLEARANCE jobs (direction, ports, invoice value, HS lines, CHA parties). Ops workflow remains under /jobs/:id/cc/*.",
  })
  getCustomsClearance(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.get("customs_clearance", tenantId, id);
  }

  @Put(":id/customs-clearance/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert Customs Clearance booking form" })
  putCustomsClearance(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertCustomsClearanceBookingFormDto,
  ) {
    return this.forms.upsert("customs_clearance", tenantId, id, dto, actorId);
  }

  @Post(":id/customs-clearance/booking-form/complete")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Complete Customs Clearance booking form" })
  completeCustomsClearance(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.complete("customs_clearance", tenantId, id, actorId);
  }

  @Get(":id/warehouse/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Get Warehouse booking form",
    description:
      "Specialized intake for WAREHOUSE jobs (warehouse location, inbound/outbound dates, stock lines, bonded/temp flags). WMS ASN/GRN/GDO remain under /wms/*.",
  })
  getWarehouse(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.get("warehouse", tenantId, id);
  }

  @Put(":id/warehouse/booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert Warehouse booking form" })
  putWarehouse(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertWarehouseBookingFormDto,
  ) {
    return this.forms.upsert("warehouse", tenantId, id, dto, actorId);
  }

  @Post(":id/warehouse/booking-form/complete")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Complete Warehouse booking form" })
  completeWarehouse(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.complete("warehouse", tenantId, id, actorId);
  }
}
