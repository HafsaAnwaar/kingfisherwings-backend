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

import { UnitsOfMeasureService } from './units-of-measure.service';
import { CreateUnitOfMeasureDto, UpdateUnitOfMeasureDto } from '../dto/unit-of-measure.dto';
import { MasterQueryDto } from '../dto/master-query.dto';

import { RolesGuard } from '../../users/guards/roles.guard';
import { PermissionsGuard } from '../../users/guards/permissions.guard';
import { RequirePermissions } from '../../users/decorators/permissions.decorator';
import { CurrentUser } from '../../users/decorators/current-user.decorator';
import { MASTERS_PERMISSIONS } from '../constants/masters-permission.constants';

@ApiTags('Masters — UnitsOfMeasure')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('masters/units-of-measure')
export class UnitsOfMeasureController {
  constructor(private readonly service: UnitsOfMeasureService) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'list unitsofmeasure' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: MasterQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a record by id' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(MASTERS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a record' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateUnitOfMeasureDto,
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Patch(':id')
  @RequirePermissions(MASTERS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a record' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitOfMeasureDto,
  ) {
    return this.service.update(tenantId, id, { ...dto }, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(MASTERS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a record' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}
