import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { PORTAL_PERMISSIONS } from './constants/portal-permission.constants';
import { UpsertPortalPermissionsDto } from './dto/portal-permissions.dto';
import { PortalPermissionsService } from './portal-permissions.service';

@ApiTags('Parties')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('parties')
export class PartyPortalPermissionsController {
  constructor(private readonly permissions: PortalPermissionsService) {}

  @Get(':partyId/portal-permissions')
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_PERMISSIONS)
  @ApiOperation({
    summary: 'Get portal document rights matrix for a customer Party',
    description:
      'Returns effective can_view / can_download per document type. Defaults to view-only when unset.',
  })
  get(@CurrentUser('tenantId') tenantId: string, @Param('partyId', ParseUUIDPipe) partyId: string) {
    return this.permissions.getForParty(tenantId, partyId);
  }

  @Put(':partyId/portal-permissions')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_PERMISSIONS)
  @ApiOperation({
    summary: 'Replace portal document rights for a customer Party',
    description: 'Must include all document types. Download requires view to be enabled.',
  })
  upsert(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('partyId', ParseUUIDPipe) partyId: string,
    @Body() dto: UpsertPortalPermissionsDto,
  ) {
    return this.permissions.upsertForParty(tenantId, partyId, dto, actorId);
  }

  @Post(':partyId/portal-permissions/reset-defaults')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_PERMISSIONS)
  @ApiOperation({
    summary: 'Reset portal document rights to defaults',
    description: 'All types: can_view=true, can_download=false.',
  })
  resetDefaults(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('partyId', ParseUUIDPipe) partyId: string,
  ) {
    return this.permissions.resetToDefaults(tenantId, partyId, actorId);
  }
}
