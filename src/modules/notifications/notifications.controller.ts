import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { NOTIFICATIONS_PERMISSIONS } from "./constants/notifications-permission.constants";
import { NotificationsService } from "./notifications.service";

class NotificationQueryDto {
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

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @RequirePermissions(NOTIFICATIONS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List staff in-app notifications (unread first)",
    description:
      "Each item includes `link_path` (app-relative). On click: POST /notifications/:id/open then navigate to data.link_path. If link_path is null, stay on the notifications list.",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notifications.listForStaff(tenantId, userId, {
      page: query.page,
      limit: query.limit,
      unread_only: query.unread_only === "true" || query.unread_only === "1",
    });
  }

  @Get("unread-count")
  @RequirePermissions(NOTIFICATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Unread notification badge count" })
  unreadCount(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.notifications.unreadCountForStaff(tenantId, userId);
  }

  @Post("read-all")
  @RequirePermissions(NOTIFICATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Mark all notifications as read" })
  markAll(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.notifications.markAllReadStaff(tenantId, userId);
  }

  @Post(":id/open")
  @RequirePermissions(NOTIFICATIONS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Open notification (mark read + return deep link)",
    description:
      "FE contract: call this on click, then router.push(data.link_path). Paths are staff ERP routes (e.g. /quotations/:id). If link_path is null, show a toast and do not navigate.",
  })
  open(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.notifications.openStaff(tenantId, userId, id);
  }

  @Post(":id/read")
  @RequirePermissions(NOTIFICATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Mark one notification as read" })
  markRead(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.notifications.markReadStaff(tenantId, userId, id);
  }
}
