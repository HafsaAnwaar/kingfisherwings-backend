import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { CustomsClearanceService } from "../jobs/customs-clearance/customs-clearance.service";
import { PortalCcDocumentDto } from "../jobs/customs-clearance/dto/customs-clearance.dto";

@ApiTags("Portal — Customs Clearance")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/cc-jobs")
export class PortalCcController {
  constructor(private readonly cc: CustomsClearanceService) {}

  @Get()
  @ApiOperation({ summary: "List party Customs Clearance jobs" })
  list(@CurrentPortal() user: CurrentPortalUser) {
    return this.cc.portalList(user.tenantId, user.partyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get CC job detail for portal" })
  getOne(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.portalGet(user.tenantId, user.partyId, id);
  }

  @Get(":id/checklist")
  @ApiOperation({ summary: "CC checklist for portal" })
  checklist(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.portalChecklist(user.tenantId, user.partyId, id);
  }

  @Post(":id/documents")
  @ApiOperation({
    summary: "Mark checklist doc received (link job_document_id)",
  })
  markDoc(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PortalCcDocumentDto,
  ) {
    return this.cc.portalMarkDocument(user.tenantId, user.partyId, id, dto);
  }
}
