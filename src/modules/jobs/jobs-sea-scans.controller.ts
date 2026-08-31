import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { JOBS_PERMISSIONS } from './constants/jobs-permission.constants';

export class RecordSeaScanDto {
  scan_type!: string;
  barcode_value?: string;
  container_number?: string;
  location?: string;
  notes?: string;
}

@ApiTags('Jobs — Sea Scans')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('jobs')
export class JobsSeaScansController {
  constructor(private readonly prisma: PrismaService) {}

  @Post(':id/sea-scans')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Record a sea barcode/container scan (Week 26)' })
  record(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Body() dto: RecordSeaScanDto,
  ) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobSeaScan.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          scan_type: dto.scan_type,
          barcode_value: dto.barcode_value,
          container_number: dto.container_number,
          location: dto.location,
          notes: dto.notes,
          created_by: actorId,
        },
      }),
    );
  }

  @Get(':id/sea-scans')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List sea scans for a job' })
  list(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobSeaScan.findMany({
        where: { tenant_id: tenantId, job_id: jobId },
        orderBy: { scanned_at: 'desc' },
      }),
    );
  }
}

@ApiTags('Reports — Sea KPI')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('reports/sea')
export class SeaKpiReportController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('kpi-weekly')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Sea KPI weekly summary by branch/job type' })
  async kpiWeekly(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    const seaTypes: JobType[] = [
      'SEA_FCL_EXPORT',
      'SEA_FCL_IMPORT',
      'SEA_LCL_EXPORT',
      'SEA_LCL_IMPORT',
    ];

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        job_type: { in: seaTypes },
        ...(branchId ? { branch_id: branchId } : {}),
      };

      const [total, completed, inProgress, scans] = await Promise.all([
        tx.job.count({ where }),
        tx.job.count({ where: { ...where, status: 'COMPLETED' } }),
        tx.job.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        tx.jobSeaScan.count({ where: { tenant_id: tenantId } }),
      ]);

      return {
        period: 'weekly',
        branch_id: branchId ?? null,
        jobs_total: total,
        jobs_completed: completed,
        jobs_in_progress: inProgress,
        sea_scans_total: scans,
        generated_at: new Date().toISOString(),
      };
    });
  }
}
