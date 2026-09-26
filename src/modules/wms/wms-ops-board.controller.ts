import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RolesGuard } from "../users/guards/roles.guard";
import { CurrentUser as CurrentUserType } from "../users/interfaces/current-user.interface";
import { WMS_PERMISSIONS } from "./constants/wms-permission.constants";
import { WmsOpsBoardService } from "./wms-ops-board.service";

@ApiTags("WMS Ops Board")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("wms/ops-board")
export class WmsOpsBoardController {
  constructor(private readonly service: WmsOpsBoardService) {}

  @Get()
  @RequirePermissions(WMS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Admin WMS ops board",
    description:
      "Inbound ASN yard statuses, outbound GDO/DISPATCHED, lot OVERDUE/OVER_BILL labels, and customer send flags.",
  })
  getBoard(@CurrentUser() user: CurrentUserType) {
    return this.service.getBoard(user);
  }
}
