import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { QUOTATIONS_PERMISSIONS } from "../constants/quotations-permission.constants";
import {
  CreateServiceCatalogItemDto,
  ServiceCatalogQueryDto,
  UpdateServiceCatalogItemDto,
} from "./service-catalog.dto";
import { ServiceCatalogService } from "./service-catalog.service";

@ApiTags("Quotation Service Catalog")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("quotations/service-catalog")
export class ServiceCatalogController {
  constructor(private readonly catalog: ServiceCatalogService) {}

  @Get()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List tenant service catalog items" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ServiceCatalogQueryDto,
  ) {
    return this.catalog.findAll(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get service catalog item" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.catalog.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.SERVICE_CATALOG_MANAGE)
  @ApiOperation({ summary: "Create service catalog item" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateServiceCatalogItemDto,
  ) {
    return this.catalog.create(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update service catalog item" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceCatalogItemDto,
  ) {
    return this.catalog.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Soft-delete service catalog item" })
  remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.catalog.softDelete(tenantId, id, actorId);
  }
}
