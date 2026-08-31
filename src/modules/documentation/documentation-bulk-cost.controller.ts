import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { DOCUMENTATION_PERMISSIONS } from './constants/documentation-permission.constants';
import { DocumentationBulkCostService } from './documentation-bulk-cost.service';
import { BulkCostBatchDto } from './dto/documentation-bulk-cost.dto';

@ApiTags('Documentation — Bulk Cost')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('documentation/bulk-costs')
export class DocumentationBulkCostController {
  constructor(private readonly service: DocumentationBulkCostService) {}

  @Post('preview')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  preview(@CurrentUser('tenantId') tenantId: string, @Body() dto: BulkCostBatchDto) {
    return this.service.preview(tenantId, dto);
  }

  @Post()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  submit(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: BulkCostBatchDto,
  ) {
    return this.service.submit(tenantId, dto, actorId);
  }

  @Get(':id')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }
}
