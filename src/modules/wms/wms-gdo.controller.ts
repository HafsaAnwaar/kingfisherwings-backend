import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { WMS_PERMISSIONS } from './constants/wms-permission.constants';
import { CreateGdoDto } from './dto/wms.dto';
import { WmsGdoService } from './wms-gdo.service';

@ApiTags('WMS GDO')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('wms/gdos')
export class WmsGdoController {
  constructor(private readonly service: WmsGdoService) {}

  @Get()
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List GDOs' })
  list(@CurrentUser() user: CurrentUserType) {
    return this.service.list(user);
  }

  @Post()
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_GDO)
  @ApiOperation({ summary: 'Create draft GDO' })
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateGdoDto) {
    return this.service.create(user, dto);
  }

  @Get(':id')
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  get(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(user, id);
  }

  @Post(':id/post')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_GDO)
  @ApiOperation({ summary: 'Post GDO — consumes lots FIFO/LIFO' })
  post(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.post(user, id);
  }

  @Post(':id/cancel')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_GDO)
  @ApiOperation({ summary: 'Cancel draft GDO' })
  cancel(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancel(user, id);
  }
}
