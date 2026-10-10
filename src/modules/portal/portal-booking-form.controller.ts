import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalBookingFormService } from "./portal-booking-form.service";

@ApiTags("Portal — Booking forms")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal")
export class PortalBookingFormController {
  constructor(private readonly forms: PortalBookingFormService) {}

  @Get("shipments/:id/booking-form")
  @ApiOperation({
    summary:
      "Customer get booking form for shipment (all modes; provisional job if needed)",
  })
  getShipmentForm(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.getForShipment(user, id);
  }

  @Put("shipments/:id/booking-form")
  @ApiOperation({ summary: "Customer upsert booking form for shipment" })
  putShipmentForm(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.forms.upsertForShipment(user, id, dto);
  }

  @Post("shipments/:id/booking-form/complete")
  @ApiOperation({ summary: "Customer complete booking form for shipment" })
  completeShipmentForm(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.forms.completeForShipment(user, id, dto);
  }

  @Get("quotations/:id/booking-form")
  @ApiOperation({
    summary:
      "Customer get booking form for quotation (APPROVED + provisional job)",
  })
  getQuoteForm(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.forms.getForQuotation(user, id);
  }

  @Put("quotations/:id/booking-form")
  @ApiOperation({ summary: "Customer upsert booking form for quotation" })
  putQuoteForm(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.forms.upsertForQuotation(user, id, dto);
  }

  @Post("quotations/:id/booking-form/complete")
  @ApiOperation({ summary: "Customer complete booking form for quotation" })
  completeQuoteForm(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.forms.completeForQuotation(user, id, dto);
  }
}
