import {
  Body,
  Controller,
  Delete,
  Get,
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
import { NVOCC_PERMISSIONS } from './constants/nvocc-permission.constants';
import { NvoccVoyagesService } from './nvocc-voyages.service';
import {
  CopyNvoccVoyageDto,
  CreateNvoccVoyageDto,
  NvoccVoyageQueryDto,
  UpdateNvoccVoyageDto,
} from './dto/nvocc-voyage.dto';
import { NvoccLoadListService } from './nvocc-load-list.service';
import {
  AssignLoadListContainerDto,
  UpdateNvoccLoadListItemDto,
} from './dto/nvocc-load-list.dto';

@ApiTags('NVOCC — Voyages')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('nvocc/voyages')
export class NvoccVoyagesController {
  constructor(
    private readonly voyagesService: NvoccVoyagesService,
    private readonly loadListService: NvoccLoadListService,
  ) {}

  @Get()
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List NVOCC voyages' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: NvoccVoyageQueryDto) {
    return this.voyagesService.findAll(tenantId, query);
  }

  @Post()
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Create an NVOCC voyage' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateNvoccVoyageDto,
  ) {
    return this.voyagesService.create(tenantId, dto, actorId);
  }

  @Get(':id')
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get an NVOCC voyage with bookings and load list' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.voyagesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Update an NVOCC voyage' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNvoccVoyageDto,
  ) {
    return this.voyagesService.update(tenantId, id, dto, actorId);
  }

  @Delete(':id')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Soft-delete (cancel) an NVOCC voyage' })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voyagesService.remove(tenantId, id, actorId);
  }

  @Post(':id/publish')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Publish voyage (visible to agents)' })
  publish(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voyagesService.publish(tenantId, id, actorId);
  }

  @Post(':id/close')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Close voyage (no more bookings)' })
  close(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voyagesService.close(tenantId, id, actorId);
  }

  @Post(':id/mark-sailed')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Mark voyage as sailed' })
  markSailed(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voyagesService.markSailed(tenantId, id, actorId);
  }

  @Post(':id/copy')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Copy voyage for next sailing' })
  copy(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CopyNvoccVoyageDto,
  ) {
    return this.voyagesService.copy(tenantId, id, dto, actorId);
  }

  @Get(':id/load-list')
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Consolidated load list for a voyage' })
  loadList(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.loadListService.listForVoyage(tenantId, id);
  }

  @Get(':id/load-list/weight-check')
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Container weight utilization per container number' })
  weightCheck(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.loadListService.containerWeightCheck(tenantId, id);
  }

  @Patch(':voyageId/load-list/:itemId')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Update load list row (cargo status, weights, container)' })
  updateLoadListItem(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('voyageId', ParseUUIDPipe) voyageId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateNvoccLoadListItemDto,
  ) {
    return this.loadListService.updateItem(tenantId, voyageId, itemId, dto, actorId);
  }

  @Post(':voyageId/load-list/:itemId/assign-container')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Assign container number and seal to load list row' })
  assignContainer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('voyageId', ParseUUIDPipe) voyageId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: AssignLoadListContainerDto,
  ) {
    return this.loadListService.assignContainer(tenantId, voyageId, itemId, dto, actorId);
  }

  @Post(':id/load-list/pdf')
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Queue load list PDF generation' })
  loadListPdf(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.loadListService.generateLoadListPdf(tenantId, id, actorId);
  }

  @Get(':id/pnl')
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Voyage profit and loss' })
  pnl(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.voyagesService.getVoyagePnl(tenantId, id);
  }
}
