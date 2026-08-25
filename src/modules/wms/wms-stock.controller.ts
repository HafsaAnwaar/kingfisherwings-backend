import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { WMS_PERMISSIONS } from './constants/wms-permission.constants';
import { AdjustStockDto, CreateTransferDto, MovementQueryDto, StockQueryDto } from './dto/wms.dto';
import { WmsStockService } from './wms-stock.service';

@ApiTags('WMS Stock')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('wms')
export class WmsStockController {
  constructor(private readonly service: WmsStockService) {}

  @Get('stock/on-hand')
  @RequirePermissions(WMS_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: 'Stock on-hand by warehouse/item' })
  onHand(@CurrentUser() user: CurrentUserType, @Query() query: StockQueryDto) {
    return this.service.onHand(user, query);
  }

  @Get('stock/movements')
  @RequirePermissions(WMS_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: 'Stock movement ledger' })
  movements(@CurrentUser() user: CurrentUserType, @Query() query: MovementQueryDto) {
    return this.service.movements(user, query);
  }

  @Get('stock/low-stock')
  @RequirePermissions(WMS_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: 'Items at or below low-stock threshold' })
  lowStock(@CurrentUser() user: CurrentUserType, @Query() query: StockQueryDto) {
    return this.service.lowStock(user, query);
  }

  @Get('stock/lot-aging')
  @RequirePermissions(WMS_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: 'Open lots with age in days' })
  lotAging(@CurrentUser() user: CurrentUserType, @Query() query: StockQueryDto) {
    return this.service.lotAging(user, query);
  }

  @Post('stock/adjust')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_STOCK)
  @ApiOperation({ summary: 'Signed stock adjustment' })
  adjust(@CurrentUser() user: CurrentUserType, @Body() dto: AdjustStockDto) {
    return this.service.adjustStock(user, dto);
  }

  @Get('transfers')
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  listTransfers(@CurrentUser() user: CurrentUserType) {
    return this.service.listTransfers(user);
  }

  @Post('transfers')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_TRANSFERS)
  @ApiOperation({ summary: 'Create draft warehouse transfer' })
  createTransfer(@CurrentUser() user: CurrentUserType, @Body() dto: CreateTransferDto) {
    return this.service.createTransfer(user, dto);
  }

  @Get('transfers/:id')
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  getTransfer(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getTransfer(user, id);
  }

  @Post('transfers/:id/post')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_TRANSFERS)
  @ApiOperation({ summary: 'Post transfer — TRANSFER_OUT + TRANSFER_IN' })
  postTransfer(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.postTransfer(user, id);
  }
}
