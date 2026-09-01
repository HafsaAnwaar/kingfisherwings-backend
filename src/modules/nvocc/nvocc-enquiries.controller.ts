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
import { NvoccEnquiriesService } from "./nvocc-enquiries.service";
import {
  CreateNvoccEnquiryDto,
  MarkNvoccEnquiryLostDto,
  NvoccEnquiryQueryDto,
  SendNvoccRateDto,
  UpdateNvoccEnquiryDto,
} from "./dto/nvocc-enquiry.dto";

@ApiTags("NVOCC — Enquiries")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("nvocc/enquiries")
export class NvoccEnquiriesController {
  constructor(private readonly service: NvoccEnquiriesService) {}

  @Get()
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List NVOCC space enquiries" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: NvoccEnquiryQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get("analytics")
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Enquiry conversion and loss-reason analytics" })
  analytics(@CurrentUser("tenantId") tenantId: string) {
    return this.service.analytics(tenantId);
  }

  @Post()
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Create an NVOCC space enquiry" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateNvoccEnquiryDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Get(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get an NVOCC enquiry" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Update an NVOCC enquiry" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateNvoccEnquiryDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Cancel an NVOCC enquiry" })
  remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(tenantId, id, actorId);
  }

  @Post(":id/send-rate")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Email rate quotation to customer" })
  sendRate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendNvoccRateDto,
  ) {
    return this.service.sendRate(tenantId, id, dto, actorId);
  }

  @Post(":id/mark-lost")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Mark enquiry as lost with reason" })
  markLost(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: MarkNvoccEnquiryLostDto,
  ) {
    return this.service.markLost(tenantId, id, dto, actorId);
  }

  @Post(":id/convert-to-booking")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Convert enquiry to draft booking" })
  convertToBooking(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.convertToBooking(tenantId, id, actorId);
  }
}
