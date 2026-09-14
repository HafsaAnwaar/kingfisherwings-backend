import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { NotificationsService } from "../../notifications/notifications.service";
import { MASTERS_PERMISSIONS } from "../constants/masters-permission.constants";

class MastersNotificationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  unread_only?: string;
}

@ApiTags("Masters — Notifications")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("masters/notifications")
export class MastersNotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Proxy: list current-user notifications (same as /notifications)",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Query() query: MastersNotificationQueryDto,
  ) {
    return this.notifications.listForStaff(tenantId, userId, {
      page: query.page,
      limit: query.limit,
      unread_only: query.unread_only === "true" || query.unread_only === "1",
    });
  }
}
