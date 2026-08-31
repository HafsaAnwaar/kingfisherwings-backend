import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { NVOCC_PERMISSIONS } from './constants/nvocc-permission.constants';
import { NvoccReportingService } from './nvocc-reporting.service';
import {
  NvoccTradeLaneProfitabilityQueryDto,
  NvoccUtilizationQueryDto,
} from './dto/nvocc-report.dto';

@ApiTags('NVOCC — Reports')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('nvocc')
export class NvoccReportsController {
  constructor(private readonly reportingService: NvoccReportingService) {}

  @Get('voyages/utilization')
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Space utilization across NVOCC voyages' })
  utilization(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: NvoccUtilizationQueryDto,
  ) {
    return this.reportingService.getUtilization(tenantId, query);
  }

  @Get('reports/trade-lane-profitability')
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'NVOCC trade-lane profitability report' })
  tradeLaneProfitability(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: NvoccTradeLaneProfitabilityQueryDto,
  ) {
    return this.reportingService.getTradeLaneProfitability(tenantId, query);
  }
}
