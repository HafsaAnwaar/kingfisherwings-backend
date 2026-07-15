import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { GL_PERMISSIONS } from './constants/gl-permission.constants';
import { MisService } from './mis.service';
import { MisDashboardQueryDto, ProfitabilityQueryDto } from './dto/financial-reports.dto';

@ApiTags('GL — MIS Dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('gl/mis')
export class MisController {
  constructor(private readonly service: MisService) {}

  @Get('dashboard')
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: 'Management MIS dashboard widgets (Ch.23 / Week 12)' })
  dashboard(@CurrentUser('tenantId') tenantId: string, @Query() query: MisDashboardQueryDto) {
    return this.service.dashboard(tenantId, query);
  }

  @Get('profitability')
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({
    summary: 'Job profitability by shipper / job_type / branch / salesperson (Ch.23)',
  })
  profitability(@CurrentUser('tenantId') tenantId: string, @Query() query: ProfitabilityQueryDto) {
    return this.service.jobProfitability(tenantId, query);
  }

  @Get('operational')
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: 'Operational KPIs — pending PRs, draft invoices, uninvoiced charges' })
  operational(@CurrentUser('tenantId') tenantId: string, @Query() query: MisDashboardQueryDto) {
    return this.service.operationalSummary(tenantId, query);
  }
}
