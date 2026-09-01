import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { DOCUMENTATION_PERMISSIONS } from "./constants/documentation-permission.constants";
import { DocumentationDeliveryOrderService } from "./documentation-delivery-order.service";
import {
  ClosedJobsQueryDto,
  UpdateDeliveryOrderDto,
} from "./dto/documentation-do.dto";

@ApiTags("Documentation — Delivery Orders")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("documentation")
export class DocumentationDeliveryOrderController {
  constructor(private readonly service: DocumentationDeliveryOrderService) {}

  @Get("delivery-orders/closed-jobs")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  closedJobs(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ClosedJobsQueryDto,
  ) {
    return this.service.listClosedJobs(tenantId, query);
  }

  @Patch("jobs/:jobId/delivery-order")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  updateDo(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
    @Body() dto: UpdateDeliveryOrderDto,
  ) {
    return this.service.updateDeliveryOrder(tenantId, jobId, dto, actorId);
  }
}
