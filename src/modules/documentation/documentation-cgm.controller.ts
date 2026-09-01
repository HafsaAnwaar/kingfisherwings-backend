import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  DocumentationCgmService,
  CgmVoyageDto,
} from "./documentation-cgm.service";
import { DocumentationPaginationDto } from "./dto/documentation-pagination.dto";

@ApiTags("Documentation — CGM")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("documentation/edi/cgm/vessels")
export class DocumentationCgmController {
  constructor(private readonly service: DocumentationCgmService) {}

  @Get()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: DocumentationPaginationDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CgmVoyageDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: Partial<CgmVoyageDto>,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.remove(tenantId, id, actorId);
  }

  @Post(":id/download-edi")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  downloadEdi(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.downloadEdi(tenantId, id, actorId);
  }
}
