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

import { PaymentRequestsService } from "./payment-requests.service";
import {
  CreatePaymentRequestDto,
  PaymentRequestQueryDto,
  RejectPaymentRequestDto,
  UpdatePaymentRequestDto,
} from "./dto/payment-request.dto";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { INVOICES_PERMISSIONS } from "./constants/invoices-permission.constants";

@ApiTags("Payment Requests")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("payment-requests")
export class PaymentRequestsController {
  constructor(private readonly service: PaymentRequestsService) {}

  @Get()
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List payment requests" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: PaymentRequestQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get a payment request" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(INVOICES_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Create a payment request" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreatePaymentRequestDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a pending payment request" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentRequestDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(INVOICES_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a pending payment request" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  @Post(":id/approve")
  @RequirePermissions(INVOICES_PERMISSIONS.APPROVE_PAYMENT)
  @ApiOperation({ summary: "Approve a payment request" })
  approve(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.approve(tenantId, id, actorId);
  }

  @Post(":id/reject")
  @RequirePermissions(INVOICES_PERMISSIONS.APPROVE_PAYMENT)
  @ApiOperation({ summary: "Reject a payment request" })
  reject(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RejectPaymentRequestDto,
  ) {
    return this.service.reject(tenantId, id, dto, actorId);
  }

  @Post(":id/mark-paid")
  @RequirePermissions(INVOICES_PERMISSIONS.APPROVE_PAYMENT)
  @ApiOperation({ summary: "Mark an approved payment request as paid" })
  markPaid(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.markPaid(tenantId, id, actorId);
  }
}
