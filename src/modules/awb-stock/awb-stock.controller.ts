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
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AwbStockService } from "./awb-stock.service";
import {
  AllocateAwbDto,
  AwbStockQueryDto,
  CreateAwbStockBatchDto,
  TransferAwbBatchDto,
  UpdateAwbStockBatchDto,
  VoidAwbAllocationDto,
} from "./dto/awb-stock.dto";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { AWB_STOCK_PERMISSIONS } from "./constants/awb-stock-permission.constants";

@ApiTags("AWB Stock")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("awb-stock")
export class AwbStockController {
  constructor(private readonly service: AwbStockService) {}

  @Get("batches")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List AWB stock batches" })
  listBatches(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: AwbStockQueryDto,
  ) {
    return this.service.listBatches(tenantId, query);
  }

  @Get("reports/low-stock")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Batches at or below their low-stock threshold" })
  getLowStockReport(@CurrentUser("tenantId") tenantId: string) {
    return this.service.getLowStockReport(tenantId);
  }

  @Get("allocations")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List AWB allocations" })
  listAllocations(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: AwbStockQueryDto,
  ) {
    return this.service.listAllocations(tenantId, query);
  }

  @Get("batches/:id")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get an AWB stock batch with recent allocations" })
  getBatch(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getBatch(tenantId, id);
  }

  @Post("batches")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Register a new AWB number range for an airline" })
  createBatch(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateAwbStockBatchDto,
  ) {
    return this.service.createBatch(tenantId, dto, actorId);
  }

  @Patch("batches/:id")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update batch metadata (threshold, notes)" })
  updateBatch(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAwbStockBatchDto,
  ) {
    return this.service.updateBatch(tenantId, id, dto, actorId);
  }

  @Delete("batches/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(AWB_STOCK_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete an empty AWB stock batch" })
  async removeBatch(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDeleteBatch(tenantId, id, actorId);
  }

  @Post("batches/:id/allocate")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.ALLOCATE)
  @ApiOperation({
    summary: "Allocate the next AWB number from a batch to a job",
  })
  allocate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AllocateAwbDto,
  ) {
    return this.service.allocate(tenantId, id, dto, actorId);
  }

  @Post("batches/:id/transfer-branch")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Transfer batch ownership to another branch" })
  transferBranch(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: TransferAwbBatchDto,
  ) {
    return this.service.transferBranch(tenantId, id, dto, actorId);
  }

  @Post("allocations/:id/void")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.VOID)
  @ApiOperation({ summary: "Void an allocated (unused) AWB number" })
  voidAllocation(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VoidAwbAllocationDto,
  ) {
    return this.service.voidAllocation(tenantId, id, dto, actorId);
  }

  @Post("allocations/:id/mark-used")
  @RequirePermissions(AWB_STOCK_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Mark an allocated AWB as used (flown/printed)" })
  markUsed(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.markUsed(tenantId, id, actorId);
  }
}
