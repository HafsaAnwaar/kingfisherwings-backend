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

import { QuotationsService } from './quotations.service';

import { CreateQuotationDto, UpdateQuotationDto } from './dto/quotation.dto';
import { CreateQuotationLineDto, UpdateQuotationLineDto } from './dto/quotation-line.dto';
import { QuotationQueryDto } from './dto/quotation-query.dto';
import { MarkLostDto, ApprovalDecisionDto } from './dto/quotation-actions.dto';

import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { QUOTATIONS_PERMISSIONS } from './constants/quotations-permission.constants';

@ApiTags('Quotations')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly service: QuotationsService) {}

  @Get()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List quotations' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: QuotationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('reports/chargewise')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: '"All Quotations Chargewise" report — same filters as the list, with each charge line included' })
  findAllChargewise(@CurrentUser('tenantId') tenantId: string, @Query() query: QuotationQueryDto) {
    return this.service.findAllChargewise(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a quotation with its lines, status history, and approvals' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a quotation (DRAFT)' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a quotation header (DRAFT or REJECTED only)' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(QUOTATIONS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a quotation (DRAFT only)' })
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.softDelete(tenantId, id);
  }

  @Post(':id/lines')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Add a charge line — GP recalculates automatically' })
  addLine(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateQuotationLineDto,
  ) {
    return this.service.addLine(tenantId, id, dto, actorId);
  }

  @Post(':id/apply-tariff')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane" })
  applyTariff(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.applyTariff(tenantId, id, actorId);
  }

  @Patch(':id/lines/:lineId')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a charge line' })
  updateLine(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateQuotationLineDto,
  ) {
    return this.service.updateLine(tenantId, id, lineId, dto, actorId);
  }

  @Delete(':id/lines/:lineId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Remove a charge line' })
  async removeLine(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
  ) {
    await this.service.removeLine(tenantId, id, lineId);
  }

  @Post(':id/submit')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.SUBMIT)
  @ApiOperation({ summary: 'DRAFT/REJECTED -> SUBMITTED, opens the approval cycle' })
  submit(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.submit(tenantId, id, actorId);
  }

  @Post(':id/approve')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.APPROVE)
  @ApiOperation({ summary: 'SUBMITTED -> APPROVED' })
  approve(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApprovalDecisionDto,
  ) {
    return this.service.approve(tenantId, id, actorId, dto);
  }

  @Post(':id/reject')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.APPROVE)
  @ApiOperation({ summary: 'SUBMITTED -> REJECTED (editable again, can be resubmitted)' })
  reject(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApprovalDecisionDto,
  ) {
    return this.service.reject(tenantId, id, actorId, dto);
  }

  @Post(':id/send')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.SEND)
  @ApiOperation({ summary: 'APPROVED -> SENT' })
  send(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.send(tenantId, id, actorId);
  }

  @Post(':id/mark-won')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CLOSE)
  @ApiOperation({ summary: 'SENT -> WON' })
  markWon(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.markWon(tenantId, id, actorId);
  }

  @Post(':id/mark-lost')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CLOSE)
  @ApiOperation({ summary: 'SENT -> LOST, with a reason code' })
  markLost(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkLostDto,
  ) {
    return this.service.markLost(tenantId, id, dto, actorId);
  }

  @Post(':id/duplicate')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Clone into a new revision (new DRAFT, version+1, linked to the same parent)' })
  duplicate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.duplicate(tenantId, id, actorId);
  }

  @Post(':id/convert-to-job')
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CLOSE)
  @ApiOperation({
    summary:
      'WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module.',
  })
  convertToJob(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.convertToJob(tenantId, id, actorId);
  }
}
