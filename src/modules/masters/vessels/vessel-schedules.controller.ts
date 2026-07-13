import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { VesselSchedulesService } from './vessel-schedules.service';
import {
  CreateVesselScheduleDto,
  UpdateVesselScheduleDto,
  VesselScheduleQueryDto,
} from '../dto/vessel-schedule.dto';

import { RolesGuard } from '../../users/guards/roles.guard';
import { PermissionsGuard } from '../../users/guards/permissions.guard';
import { RequirePermissions } from '../../users/decorators/permissions.decorator';
import { CurrentUser } from '../../users/decorators/current-user.decorator';
import { MASTERS_PERMISSIONS } from '../constants/masters-permission.constants';

/**
 * Plan path: GET/POST /vessels/:id/schedules (Week 7 / Ch.10).
 * Nested under vessels (not masters/vessels) to match the 28-week plan.
 */
@ApiTags('Vessels — Schedules')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('vessels')
export class VesselSchedulesController {
  constructor(private readonly service: VesselSchedulesService) {}

  @Get(':id/schedules')
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List vessel voyage schedules (filter by ETD/ETA)' })
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: VesselScheduleQueryDto,
  ) {
    return this.service.list(tenantId, id, query);
  }

  @Post(':id/schedules')
  @RequirePermissions(MASTERS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a vessel voyage schedule' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVesselScheduleDto,
  ) {
    return this.service.create(tenantId, id, dto, actorId);
  }

  @Patch(':id/schedules/:scheduleId')
  @RequirePermissions(MASTERS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a vessel voyage schedule' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Body() dto: UpdateVesselScheduleDto,
  ) {
    return this.service.update(tenantId, id, scheduleId, dto, actorId);
  }

  @Delete(':id/schedules/:scheduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(MASTERS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a vessel voyage schedule' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
  ) {
    await this.service.remove(tenantId, id, scheduleId, actorId);
  }
}
