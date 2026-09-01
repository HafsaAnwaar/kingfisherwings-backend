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
import { PORTAL_PERMISSIONS } from "./constants/portal-permission.constants";
import { CreatePartyPortalUserDto } from "./dto/create-party-portal-user.dto";
import {
  PortalUserQueryDto,
  ResetPortalPasswordDto,
  UpdatePortalUserStatusDto,
} from "./dto/portal.dto";
import { PortalService } from "./portal.service";

/**
 * Tenant Admin / staff ERP Admin panel — manage portal logins under Customer Parties.
 * No separate "Customer Portal Admin". Each tenant only manages its own data.
 */
@ApiTags("Parties")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("parties")
export class PartyPortalUsersController {
  constructor(private readonly portal: PortalService) {}

  @Get(":partyId/portal-users")
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_USERS)
  @ApiOperation({
    summary: "List portal users for a customer Party",
    description:
      "Admin panel only. Scoped to the authenticated tenant — other tenants’ customers are invisible.",
  })
  listForParty(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
  ) {
    return this.portal.listPortalUsers(tenantId, { party_id: partyId });
  }

  @Post(":partyId/portal-users")
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({
    summary: "Create portal login for a customer Party",
    description:
      "Tenant Admin / staff issues email + password (e.g. after Get a Quote). Enables party.portal_access.",
  })
  createForParty(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Body() dto: CreatePartyPortalUserDto,
  ) {
    return this.portal.createPortalUser(tenantId, actorId, {
      ...dto,
      party_id: partyId,
    });
  }

  @Patch(":partyId/portal-users/:id/status")
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({ summary: "Enable or disable a portal user for this Party" })
  updateStatus(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortalUserStatusDto,
  ) {
    return this.portal.updateStatus(tenantId, actorId, id, dto, partyId);
  }

  @Post(":partyId/portal-users/:id/reset-password")
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({ summary: "Reset portal password for this Party’s user" })
  resetPassword(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ResetPortalPasswordDto,
  ) {
    return this.portal.resetPassword(tenantId, actorId, id, dto, partyId);
  }

  @Post(":partyId/portal-users/:id/resend-invite")
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({
    summary: "Resend portal invite email with a fresh accept-invite token",
  })
  resendInvite(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.portal.resendInvite(tenantId, actorId, id, partyId);
  }
}

@ApiTags("Admin — Customer Portal Users")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("portal-users")
export class PortalUsersAdminController {
  constructor(private readonly portal: PortalService) {}

  @Get()
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_USERS)
  @ApiOperation({
    summary: "List portal users in this tenant",
    description:
      "Admin directory. Optional filters: party_id, company_id. Never crosses tenants.",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: PortalUserQueryDto,
  ) {
    return this.portal.listPortalUsers(tenantId, query);
  }
}
