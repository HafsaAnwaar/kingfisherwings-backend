import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { WMS_PERMISSIONS } from './constants/wms-permission.constants';
import { CreateGrnDto } from './dto/wms.dto';
import { WmsGrnService } from './wms-grn.service';

@ApiTags('WMS GRN')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('wms/grns')
export class WmsGrnController {
  constructor(private readonly service: WmsGrnService) {}

  @Get()
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List GRNs' })
  list(@CurrentUser() user: CurrentUserType) {
    return this.service.list(user);
  }

  @Post()
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_GRN)
  @ApiOperation({ summary: 'Create draft GRN' })
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateGrnDto) {
    return this.service.create(user, dto);
  }

  @Get(':id')
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  get(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(user, id);
  }

  @Post(':id/post')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_GRN)
  @ApiOperation({ summary: 'Post GRN — creates stock lots + GRN_IN movements' })
  post(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.post(user, id);
  }

  @Post(':id/cancel')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_GRN)
  @ApiOperation({ summary: 'Cancel draft GRN' })
  cancel(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancel(user, id);
  }
}
