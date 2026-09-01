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
import {
  CreateMpciFilingDto,
  DocumentationMpciService,
  MpciQueryDto,
} from "./documentation-mpci.service";

@ApiTags("Documentation — MPCI")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("documentation/mpci/filings")
export class DocumentationMpciController {
  constructor(private readonly service: DocumentationMpciService) {}

  @Get()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MPCI)
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MpciQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MPCI)
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateMpciFilingDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Post(":id/prepare")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MPCI)
  prepare(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.prepare(tenantId, id, actorId);
  }

  @Post(":id/submit")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MPCI)
  submit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.submit(tenantId, id, actorId);
  }

  @Get(":id/status")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MPCI)
  status(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getStatus(tenantId, id);
  }
}
