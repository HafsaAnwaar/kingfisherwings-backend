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
import { DocumentationChargeTemplateService } from "./documentation-charge-template.service";
import {
  ApplyChargeTemplateDto,
  ChargeTemplateQueryDto,
  CreateChargeTemplateDto,
  UpdateChargeTemplateDto,
} from "./dto/documentation-charge-template.dto";

@ApiTags("Documentation — Charge Templates")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("documentation/charge-templates")
export class DocumentationChargeTemplateController {
  constructor(private readonly service: DocumentationChargeTemplateService) {}

  @Get()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ChargeTemplateQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateChargeTemplateDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateChargeTemplateDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.remove(tenantId, id, actorId);
  }

  @Post(":id/apply")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  apply(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ApplyChargeTemplateDto,
  ) {
    return this.service.apply(tenantId, id, dto, actorId);
  }
}
