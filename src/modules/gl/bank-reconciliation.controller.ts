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
import { BankReconciliationService } from './bank-reconciliation.service';
import {
  BankReconciliationQueryDto,
  CreateBankReconciliationDto,
  CreateBankReconciliationLineDto,
  CreateBankTransferDto,
  UpdateBankReconciliationDto,
  UpdateBankReconciliationLineDto,
} from './dto/ar-ap.dto';

@ApiTags('GL — Bank Reconciliation')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('gl')
export class BankReconciliationController {
  constructor(private readonly service: BankReconciliationService) {}

  @Post('bank-transfers')
  @RequirePermissions(GL_PERMISSIONS.POST)
  @ApiOperation({ summary: 'Post a contra bank/cash transfer voucher (Ch.19.3)' })
  bankTransfer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateBankTransferDto,
  ) {
    return this.service.createBankTransfer(tenantId, dto, actorId);
  }

  @Get('bank-reconciliations')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'List bank reconciliations' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: BankReconciliationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('bank-reconciliations/:id')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Get bank reconciliation with lines + summary' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post('bank-reconciliations')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Start a draft bank reconciliation' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateBankReconciliationDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch('bank-reconciliations/:id')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Update draft bank reconciliation header' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBankReconciliationDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete('bank-reconciliations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Cancel / soft-delete a draft reconciliation' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  @Get('bank-reconciliations/:id/unmatched')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Posted bank GL lines not yet matched on this recon' })
  unmatched(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.unmatchedLines(tenantId, id);
  }

  @Post('bank-reconciliations/:id/lines')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Add a matched / statement line' })
  addLine(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateBankReconciliationLineDto,
  ) {
    return this.service.addLine(tenantId, id, dto, actorId);
  }

  @Patch('bank-reconciliations/:id/lines/:lineId')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Update recon line match flags' })
  updateLine(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateBankReconciliationLineDto,
  ) {
    return this.service.updateLine(tenantId, id, lineId, dto, actorId);
  }

  @Delete('bank-reconciliations/:id/lines/:lineId')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Remove a recon line' })
  removeLine(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
  ) {
    return this.service.removeLine(tenantId, id, lineId, actorId);
  }

  @Post('bank-reconciliations/:id/complete')
  @RequirePermissions(GL_PERMISSIONS.RECONCILE)
  @ApiOperation({ summary: 'Complete bank reconciliation' })
  complete(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.complete(tenantId, id, actorId);
  }
}
