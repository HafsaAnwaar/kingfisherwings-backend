import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { GL_PERMISSIONS } from "./constants/gl-permission.constants";
import { ArApService } from "./ar-ap.service";
import { AgingQueryDto } from "./dto/ar-ap.dto";

@ApiTags("GL — AR / AP Aging")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("gl")
export class ArApController {
  constructor(private readonly service: ArApService) {}

  @Get("ar/aging")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({ summary: "Accounts Receivable aging buckets (Ch.19.1)" })
  arAging(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.service.arAging(tenantId, query);
  }

  @Get("ap/aging")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({ summary: "Accounts Payable aging buckets (Ch.19.2)" })
  apAging(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.service.apAging(tenantId, query);
  }

  @Get("ar/statement/:partyId")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({ summary: "Customer AR statement (invoices + receipts)" })
  arStatement(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.service.partyStatement(tenantId, partyId, query, "AR");
  }

  @Get("ap/statement/:partyId")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({
    summary: "Vendor AP statement (purchase invoices + payments)",
  })
  apStatement(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.service.partyStatement(tenantId, partyId, query, "AP");
  }
}
