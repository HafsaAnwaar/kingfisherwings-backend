import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { DOCUMENTATION_PERMISSIONS } from "./constants/documentation-permission.constants";
import { DocumentationBoeService } from "./documentation-boe.service";
import {
  BoeDashboardQueryDto,
  CreateBoeRecordDto,
  UpdateBoeRecordDto,
} from "./dto/documentation-boe.dto";

@ApiTags("Documentation — BOE")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("documentation/boe")
export class DocumentationBoeController {
  constructor(private readonly service: DocumentationBoeService) {}

  @Get("dashboard")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  @ApiOperation({ summary: "BOE dashboard list" })
  dashboard(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: BoeDashboardQueryDto,
  ) {
    return this.service.getDashboard(tenantId, query);
  }

  @Get("claims/pending")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  @ApiOperation({ summary: "Pending BOE claims" })
  pendingClaims(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: BoeDashboardQueryDto,
  ) {
    return this.service.getPendingClaims(tenantId, query);
  }

  @Post()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateBoeRecordDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoeRecordDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }
}
