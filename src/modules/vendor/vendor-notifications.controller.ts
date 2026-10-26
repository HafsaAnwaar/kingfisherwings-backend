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
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { NotificationsService } from "../notifications/notifications.service";
import { CurrentVendor } from "./decorators/vendor.decorators";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

class VendorNotificationQueryDto {
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

@ApiTags("Vendor Notifications")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller("vendor/notifications")
export class VendorNotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: "List vendor in-app notifications",
    description:
      "Each item includes `link_path` under /vendor/…. On click: POST /vendor/notifications/:id/open then navigate to data.link_path.",
  })
  list(
    @CurrentVendor() user: CurrentVendorUser,
    @Query() query: VendorNotificationQueryDto,
  ) {
    return this.notifications.listForVendor(user.tenantId, user.id, {
      page: query.page,
      limit: query.limit,
      unread_only: query.unread_only === "true" || query.unread_only === "1",
    });
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Vendor unread badge count" })
  unreadCount(@CurrentVendor() user: CurrentVendorUser) {
    return this.notifications.unreadCountForVendor(user.tenantId, user.id);
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all vendor notifications as read" })
  markAll(@CurrentVendor() user: CurrentVendorUser) {
    return this.notifications.markAllReadVendor(user.tenantId, user.id);
  }

  @Post(":id/open")
  @ApiOperation({
    summary: "Open vendor notification (mark read + return deep link)",
    description:
      "FE contract: call on click, then router.push(data.link_path). Paths are vendor routes (e.g. /vendor/job-offers/:id). If link_path is null, do not navigate.",
  })
  open(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.notifications.openVendor(user.tenantId, user.id, id);
  }

  @Post(":id/read")
  @ApiOperation({ summary: "Mark one vendor notification as read" })
  markRead(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.notifications.markReadVendor(user.tenantId, user.id, id);
  }
}
