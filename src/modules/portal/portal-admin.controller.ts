import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { PORTAL_PERMISSIONS } from './constants/portal-permission.constants';
import {
  CreatePortalUserDto,
  PortalUserQueryDto,
  ResetPortalPasswordDto,
  UpdatePortalUserStatusDto,
} from './dto/portal.dto';
import { PortalService } from './portal.service';

@ApiTags('Portal Admin')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('portal-admin')
export class PortalAdminController {
  constructor(private readonly portal: PortalService) {}

  @Post('users')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({
    summary: 'Create portal credentials for a customer Party',
    description:
      'Called by tenant staff after a public Get a Quote (or manually). Enables party.portal_access and issues email/password for portal login.',
  })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreatePortalUserDto,
  ) {
    return this.portal.createPortalUser(tenantId, actorId, dto);
  }

  @Get('users')
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_USERS)
  @ApiOperation({ summary: 'List portal users (optional party_id filter)' })
  list(@CurrentUser('tenantId') tenantId: string, @Query() query: PortalUserQueryDto) {
    return this.portal.listPortalUsers(tenantId, query);
  }

  @Patch('users/:id/status')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({ summary: 'Enable or disable a portal user (disabling revokes sessions)' })
  updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortalUserStatusDto,
  ) {
    return this.portal.updateStatus(tenantId, actorId, id, dto);
  }

  @Post('users/:id/reset-password')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_USERS)
  @ApiOperation({ summary: 'Reset portal password and revoke existing sessions' })
  resetPassword(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPortalPasswordDto,
  ) {
    return this.portal.resetPassword(tenantId, actorId, id, dto);
  }
}
