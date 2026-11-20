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

import { InvoicesService } from "./invoices.service";
import {
  CreatePurchaseInvoiceDto,
  InvoiceQueryDto,
  UpdateInvoiceDto,
} from "./dto/invoice.dto";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { INVOICES_PERMISSIONS } from "./constants/invoices-permission.constants";

@ApiTags("Purchase Invoices")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("purchase-invoices")
export class PurchaseInvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List purchase invoices (vendor bills)" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Query() query: InvoiceQueryDto,
  ) {
    return this.service.findAll(
      tenantId,
      query,
      "PURCHASE_INVOICE",
      permissions,
      { userId, role, permissions },
    );
  }

  @Get(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get a purchase invoice" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id, permissions, {
      userId,
      role,
      permissions,
    });
  }

  @Post("from-job/:jobId")
  @RequirePermissions(INVOICES_PERMISSIONS.CREATE)
  @ApiOperation({
    summary:
      "Create draft purchase invoice from job cost lines (optional charge_ids)",
  })
  createFromJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("jobId", ParseUUIDPipe) jobId: string,
    @Body() body?: { charge_ids?: string[] },
  ) {
    return this.service.createPurchaseFromJob(
      tenantId,
      jobId,
      body?.charge_ids,
      actorId,
      { userId: actorId, role, permissions },
    );
  }

  @Post()
  @RequirePermissions(INVOICES_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Create a draft purchase invoice" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() dto: CreatePurchaseInvoiceDto,
  ) {
    return this.service.createPurchaseInvoice(tenantId, dto, actorId, {
      userId: actorId,
      role,
      permissions,
    });
  }

  @Patch(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a draft purchase invoice" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId, {
      userId: actorId,
      role,
      permissions,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(INVOICES_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a draft purchase invoice" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId, {
      userId: actorId,
      role,
      permissions,
    });
  }

  @Post(":id/post")
  @RequirePermissions(INVOICES_PERMISSIONS.POST)
  @ApiOperation({ summary: "Post a draft purchase invoice" })
  post(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.post(tenantId, id, actorId, {
      userId: actorId,
      role,
      permissions,
    });
  }
}
