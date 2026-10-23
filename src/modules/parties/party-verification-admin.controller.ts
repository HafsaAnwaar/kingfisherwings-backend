import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RolesGuard } from "../users/guards/roles.guard";
import { PORTAL_PERMISSIONS } from "../portal/constants/portal-permission.constants";
import {
  ApprovePartyVerificationDto,
  RejectPartyVerificationDto,
} from "./dto/party-verification.dto";
import { PartyVerificationService } from "./party-verification.service";

@ApiTags("Admin — Party Verification")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("parties/:partyId/verification")
export class PartyVerificationAdminController {
  constructor(private readonly verification: PartyVerificationService) {}

  @Get()
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_USERS)
  @ApiOperation({ summary: "Get party verification status + documents" })
  get(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
  ) {
    return this.verification.getStatus(tenantId, partyId);
  }

  @Get("documents/:documentId/download")
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_USERS)
  @ApiOperation({ summary: "Download / view a party verification document" })
  download(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Res() res: Response,
  ) {
    return this.verification.downloadDocument(
      tenantId,
      partyId,
      documentId,
      res,
    );
  }

  @Post("approve")
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({ summary: "Approve party verification (unlocks portal/vendor)" })
  approve(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Body() _dto: ApprovePartyVerificationDto,
  ) {
    return this.verification.approve(tenantId, partyId, actorId);
  }

  @Post("reject")
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({ summary: "Reject party verification with reason" })
  reject(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Body() dto: RejectPartyVerificationDto,
  ) {
    return this.verification.reject(tenantId, partyId, actorId, dto.reason);
  }
}
