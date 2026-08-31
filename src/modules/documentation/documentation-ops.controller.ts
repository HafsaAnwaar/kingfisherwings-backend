import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { DOCUMENTATION_PERMISSIONS } from './constants/documentation-permission.constants';
import { DocumentationAirTrackingService } from './documentation-air-tracking.service';
import { DocumentationJobTransferService } from './documentation-job-transfer.service';

@ApiTags('Documentation — Job Transfer')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('documentation/jobs')
export class DocumentationJobTransferController {
  constructor(private readonly service: DocumentationJobTransferService) {}

  @Post('export')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  export(@CurrentUser('tenantId') tenantId: string, @Body() body: { job_ids: string[] }) {
    return this.service.exportJobs(tenantId, body.job_ids ?? []);
  }

  @Post('import')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  import(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() bundle: { jobs?: unknown[] },
  ) {
    return this.service.importJobs(tenantId, bundle, actorId);
  }
}

@ApiTags('Documentation — Air Tracking')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('documentation/tracking')
export class DocumentationTrackingController {
  constructor(private readonly airTracking: DocumentationAirTrackingService) {}

  @Get('air')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  air(@CurrentUser('tenantId') tenantId: string, @Query('mawb_number') mawbNumber: string) {
    return this.airTracking.getByMawb(tenantId, mawbNumber);
  }
}
