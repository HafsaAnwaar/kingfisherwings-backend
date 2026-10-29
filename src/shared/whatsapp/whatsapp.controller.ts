import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { RolesGuard } from "../../modules/users/guards/roles.guard";
import { PermissionsGuard } from "../../modules/users/guards/permissions.guard";
import { RequirePermissions } from "../../modules/users/decorators/permissions.decorator";
import { CurrentUser } from "../../modules/users/decorators/current-user.decorator";
import { MASTERS_PERMISSIONS } from "../../modules/masters/constants/masters-permission.constants";
import { SendWhatsAppDto } from "./dto/send-whatsapp.dto";
import { WhatsAppComposeService } from "./whatsapp-compose.service";

@ApiTags("WhatsApp")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("whatsapp")
export class WhatsAppController {
  constructor(private readonly compose: WhatsAppComposeService) {}

  @Get("status")
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "WhatsApp / Twilio config health (no secrets) — ready when keys are pasted",
  })
  status() {
    return this.compose.status();
  }

  @Post("send")
  @RequirePermissions(MASTERS_PERMISSIONS.CREATE)
  @ApiOperation({
    summary:
      "Send a WhatsApp message to a staff user, customer/vendor party, or raw E.164 number",
  })
  send(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: SendWhatsAppDto,
  ) {
    return this.compose.send(tenantId, dto, actorId);
  }
}
