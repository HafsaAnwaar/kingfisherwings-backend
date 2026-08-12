import { Body, Controller, Get, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { VENDOR_PERMISSIONS } from './constants/vendor-permission.constants';
import { UpsertVendorPermissionsBodyDto } from './dto/vendor-permissions.dto';
import { VendorPermissionsService } from './vendor-permissions.service';

@ApiTags('Parties')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('parties')
export class PartyVendorPermissionsController {
  constructor(private readonly permissions: VendorPermissionsService) {}

  @Get(':partyId/vendor-permissions')
  @RequirePermissions(VENDOR_PERMISSIONS.VIEW_PERMISSIONS)
  @ApiOperation({ summary: 'Get vendor document rights matrix for a Party' })
  get(@CurrentUser('tenantId') tenantId: string, @Param('partyId', ParseUUIDPipe) partyId: string) {
    return this.permissions.getForParty(tenantId, partyId);
  }

  @Put(':partyId/vendor-permissions')
  @RequirePermissions(VENDOR_PERMISSIONS.MANAGE_PERMISSIONS)
  @ApiOperation({ summary: 'Replace vendor document rights for a Party' })
  upsert(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('partyId', ParseUUIDPipe) partyId: string,
    @Body() dto: UpsertVendorPermissionsBodyDto,
  ) {
    return this.permissions.upsertForParty(tenantId, partyId, dto, actorId);
  }
}
