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
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { GL_PERMISSIONS } from './constants/gl-permission.constants';
import { SavedReportsService } from './saved-reports.service';
import {
  CreateSavedReportDto,
  SavedReportQueryDto,
  UpdateSavedReportDto,
} from './dto/financial-reports.dto';

@ApiTags('GL — My Reports')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('gl/saved-reports')
export class SavedReportsController {
  constructor(private readonly service: SavedReportsService) {}

  @Get()
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: 'List saved / shared report configurations (Ch.23 My Reports)' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Query() query: SavedReportQueryDto,
  ) {
    return this.service.findAll(tenantId, userId, query);
  }

  @Get(':id')
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: 'Get a saved report by id' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(GL_PERMISSIONS.MANAGE_REPORTS)
  @ApiOperation({ summary: 'Save a report configuration (filters + type)' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateSavedReportDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions(GL_PERMISSIONS.MANAGE_REPORTS)
  @ApiOperation({ summary: 'Update a saved report' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSavedReportDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(GL_PERMISSIONS.MANAGE_REPORTS)
  @ApiOperation({ summary: 'Soft-delete a saved report' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}
