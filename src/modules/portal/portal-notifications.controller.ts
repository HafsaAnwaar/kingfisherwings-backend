import {
  Controller,
  Get,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Observable, concat, defer, from, interval, map, switchMap } from 'rxjs';
import { SkipStaffJwt } from '../../common/decorators/skip-staff-jwt.decorator';
import { CurrentPortal } from './decorators/portal.decorators';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { NotificationsService } from '../notifications/notifications.service';

class PortalNotificationQueryDto {
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

@ApiTags('Portal Notifications')
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller('portal/notifications')
export class PortalNotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List portal in-app notifications' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalNotificationQueryDto) {
    return this.notifications.listForPortal(user.tenantId, user.id, {
      page: query.page,
      limit: query.limit,
      unread_only: query.unread_only === 'true' || query.unread_only === '1',
    });
  }

  @Sse('stream')
  @ApiOperation({ summary: 'SSE stream of portal unread notification count (immediate + every 15s)' })
  stream(@CurrentPortal() user: CurrentPortalUser): Observable<MessageEvent> {
    const toEvent = (result: { data: { unread_count: number } }): MessageEvent => ({
      data: { unread_count: result.data.unread_count },
    });

    const fetchCount = () =>
      from(this.notifications.unreadCountForPortal(user.tenantId, user.id)).pipe(map(toEvent));

    return concat(
      defer(fetchCount),
      interval(15_000).pipe(switchMap(() => fetchCount())),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Portal unread badge count' })
  unreadCount(@CurrentPortal() user: CurrentPortalUser) {
    return this.notifications.unreadCountForPortal(user.tenantId, user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all portal notifications as read' })
  markAll(@CurrentPortal() user: CurrentPortalUser) {
    return this.notifications.markAllReadPortal(user.tenantId, user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark one portal notification as read' })
  markRead(@CurrentPortal() user: CurrentPortalUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.markReadPortal(user.tenantId, user.id, id);
  }
}
