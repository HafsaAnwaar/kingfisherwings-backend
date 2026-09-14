import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from "@nestjs/swagger";
import { OutboundMessageChannel } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { MASTERS_PERMISSIONS } from "../constants/masters-permission.constants";
import { CreateOutboundMessageLogDto } from "../dto/outbound-message-log.dto";
import { WhatsappSmsHistoryService } from "./whatsapp-sms-history.service";

class MessageHistoryQueryDto {
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

  @ApiPropertyOptional({ enum: OutboundMessageChannel })
  @IsOptional()
  @IsEnum(OutboundMessageChannel)
  channel?: OutboundMessageChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}

@ApiTags("Masters — WhatsApp SMS History")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("masters/whatsapp-sms-history")
export class WhatsappSmsHistoryController {
  constructor(private readonly service: WhatsappSmsHistoryService) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List outbound WhatsApp / SMS message history" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MessageHistoryQueryDto,
  ) {
    return this.service.list(tenantId, query);
  }

  @Post()
  @RequirePermissions(MASTERS_PERMISSIONS.CREATE)
  @ApiOperation({
    summary: "Append a message history row (for future providers)",
  })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateOutboundMessageLogDto,
  ) {
    return this.service.append(tenantId, actorId, dto);
  }
}
