import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from '../dto/exchange-rate.dto';
import { MasterQueryDto } from '../dto/master-query.dto';

import { RolesGuard } from '../../users/guards/roles.guard';
import { PermissionsGuard } from '../../users/guards/permissions.guard';
import { RequirePermissions } from '../../users/decorators/permissions.decorator';
import { CurrentUser } from '../../users/decorators/current-user.decorator';
import { MASTERS_PERMISSIONS } from '../constants/masters-permission.constants';

@ApiTags('Masters — Exchange Rates')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('masters/exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly service: ExchangeRatesService) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List exchange rates, optionally filtered by currency' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: MasterQueryDto,
    @Query('currency_id') currencyId?: string,
  ) {
    return this.service.findAll(tenantId, { ...query, currency_id: currencyId });
  }

  @Get('latest/:currencyId')
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Most recent rate on file for a currency' })
  latest(@CurrentUser('tenantId') tenantId: string, @Param('currencyId', ParseUUIDPipe) currencyId: string) {
    return this.service.latest(tenantId, currencyId);
  }

  @Post()
  @RequirePermissions(MASTERS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Record (or correct) an exchange rate for a date — upserts by currency + date' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateExchangeRateDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }
}
