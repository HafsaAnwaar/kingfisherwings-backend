import {
  Body,
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
import { UserRole } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { Roles } from "../users/decorators/roles.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { NOTIFICATIONS_PERMISSIONS } from "./constants/notifications-permission.constants";
import { NotificationsService } from "./notifications.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";

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

  @ApiPropertyOptional({
    description:
      "Admin/branch manager only: view another staff user's inbox (still one recipient feed).",
  })
  @IsOptional()
  @IsUUID()
  for_user_id?: string;

  @ApiPropertyOptional({
    description: "Accepted for FE compatibility; delivery is per-user at write time.",
  })
  @IsOptional()
  @IsString()
  audience?: string;

  @ApiPropertyOptional({
    description: "Accepted for FE compatibility; delivery is per-user at write time.",
  })
  @IsOptional()
  @IsString()
  role?: string;
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
    summary: "List staff in-app notifications for the auth user (unread first)",
    description:
      "Scoped to the JWT user (or for_user_id when admin). Each item includes type, entity_type, entity_id, link_path. On click: POST /notifications/:id/open then navigate to data.link_path.",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notifications.listForStaff(tenantId, userId, role, {
      page: query.page,
      limit: query.limit,
      unread_only: query.unread_only === "true" || query.unread_only === "1",
      for_user_id: query.for_user_id,
      audience: query.audience,
      role: query.role,
    });
  }

  @Get("unread-count")
  @RequirePermissions(NOTIFICATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Unread notification badge count (auth user scoped)" })
  unreadCount(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @Query("for_user_id") forUserId?: string,
    @Query("audience") audience?: string,
    @Query("role") targetRole?: string,
  ) {
    return this.notifications.unreadCountForStaff(tenantId, userId, role, {
      for_user_id: forUserId,
      audience,
      role: targetRole,
    });
  }

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  @RequirePermissions(NOTIFICATIONS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Create targeted staff notifications (one row per recipient)",
    description:
      "Requires at least one of audience | recipient_user_ids | roles | permissions | modules. Never writes a tenant-wide shared row.",
  })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notifications.createTargeted(tenantId, dto);
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
