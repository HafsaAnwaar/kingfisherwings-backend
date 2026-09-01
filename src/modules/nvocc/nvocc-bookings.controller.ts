import {
  Body,
  Controller,
  Delete,
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
import { NVOCC_PERMISSIONS } from "./constants/nvocc-permission.constants";
import { NvoccBookingsService } from "./nvocc-bookings.service";
import {
  ConvertNvoccBookingToJobDto,
  CreateNvoccBookingDto,
  NvoccBookingQueryDto,
  SendCutoffReminderDto,
  UpdateNvoccBookingDto,
} from "./dto/nvocc-booking.dto";

@ApiTags("NVOCC — Bookings")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("nvocc/bookings")
export class NvoccBookingsController {
  constructor(private readonly service: NvoccBookingsService) {}

  @Get()
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List NVOCC bookings" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: NvoccBookingQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Create an NVOCC booking (manual or from enquiry)" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateNvoccBookingDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Get(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get an NVOCC booking" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Update a draft NVOCC booking" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateNvoccBookingDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Soft-delete a draft NVOCC booking" })
  remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(tenantId, id, actorId);
  }

  @Post(":id/confirm")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary: "Confirm booking, allocate HBL number, deduct voyage space",
  })
  confirm(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.confirm(tenantId, id, actorId);
  }

  @Post(":id/cancel")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Cancel booking and release voyage space" })
  cancel(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.cancel(tenantId, id, actorId);
  }

  @Post(":id/convert-to-job")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Convert confirmed booking to NVOCC job" })
  convertToJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ConvertNvoccBookingToJobDto,
  ) {
    return this.service.convertToJob(tenantId, id, dto, actorId);
  }

  @Post(":id/send-cutoff-reminder")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Send cut-off reminder email for SI/VGM/CY/cargo" })
  sendCutoffReminder(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendCutoffReminderDto,
  ) {
    return this.service.sendCutoffReminder(tenantId, id, dto);
  }

  @Post(":id/documents/booking-confirmation")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue booking confirmation PDF" })
  bookingConfirmationPdf(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.generateBookingConfirmationPdf(tenantId, id, actorId);
  }
}
