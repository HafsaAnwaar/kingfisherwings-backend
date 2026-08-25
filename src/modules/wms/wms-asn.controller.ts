import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { WMS_PERMISSIONS } from './constants/wms-permission.constants';
import { CreateAsnDto } from './dto/wms.dto';
import { WmsAsnService } from './wms-asn.service';

@ApiTags('WMS ASN')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('wms/asns')
export class WmsAsnController {
  constructor(private readonly service: WmsAsnService) {}
  @Get() @RequirePermissions(WMS_PERMISSIONS.VIEW)
  list(@CurrentUser() user: CurrentUserType) { return this.service.list(user); }
  @Post() @RequirePermissions(WMS_PERMISSIONS.MANAGE_ASN)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateAsnDto) { return this.service.create(user, dto); }
  @Get(':id') @RequirePermissions(WMS_PERMISSIONS.VIEW)
  get(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) { return this.service.get(user, id); }
  @Post(':id/confirm') @RequirePermissions(WMS_PERMISSIONS.MANAGE_ASN)
  confirm(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) { return this.service.confirm(user, id); }
  @Post(':id/cancel') @RequirePermissions(WMS_PERMISSIONS.MANAGE_ASN)
  cancel(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) { return this.service.cancel(user, id); }
}
