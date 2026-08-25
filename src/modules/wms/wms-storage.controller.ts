import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { WMS_PERMISSIONS } from './constants/wms-permission.constants';
import { CalculateStorageDto, InvoiceStorageDto } from './dto/wms.dto';
import { WmsStorageService } from './wms-storage.service';

@ApiTags('WMS Storage')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('wms/storage')
export class WmsStorageController {
  constructor(private readonly service: WmsStorageService) {}

  @Post('calculate')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_STORAGE)
  @ApiOperation({ summary: 'Calculate OPEN storage charges for a party/warehouse period' })
  calculate(@CurrentUser() user: CurrentUserType, @Body() dto: CalculateStorageDto) {
    return this.service.calculate(user, dto);
  }

  @Get('charges')
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List storage charges' })
  list(
    @CurrentUser() user: CurrentUserType,
    @Query('party_id') partyId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listCharges(user, { party_id: partyId, status });
  }

  @Post('invoice')
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_STORAGE)
  @ApiOperation({ summary: 'Create DRAFT customer invoice from OPEN storage charges' })
  invoice(@CurrentUser() user: CurrentUserType, @Body() dto: InvoiceStorageDto) {
    return this.service.invoiceCharges(user, dto);
  }
}
