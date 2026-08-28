import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { TRANSPORT_PERMISSIONS } from './constants/transport-permission.constants';
import { TransportService } from './transport.service';
import {
  AssignTransportRequestDto,
  RecordTransportCostDto,
  TransportRequestQueryDto,
  TransportTimestampDto,
} from './dto/transport-request.dto';

@ApiTags('Transport Requests')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('transport-requests')
export class TransportController {
  constructor(private readonly service: TransportService) {}

  @Get()
  @RequirePermissions(TRANSPORT_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List transport requests for the tenant' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: TransportRequestQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(TRANSPORT_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a transport request' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post(':id/assign')
  @RequirePermissions(TRANSPORT_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Assign a trucker to a transport request' })
  assign(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTransportRequestDto,
  ) {
    return this.service.assign(tenantId, id, dto, actorId);
  }

  @Post(':id/confirm-pickup')
  @RequirePermissions(TRANSPORT_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Confirm pickup on a transport request' })
  confirmPickup(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransportTimestampDto,
  ) {
    return this.service.confirmPickup(tenantId, id, dto, actorId);
  }

  @Post(':id/in-transit')
  @RequirePermissions(TRANSPORT_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Mark a transport request in transit' })
  markInTransit(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransportTimestampDto,
  ) {
    return this.service.markInTransit(tenantId, id, dto, actorId);
  }

  @Post(':id/delivered')
  @RequirePermissions(TRANSPORT_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Mark a transport request delivered' })
  markDelivered(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransportTimestampDto,
  ) {
    return this.service.markDelivered(tenantId, id, dto, actorId);
  }

  @Post(':id/cancel')
  @RequirePermissions(TRANSPORT_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Cancel a transport request' })
  cancel(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.cancel(tenantId, id, actorId);
  }

  @Post(':id/record-cost')
  @RequirePermissions(TRANSPORT_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Record transport cost as a job cost charge line' })
  recordCost(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordTransportCostDto,
  ) {
    return this.service.recordCost(tenantId, id, dto, actorId);
  }

  @Post(':id/documents/transport-request')
  @RequirePermissions(TRANSPORT_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: 'Queue Transport Request PDF for the linked job' })
  generatePdf(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.generatePdf(tenantId, id, actorId);
  }
}
