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
import { VENDOR_PERMISSIONS } from "./constants/vendor-permission.constants";
import {
  CreateVendorUserDto,
  ResetVendorPasswordDto,
  UpdateVendorUserStatusDto,
  VendorUserQueryDto,
} from "./dto/vendor-auth.dto";
import { VendorService } from "./vendor.service";

@ApiTags("Parties")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("parties")
export class PartyVendorUsersController {
  constructor(private readonly vendor: VendorService) {}

  @Get(":partyId/vendor-users")
  @RequirePermissions(VENDOR_PERMISSIONS.VIEW_USERS)
  @ApiOperation({ summary: "List vendor portal users for a supplier Party" })
  listForParty(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
  ) {
    return this.vendor.listVendorUsers(tenantId, { party_id: partyId });
  }

  @Post(":partyId/vendor-users")
  @RequirePermissions(VENDOR_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({
    summary: "Invite or create a vendor portal user for this Party",
  })
  createForParty(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Body() dto: CreateVendorUserDto,
  ) {
    return this.vendor.createVendorUser(tenantId, actorId, {
      ...dto,
      party_id: partyId,
    });
  }

  @Patch(":partyId/vendor-users/:id/status")
  @RequirePermissions(VENDOR_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({ summary: "Enable or disable a vendor user for this Party" })
  updateStatus(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateVendorUserStatusDto,
  ) {
    return this.vendor.updateStatus(tenantId, actorId, id, dto, partyId);
  }

  @Post(":partyId/vendor-users/:id/reset-password")
  @RequirePermissions(VENDOR_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({
    summary: "Reset vendor portal password for this Party’s user",
  })
  resetPassword(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ResetVendorPasswordDto,
  ) {
    return this.vendor.resetPassword(tenantId, actorId, id, dto, partyId);
  }

  @Post(":partyId/vendor-users/:id/resend-invite")
  @RequirePermissions(VENDOR_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({ summary: "Resend vendor invite email" })
  resendInvite(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.vendor.resendInvite(tenantId, actorId, id, partyId);
  }
}

@ApiTags("Admin — Vendor Portal Users")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("vendor-users")
export class VendorUsersAdminController {
  constructor(private readonly vendor: VendorService) {}

  @Get()
  @RequirePermissions(VENDOR_PERMISSIONS.VIEW_USERS)
  @ApiOperation({ summary: "List vendor portal users in this tenant" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: VendorUserQueryDto,
  ) {
    return this.vendor.listVendorUsers(tenantId, query);
  }
}
