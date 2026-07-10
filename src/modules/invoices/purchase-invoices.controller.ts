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

import { InvoicesService } from './invoices.service';
import { CreatePurchaseInvoiceDto, InvoiceQueryDto, UpdateInvoiceDto } from './dto/invoice.dto';

import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { INVOICES_PERMISSIONS } from './constants/invoices-permission.constants';

@ApiTags('Purchase Invoices')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('purchase-invoices')
export class PurchaseInvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List purchase invoices (vendor bills)' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: InvoiceQueryDto) {
    return this.service.findAll(tenantId, query, 'PURCHASE_INVOICE');
  }

  @Get(':id')
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a purchase invoice' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(INVOICES_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a draft purchase invoice' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreatePurchaseInvoiceDto,
  ) {
    return this.service.createPurchaseInvoice(tenantId, dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a draft purchase invoice' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(INVOICES_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a draft purchase invoice' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  @Post(':id/post')
  @RequirePermissions(INVOICES_PERMISSIONS.POST)
  @ApiOperation({ summary: 'Post a draft purchase invoice' })
  post(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.post(tenantId, id, actorId);
  }
}
