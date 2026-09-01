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

import { ZipDistancesService } from "./zip-distances.service";
import {
  CreateZipDistanceDto,
  UpdateZipDistanceDto,
} from "../dto/zip-distance.dto";
import { MasterQueryDto } from "../../masters/dto/master-query.dto";

import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { QUOTATIONS_PERMISSIONS } from "../constants/quotations-permission.constants";

@ApiTags("Quotations — Zip Distance Master")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("quotations/zip-distances")
export class ZipDistancesController {
  constructor(private readonly service: ZipDistancesService) {}

  @Get()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List zip-to-zip distances" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MasterQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get a zip distance record by id" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Record a distance between two zip/location codes" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateZipDistanceDto,
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Patch(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a zip distance record" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateZipDistanceDto,
  ) {
    return this.service.update(tenantId, id, { ...dto }, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(QUOTATIONS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a zip distance record" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}
