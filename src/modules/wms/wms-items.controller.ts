import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { WMS_PERMISSIONS } from './constants/wms-permission.constants';
import { CreateWmsItemDto, ItemQueryDto, UpdateWmsItemDto } from './dto/wms.dto';
import { WmsItemsService } from './wms-items.service';

@ApiTags('WMS Items')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('wms/items')
export class WmsItemsController {
  constructor(private readonly service: WmsItemsService) {}

  @Get() @RequirePermissions(WMS_PERMISSIONS.VIEW)
  list(@CurrentUser() user: CurrentUserType, @Query() query: ItemQueryDto) { return this.service.list(user, query); }

  @Post() @RequirePermissions(WMS_PERMISSIONS.MANAGE_ITEMS)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateWmsItemDto) { return this.service.create(user, dto); }

  @Get(':id') @RequirePermissions(WMS_PERMISSIONS.VIEW)
  get(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) { return this.service.get(user, id); }

  @Patch(':id') @RequirePermissions(WMS_PERMISSIONS.MANAGE_ITEMS)
  update(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWmsItemDto) {
    return this.service.update(user, id, dto);
  }

  @Delete(':id') @RequirePermissions(WMS_PERMISSIONS.MANAGE_ITEMS)
  remove(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) { return this.service.remove(user, id); }
}
