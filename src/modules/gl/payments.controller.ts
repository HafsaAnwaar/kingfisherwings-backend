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
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { GL_PERMISSIONS } from "./constants/gl-permission.constants";
import { PaymentsService } from "./payments.service";
import {
  CreatePaymentDto,
  PaymentAllocationInputDto,
  PaymentQueryDto,
  UpdatePaymentDto,
} from "./dto/ar-ap.dto";

@ApiTags("GL — Payments (AR/AP)")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("gl/payments")
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List customer receipts and vendor payments (Ch.19)",
  })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: PaymentQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get payment with allocations" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(GL_PERMISSIONS.MANAGE_PAYMENTS)
  @ApiOperation({ summary: "Create a draft receipt or vendor payment" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_PAYMENTS)
  @ApiOperation({ summary: "Update a draft payment header" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(GL_PERMISSIONS.MANAGE_PAYMENTS)
  @ApiOperation({ summary: "Soft-delete a draft payment" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  @Post(":id/allocations")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_PAYMENTS)
  @ApiOperation({ summary: "Allocate payment amount to an open invoice" })
  addAllocation(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PaymentAllocationInputDto,
  ) {
    return this.service.addAllocation(tenantId, id, dto, actorId);
  }

  @Delete(":id/allocations/:allocationId")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_PAYMENTS)
  @ApiOperation({ summary: "Remove a draft payment allocation" })
  removeAllocation(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("allocationId", ParseUUIDPipe) allocationId: string,
  ) {
    return this.service.removeAllocation(tenantId, id, allocationId, actorId);
  }

  @Post(":id/post")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_PAYMENTS)
  @ApiOperation({
    summary: "Post payment: update invoice balances + create GL voucher",
  })
  post(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.post(tenantId, id, actorId);
  }

  @Post(":id/cancel")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_PAYMENTS)
  @ApiOperation({
    summary: "Cancel payment (reverses invoice balances and GL if posted)",
  })
  cancel(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.cancel(tenantId, id, actorId);
  }
}
