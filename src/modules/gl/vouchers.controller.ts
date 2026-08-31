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
import { VouchersService } from './vouchers.service';
import {
  CreateVoucherDto,
  CreateVoucherLineDto,
  UpdateVoucherDto,
  UpdateVoucherLineDto,
  VoucherQueryDto,
  BatchVoucherStatusDto,
} from './dto/gl.dto';

@ApiTags('GL — Vouchers')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('gl/vouchers')
export class VouchersController {
  constructor(private readonly service: VouchersService) {}

  @Get()
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List vouchers (Ch.17)' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: VoucherQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Patch('batch-status')
  @RequirePermissions(GL_PERMISSIONS.POST)
  @ApiOperation({ summary: 'Batch update voucher status (documentation voucher batch)' })
  batchStatus(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: BatchVoucherStatusDto,
  ) {
    return this.service.batchUpdateStatus(tenantId, dto.voucher_ids, dto.status, actorId);
  }

  @Get(':id')
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get voucher with lines' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(GL_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a draft voucher (optionally with lines)' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateVoucherDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions(GL_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update draft voucher header' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVoucherDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(GL_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a draft voucher' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  @Post(':id/lines')
  @RequirePermissions(GL_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Add a line to a draft voucher' })
  addLine(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVoucherLineDto,
  ) {
    return this.service.addLine(tenantId, id, dto, actorId);
  }

  @Patch(':id/lines/:lineId')
  @RequirePermissions(GL_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a draft voucher line' })
  updateLine(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateVoucherLineDto,
  ) {
    return this.service.updateLine(tenantId, id, lineId, dto, actorId);
  }

  @Delete(':id/lines/:lineId')
  @RequirePermissions(GL_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Remove a line from a draft voucher' })
  removeLine(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
  ) {
    return this.service.removeLine(tenantId, id, lineId, actorId);
  }

  @Post(':id/post')
  @RequirePermissions(GL_PERMISSIONS.POST)
  @ApiOperation({ summary: 'Post a balanced draft voucher to the GL' })
  post(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.post(tenantId, id, actorId);
  }

  @Post(':id/reverse')
  @RequirePermissions(GL_PERMISSIONS.REVERSE)
  @ApiOperation({ summary: 'Create an offsetting posted reversal voucher' })
  reverse(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.reverse(tenantId, id, actorId);
  }
}
