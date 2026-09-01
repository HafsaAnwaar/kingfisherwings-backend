import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RolesGuard } from "../users/guards/roles.guard";
import { CurrentUser as CurrentUserType } from "../users/interfaces/current-user.interface";
import { WMS_PERMISSIONS } from "./constants/wms-permission.constants";
import { UpsertWmsSettingsDto } from "./dto/wms.dto";
import { WmsSettingsService } from "./wms-settings.service";

@ApiTags("WMS Settings")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("wms")
export class WmsSettingsController {
  constructor(private readonly service: WmsSettingsService) {}

  @Get("settings")
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  get(@CurrentUser() user: CurrentUserType) {
    return this.service.getOrCreate(user);
  }

  @Put("settings")
  @RequirePermissions(WMS_PERMISSIONS.MANAGE_SETTINGS)
  upsert(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpsertWmsSettingsDto,
  ) {
    return this.service.upsert(user, dto);
  }
}
